"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Background from "@/components/Background";
import { Users, Plus, UserPlus, Copy, Check, ArrowLeft, Crown, User } from "lucide-react";
import Link from "next/link";

const HackathonTeamRegistration = () => {
    const params = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('create'); // 'create' or 'join'
    const [hackathon, setHackathon] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [copied, setCopied] = useState(false);
    const [createdInviteCode, setCreatedInviteCode] = useState(null);
    
    // Form states
    const [createForm, setCreateForm] = useState({
        teamName: ''
    });
    const [joinForm, setJoinForm] = useState({
        inviteCode: ''
    });

    useEffect(() => {
        if (params.id) {
            fetchHackathon();
            fetchUserRegistrations();
        }
    }, [params.id]);

    const fetchHackathon = async () => {
        try {
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
        }
    };

    const fetchUserRegistrations = async () => {
        try {
            const response = await fetch('/api/teams');
            const data = await response.json();
            
            if (data.success) {
                // Filter registrations for this specific hackathon
                const hackathonRegistrations = data.data.filter(registration => 
                    registration.hackathon_id === params.id
                );
                setRegistrations(hackathonRegistrations);
            }
        } catch (err) {
            console.error('Error fetching registrations:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        setCreatedInviteCode(null);

        try {
            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'create',
                    teamName: createForm.teamName,
                    hackathonId: params.id
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                setSuccess(`Team "${createForm.teamName}" registered successfully!`);
                setCreatedInviteCode(data.data.inviteCode);
                setCreateForm({ teamName: '' });
                fetchUserRegistrations(); // Refresh registrations list
            } else {
                setError(data.error || 'Failed to create team');
            }
        } catch (err) {
            setError('Failed to create team');
            console.error('Error creating team:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleJoinTeam = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'join',
                    inviteCode: joinForm.inviteCode
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                setSuccess(data.data.message || 'Successfully joined team!');
                setJoinForm({ inviteCode: '' });
                fetchUserRegistrations(); // Refresh registrations list
            } else {
                setError(data.error || 'Failed to join team');
            }
        } catch (err) {
            setError('Failed to join team');
            console.error('Error joining team:', err);
        } finally {
            setSubmitting(false);
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
            month: 'short',
            day: 'numeric'
        });
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

    if (!hackathon) {
        return (
            <div>
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <Background />
                </div>
                <div className="relative w-full p-8 pt-0">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="text-red-400 text-xl mb-4">Hackathon not found</div>
                            <Link href="/explore" className="text-cyan-400 hover:text-cyan-300">
                                ← Back to Explore
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
                        <Link href={`/explore/${params.id}`} className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to Hackathon</span>
                        </Link>
                    </div>
                    <div>
                        <span className="text-3xl font-semibold text-white">
                            Team Registration for
                        </span>
                        <span className="ml-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-300">
                            {hackathon.title}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Team Management */}
                    <div className="space-y-6">
                        {/* Tab Navigation */}
                        <div className="flex bg-white/10 border border-white/20 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('create')}
                                disabled={registrations.length > 0}
                                className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                                    activeTab === 'create'
                                        ? registrations.length > 0 
                                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                        : registrations.length > 0
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-white hover:bg-white/10'
                                }`}
                            >
                                <Plus className="w-4 h-4" />
                                Create Team
                            </button>
                            <button
                                onClick={() => setActiveTab('join')}
                                disabled={registrations.length > 0}
                                className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                                    activeTab === 'join'
                                        ? registrations.length > 0 
                                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                        : registrations.length > 0
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-white hover:bg-white/10'
                                }`}
                            >
                                <UserPlus className="w-4 h-4" />
                                Join Team
                            </button>
                        </div>

                        {/* Already Registered Message */}
                        {registrations.length > 0 && (
                            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Crown className="w-5 h-5 text-yellow-400" />
                                    <h4 className="text-yellow-300 font-semibold">Already Registered</h4>
                                </div>
                                <p className="text-yellow-200 text-sm">
                                    You are already registered for this hackathon. You cannot create or join additional teams.
                                </p>
                            </div>
                        )}

                        {/* Create Team Form */}
                        {activeTab === 'create' && (
                            <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-md">
                                <h3 className="text-xl font-semibold text-white mb-4">Create a New Team</h3>
                                {registrations.length > 0 ? (
                                    <div className="text-center py-8">
                                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-300 mb-2">You are already registered for this hackathon.</p>
                                        <p className="text-gray-400 text-sm">Check your registrations on the right side.</p>
                                    </div>
                                ) : (
                                    <>
                                        <form onSubmit={handleCreateTeam} className="space-y-4">
                                            <div>
                                                <label className="block text-white font-medium mb-2">Team Name</label>
                                                <input
                                                    type="text"
                                                    value={createForm.teamName}
                                                    onChange={(e) => setCreateForm(prev => ({ ...prev, teamName: e.target.value }))}
                                                    className="w-full px-4 py-2 bg-slate-900/80 text-white border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none"
                                                    placeholder="Enter team name"
                                                    required
                                                />
                                            </div>
                                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                                <p className="text-blue-300 text-sm">
                                                    <strong>Team Size:</strong> {hackathon.team_min && hackathon.team_max 
                                                        ? `${hackathon.team_min}-${hackathon.team_max} members`
                                                        : hackathon.team_min 
                                                            ? `Minimum ${hackathon.team_min} members`
                                                            : hackathon.team_max 
                                                                ? `Maximum ${hackathon.team_max} members`
                                                                : 'No size limit'
                                                    }
                                                </p>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {submitting ? 'Creating...' : 'Create Team'}
                                            </button>
                                        </form>

                                        {/* Show invite code after creation */}
                                        {createdInviteCode && (
                                            <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                                                <h4 className="text-green-300 font-semibold mb-2">Team Created Successfully!</h4>
                                                <p className="text-green-300 text-sm mb-3">Share this invite code with your teammates:</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2">
                                                        <span className="font-mono text-white font-semibold text-lg">{createdInviteCode}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => copyToClipboard(createdInviteCode)}
                                                        className="px-3 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors"
                                                    >
                                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Join Team Form */}
                        {activeTab === 'join' && (
                            <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-md">
                                <h3 className="text-xl font-semibold text-white mb-4">Join an Existing Team</h3>
                                {registrations.length > 0 ? (
                                    <div className="text-center py-8">
                                        <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-300 mb-2">You are already registered for this hackathon.</p>
                                        <p className="text-gray-400 text-sm">Check your registrations on the right side.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleJoinTeam} className="space-y-4">
                                        <div>
                                            <label className="block text-white font-medium mb-2">Invite Code</label>
                                            <input
                                                type="text"
                                                value={joinForm.inviteCode}
                                                onChange={(e) => setJoinForm(prev => ({ ...prev, inviteCode: e.target.value.toUpperCase() }))}
                                                className="w-full px-4 py-2 bg-slate-900/80 text-white border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none font-mono"
                                                placeholder="Enter invite code"
                                                maxLength={8}
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? 'Joining...' : 'Join Team'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* Messages */}
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                                <p className="text-red-300">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                                <p className="text-green-300">{success}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - User's Registrations for this Hackathon */}
                    <div className="space-y-6">
                        <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-md">
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Your Registrations for {hackathon.title}
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
                                                Registered: {formatDate(registration.submitted_at)}
                                            </p>

                                            {/* Show invite code if user is team leader */}
                                            {registration.invite_code && (
                                                <div className="mb-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                                                    <p className="text-cyan-300 text-sm mb-2">Team Invite Code:</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-white font-semibold">{registration.invite_code}</span>
                                                        <button
                                                            onClick={() => copyToClipboard(registration.invite_code)}
                                                            className="text-cyan-400 hover:text-cyan-300"
                                                        >
                                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => router.push(`/registrations/${registration.id}`)}
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HackathonTeamRegistration; 