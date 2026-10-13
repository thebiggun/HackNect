"use client";
import React from "react";
import { Users, Clock } from "lucide-react";

const StatsCards = ({ registrations, formatDate }) => {
    const totalTeams = registrations.length;
    const totalParticipants = registrations.reduce((total, reg) => {
        const filteredTeammates = reg.teammates?.filter((t) => t.id !== reg.team_leader?.id) || [];
        return total + 1 + filteredTeammates.length;
    }, 0);

    const avgTeamSize =
        totalTeams > 0
            ? Math.round((totalParticipants / totalTeams) * 10) / 10
            : 0;

    const latestRegistration =
        totalTeams > 0 ? formatDate(registrations[0].submitted_at) : 'None';

    return (
        <div className="grid gap-6 md:grid-cols-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-blue-300 text-sm">Total Teams</p>
                        <p className="text-2xl font-bold text-white">{totalTeams}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-500/20 rounded-lg">
                        <Users className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                        <p className="text-green-300 text-sm">Total Participants</p>
                        <p className="text-2xl font-bold text-white">{totalParticipants}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                        <Clock className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-purple-300 text-sm">Avg Team Size</p>
                        <p className="text-2xl font-bold text-white">{avgTeamSize}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-500/20 rounded-lg">
                        <Clock className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <p className="text-orange-300 text-sm">Latest Registration</p>
                        <p className="text-sm font-semibold text-white truncate max-w-[150px]">{latestRegistration}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsCards;
