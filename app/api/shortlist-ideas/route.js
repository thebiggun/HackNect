import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { GoogleGenAI } from '@google/genai';
import supabase from '@/lib/supabase';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const MAX_CHARS_PER_PDF = 8000;

const SCORING_INSTRUCTION = `You are a hackathon judge. You will receive the text of one project idea submission.
Score it from 0 to 100 based on innovation, feasibility, societal impact, and technical execution.
Respond with ONLY a single integer between 0 and 100. No words, no symbols, no explanation.`;

async function scoreIdea(ai, text) {
    try {
        const res = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: `Project submission:\n\n${text.slice(0, MAX_CHARS_PER_PDF)}`,
            config: {
                systemInstruction: SCORING_INSTRUCTION,
                temperature: 0,
                // Headroom in case the model spends a few tokens on thinking.
                // If you still get empty responses, raise this further.
                maxOutputTokens: 64,
            },
        });

        const match = (res.text || '').match(/\d+(?:\.\d+)?/);
        if (!match) return null;

        const score = Number(match[0]);
        if (Number.isNaN(score)) return null;
        return Math.max(0, Math.min(100, Math.round(score)));
    } catch (err) {
        console.error('Gemini scoring failed:', err.message);
        return null;
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { pdfUrls, n, hackathonId: bodyHackathonId } = body;

        let targetUrls = Array.isArray(pdfUrls) ? [...pdfUrls] : [];

        // If no URLs were sent, auto-fetch idea_pdf_url from registrations for this hackathon
        if (targetUrls.length === 0 && bodyHackathonId) {
            const { data: dbRegs, error: fetchRegsErr } = await supabase
                .from('registrations')
                .select('idea_pdf_url')
                .eq('hackathon_id', bodyHackathonId)
                .not('idea_pdf_url', 'is', null);

            if (!fetchRegsErr && dbRegs) {
                targetUrls = dbRegs
                    .map(r => r.idea_pdf_url)
                    .filter(Boolean);
            }
        }

        const parsedN = typeof n === 'number' && n > 0 ? n : (Number(n) > 0 ? Number(n) : 1);

        const remotePdfUrls = targetUrls
            .filter(url => url && typeof url === 'string')
            .map(url => url.trim())
            .filter(url => /^https?:\/\//i.test(url));

        if (remotePdfUrls.length === 0) {
            return new Response(JSON.stringify({ error: 'No valid PDF URLs provided or found for this hackathon.' }), { status: 400 });
        }

        if (remotePdfUrls.length > 20) {
            return new Response(JSON.stringify({ error: 'Too many PDFs. Limit to 20.' }), { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured.' }), { status: 500 });
        }

        // 1. Fetch and extract text from each PDF
        const pdfTexts = await Promise.all(remotePdfUrls.map(async (url) => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    console.error(`Failed to fetch PDF from ${url}: HTTP ${response.status}`);
                    return { url, text: '' };
                }

                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const data = await pdfParse(buffer);
                return { url, text: (data.text || '').trim() };
            } catch (err) {
                console.error(`Error parsing PDF from ${url}:`, err.message);
                return { url, text: '' };
            }
        }));

        // Filter out empty or unreadable PDFs
        const validTexts = pdfTexts.filter(p => p.text.length > 10);
        if (validTexts.length === 0) {
            return new Response(JSON.stringify({ error: 'Could not extract readable text from the submitted PDF(s).' }), { status: 400 });
        }

        const effectiveN = Math.min(parsedN, validTexts.length);

        // 2. Score each PDF individually with Gemini (one request per PDF)
        const ai = new GoogleGenAI({ apiKey });

        const scored = await Promise.all(
            validTexts.map(async (p) => ({
                url: p.url,
                score: await scoreIdea(ai, p.text),
            }))
        );

        // Abort if Gemini returned no usable scores, so no meaningless shortlist is saved
        if (scored.every(s => s.score === null)) {
            return new Response(
                JSON.stringify({ error: 'Scoring failed for all submissions. Check the Gemini model name and API key.' }),
                { status: 502 }
            );
        }

        // 3. Rank by score (unscored items go last) and take the top N
        const ranked = [...scored].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
        const shortlisted = ranked.slice(0, effectiveN).map(r => r.url);

        // 4. Fetch registrations for all processed PDF URLs
        let regQuery = supabase
            .from('registrations')
            .select('id, hackathon_id, idea_pdf_url')
            .in('idea_pdf_url', remotePdfUrls);

        if (bodyHackathonId) {
            regQuery = regQuery.eq('hackathon_id', bodyHackathonId);
        }

        const { data: allRegistrations, error: regError } = await regQuery;

        if (regError) {
            console.error('Error fetching registrations for PDF URLs:', regError);
            return new Response(JSON.stringify({ error: 'Failed to fetch registrations for PDF URLs' }), { status: 500 });
        }

        const normalizeUrl = (url) => (typeof url === 'string' ? url.trim() : '');

        // Map scored URLs to their numeric score
        const scoreMap = new Map();
        for (const item of scored) {
            if (typeof item.score === 'number' && !Number.isNaN(item.score)) {
                scoreMap.set(normalizeUrl(item.url), item.score);
            }
        }

        // 5. Save the scores received from Gemini to the registrations table score column
        if (allRegistrations && allRegistrations.length > 0) {
            const scoredRegistrations = allRegistrations.filter(reg =>
                reg.idea_pdf_url && scoreMap.has(normalizeUrl(reg.idea_pdf_url))
            );

            if (scoredRegistrations.length > 0) {
                const updatePromises = scoredRegistrations.map(reg => {
                    const score = scoreMap.get(normalizeUrl(reg.idea_pdf_url));
                    return supabase
                        .from('registrations')
                        .update({ score })
                        .eq('id', reg.id);
                });

                const updateResults = await Promise.all(updatePromises);
                const updateErrors = updateResults.filter(r => r.error);
                if (updateErrors.length > 0) {
                    console.error('Some registration score updates failed:', updateErrors.map(e => e.error));
                }
            }
        } else {
            // Direct update fallback by idea_pdf_url if registrations weren't returned by ID
            const directUpdates = Array.from(scoreMap.entries()).map(([url, score]) => {
                let q = supabase.from('registrations').update({ score }).eq('idea_pdf_url', url);
                if (bodyHackathonId) q = q.eq('hackathon_id', bodyHackathonId);
                return q;
            });
            await Promise.all(directUpdates);
        }

        // 6. Persist shortlisted records to the shortlists table
        const hackathonId = bodyHackathonId || allRegistrations?.[0]?.hackathon_id;

        if (hackathonId) {
            // Delete previous shortlists for this hackathon
            const { error: deleteError } = await supabase
                .from('shortlists')
                .delete()
                .eq('hackathon_id', hackathonId);

            if (deleteError) {
                console.error('Error deleting previous shortlists:', deleteError);
            }

            // Identify registrations for shortlisted URLs
            const shortlistedUrlSet = new Set(shortlisted.map(normalizeUrl));
            const shortlistedRegs = (allRegistrations || []).filter(reg =>
                reg.idea_pdf_url && shortlistedUrlSet.has(normalizeUrl(reg.idea_pdf_url))
            );

            // Deduplicate by registration_id
            const seenRegIds = new Set();
            const rows = [];
            for (const reg of shortlistedRegs) {
                if (!seenRegIds.has(reg.id)) {
                    seenRegIds.add(reg.id);
                    rows.push({
                        hackathon_id: reg.hackathon_id,
                        registration_id: reg.id,
                    });
                }
            }

            // Fallback query if allRegistrations missed some shortlisted registrations
            if (rows.length === 0 && shortlisted.length > 0) {
                const { data: directShortlistedRegs } = await supabase
                    .from('registrations')
                    .select('id, hackathon_id, idea_pdf_url')
                    .in('idea_pdf_url', shortlisted);

                if (directShortlistedRegs && directShortlistedRegs.length > 0) {
                    for (const reg of directShortlistedRegs) {
                        if (!seenRegIds.has(reg.id)) {
                            seenRegIds.add(reg.id);
                            rows.push({
                                hackathon_id: reg.hackathon_id,
                                registration_id: reg.id,
                            });
                        }
                    }
                }
            }

            if (rows.length > 0) {
                const { error: insertError } = await supabase
                    .from('shortlists')
                    .insert(rows);

                if (insertError) {
                    console.error('Failed to insert shortlists:', insertError);
                    return new Response(JSON.stringify({ error: 'Failed to insert shortlists' }), { status: 500 });
                }
            }
        }

        const regByUrl = new Map();
        (allRegistrations || []).forEach(reg => {
            if (reg.idea_pdf_url) regByUrl.set(normalizeUrl(reg.idea_pdf_url), reg.id);
        });

        const rankedWithIds = ranked.map(r => ({
            ...r,
            registration_id: regByUrl.get(normalizeUrl(r.url)) || null,
        }));

        return new Response(JSON.stringify({ success: true, shortlisted, scores: rankedWithIds }), { status: 200 });
    } catch (err) {
        console.error('Internal server error in shortlist-ideas:', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}