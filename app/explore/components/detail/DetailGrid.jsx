"use client";
import { MapPin, Users, Clock, Trophy } from "lucide-react";
import { formatDetailDate, getDetailTimeRemaining } from "../utils";

const DetailGrid = ({ hackathon }) => {
    if (!hackathon) return null;

    const timeRemaining = getDetailTimeRemaining(hackathon.registration_deadline);
    const isClosed = timeRemaining?.includes('Closed');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Venue */}
            {hackathon.venue && (
                <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <MapPin className="w-6 h-6 text-[#ff6a00]" />
                        <h3 className="text-lg font-semibold text-white">Venue</h3>
                    </div>
                    <p className="text-gray-300">{hackathon.venue}</p>
                </div>
            )}

            {/* Team Size */}
            {(hackathon.team_min || hackathon.team_max) && (
                <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Users className="w-6 h-6 text-[#ff6a00]" />
                        <h3 className="text-lg font-semibold text-white">Team Size</h3>
                    </div>
                    <p className="text-gray-300">
                        {hackathon.team_min && hackathon.team_max
                            ? `${hackathon.team_min}-${hackathon.team_max} members`
                            : hackathon.team_min
                                ? `Minimum ${hackathon.team_min} members`
                                : `Maximum ${hackathon.team_max} members`
                        }
                    </p>
                </div>
            )}

            {/* Registration Deadline */}
            <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-6 h-6 text-[#ff6a00]" />
                    <h3 className="text-lg font-semibold text-white">Registration Deadline</h3>
                </div>
                <p className="text-gray-300 mb-2">{formatDetailDate(hackathon.registration_deadline)}</p>
                {hackathon.registration_deadline && (
                    <p className={`text-sm font-medium ${isClosed ? 'text-red-400' : 'text-green-400'}`}>
                        {timeRemaining}
                    </p>
                )}
            </div>

            {/* Top N Selections */}
            {hackathon.top_n_selections && (
                <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Trophy className="w-6 h-6 text-[#ff6a00]" />
                        <h3 className="text-lg font-semibold text-white">Top Selections</h3>
                    </div>
                    <p className="text-gray-300">Top {hackathon.top_n_selections} teams will be selected</p>
                </div>
            )}
        </div>
    );
};

export default DetailGrid;
