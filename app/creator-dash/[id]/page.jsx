"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import BackgroundEffects from "@/components/Background";
import {
    HackathonHeader,
    TabNavigation,
    DetailsTab,
    RegistrationsTab,
    ShortlistedTab,
    formatDate,
    getStatus,
} from "./components";

const HackathonDetail = () => {
    const params = useParams();
    const router = useRouter();
    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreator, setIsCreator] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});
    const [bannerPreview, setBannerPreview] = useState(null);
    const [pfpPreview, setPfpPreview] = useState(null);
    const [activeTab, setActiveTab] = useState('details'); // 'details', 'registrations', or 'shortlisted'
    const [registrations, setRegistrations] = useState([]);
    const [registrationsLoading, setRegistrationsLoading] = useState(false);
    const [shortlistedTeams, setShortlistedTeams] = useState([]);
    const [shortlistedLoading, setShortlistedLoading] = useState(false);
    const [shortlistedError, setShortlistedError] = useState(null);
    const [shortlisting, setShortlisting] = useState(false);
    const [shortlistError, setShortlistError] = useState(null);

    useEffect(() => {
        if (params.id) {
            fetchHackathon();
        }
    }, [params.id]);

    useEffect(() => {
        if ((activeTab === 'registrations' || activeTab === 'shortlisted') && isCreator) {
            fetchRegistrations();
        }
    }, [activeTab, isCreator]);

    // Fetch shortlisted teams when shortlisted tab is active
    useEffect(() => {
        if (activeTab === 'shortlisted' && isCreator) {
            fetchShortlistedTeams();
        }
    }, [activeTab, isCreator, params.id]);

    const fetchShortlistedTeams = async () => {
        try {
            setShortlistedLoading(true);
            setShortlistedError(null);
            const response = await fetch(`/api/hackathons/${params.id}/shortlisted`);
            const data = await response.json();
            if (data.success) {
                setShortlistedTeams(data.data || []);
            } else {
                setShortlistedError(data.error || 'Failed to fetch shortlisted teams');
            }
        } catch (err) {
            setShortlistedError('Failed to fetch shortlisted teams');
        } finally {
            setShortlistedLoading(false);
        }
    };

    const fetchRegistrations = async () => {
        try {
            setRegistrationsLoading(true);
            const response = await fetch(`/api/hackathons/${params.id}/registrations`);
            const data = await response.json();

            if (data.success) {
                setRegistrations(data.data || []);
                return data.data || [];
            } else {
                setError(data.error || 'Failed to fetch registrations');
                return [];
            }
        } catch (err) {
            setError('Failed to fetch registrations');
            console.error('Error fetching registrations:', err);
            return [];
        } finally {
            setRegistrationsLoading(false);
        }
    };

    const fetchHackathon = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/hackathons/${params.id}`);
            const data = await response.json();

            if (data.success) {
                setHackathon(data.data);
                setIsCreator(data.isCreator);
                setFormData({
                    title: data.data.title || '',
                    description: data.data.description || '',
                    team_min: data.data.team_min || '',
                    team_max: data.data.team_max || '',
                    top_n_selections: data.data.top_n_selections || '',
                    registration_deadline: data.data.registration_deadline ? data.data.registration_deadline.split('T')[0] : '',
                    venue: data.data.venue || '',
                    prizes: data.data.prizes || '',
                    timeline: data.data.timeline || '',
                });
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'banner') {
                setBannerPreview(URL.createObjectURL(file));
            } else if (type === 'pfp') {
                setPfpPreview(URL.createObjectURL(file));
            }
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setBannerPreview(null);
        setPfpPreview(null);
        if (hackathon) {
            setFormData({
                title: hackathon.title || '',
                description: hackathon.description || '',
                team_min: hackathon.team_min || '',
                team_max: hackathon.team_max || '',
                top_n_selections: hackathon.top_n_selections || '',
                registration_deadline: hackathon.registration_deadline ? hackathon.registration_deadline.split('T')[0] : '',
                venue: hackathon.venue || '',
                prizes: hackathon.prizes || '',
                timeline: hackathon.timeline || '',
            });
        }
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setSaving(true);

        try {
            const submitData = new FormData();

            // Add form fields
            Object.keys(formData).forEach((key) => {
                if (formData[key] !== '') {
                    submitData.append(key, formData[key]);
                }
            });

            // Add files if selected
            const bannerFile = document.getElementById('banner-upload')?.files[0];
            if (bannerFile) {
                submitData.append('banner_url', bannerFile);
            }

            const pfpFile = document.getElementById('pfp-upload')?.files[0];
            if (pfpFile) {
                submitData.append('pfp_url', pfpFile);
            }

            const response = await fetch(`/api/hackathons/${params.id}`, {
                method: 'PUT',
                body: submitData,
            });

            const data = await response.json();

            if (data.success) {
                setHackathon(data.data);
                setIsEditing(false);
                setBannerPreview(null);
                setPfpPreview(null);
                // Reset file inputs
                if (document.getElementById('banner-upload')) document.getElementById('banner-upload').value = '';
                if (document.getElementById('pfp-upload')) document.getElementById('pfp-upload').value = '';
            } else {
                setError(data.error || 'Failed to update hackathon');
            }
        } catch (err) {
            setError('Failed to update hackathon');
            console.error('Error updating hackathon:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleShortlist = async () => {
        setShortlisting(true);
        setShortlistError(null);
        try {
            let currentRegs = registrations;
            if (!currentRegs || currentRegs.length === 0) {
                currentRegs = await fetchRegistrations();
            }
            // Collect all valid PDF URLs from registrations
            const urls = (currentRegs || [])
                .map((r) => r.idea_pdf_url)
                .filter((url) => url && typeof url === 'string' && url.trim() !== '');

            const response = await fetch('/api/shortlist-ideas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pdfUrls: urls,
                    n: Number(hackathon?.top_n_selections) || 1,
                    hackathonId: params.id,
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.shortlisted) {
                setShortlistError(data.error || 'Failed to shortlist ideas.');
            } else {
                // Refetch shortlisted teams and registrations after shortlisting
                fetchShortlistedTeams();
                fetchRegistrations();
            }
        } catch (err) {
            setShortlistError('Failed to shortlist ideas.');
        } finally {
            setShortlisting(false);
        }
    };

    if (loading) {
        return (
            <div>
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <BackgroundEffects />
                </div>
                <div className="relative w-full p-8 pt-0">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-white text-xl">Loading hackathon details...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <BackgroundEffects />
                </div>
                <div className="relative w-full p-8 pt-0">
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                        <p className="text-red-300">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!hackathon) {
        return (
            <div>
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <BackgroundEffects />
                </div>
                <div className="relative w-full p-8 pt-0">
                    <div className="text-white text-xl">Hackathon not found</div>
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
                    {/* Header */}
                    <HackathonHeader
                        isCreator={isCreator}
                        isEditing={isEditing}
                        saving={saving}
                        onBack={() => router.back()}
                        onEdit={() => setIsEditing(true)}
                        onCancel={handleCancelEdit}
                        onSave={handleSubmit}
                    />

                    {/* Tab Navigation */}
                    {isCreator && !isEditing && (
                        <TabNavigation
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            registrationsCount={registrations.length}
                            shortlistedCount={shortlistedTeams.length}
                        />
                    )}

                    {/* Tab Content */}
                    {activeTab === 'details' ? (
                        <DetailsTab
                            hackathon={hackathon}
                            formData={formData}
                            isEditing={isEditing}
                            bannerPreview={bannerPreview}
                            pfpPreview={pfpPreview}
                            onInputChange={handleInputChange}
                            onFileChange={handleFileChange}
                            formatDate={formatDate}
                            status={getStatus(hackathon)}
                        />
                    ) : activeTab === 'registrations' ? (
                        <RegistrationsTab
                            registrations={registrations}
                            loading={registrationsLoading}
                            onRefresh={fetchRegistrations}
                            formatDate={formatDate}
                        />
                    ) : activeTab === 'shortlisted' && isCreator ? (
                        <ShortlistedTab
                            hackathon={hackathon}
                            shortlistedTeams={shortlistedTeams}
                            loading={shortlistedLoading}
                            onRefresh={fetchShortlistedTeams}
                            onShortlist={handleShortlist}
                            shortlisting={shortlisting}
                            shortlistError={shortlistError}
                            formatDate={formatDate}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default HackathonDetail;