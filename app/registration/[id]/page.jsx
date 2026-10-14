"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Background from "@/components/Background";
import {
    RegistrationHeader,
    TeamInfoCard,
    TeamMembersSection,
    IdeaSubmissionSection,
    RegistrationLoading,
    RegistrationError,
} from "../components";

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

    if (loading) {
        return <RegistrationLoading />;
    }

    if (error || !registration) {
        return <RegistrationError error={error} onBack={() => router.back()} />;
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

    const handleCancelFile = () => {
        setSelectedFile(null);
        const input = document.getElementById('pdf-upload');
        if (input) input.value = '';
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

        if (file.size > 4.2 * 1024 * 1024) {
            setUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). PDF size must be under 4MB due to server upload limits.`);
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

            if (!res.ok) {
                let errorMsg = 'Failed to upload PDF.';
                try {
                    const errorData = await res.json();
                    errorMsg = errorData.error || errorMsg;
                } catch {
                    const text = await res.text();
                    if (res.status === 413 || text.includes('FUNCTION_PAYLOAD_TOO_LARGE') || text.includes('Request Entity Too Large')) {
                        errorMsg = 'PDF is too large for server limits. Please compress your PDF to under 4MB.';
                    } else if (text) {
                        errorMsg = text.slice(0, 150);
                    }
                }
                setUploadError(errorMsg);
                return;
            }

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
            setUploadError(err.message || 'Failed to upload PDF. Please check your connection and try again.');
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
                <RegistrationHeader hackathonTitle={registration.hackathons?.title} />

                <div className="max-w-4xl mx-auto space-y-6">
                    <TeamInfoCard 
                        registration={registration}
                        currentMemberCount={currentMemberCount}
                        minTeamSize={minTeamSize}
                        maxTeamSize={maxTeamSize}
                        isTeamSizeSufficient={isTeamSizeSufficient}
                        neededMembers={neededMembers}
                        copied={copied}
                        onCopyInviteCode={copyToClipboard}
                    />

                    <TeamMembersSection 
                        currentMemberCount={currentMemberCount}
                        maxTeamSize={maxTeamSize}
                        isTeamSizeSufficient={isTeamSizeSufficient}
                        neededMembers={neededMembers}
                        leader={leader}
                        teammates={otherTeammates}
                    />

                    <IdeaSubmissionSection 
                        registration={registration}
                        isTeamSizeSufficient={isTeamSizeSufficient}
                        isTeamLead={isTeamLead}
                        minTeamSize={minTeamSize}
                        currentMemberCount={currentMemberCount}
                        neededMembers={neededMembers}
                        leader={leader}
                        copied={copied}
                        onCopyInviteCode={copyToClipboard}
                        selectedFile={selectedFile}
                        uploading={uploading}
                        uploadError={uploadError}
                        uploadSuccess={uploadSuccess}
                        onFileChange={handleFileChange}
                        onPdfUpload={handlePdfUpload}
                        onCancelFile={handleCancelFile}
                    />
                </div>
            </div>
        </div>
    );
};

export default RegistrationDetailPage;
