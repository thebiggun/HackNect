"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Background from "@/components/Background";
import { Calendar, Users, MapPin, Trophy, Clock, ArrowLeft, User, Share2, Bookmark, ExternalLink } from "lucide-react";
import Loader from '@/components/Loader';

const HackathonDetail = () => {
    const params = useParams();
    const router = useRouter();
    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [navLoading, setNavLoading] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchHackathon();
        }
    }, [params.id]);

    const fetchHackathon = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/hackathons/public/${params.id}`);
            const data = await response.json();

            if (data.success) {
                setHackathon(data.data);
            } else {
                setError(data.error || 'Failed to fetch hackathon');
            }
        } catch (err) {
            setError('Failed to fetch hackathon');
            console.error('Error fetching hackathon:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeRemaining = (deadline) => {
        if (!deadline) return null;
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diff = deadlineDate - now;

        if (diff <= 0) return 'Registration Closed';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h ${minutes}m left`;
        if (hours > 0) return `${hours}h ${minutes}m left`;
        return `${minutes}m left`;
    };

    const getRegistrationStatus = (deadline) => {
        if (!deadline) return { status: 'Open', color: 'text-green-400' };
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diff = deadlineDate - now;

        if (diff <= 0) return { status: 'Closed', color: 'text-red-400' };
        if (diff <= 24 * 60 * 60 * 1000) return { status: 'Ending Soon', color: 'text-yellow-400' };
        return { status: 'Open', color: 'text-green-400' };
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: hackathon.title,
                    text: hackathon.description,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            } catch (err) {
                console.log('Error copying to clipboard:', err);
            }
        }
    };

    if (loading) {
        return (
            <div>
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <Background />
                </div>
                <div className="relative w-full p-8 pt-0">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-white text-xl">Loading...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !hackathon) {
        return (
            <div>
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <Background />
                </div>
                <div className="relative w-full p-8 pt-0">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="text-red-400 text-xl mb-4">{error || 'Hackathon not found'}</div>
                            <button
                                onClick={() => router.push('/explore')}
                                className="text-cyan-400 hover:text-cyan-300"
                            >
                                ← Back to Explore
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const registrationStatus = getRegistrationStatus(hackathon.registration_deadline);

    return (
        <div>
            <div className="fixed inset-0 z-0 overflow-hidden">
                <Background />
            </div>
            <div className="relative w-full p-4 sm:p-6 md:p-8 pt-0">
                <div className="px-2 sm:px-4 md:px-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                        <button
                            onClick={() => router.push('/explore')}
                            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to Explore</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Hero Section */}
                        <div className="relative">
                            {hackathon.banner_url && (
                                <img
                                    src={hackathon.banner_url}
                                    alt={hackathon.title}
                                    className="w-full h-64 object-cover rounded-xl"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <h1 className="text-3xl font-bold text-white mb-2">{hackathon.title}</h1>
                                {hackathon.creator && (
                                    <p className="text-gray-300">by {hackathon.creator.name}</p>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">About</h2>
                            <p className="text-gray-300 leading-relaxed">{hackathon.description}</p>
                        </div>

                        {/* Details Grid */}
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
                                <p className="text-gray-300 mb-2">{formatDate(hackathon.registration_deadline)}</p>
                                {hackathon.registration_deadline && (
                                    <p className={`text-sm font-medium ${getTimeRemaining(hackathon.registration_deadline)?.includes('Closed') ? 'text-red-400' : 'text-green-400'}`}>
                                        {getTimeRemaining(hackathon.registration_deadline)}
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

                        {/* Timeline */}
                        {hackathon.timeline && (
                            <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Calendar className="w-6 h-6 text-[#ff6a00]" />
                                    <h3 className="text-xl font-semibold text-white">Timeline</h3>
                                </div>
                                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4">
                                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">{hackathon.timeline}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Registration Status Card */}
                        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Registration Status</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">Status:</span>
                                    <span className={`font-semibold ${registrationStatus.color}`}>
                                        {registrationStatus.status}
                                    </span>
                                </div>
                                {hackathon.registration_deadline && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Time Left:</span>
                                        <span className={`font-semibold ${getTimeRemaining(hackathon.registration_deadline)?.includes('Closed') ? 'text-red-400' : 'text-green-400'}`}>
                                            {getTimeRemaining(hackathon.registration_deadline)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 space-y-3">
                                <button
                                    onClick={() => router.push(`/explore/${params.id}/register`)}
                                    disabled={getTimeRemaining(hackathon.registration_deadline) === 'Registration Closed'}
                                    className={`w-full py-3 font-semibold rounded-lg transition-all duration-200 transform ${getTimeRemaining(hackathon.registration_deadline) === 'Registration Closed'
                                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                                            : 'bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white hover:from-[#ee0979] hover:to-[#ff6a00] hover:scale-105'
                                        }`}
                                >
                                    {getTimeRemaining(hackathon.registration_deadline) === 'Registration Closed'
                                        ? 'Registration Closed'
                                        : 'Register for Teams'
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Quick Info */}
                        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Quick Info</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Created:</span>
                                    <span className="text-white">{formatDate(hackathon.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Last Updated:</span>
                                    <span className="text-white">{formatDate(hackathon.updated_at)}</span>
                                </div>
                                {hackathon.creator && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Organizer:</span>
                                        <span className="text-white">{hackathon.creator.name || 'Anonymous'}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Share Section */}
                        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Trophy className="w-6 h-6 text-[#ff6a00]" />
                                <h3 className="text-xl font-semibold text-white">Prizes</h3>
                            </div>
                            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4">
                                <p className="text-gray-300 leading-relaxed">{hackathon.prizes}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HackathonDetail;
