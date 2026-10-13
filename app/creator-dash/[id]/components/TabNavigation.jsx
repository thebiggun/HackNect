"use client";
import React from "react";
import { Users, Trophy } from "lucide-react";

const TabNavigation = ({
    activeTab,
    setActiveTab,
    registrationsCount = 0,
    shortlistedCount = 0,
}) => {
    return (
        <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-1 bg-white/10 border border-white/20 rounded-xl p-1">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                        activeTab === 'details'
                            ? 'bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white shadow-lg'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                >
                    Details
                </button>
                <button
                    onClick={() => setActiveTab('registrations')}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                        activeTab === 'registrations'
                            ? 'bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white shadow-lg'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" />
                        Registrations
                        {registrationsCount > 0 && (
                            <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                                {registrationsCount}
                            </span>
                        )}
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('shortlisted')}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 cursor-pointer ${
                        activeTab === 'shortlisted'
                            ? 'bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white shadow-lg'
                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                >
                    <div className="flex items-center justify-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Shortlisted
                        {shortlistedCount > 0 && (
                            <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                                {shortlistedCount}
                            </span>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
};

export default TabNavigation;
