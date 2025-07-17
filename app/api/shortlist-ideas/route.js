import fetch from 'node-fetch';
// Fix the pdf-parse import
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { InferenceClient } from "@huggingface/inference";
import supabase from '@/lib/supabase';

export async function POST(req) {
    try {
        const body = await req.json();
        const { pdfUrls, n } = body;
        
        // Validate input
        if (!Array.isArray(pdfUrls) || typeof n !== 'number' || n <= 0) {
            return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
        }

        const remotePdfUrls = pdfUrls.filter(url => /^https?:\/\//i.test(url));
        if (remotePdfUrls.length === 0) {
            return new Response(JSON.stringify({ error: 'No valid PDF URLs provided' }), { status: 400 });
        }

        if (remotePdfUrls.length > 10) {
            return new Response(JSON.stringify({ error: 'Too many PDFs. Limit to 10.' }), { status: 400 });
        }

        // 1. Fetch and extract text from each PDF
        const pdfTexts = await Promise.all(remotePdfUrls.map(async (url) => {
            try {
                const response = await fetch(url);
                const contentType = response.headers.get('content-type') || '';
                if (response.status !== 200 || !contentType.includes('pdf')) {
                    return { url, text: '' };
                }

                const buffer = await response.buffer();
                // Use the imported function directly
                const data = await pdfParse(buffer);
                return { url, text: data.text || '' };
            } catch (err) {
                return { url, text: '' };
            }
        }));
        
        // Filter out empty PDFs
        const validTexts = pdfTexts.filter(p => p.text.trim().length > 100);
        if (validTexts.length < n) {
            return new Response(JSON.stringify({ error: `Only ${validTexts.length} valid PDFs found. Cannot select top ${n}.` }), { status: 400 });
        }

        // 2. Construct the prompt
        const prompt = `
You are a judge evaluating hackathon ideas. Here are the project summaries:

${validTexts.map((p, i) => `Idea ${i + 1}:\n${p.text.slice(0, 2000)}`).join('\n\n')}

Please select the best ${n} ideas based on uniqueness, impact on society, feasibility, viability, and implementation potential.\nReturn ONLY a JSON array of the idea numbers (e.g. [2, 5, 1]).
`;

        // 3. Call Hugging Face Inference API (Mistral 7B)
        const client = new InferenceClient(process.env.HUGGING_FACE_KEY); // or HF_TOKEN
        let hfData;
        try {
            const chatCompletion = await client.chatCompletion({
                provider: "together",
                model: "mistralai/Mistral-7B-Instruct-v0.3",
                messages: [
                    {
                        role: "user",
                        content: prompt, // your constructed prompt
                    },
                ],
            });

            // Extract the model's response
            const content = chatCompletion.choices[0].message.content;

            let selectedIndexes = [];
            try {
                const match = content.match(/\[\s*\d+(?:\s*,\s*\d+)*\s*\]/); // matches [1, 2, 3]
                if (match) selectedIndexes = JSON.parse(match[0]);
            } catch (err) {
            }

            // 5. Return shortlisted URLs
            const shortlisted = selectedIndexes
                .map(i => validTexts[i - 1]?.url)
                .filter(Boolean);

            // Persist shortlisted URLs to the shortlists table
            // 1. Fetch registrations for the shortlisted URLs
            const { data: registrations, error: regError } = await supabase
                .from('registrations')
                .select('id, hackathon_id, idea_pdf_url')
                .in('idea_pdf_url', shortlisted);

            if (regError) {
                return new Response(JSON.stringify({ error: 'Failed to fetch registrations for shortlisted URLs' }), { status: 500 });
            }

            // 2. Prepare rows for insertion
            const rows = registrations.map(reg => ({
                hackathon_id: reg.hackathon_id,
                registration_id: reg.id,
            }));

            // 2.5. Delete previous shortlists for this hackathon
            // Get the hackathon_id (assume all rows have the same hackathon_id)
            const hackathonId = rows.length > 0 ? rows[0].hackathon_id : null;
            if (hackathonId) {
                const { data: deletedShortlists, error: deleteError } = await supabase
                    .from('shortlists')
                    .delete()
                    .eq('hackathon_id', hackathonId)
                    .select();
                if (deleteError) {
                    return new Response(JSON.stringify({ error: 'Failed to delete previous shortlists' }), { status: 500 });
                }
            }

            // 3. Insert into shortlists table
            if (rows.length > 0) {
                const { error: insertError } = await supabase
                    .from('shortlists')
                    .insert(rows);
                if (insertError) {
                    return new Response(JSON.stringify({ error: 'Failed to insert shortlists' }), { status: 500 });
                }
            }

            return new Response(JSON.stringify({ shortlisted }), { status: 200 });
        } catch (err) {
            return new Response(JSON.stringify({ error: 'Failed to get response from Hugging Face' }), { status: 500 });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}
