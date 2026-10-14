import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODEL, MAX_CHARS_PER_PDF, SCORING_INSTRUCTION } from './constants.js';

/**
 * Scores a single project submission text using Gemini.
 * @param {GoogleGenAI} ai - Initialized GoogleGenAI client
 * @param {string} text - Submission text
 * @param {string} [identifier] - Submission URL or identifier for logging
 * @returns {Promise<number|null>}
 */
export async function scoreSingleIdea(ai, text, identifier = '') {
    try {
        const truncatedText = text.slice(0, MAX_CHARS_PER_PDF);
        const res = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: `Project submission:\n\n${truncatedText}`,
            config: {
                systemInstruction: SCORING_INSTRUCTION,
                temperature: 0,
                seed: 42,
                maxOutputTokens: 64,
            },
        });

        const rawText = res.text || '';
        const match = rawText.match(/\d+(?:\.\d+)?/);
        if (!match) {
            console.warn(`[Gemini Scorer] No numeric score found in model output for ${identifier}. Output: "${rawText.trim()}"`);
            return null;
        }

        const parsedScore = Number(match[0]);
        if (Number.isNaN(parsedScore)) {
            console.warn(`[Gemini Scorer] Parsed score is NaN for ${identifier}.`);
            return null;
        }

        const finalScore = Math.max(0, Math.min(100, Math.round(parsedScore)));
        console.log(`[Gemini Scorer] Scored: ${finalScore}/100 for ${identifier}`);
        return finalScore;
    } catch (err) {
        console.error(`[Gemini Scorer] Scoring failed for ${identifier}:`, err.message);
        return null;
    }
}

/**
 * Scores all valid submission texts using Gemini.
 * @param {Array<{ url: string, text: string }>} submissions
 * @param {string} apiKey
 * @returns {Promise<Array<{ url: string, score: number|null }>>}
 */
export async function scoreAllIdeas(submissions, apiKey) {
    console.log(`[Gemini Scorer] Initializing Gemini (${GEMINI_MODEL}) for ${submissions.length} submission(s)...`);
    const ai = new GoogleGenAI({ apiKey });

    const scored = await Promise.all(
        submissions.map(async (item) => ({
            url: item.url,
            score: await scoreSingleIdea(ai, item.text, item.url),
        }))
    );

    const validCount = scored.filter(s => typeof s.score === 'number').length;
    console.log(`[Gemini Scorer] Completed scoring. Usable scores: ${validCount}/${submissions.length}`);

    return scored;
}

/**
 * Ranks scored ideas by score descending and extracts top N shortlisted URLs.
 * @param {Array<{ url: string, score: number|null }>} scored
 * @param {number} count - Desired number of shortlisted ideas
 * @returns {{ ranked: Array<{ url: string, score: number|null }>, shortlisted: string[] }}
 */
export function rankAndShortlist(scored, count) {
    const ranked = [...scored].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    const effectiveCount = Math.max(1, Math.min(count, ranked.length));
    const shortlisted = ranked.slice(0, effectiveCount).map(r => r.url);

    console.log(`[Gemini Scorer] Ranked ${ranked.length} submissions. Shortlisted top ${shortlisted.length}:`);
    shortlisted.forEach((url, idx) => {
        const score = ranked[idx]?.score;
        console.log(`  #${idx + 1} (${score ?? 'unscored'} pts): ${url}`);
    });

    return { ranked, shortlisted };
}
