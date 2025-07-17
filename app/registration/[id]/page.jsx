"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Background from "@/components/Background";
import { Users, ArrowLeft, Crown, User, Copy, Check, Calendar } from "lucide-react";
import Link from "next/link";

const RegistrationDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const [registration, setRegistration] = useState(null);
    const [teammates, setTeammates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(null);

    useEffect(() => {
        if (params.id) {
            fetchRegistrationDetails();
        }
        // eslint-disable-next-line
    }, [params.id]);

    const fetchRegistrationDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/registrations/${params.id}`);
            const data = await response.json();
            if (data.success) {
                setRegistration(data.data.registration);
                setTeammates(data.data.teammates || []);
            } else {
                setError(data.error || "Failed to fetch registration details");
            }
        } catch (err) {
            setError("Failed to fetch registration details");
            console.error("Error fetching registration details:", err);
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
            console.error("Failed to copy:", err);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not set";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
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

    if (error || !registration) {
        return (
            <div>
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <Background />
                </div>
                <div className="relative w-full p-8 pt-0">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="text-red-400 text-xl mb-4">{error || "Registration not found"}</div>
                            <button
                                onClick={() => router.back()}
                                className="text-cyan-400 hover:text-cyan-300"
                            >
                                ← Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Find leader in teammates or registration
    const leaderId = registration.team_leader_id;
    const leader = teammates.find((t) => t.id === leaderId);
    const otherTeammates = teammates.filter((t) => t.id !== leaderId);

    // Helper to check if current user is team lead
    const isTeamLead = registration && leaderId === teammates.find((t) => t.id === leaderId)?.id;

    const handlePdfUpload = async (e) => {
        e.preventDefault();
        setUploading(true);
        setUploadError(null);
        setUploadSuccess(null);
        const fileInput = document.getElementById('pdf-upload');
        if (!fileInput.files[0]) {
            setUploadError('Please select a PDF file.');
            setUploading(false);
            return;
        }
        const formData = new FormData();
        formData.append('pdf', fileInput.files[0]);
        try {
            const res = await fetch(`/api/registrations/${params.id}`, {
                method: 'PUT',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setUploadSuccess('PDF uploaded successfully!');
                fetchRegistrationDetails();
            } else {
                setUploadError(data.error || 'Failed to upload PDF.');
            }
        } catch (err) {
            setUploadError('Failed to upload PDF.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <div className="fixed inset-0 z-0 overflow-hidden">
                <Background />
            </div>
            <div className="relative w-full p-8 pt-0">
                <div className="px-6 mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/explore" className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to Explore</span>
                        </Link>
                    </div>
                    <div>
                        <span className="text-3xl font-semibold text-white">Team Registration for</span>
                        <span className="ml-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-300">
                            {registration.hackathons?.title || "Unknown Hackathon"}
                        </span>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Team Header */}
                    <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-2">{registration.team_name}</h1>
                                <p className="text-gray-300 text-sm">Team ID: <span className="font-mono text-white">{registration.id}</span></p>
                                {registration.hackathons && (
                                    <p className="text-gray-300">Hackathon: {registration.hackathons.title}</p>
                                )}
                            </div>
                            {registration.invite_code && (
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-gray-400 text-sm">Invite Code</p>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-white font-semibold">{registration.invite_code}</span>
                                            <button
                                                onClick={() => copyToClipboard(registration.invite_code)}
                                                className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded text-xs text-white hover:bg-white/20 transition-colors"
                                            >
                                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{1 + otherTeammates.length} member{otherTeammates.length !== 0 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Registered {formatDate(registration.submitted_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Team Members */}
                    <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-md">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Team Members
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* Team Leader */}
                            {leader && (
                                <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-[#ff6a00] to-[#ee0979] rounded-full flex items-center justify-center">
                                            <Crown className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-white">{leader.name}</p>
                                            <p className="text-sm text-gray-400">Team Leader</p>
                                            <p className="text-xs text-gray-500">{leader.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Teammates */}
                            {otherTeammates.map((teammate) => (
                                <div key={teammate.id} className="bg-white/10 border border-white/20 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-white">{teammate.name}</p>
                                            <p className="text-sm text-gray-400">Teammate</p>
                                            <p className="text-xs text-gray-500">{teammate.email}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {isTeamLead && (
                        <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-md mt-6">
                            <h2 className="text-xl font-semibold text-white mb-4">Upload Project PDF</h2>
                            <form onSubmit={handlePdfUpload} className="flex flex-col gap-4">
                                <input id="pdf-upload" type="file" accept="application/pdf" className="text-white" />
                                <button type="submit" disabled={uploading} className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-purple-400 transition-all duration-200">
                                    {uploading ? 'Uploading...' : 'Upload PDF'}
                                </button>
                                {uploadError && <div className="text-red-400">{uploadError}</div>}
                                {uploadSuccess && <div className="text-green-400">{uploadSuccess}</div>}
                                {registration.idea_pdf_url && (
                                    <a href={registration.idea_pdf_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">View Uploaded PDF</a>
                                )}
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegistrationDetailPage;
