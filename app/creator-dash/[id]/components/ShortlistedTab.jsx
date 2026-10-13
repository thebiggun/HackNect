"use client";
import React from "react";
import { Trophy } from "lucide-react";
import Loader from "@/components/Loader";
import TeamCard from "./TeamCard";

const ShortlistedTab = ({
    hackathon,
    shortlistedTeams = [],
    loading,
    onRefresh,
    onShortlist,
    shortlisting,
    shortlistError,
    formatDate,
}) => {
    const topN = hackathon?.top_n_selections;
    const isShortlistDisabled =
        shortlisting ||
        !topN ||
        isNaN(Number(topN)) ||
        Number(topN) < 1;

    return (
        <div className="space-y-6">
            {/* Shortlist Action Section */}
            <div className="mb-4">
                <div className="flex flex-col gap-2 items-start">
                    <button
                        onClick={onShortlist}
                        disabled={isShortlistDisabled}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 cursor-pointer flex items-center"
                    >
                        {shortlisting ? (
                            <>
                                <Loader size={18} className="mr-2 align-middle" />
                                <span>Shortlisting...</span>
                            </>
                        ) : (
                            `Shortlist Best ${topN || ''} Ideas`
                        )}
                    </button>
                </div>

                {shortlisting && (
                    <div className="mt-4 text-white">Shortlisting ideas, please wait...</div>
                )}
                {shortlistError && (
                    <div className="mt-4 text-red-400">{shortlistError}</div>
                )}
            </div>

            {/* Shortlisted Teams List */}
            <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Shortlisted Teams</h2>
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-white text-lg">Loading shortlisted teams...</div>
                    </div>
                ) : shortlistedTeams.length === 0 ? (
                    <div className="text-center py-12">
                        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Teams Shortlisted Yet</h3>
                        <p className="text-gray-300">Run the shortlisting to select the best teams.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {shortlistedTeams.map((registration, index) => (
                            <TeamCard
                                key={registration.id}
                                registration={registration}
                                index={index}
                                formatDate={formatDate}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShortlistedTab;
