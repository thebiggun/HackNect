"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Background from "@/components/Background";
import { 
    Users, 
    ArrowLeft, 
    Crown, 
    User, 
    Copy, 
    Check, 
    Calendar, 
    FileText, 
    AlertCircle, 
    Upload, 
    CheckCircle2, 
    Lock, 
    ShieldAlert, 
    AlertTriangle,
    ExternalLink 
} from "lucide-react";
import Link from "next/link";

const RegistrationDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const [registration, setRegistration] = useState(null);
    const [teammates, setTeammates] = useState([]);
    const [isTeamLeader, setIsTeamLeader] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
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
                setIsTeamLeader(Boolean(data.data.isTeamLeader));
                setCurrentUserId(data.data.currentUserId || null);
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

    // Compute unique team member count and hackathon size requirements
    const memberIds = new Set([registration.team_leader_id, ...(registration.teammates || [])].filter(Boolean));
    const currentMemberCount = memberIds.size > 0 ? memberIds.size : (leader ? 1 + otherTeammates.length : (teammates.length || 1));
    const minTeamSize = registration.hackathons?.team_min || 1;
    const maxTeamSize = registration.hackathons?.team_max;
    const isTeamSizeSufficient = currentMemberCount >= minTeamSize;
    const neededMembers = Math.max(0, minTeamSize - currentMemberCount);

    // Helper to check if current user is team lead
    const isTeamLead = isTeamLeader || (currentUserId && leaderId === currentUserId);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                setUploadError('Only PDF files are allowed.');
                setSelectedFile(null);
                e.target.value = '';
                return;
            }
            setSelectedFile(file);
            setUploadError(null);
        }
    };

    const handlePdfUpload = async (e) => {
        e.preventDefault();
        setUploadError(null);
        setUploadSuccess(null);

        if (!isTeamSizeSufficient) {
            setUploadError(`Your team must have at least ${minTeamSize} member${minTeamSize > 1 ? 's' : ''} to submit an idea PDF.`);
            return;
        }

        const fileInput = document.getElementById('pdf-upload');
        const file = fileInput?.files?.[0] || selectedFile;
        if (!file) {
            setUploadError('Please select a PDF file to upload.');
            return;
        }

        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            setUploadError('Only PDF files are allowed.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('pdf', file);

        try {
            const res = await fetch(`/api/registrations/${params.id}`, {
                method: 'PUT',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                setUploadSuccess('Idea PDF uploaded successfully!');
                setSelectedFile(null);
                if (fileInput) fileInput.value = '';
                fetchRegistrationDetails();
            } else {
                setUploadError(data.error || 'Failed to upload PDF.');
            }
        } catch (err) {
            setUploadError('Failed to upload PDF. Please check your connection and try again.');
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
                        <Link href="/dash" className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to Dashboard</span>
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
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-1">{registration.team_name}</h1>
                                <p className="text-gray-300 text-sm">Team ID: <span className="font-mono text-white">{registration.id}</span></p>
                                {registration.hackathons && (
                                    <p className="text-gray-300 text-sm mt-1">Hackathon: <span className="text-cyan-300 font-medium">{registration.hackathons.title}</span></p>
                                )}
                            </div>
                            {registration.invite_code && (
                                <div className="flex items-center gap-3">
                                    <div className="text-left sm:text-right bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-lg border border-white/10 sm:border-0">
                                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Team Invite Code</p>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-white font-semibold text-base bg-slate-900/60 px-3 py-1 rounded border border-slate-700">{registration.invite_code}</span>
                                            <button
                                                onClick={() => copyToClipboard(registration.invite_code)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded text-xs transition-colors"
                                                title="Copy Invite Code"
                                            >
                                                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                <span>{copied ? "Copied" : "Copy"}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 pt-3 border-t border-white/10">
                            {/* Member Count & Min Requirement Badge */}
                            <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-cyan-400" />
                                <span>{currentMemberCount} member{currentMemberCount !== 1 ? 's' : ''}</span>
                                <span className="text-gray-500">•</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                    isTeamSizeSufficient 
                                        ? "bg-green-500/20 text-green-300 border border-green-500/30" 
                                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                }`}>
                                    {isTeamSizeSufficient 
                                        ? `Min size met (${minTeamSize}${maxTeamSize ? `-${maxTeamSize}` : ''})` 
                                        : `Min ${minTeamSize} required (${neededMembers} needed)`}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-gray-400">
                                <Calendar className="w-4 h-4 text-purple-400" />
                                <span>Registered {formatDate(registration.submitted_at)}</span>
                            </div>

                            {/* Idea PDF Status Badge */}
                            <div className="ml-auto">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                                    registration.idea_pdf_url 
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                                        : "bg-slate-700/50 text-slate-300 border border-slate-600/50"
                                }`}>
                                    {registration.idea_pdf_url ? (
                                        <>
                                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                            <span>Idea PDF Submitted</span>
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="w-3 h-3 text-slate-400" />
                                            <span>No Idea PDF</span>
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Team Members */}
                    <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-cyan-400" />
                                Team Members ({currentMemberCount}{maxTeamSize ? `/${maxTeamSize}` : ''})
                            </h2>
                            {!isTeamSizeSufficient && (
                                <span className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                                    Need {neededMembers} more member{neededMembers !== 1 ? 's' : ''} to unlock idea submission
                                </span>
                            )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* Team Leader */}
                            {leader && (
                                <div className="bg-white/10 border border-white/20 rounded-lg p-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-500/20 to-transparent rounded-bl-full pointer-events-none" />
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-[#ff6a00] to-[#ee0979] rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                                            <Crown className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-white truncate" title={leader.name}>{leader.name}</p>
                                            <p className="text-xs text-amber-300 font-medium">Team Leader</p>
                                            <p className="text-xs text-gray-400 truncate mt-0.5" title={leader.email}>{leader.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Teammates */}
                            {otherTeammates.map((teammate) => (
                                <div key={teammate.id} className="bg-white/10 border border-white/20 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center shrink-0">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-white truncate" title={teammate.name}>{teammate.name}</p>
                                            <p className="text-xs text-cyan-300">Teammate</p>
                                            <p className="text-xs text-gray-400 truncate mt-0.5" title={teammate.email}>{teammate.email}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Idea PDF Submission Section */}
                    <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-purple-400" />
                                Project Idea PDF Submission
                            </h2>
                            {registration.idea_pdf_url && (
                                <a 
                                    href={registration.idea_pdf_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded-lg text-sm transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    <span>View Current PDF</span>
                                </a>
                            )}
                        </div>

                        {/* CASE 1: Minimum Team Size NOT Met */}
                        {!isTeamSizeSufficient ? (
                            <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-amber-200">
                                            Idea Submission Locked: Minimum Team Size Not Met
                                        </h3>
                                        <p className="text-sm text-amber-300/90 mt-1">
                                            This hackathon requires at least <strong className="text-amber-100">{minTeamSize} members</strong> before a team can submit their idea PDF. 
                                            Your team currently has <strong className="text-amber-100">{currentMemberCount} member{currentMemberCount !== 1 ? 's' : ''}</strong>. 
                                            You need <strong className="text-amber-100">{neededMembers} more member{neededMembers !== 1 ? 's' : ''}</strong> to join before submitting.
                                        </p>
                                    </div>
                                </div>

                                {registration.invite_code && (
                                    <div className="pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <p className="text-xs text-amber-200">
                                            Share your team invite code with your teammates to invite them:
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-white bg-slate-900/80 px-3 py-1 rounded border border-amber-500/30 text-sm">
                                                {registration.invite_code}
                                            </span>
                                            <button
                                                onClick={() => copyToClipboard(registration.invite_code)}
                                                className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded text-xs font-medium transition-colors"
                                            >
                                                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                <span>{copied ? "Copied" : "Copy Code"}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : isTeamLead ? (
                            /* CASE 2: Team Leader & Team Size Requirement MET */
                            <div>
                                <p className="text-gray-300 text-sm mb-4">
                                    Upload your team's project idea PDF document (pitch deck, architecture diagram, or proposal).
                                    {registration.idea_pdf_url && " You can upload a new PDF below to replace your existing submission."}
                                </p>

                                <form onSubmit={handlePdfUpload} className="flex flex-col gap-4">
                                    <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-6 transition-colors bg-slate-900/40 text-center">
                                        <input 
                                            id="pdf-upload" 
                                            type="file" 
                                            accept="application/pdf,.pdf" 
                                            onChange={handleFileChange}
                                            className="hidden" 
                                        />
                                        <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                                            <div className="p-3 bg-white/5 rounded-full text-cyan-400 group-hover:scale-110 transition-transform">
                                                <Upload className="w-6 h-6" />
                                            </div>
                                            {selectedFile ? (
                                                <div>
                                                    <p className="text-white font-medium">{selectedFile.name}</p>
                                                    <p className="text-xs text-gray-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to change file</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-white font-medium">Click to select PDF document</p>
                                                    <p className="text-xs text-gray-400">Supports PDF up to 15MB</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button 
                                            type="submit" 
                                            disabled={uploading || !selectedFile} 
                                            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {uploading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    <span>Uploading PDF...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4" />
                                                    <span>{registration.idea_pdf_url ? 'Replace PDF' : 'Upload Idea PDF'}</span>
                                                </>
                                            )}
                                        </button>
                                        
                                        {selectedFile && !uploading && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedFile(null);
                                                    const input = document.getElementById('pdf-upload');
                                                    if (input) input.value = '';
                                                }}
                                                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>

                                    {uploadError && (
                                        <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span>{uploadError}</span>
                                        </div>
                                    )}
                                    {uploadSuccess && (
                                        <div className="p-3 bg-green-500/20 border border-green-500/40 rounded-lg text-green-300 text-sm flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                                            <span>{uploadSuccess}</span>
                                        </div>
                                    )}
                                </form>
                            </div>
                        ) : (
                            /* CASE 3: Teammate View (Non-Leader) & Size Requirement MET */
                            <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-white">
                                            {registration.idea_pdf_url ? "Idea PDF Uploaded" : "Awaiting Idea PDF Submission"}
                                        </h3>
                                        <p className="text-sm text-gray-300 mt-1">
                                            {registration.idea_pdf_url ? (
                                                "The team leader has submitted the idea PDF for this registration."
                                            ) : (
                                                `The minimum team size has been met! Only the team leader (${leader?.name || "Team Leader"}) can upload the project idea PDF.`
                                            )}
                                        </p>
                                    </div>
                                </div>
                                {registration.idea_pdf_url && (
                                    <div className="pt-2">
                                        <a 
                                            href={registration.idea_pdf_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-semibold hover:from-cyan-400 hover:to-purple-400 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            <span>View Submitted Idea PDF</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationDetailPage;

