"use client";
import React from "react";
import { Calendar, Crown, User } from "lucide-react";

const TeamCard = ({ registration, index, formatDate }) => {
    // Filter teammates to exclude the team leader
    const filteredTeammates = registration.teammates?.filter(
        (teammate) => teammate.id !== registration.team_leader?.id
    ) || [];
    const memberCount = 1 + filteredTeammates.length;

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200">
            <div className="flex flex-col gap-2 sm:gap-4 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 w-full">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#ff6a00] to-[#ee0979] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {index + 1}
                        </div>
                        <h3 className="text-xl font-bold text-white break-words">{registration.team_name}</h3>
                        <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full whitespace-nowrap">
                            <span className="text-green-400 text-sm font-medium">
                                {memberCount} members
                            </span>
                        </div>
                        {typeof registration.score === 'number' && (
                            <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full whitespace-nowrap">
                                <span className="text-purple-300 text-sm font-medium">
                                    Score: {registration.score}/100
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-300 w-full sm:w-auto">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 shrink-0" />
                            Registered: {formatDate(registration.submitted_at)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Crown className="w-4 h-4 shrink-0" />
                            Leader: {registration.team_leader?.name || 'Unknown'}
                        </span>
                    </div>
                </div>

                {/* PDF Submission Info */}
                <div className="text-sm">
                    <span className="font-semibold text-gray-300">Project PDF: </span>
                    {registration.idea_pdf_url ? (
                        <a
                            href={registration.idea_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 underline hover:text-cyan-300 transition-colors"
                        >
                            View PDF
                        </a>
                    ) : (
                        <span className="text-red-400">Not submitted</span>
                    )}
                </div>
            </div>

            {/* Team Members */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Team Members</h4>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 w-full">
                    {/* Team Leader as first member */}
                    <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#ff6a00] to-[#ee0979] rounded-full flex items-center justify-center shrink-0">
                                <Crown className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate">{registration.team_leader?.name || 'Unknown'}</p>
                                <p className="text-sm text-gray-400">Team Leader</p>
                                <p className="text-xs text-gray-500 truncate">{registration.team_leader?.email || 'No email'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Teammates (excluding leader) */}
                    {filteredTeammates.map((teammate) => (
                        <div key={teammate.id} className="bg-white/10 border border-white/20 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white truncate">{teammate.name}</p>
                                    <p className="text-sm text-gray-400">Teammate</p>
                                    <p className="text-xs text-gray-500 truncate">{teammate.email}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeamCard;
