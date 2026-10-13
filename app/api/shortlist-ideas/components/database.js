import supabase from '@/lib/supabase';

/**
 * Normalizes URL strings for consistent map lookups and deduplication.
 * @param {string} url
 * @returns {string}
 */
export const normalizeUrl = (url) => (typeof url === 'string' ? url.trim() : '');

/**
 * Fetches idea PDF URLs for a hackathon from the registrations table.
 * @param {string} hackathonId
 * @returns {Promise<string[]>}
 */
export async function fetchRegisteredPdfUrls(hackathonId) {
    if (!hackathonId) return [];

    console.log(`[Database] Auto-fetching registered PDF URLs for hackathon: ${hackathonId}`);
    const { data: dbRegs, error } = await supabase
        .from('registrations')
        .select('idea_pdf_url')
        .eq('hackathon_id', hackathonId)
        .not('idea_pdf_url', 'is', null);

    if (error) {
        console.error('[Database] Failed to auto-fetch PDF URLs:', error.message);
        return [];
    }

    const urls = (dbRegs || [])
        .map(r => r.idea_pdf_url)
        .filter(Boolean);

    console.log(`[Database] Found ${urls.length} PDF URL(s) in registrations for hackathon ${hackathonId}`);
    return urls;
}

/**
 * Fetches registrations matching the given PDF URLs and optional hackathon ID.
 * @param {string[]} remotePdfUrls
 * @param {string} [hackathonId]
 * @returns {Promise<{ registrations: Array<{ id: string, hackathon_id: string, idea_pdf_url: string }>, error: any }>}
 */
export async function fetchRegistrations(remotePdfUrls, hackathonId) {
    console.log(`[Database] Querying registrations for ${remotePdfUrls.length} PDF URL(s)...`);

    let query = supabase
        .from('registrations')
        .select('id, hackathon_id, idea_pdf_url')
        .in('idea_pdf_url', remotePdfUrls);

    if (hackathonId) {
        query = query.eq('hackathon_id', hackathonId);
    }

    const { data, error } = await query;
    if (error) {
        console.error('[Database] Error querying registrations:', error.message);
        return { registrations: [], error };
    }

    console.log(`[Database] Retrieved ${data?.length || 0} matching registration record(s).`);
    return { registrations: data || [], error: null };
}

/**
 * Updates score column in registrations table for all scored submissions.
 * @param {Array<{ id: string, hackathon_id: string, idea_pdf_url: string }>} allRegistrations
 * @param {Array<{ url: string, score: number|null }>} scored
 * @param {string} [hackathonId]
 */
export async function updateRegistrationScores(allRegistrations, scored, hackathonId) {
    const scoreMap = new Map();
    for (const item of scored) {
        if (typeof item.score === 'number' && !Number.isNaN(item.score)) {
            scoreMap.set(normalizeUrl(item.url), item.score);
        }
    }

    if (scoreMap.size === 0) {
        console.warn('[Database] No numeric scores available to update.');
        return;
    }

    console.log(`[Database] Updating scores for ${scoreMap.size} submissions...`);

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

            const results = await Promise.all(updatePromises);
            const errors = results.filter(r => r.error);
            if (errors.length > 0) {
                console.error('[Database] Some registration score updates failed:', errors.map(e => e.error));
            } else {
                console.log(`[Database] Successfully updated scores for ${scoredRegistrations.length} registrations by ID.`);
            }
        }
    } else {
        // Fallback: direct update by idea_pdf_url
        console.log('[Database] Fallback: updating scores directly by idea_pdf_url...');
        const directUpdates = Array.from(scoreMap.entries()).map(([url, score]) => {
            let q = supabase.from('registrations').update({ score }).eq('idea_pdf_url', url);
            if (hackathonId) q = q.eq('hackathon_id', hackathonId);
            return q;
        });

        await Promise.all(directUpdates);
        console.log(`[Database] Completed direct score updates for ${scoreMap.size} URLs.`);
    }
}

/**
 * Persists shortlisted records to the shortlists table (deleting previous records first).
 * @param {string} hackathonId
 * @param {string[]} shortlistedUrls
 * @param {Array<{ id: string, hackathon_id: string, idea_pdf_url: string }>} allRegistrations
 * @returns {Promise<{ success: boolean, error?: any }>}
 */
export async function syncShortlists(hackathonId, shortlistedUrls, allRegistrations) {
    if (!hackathonId) {
        console.warn('[Database] No hackathonId found. Skipping shortlist database persistence.');
        return { success: true };
    }

    console.log(`[Database] Syncing shortlists for hackathon: ${hackathonId}...`);

    // 1. Delete previous shortlists for this hackathon
    const { error: deleteError } = await supabase
        .from('shortlists')
        .delete()
        .eq('hackathon_id', hackathonId);

    if (deleteError) {
        console.error('[Database] Error deleting previous shortlists:', deleteError.message);
    } else {
        console.log(`[Database] Cleared previous shortlists for hackathon ${hackathonId}`);
    }

    // 2. Identify and deduplicate registrations for shortlisted URLs
    const shortlistedUrlSet = new Set(shortlistedUrls.map(normalizeUrl));
    const shortlistedRegs = (allRegistrations || []).filter(reg =>
        reg.idea_pdf_url && shortlistedUrlSet.has(normalizeUrl(reg.idea_pdf_url))
    );

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

    // 3. Fallback query if allRegistrations missed some shortlisted URLs
    if (rows.length === 0 && shortlistedUrls.length > 0) {
        console.log('[Database] Fallback: querying registrations directly for shortlisted URLs...');
        const { data: directShortlistedRegs, error: fallbackError } = await supabase
            .from('registrations')
            .select('id, hackathon_id, idea_pdf_url')
            .in('idea_pdf_url', shortlistedUrls);

        if (fallbackError) {
            console.error('[Database] Fallback query failed:', fallbackError.message);
        } else if (directShortlistedRegs && directShortlistedRegs.length > 0) {
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

    // 4. Insert new shortlist records
    if (rows.length > 0) {
        const { error: insertError } = await supabase
            .from('shortlists')
            .insert(rows);

        if (insertError) {
            console.error('[Database] Failed to insert shortlists:', insertError.message);
            return { success: false, error: insertError };
        }
        console.log(`[Database] Shortlists saved successfully. (${rows.length} rows inserted)`);
    } else {
        console.warn('[Database] No matching registration rows found to insert into shortlists table.');
    }

    return { success: true };
}

/**
 * Maps ranked submissions to include registration_id from matching registrations.
 * @param {Array<{ url: string, score: number|null }>} ranked
 * @param {Array<{ id: string, idea_pdf_url: string }>} allRegistrations
 * @returns {Array<{ url: string, score: number|null, registration_id: string|null }>}
 */
export function buildRankedResponseWithIds(ranked, allRegistrations) {
    const regByUrl = new Map();
    (allRegistrations || []).forEach(reg => {
        if (reg.idea_pdf_url) {
            regByUrl.set(normalizeUrl(reg.idea_pdf_url), reg.id);
        }
    });

    return ranked.map(r => ({
        ...r,
        registration_id: regByUrl.get(normalizeUrl(r.url)) || null,
    }));
}
