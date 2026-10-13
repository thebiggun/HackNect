"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ExploreHeader,
    ExploreFilters,
    HackathonCard,
    EmptyHackathons,
    indianCities
} from "./components";

const ExplorePage = () => {
    const router = useRouter();
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredHackathons, setFilteredHackathons] = useState([]);
    const [navLoading, setNavLoading] = useState(false);
    
    // Filter states
    const [filters, setFilters] = useState({
        type: "all", // "all", "offline", "virtual"
        city: "all",
        happening: "all" // "all", "this_week", "this_month", "this_year"
    });

    useEffect(() => {
        fetchHackathons();
    }, []);

    useEffect(() => {
        // Filter hackathons based on current filters
        let filtered = hackathons;

        // First, filter out hackathons whose registration deadline has passed
        filtered = filtered.filter(hackathon => {
            if (!hackathon.registration_deadline) return true; // Keep hackathons without deadline
            const now = new Date();
            const deadline = new Date(hackathon.registration_deadline);
            return deadline > now; // Only keep hackathons where deadline hasn't passed
        });

        // Filter by type (virtual/offline)
        if (filters.type !== "all") {
            filtered = filtered.filter(hackathon => {
                if (filters.type === "virtual") {
                    return hackathon.venue === "Virtual Event";
                } else if (filters.type === "offline") {
                    return hackathon.venue !== "Virtual Event";
                }
                return true;
            });
        }

        // Filter by city
        if (filters.city !== "all") {
            filtered = filtered.filter(hackathon => {
                if (hackathon.venue === "Virtual Event") return false;
                return hackathon.venue && hackathon.venue.includes(filters.city);
            });
        }

        // Filter by happening time
        if (filters.happening !== "all") {
            const now = new Date();
            filtered = filtered.filter(hackathon => {
                if (!hackathon.registration_deadline) return false;
                const deadline = new Date(hackathon.registration_deadline);
                
                if (filters.happening === "this_week") {
                    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    return deadline >= now && deadline <= weekFromNow;
                } else if (filters.happening === "this_month") {
                    const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                    return deadline >= now && deadline <= monthFromNow;
                } else if (filters.happening === "this_year") {
                    const yearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
                    return deadline >= now && deadline <= yearFromNow;
                }
                return true;
            });
        }

        setFilteredHackathons(filtered);
    }, [filters, hackathons]);

    const fetchHackathons = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/hackathons/public');
            const data = await response.json();
            
            if (data.success) {
                setHackathons(data.data || []);
                setFilteredHackathons(data.data || []);
            } else {
                setError(data.error || 'Failed to fetch hackathons');
            }
        } catch (err) {
            setError('Failed to fetch hackathons');
            console.error('Error fetching hackathons:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleHackathonClick = async (hackathonId) => {
        setNavLoading(true);
        await router.push(`/explore/${hackathonId}`);
        setNavLoading(false);
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            type: "all",
            city: "all",
            happening: "all"
        });
    };

    if (loading) {
        return (
            <div className="relative w-full p-8 pt-0">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-white text-xl">Discovering amazing hackathons...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full p-8 pt-0">
            <div className="px-2 sm:px-4 md:px-6">
                <ExploreHeader count={filteredHackathons.length} />

                {/* Filters Section */}
                <ExploreFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={clearFilters}
                    navLoading={navLoading}
                    cities={indianCities}
                />

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {filteredHackathons.length === 0 ? (
                    <EmptyHackathons
                        onClearFilters={clearFilters}
                        navLoading={navLoading}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {filteredHackathons.map((hackathon) => (
                            <HackathonCard
                                key={hackathon.id}
                                hackathon={hackathon}
                                onClick={() => handleHackathonClick(hackathon.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExplorePage;
