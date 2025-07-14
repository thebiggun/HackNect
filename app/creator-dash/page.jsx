"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BackgroundEffects from "@/components/Background";
import { Calendar, Users, MapPin, Trophy, Clock, Edit, Eye, Info } from "lucide-react";

const CreatorDash = () => {
    const router = useRouter();
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHackathons();
    }, []);

    const fetchHackathons = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/hackathons');
            const data = await response.json();
            
            if (data.success) {
                setHackathons(data.data || []);
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

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleHackathonClick = (hackathonId) => {
        router.push(`/creator-dash/${hackathonId}`);
    };

    const handleViewDetails = (e, hackathonId) => {
        e.stopPropagation();
        router.push(`/creator-dash/${hackathonId}`);
    };

    const handleEditHackathon = (e, hackathonId) => {
        e.stopPropagation();
        router.push(`/creator-dash/${hackathonId}`);
    };

    // Helper to get registration status and days left for a hackathon
    const getRegistrationStatus = (hackathon) => {
        if (!hackathon || !hackathon.registration_deadline) return { status: 'Unknown', daysLeft: null };
        const now = new Date();
        const deadline = new Date(hackathon.registration_deadline);
        const diff = deadline - now;
        if (diff < 0) return { status: 'Expired', daysLeft: null };
        return { status: 'Open', daysLeft: Math.ceil(diff / (1000 * 60 * 60 * 24)) };
    };

    if (loading) {
        return (
            <div>
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <BackgroundEffects />
                </div>
                <div className="relative w-full p-8 pt-0">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-white text-xl">Loading your hackathons...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="fixed inset-0 z-0 overflow-hidden">
                <BackgroundEffects />
            </div>
            <div className="relative w-full p-4 sm:p-6 md:p-8 pt-0">
                <div className="px-2 sm:px-4 md:px-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 md:gap-0">
                        <div>
                            <span className="text-3xl font-semibold text-white">
                                Your
                            </span>
                            <span className="ml-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6a00] to-[#ee0979]">
                                Hackathons
                            </span>
                        </div>
                        <div className="text-white text-lg">
                            {hackathons.length} {hackathons.length === 1 ? 'Hackathon' : 'Hackathons'}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                            <p className="text-red-300">{error}</p>
                        </div>
                    )}

                    {hackathons.length === 0 ? (
                        <div className="bg-white/10 border border-white/20 rounded-xl p-12 text-center">
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-[#ff6a00] to-[#ee0979] flex items-center justify-center mb-6">
                                <Calendar className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4">No Hackathons Yet</h2>
                            <p className="text-gray-300 text-lg mb-6">
                                You haven't created any hackathons yet. Start by creating your first event!
                            </p>
                            <a 
                                href="/hosting" 
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white font-semibold rounded-lg hover:from-[#ee0979] hover:to-[#ff6a00] transition-all duration-200"
                            >
                                Create Your First Hackathon
                            </a>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {hackathons.map((hackathon) => (
                                <div 
                                    key={hackathon.id} 
                                    className="group bg-white/10 border border-white/20 rounded-xl overflow-hidden backdrop-blur-md hover:bg-white/15 transition-all duration-300 relative cursor-pointer"
                                    onClick={() => handleHackathonClick(hackathon.id)}
                                >
                                    {/* Banner Image */}
                                    <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-800 relative">
                                        {/* Registration Status Badge */}
                                        {(() => {
                                            const { status, daysLeft } = getRegistrationStatus(hackathon);
                                            return (
                                                <div className={`absolute top-4 left-4 z-10 px-4 py-1 rounded-full text-xs font-bold shadow-lg border-2 ${status === 'Open' ? 'bg-green-500/90 border-green-600 text-white' : 'bg-red-500/90 border-red-600 text-white'}`}>
                                                    {status === 'Open'
                                                        ? `Registration Open · ${daysLeft} day${daysLeft === 1 ? '' : 's'} left`
                                                        : 'Registration Expired'}
                                                </div>
                                            );
                                        })()}
                                        {hackathon.banner_url ? (
                                            <img 
                                                src={hackathon.banner_url} 
                                                alt={hackathon.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Calendar className="w-16 h-16 text-white/50" />
                                            </div>
                                        )}
                                        
                                        <div className="absolute top-4 right-4">
                                            <div className="flex gap-2">
                                                <button 
                                                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors relative group/tooltip"
                                                    onClick={(e) => handleViewDetails(e, hackathon.id)}
                                                >
                                                    <Eye className="w-4 h-4 text-white" />
                                                    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                                        View Details
                                                        <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                                                    </div>
                                                </button>
                                                <button 
                                                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors relative group/tooltip"
                                                    onClick={(e) => handleEditHackathon(e, hackathon.id)}
                                                >
                                                    <Edit className="w-4 h-4 text-white" />
                                                    <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                                        Edit Hackathon
                                                        <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profile Picture - Overlay on bottom of banner */}
                                    <div className="relative -mt-8 ml-6">
                                        <div className="w-16 h-16 rounded-full border-4 border-white/20 overflow-hidden bg-gradient-to-br from-slate-600 to-slate-700 backdrop-blur-sm shadow-lg">
                                            {hackathon.pfp_url ? (
                                                <img 
                                                    src={hackathon.pfp_url} 
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Users className="w-8 h-8 text-white/70" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-xl font-bold text-white line-clamp-2 flex-1">
                                                {hackathon.title}
                                            </h3>
                                            <div className="relative group/tooltip ml-2">
                                                <Info className="w-4 h-4 text-white/60 hover:text-white/80 transition-colors cursor-help" />
                                                <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 max-w-xs z-10">
                                                    <div className="font-semibold mb-1">Hackathon Info</div>
                                                    <div>Created: {formatDate(hackathon.created_at)}</div>
                                                    {hackathon.prizes && <div>Prizes: {hackathon.prizes}</div>}
                                                    {hackathon.timeline && <div>Timeline: {hackathon.timeline}</div>}
                                                    <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                                            {hackathon.description || 'No description available'}
                                        </p>

                                        {/* Details */}
                                        <div className="space-y-3">
                                            {hackathon.venue && (
                                                <div className="flex items-center gap-2 text-gray-300 text-sm relative group/tooltip">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="line-clamp-1">{hackathon.venue}</span>
                                                    {hackathon.venue.length > 20 && (
                                                        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                                            {hackathon.venue}
                                                            <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center gap-2 text-gray-300 text-sm">
                                                <Clock className="w-4 h-4" />
                                                <span>Deadline: {formatDate(hackathon.registration_deadline)}</span>
                                            </div>

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
                                                    <span>{hackathon.prizes}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 mt-6">
                                            <button 
                                                className="flex-1 py-2 px-4 bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white font-semibold rounded-lg hover:from-[#ee0979] hover:to-[#ff6a00] transition-all duration-200 relative group/tooltip"
                                                onClick={(e) => handleViewDetails(e, hackathon.id)}
                                            >
                                                View Details
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                                    View full hackathon details
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                                                </div>
                                            </button>
                                            <button 
                                                className="py-2 px-4 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200 relative group/tooltip"
                                                onClick={(e) => handleEditHackathon(e, hackathon.id)}
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreatorDash;
