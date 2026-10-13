"use client";
import React from "react";
import { Users } from "lucide-react";
import StatsCards from "./StatsCards";
import TeamCard from "./TeamCard";

const RegistrationsTab = ({
    registrations = [],
    loading,
    onRefresh,
    formatDate,
}) => {
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <StatsCards registrations={registrations} formatDate={formatDate} />

            {/* Registrations List */}
            <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Team Registrations</h2>
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
                        <div className="text-white text-lg">Loading registrations...</div>
                    </div>
                ) : registrations.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Registrations Yet</h3>
                        <p className="text-gray-300">Teams haven't started registering for your hackathon yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {registrations.map((registration, index) => (
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

export default RegistrationsTab;
