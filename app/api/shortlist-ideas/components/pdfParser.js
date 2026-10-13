import pdfParse from 'pdf-parse/lib/pdf-parse.js';

/**
 * Fetches and parses a single PDF from a remote URL.
 * @param {string} url - Remote PDF URL
 * @returns {Promise<{ url: string, text: string, success: boolean, error?: string }>}
 */
export async function parseSinglePdf(url) {
    try {
        console.log(`[PDF Parser] Fetching PDF: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`[PDF Parser] Failed to fetch PDF from ${url}: HTTP ${response.status}`);
            return { url, text: '', success: false, error: `HTTP ${response.status}` };
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const data = await pdfParse(buffer);
        const text = (data.text || '').trim();

        console.log(`[PDF Parser] Successfully parsed PDF (${text.length} chars): ${url}`);
        return { url, text, success: true };
    } catch (err) {
        console.error(`[PDF Parser] Error parsing PDF from ${url}:`, err.message);
        return { url, text: '', success: false, error: err.message };
    }
}

/**
 * Downloads and extracts readable text from an array of PDF URLs.
 * @param {string[]} urls - List of remote PDF URLs
 * @returns {Promise<{ validTexts: Array<{ url: string, text: string }>, allResults: Array<{ url: string, text: string, success: boolean }> }>}
 */
export async function extractPdfTexts(urls) {
    console.log(`[PDF Parser] Processing ${urls.length} PDF(s)...`);

    const allResults = await Promise.all(urls.map(url => parseSinglePdf(url)));

    // Filter out submissions with insufficient text (less than 10 characters)
    const validTexts = allResults
        .filter(res => res.text && res.text.length > 10)
        .map(res => ({ url: res.url, text: res.text }));

    console.log(`[PDF Parser] Extraction complete: ${validTexts.length}/${urls.length} valid readable PDF(s).`);

    return { validTexts, allResults };
}
