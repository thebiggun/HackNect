"use client";
import { Calendar, Users, MapPin, Trophy, Clock, Eye, User } from "lucide-react";
import { formatDate, getTimeRemaining } from "../utils";

const HackathonCard = ({ hackathon, onClick }) => {
    return (
        <div 
            className="group bg-white/10 border border-white/20 rounded-xl overflow-hidden backdrop-blur-md hover:bg-white/15 transition-all duration-300 relative cursor-pointer hover:scale-105 transform"
            onClick={onClick}
        >
            {/* Banner Image */}
            <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-800 relative overflow-hidden">
                {hackathon.banner_url ? (
                    <img 
                        src={hackathon.banner_url} 
                        alt={hackathon.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-white/50" />
                    </div>
                )}
                
                {/* Creator Info Overlay */}
                {hackathon.creator && (
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-white/80" />
                            <span className="text-white/90 text-sm font-medium">
                                {hackathon.creator.name || 'Anonymous'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Time Remaining Badge */}
                {hackathon.registration_deadline && (
                    <div className="absolute top-4 right-4">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            getTimeRemaining(hackathon.registration_deadline) === 'Registration Closed'
                                ? 'bg-red-500/80 text-white'
                                : 'bg-green-500/80 text-white'
                        }`}>
                            {getTimeRemaining(hackathon.registration_deadline)}
                        </div>
                    </div>
                )}

                {/* View Details Button */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-white" />
                        <span className="text-white font-semibold">View Details</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-white line-clamp-2 mb-3 group-hover:text-[#ff6a00] transition-colors">
                    {hackathon.title}
                </h3>
                
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {hackathon.description || 'No description available'}
                </p>

                <div className="space-y-3">
                    {hackathon.venue && (
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{hackathon.venue}</span>
                        </div>
                    )}

                    {hackathon.registration_deadline && (
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>Deadline: {formatDate(hackathon.registration_deadline)}</span>
                        </div>
                    )}

                    {(hackathon.team_min || hackathon.team_max) && (
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <Users className="w-4 h-4" />
                            <span>
                                {hackathon.team_min && hackathon.team_max 
                                    ? `${hackathon.team_min}-${hackathon.team_max} members`
                                    : hackathon.team_min 
                                        ? `Min ${hackathon.team_min} members`
                                        : `Max ${hackathon.team_max} members`
                                }
                            </span>
                        </div>
                    )}

                    {hackathon.prizes && (
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                            <Trophy className="w-4 h-4" />
                            <span className="line-clamp-1">{hackathon.prizes}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HackathonCard;
