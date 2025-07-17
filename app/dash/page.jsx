"use client";
import { useState, useEffect } from "react";
import { Plus, Calendar, Users, Clock, Trophy, ExternalLink } from "lucide-react"
import Link from "next/link";
import { useRouter } from "next/navigation";
import Loader from '@/components/Loader';

const page = () => {
    const [hackathons, setHackathons] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [navLoading, setNavLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchHackathons();
        fetchRegistrations();
    }, []);

    const fetchHackathons = async () => {
        try {
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
        }
    };

    const fetchRegistrations = async () => {
        try {
            const response = await fetch('/api/teams');
            const data = await response.json();
            
            if (data.success) {
                setRegistrations(data.data || []);
            } else {
                console.error('Failed to fetch registrations:', data.error);
            }
        } catch (err) {
            console.error('Error fetching registrations:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isExpired = (registration) => {
        const deadline = registration.hackathons?.registration_deadline;
        return deadline && new Date(deadline) < new Date();
    };

    const completedCount = registrations.filter(
        (registration) => {
            const deadline = registration.hackathons?.registration_deadline;
            return deadline && new Date(deadline) < new Date();
        }
    ).length;

    return (
        <div className='relative w-full p-4 sm:p-6 md:p-8 pt-0'>
                <div className="px-2 sm:px-4 md:px-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                        <div>
                            <span className="text-3xl font-semibold text-white">
                                Your
                            </span>
                            <span className="ml-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-300">
                                Dashboard
                            </span>
                        </div>

                        {/* Option 1: Button in header area */}
                        <div className="flex gap-4">
                            <Link href={"/creator-dash"} className="group relative px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-semibold text-white transition-all duration-300 hover:from-green-400 hover:to-emerald-400 hover:shadow-[0_0_24px_8px_rgba(34,197,94,0.3)] hover:scale-105 cursor-pointer">
                                <div className="flex items-center space-x-2">
                                    <Users className="w-5 h-5" />
                                    <span>Creator Dashboard</span>
                                </div>
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            </Link>
                            <Link href={"/hosting"} className="group relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold text-white transition-all duration-300 hover:from-cyan-400 hover:to-purple-400 hover:shadow-[0_0_24px_8px_rgba(147,51,234,0.3)] hover:scale-105 cursor-pointer">
                                <div className="flex items-center space-x-2">
                                    <Plus className="w-5 h-5" />
                                    <span>Host a Hackathon</span>
                                </div>
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 pt-6">
                        <div className="bg-white/10 border-white/20 border backdrop-blur-[2px] rounded-md w-full lg:w-[70vw] flex flex-col">
                            {/* Registered Hackathons Section */}
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Calendar className="w-6 h-6" />
                                    Your Registered Hackathons
                                </h2>
                                
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                                        <p className="text-gray-300 mt-2">Loading your registrations...</p>
                                    </div>
                                ) : registrations.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-white mb-2">No Registrations Yet</h3>
                                        <p className="text-gray-300 mb-6">
                                            You haven't registered for any hackathons yet. Start exploring to find your next challenge!
                                        </p>
                                        <button 
                                            onClick={async () => { setNavLoading(true); await router.push('/explore'); setNavLoading(false); }}
                                            className="group relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold text-white transition-all duration-300 hover:from-cyan-400 hover:to-purple-400 hover:shadow-[0_0_24px_8px_rgba(147,51,234,0.3)] hover:scale-105"
                                        >
                                            {navLoading ? <Loader size={18} className="mr-2 align-middle" /> : <div className="flex items-center space-x-2"><Plus className="w-5 h-5" /><span>Explore Hackathons</span></div>}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {registrations.map((registration) => {
                                            const hasIdeaPdf = !!registration.idea_pdf_url;
                                            const expired = isExpired(registration);

                                            let borderColor = "";
                                            let shadowColor = "";
                                            if (hasIdeaPdf && !expired) {
                                                borderColor = "border-green-400/30 hover:border-green-400/50";
                                                shadowColor = "shadow-[0_0_24px_4px_rgba(34,197,94,0.15)]";
                                            } else if (hasIdeaPdf && expired) {
                                                borderColor = "border-yellow-400/30 hover:border-yellow-400/50";
                                                shadowColor = "shadow-[0_0_24px_4px_rgba(251,191,36,0.15)]";
                                            } else if (!hasIdeaPdf && !expired) {
                                                borderColor = "border-red-400/30 hover:border-red-400/50";
                                                shadowColor = "shadow-[0_0_24px_4px_rgba(239,68,68,0.15)]";
                                            } else {
                                                borderColor = "border-gray-400/30 hover:border-gray-400/50";
                                                shadowColor = "shadow-[0_0_24px_4px_rgba(156,163,175,0.15)]";
                                            }

                                            return (
                                                <div 
                                                    key={registration.id}
                                                    className={`bg-[#181c23] border-2 rounded-lg p-4 transition-all duration-300 ${borderColor} ${shadowColor}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-semibold text-white mb-1">
                                                                {registration.hackathons?.title || 'Unknown Hackathon'}
                                                            </h3>
                                                            <div className="flex items-center gap-4 text-sm text-gray-300">
                                                                <span className="flex items-center gap-1">
                                                                    <Users className="w-4 h-4" />
                                                                    Team: {registration.team_name}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    {formatDate(registration.created_at)}
                                                                </span>
                                                                {/* Status text */}
                                                                <span className={`ml-2 px-2 py-1 rounded text-xs font-bold
                                                                    ${hasIdeaPdf ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
                                                                `}>
                                                                    {hasIdeaPdf ? "Idea PDF Uploaded" : "No Idea PDF"}
                                                                </span>
                                                                <span className={`ml-2 px-2 py-1 rounded text-xs font-bold
                                                                    ${expired ? "bg-yellow-500/20 text-yellow-400" : "bg-blue-500/20 text-blue-400"}
                                                                `}>
                                                                    {expired ? "Expired" : "Ongoing"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Link
                                                                href={`/registration/${registration.id}`}
                                                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-400 hover:to-pink-400 transition-all duration-200 text-sm font-medium"
                                                            >
                                                                View Details
                                                            </Link>
                                                            <Link
                                                                href={`/explore/${registration.hackathon_id}`}
                                                                className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 rounded-md flex-1">
                            {/* Created Card */}
                            <div className="bg-[#181c23] rounded-md p-4 flex items-center border-2 border-[#232935] justify-between transition-all duration-300 hover:shadow-[0_0_24px_4px_rgba(59,130,246,0.15)] hover:border-blue-400/30">
                                <div>
                                    <div className="text-gray-300 text-sm">Created</div>
                                    <div className="text-3xl font-bold text-blue-400">
                                        {loading ? "..." : hackathons.length}
                                    </div>
                                </div>
                                <Plus className="text-blue-400 w-8 h-8" />
                            </div>

                            {/* Participating Card */}
                            <div className="bg-[#181c23] rounded-md border-2 border-[#232935] p-4 flex items-center justify-between transition-all duration-300 hover:shadow-[0_0_24px_4px_rgba(34,197,94,0.15)] hover:border-green-400/30">
                                <div>
                                    <div className="text-gray-300 text-sm">Participating</div>
                                    <div className="text-3xl font-bold text-green-400">
                                        {loading ? "..." : registrations.length}
                                    </div>
                                </div>
                                <Users className="text-green-400 w-8 h-8" />
                            </div>

                            {/* Completed Card */}
                            <div className="bg-[#181c23] border-2 border-[#232935] rounded-md p-4 flex items-center justify-between transition-all duration-300 hover:shadow-[0_0_24px_4px_rgba(168,85,247,0.15)] hover:border-purple-400/30">
                                <div>
                                    <div className="text-gray-300 text-sm">Completed</div>
                                    <div className="text-3xl font-bold text-purple-400">
                                        {loading ? "..." : completedCount}
                                    </div>
                                </div>
                                <Clock className="text-purple-400 w-8 h-8" />
                            </div>

                            {/* Wins Card */}
                            <div className="bg-[#181c23] border-2 border-[#232935] rounded-md p-4 flex items-center justify-between transition-all duration-300 hover:shadow-[0_0_24px_4px_rgba(251,191,36,0.15)] hover:border-yellow-400/30">
                                <div>
                                    <div className="text-gray-300 text-sm">Wins</div>
                                    <div className="text-3xl font-bold text-yellow-400">1</div>
                                </div>
                                <Trophy className="text-yellow-400 w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    );
}

export default page;