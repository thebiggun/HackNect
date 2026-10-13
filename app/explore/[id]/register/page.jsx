"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Background from "@/components/Background";
import Link from "next/link";
import {
    RegisterHeader,
    RegisterTabNav,
    AlreadyRegisteredAlert,
    CreateTeamForm,
    JoinTeamForm,
    UserRegistrationsList
} from "@/app/explore/components";

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

    const isRegistered = registrations.length > 0;

    return (
        <div>
            <div className="fixed inset-0 z-0 overflow-hidden">
                <Background />
            </div>
            <div className="relative w-full p-8 pt-0">
                <RegisterHeader hackathonId={params.id} title={hackathon.title} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Team Management */}
                    <div className="space-y-6">
                        <RegisterTabNav
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            isRegistered={isRegistered}
                        />

                        {isRegistered && <AlreadyRegisteredAlert />}

                        {activeTab === 'create' && (
                            <CreateTeamForm
                                hackathon={hackathon}
                                form={createForm}
                                setForm={setCreateForm}
                                onSubmit={handleCreateTeam}
                                submitting={submitting}
                                isRegistered={isRegistered}
                                createdInviteCode={createdInviteCode}
                                onCopy={copyToClipboard}
                                copied={copied}
                            />
                        )}

                        {activeTab === 'join' && (
                            <JoinTeamForm
                                form={joinForm}
                                setForm={setJoinForm}
                                onSubmit={handleJoinTeam}
                                submitting={submitting}
                                isRegistered={isRegistered}
                            />
                        )}

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
                        <UserRegistrationsList
                            hackathonTitle={hackathon.title}
                            registrations={registrations}
                            copied={copied}
                            onCopy={copyToClipboard}
                            onViewDetails={(registrationId) => router.push(`/registration/${registrationId}`)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HackathonTeamRegistration;