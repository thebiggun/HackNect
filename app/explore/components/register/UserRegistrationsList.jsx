"use client";
import { Users, Copy, Check } from "lucide-react";
import { formatShortDate } from "../utils";

const UserRegistrationsList = ({
    hackathonTitle,
    registrations = [],
    copied = false,
    onCopy,
    onViewDetails
}) => {
    return (
        <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-md">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your Registrations for {hackathonTitle}
            </h3>
            
            {registrations.length === 0 ? (
                <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300">You haven't registered for this hackathon yet.</p>
                    <p className="text-gray-400 text-sm mt-2">Create a team to get started!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {registrations.map((registration) => (
                        <div key={registration.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-lg font-semibold text-white">{registration.team_name}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                                        Registered
                                    </span>
                                </div>
                            </div>
                            
                            <p className="text-gray-400 text-xs mb-3">
                                Registered: {formatShortDate(registration.submitted_at)}
                            </p>

                            {/* Show invite code if user is team leader */}
                            {registration.invite_code && (
                                <div className="mb-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                                    <p className="text-cyan-300 text-sm mb-2">Team Invite Code:</p>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-white font-semibold">{registration.invite_code}</span>
                                        <button
                                            onClick={() => onCopy(registration.invite_code)}
                                            className="text-cyan-400 hover:text-cyan-300"
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onViewDetails(registration.id)}
                                    className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                                >
                                    View Registration Details →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserRegistrationsList;
