"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Background from "@/components/Background";
import { Users, ArrowLeft, Crown, User, Copy, Check, Calendar } from "lucide-react";
import Link from "next/link";

const TeamDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const [team, setTeam] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchTeamDetails();
        }
    }, [params.id]);

    const fetchTeamDetails = async () => {
        try {
            setLoading(true);
            
            // Fetch team members and team info
            const response = await fetch(`/api/teams/${params.id}/members`);
            const data = await response.json();
            
            if (data.success) {
                setTeam(data.data.team);
                setMembers(data.data.members);
            } else {
                setError(data.error || 'Failed to fetch team details');
            }
        } catch (err) {
            setError('Failed to fetch team details');
            console.error('Error fetching team details:', err);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
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

    const getRoleIcon = (role) => {
        switch (role) {
            case 'leader':
                return <Crown className="w-4 h-4 text-yellow-400" />;
            default:
                return <User className="w-4 h-4 text-gray-400" />;
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'leader':
                return 'Team Leader';
            case 'member':
                return 'Member';
            default:
                return role;
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

    if (error) {
        return (
            <div>
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <Background />
                </div>
                <div className="relative w-full p-8 pt-0">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="text-red-400 text-xl mb-4">{error}</div>
                            <Link href="/register" className="text-cyan-400 hover:text-cyan-300">
                                ← Back to Team Registration
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="fixed inset-0 z-0 overflow-hidden">
                <Background />
            </div>
            <div className="relative w-full p-8 pt-0">
                <div className="px-6 mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/register" className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to Registration</span>
                        </Link>
                    </div>
                    <div>
                        <span className="text-3xl font-semibold text-white">
                            Team
                        </span>
                        <span className="ml-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-300">
                            Details
                        </span>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Team Header */}
                    {team && (
                        <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-white mb-2">{team.name}</h1>
                                    {team.hackathons && (
                                        <p className="text-gray-300">
                                            Hackathon: {team.hackathons.title}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-gray-400 text-sm">Invite Code</p>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-white font-semibold">{team.invite_code}</span>
                                            <button
                                                onClick={() => copyToClipboard(team.invite_code)}
                                                className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded text-xs text-white hover:bg-white/20 transition-colors"
                                            >
                                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Created {formatDate(team.created_at)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Team Members */}
                    <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-md">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Team Members
                        </h2>
                        
                        {members.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-300">No members found.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {members.map((member, index) => (
                                    <div key={member.users.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                {getRoleIcon(member.role)}
                                                <div>
                                                    <h3 className="font-semibold text-white">{member.users.name}</h3>
                                                    <p className="text-sm text-gray-400">{member.users.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-white">{getRoleLabel(member.role)}</p>
                                                <p className="text-xs text-gray-400">
                                                    Joined {formatDate(member.joined_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-md">
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                        <div className="flex gap-4">
                            <button
                                onClick={() => copyToClipboard(team?.invite_code || '')}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all duration-200"
                            >
                                <Copy className="w-4 h-4" />
                                Copy Invite Code
                            </button>
                            <Link
                                href="/register"
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
                            >
                                <Users className="w-4 h-4" />
                                Manage Teams
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamDetailPage; 