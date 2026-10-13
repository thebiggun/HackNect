import {
    extractPdfTexts,
    scoreAllIdeas,
    rankAndShortlist,
    fetchRegisteredPdfUrls,
    fetchRegistrations,
    updateRegistrationScores,
    syncShortlists,
    buildRankedResponseWithIds,
} from './components';

export async function POST(req) {
    console.log('\n======================================================');
    console.log('[Shortlist Ideas] Starting shortlist ideas pipeline');
    console.log('======================================================');

    try {
        const body = await req.json();
        const { pdfUrls, n, hackathonId: bodyHackathonId } = body;

        let targetUrls = Array.isArray(pdfUrls) ? [...pdfUrls] : [];

        // If no URLs were sent, auto-fetch idea_pdf_url from registrations for this hackathon
        if (targetUrls.length === 0 && bodyHackathonId) {
            targetUrls = await fetchRegisteredPdfUrls(bodyHackathonId);
        }

        const parsedN = typeof n === 'number' && n > 0 ? n : (Number(n) > 0 ? Number(n) : 1);

        const remotePdfUrls = targetUrls
            .filter(url => url && typeof url === 'string')
            .map(url => url.trim())
            .filter(url => /^https?:\/\//i.test(url));

        if (remotePdfUrls.length === 0) {
            console.warn('[Shortlist Ideas] No valid HTTP(S) PDF URLs provided or found.');
            return new Response(JSON.stringify({ error: 'No valid PDF URLs provided or found for this hackathon.' }), { status: 400 });
        }

        if (remotePdfUrls.length > 20) {
            console.warn(`[Shortlist Ideas] URL limit exceeded: ${remotePdfUrls.length} > 20.`);
            return new Response(JSON.stringify({ error: 'Too many PDFs. Limit to 20.' }), { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('[Shortlist Ideas] GEMINI_API_KEY is not configured.');
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured.' }), { status: 500 });
        }

        // 1. Fetch and extract text from each PDF
        const { validTexts } = await extractPdfTexts(remotePdfUrls);
        if (validTexts.length === 0) {
            console.warn('[Shortlist Ideas] Could not extract readable text from any submitted PDF.');
            return new Response(JSON.stringify({ error: 'Could not extract readable text from the submitted PDF(s).' }), { status: 400 });
        }

        const effectiveN = Math.min(parsedN, validTexts.length);

        // 2. Score each PDF individually with Gemini
        const scored = await scoreAllIdeas(validTexts, apiKey);

        // Abort if Gemini returned no usable scores
        if (scored.every(s => s.score === null)) {
            console.error('[Shortlist Ideas] Scoring failed for all submissions.');
            return new Response(
                JSON.stringify({ error: 'Scoring failed for all submissions. Check the Gemini model name and API key.' }),
                { status: 502 }
            );
        }

        // 3. Rank by score and take the top N
        const { ranked, shortlisted } = rankAndShortlist(scored, effectiveN);

        // 4. Fetch registrations for all processed PDF URLs
        const { registrations: allRegistrations, error: regError } = await fetchRegistrations(remotePdfUrls, bodyHackathonId);
        if (regError) {
            return new Response(JSON.stringify({ error: 'Failed to fetch registrations for PDF URLs' }), { status: 500 });
        }

        // 5. Save the scores received from Gemini to the registrations table score column
        await updateRegistrationScores(allRegistrations, scored, bodyHackathonId);

        // 6. Persist shortlisted records to the shortlists table
        const hackathonId = bodyHackathonId || allRegistrations?.[0]?.hackathon_id;
        if (hackathonId) {
            const { success, error: shortlistSyncErr } = await syncShortlists(hackathonId, shortlisted, allRegistrations);
            if (!success && shortlistSyncErr) {
                return new Response(JSON.stringify({ error: 'Failed to insert shortlists' }), { status: 500 });
            }
        }

        // 7. Attach registration IDs to ranked response
        const scoresWithRegistrationIds = buildRankedResponseWithIds(ranked, allRegistrations);

        console.log('======================================================');
        console.log('[Shortlist Ideas] Finished successfully! Returning response.');
        console.log('======================================================\n');

        return new Response(
            JSON.stringify({
                success: true,
                shortlisted,
                scores: scoresWithRegistrationIds,
            }),
            { status: 200 }
        );
    } catch (err) {
        console.error('[Shortlist Ideas] Internal server error:', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}