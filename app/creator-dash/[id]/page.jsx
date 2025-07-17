"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import BackgroundEffects from "@/components/Background";
import { Calendar, Users, MapPin, Trophy, Clock, Edit, Save, ArrowLeft, Upload, X, Crown, User } from "lucide-react";
import Loader from '@/components/Loader';

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
    const [pdfUrls, setPdfUrls] = useState([]); // For displaying collected PDF URLs
    const [shortlisted, setShortlisted] = useState([]);
    const [shortlisting, setShortlisting] = useState(false);
    const [shortlistError, setShortlistError] = useState(null);
    const [shortlistedTeams, setShortlistedTeams] = useState([]);
    const [shortlistedLoading, setShortlistedLoading] = useState(false);
    const [shortlistedError, setShortlistedError] = useState(null);

    useEffect(() => {
        if (params.id) {
            fetchHackathon();
        }
    }, [params.id]);

    useEffect(() => {
        if (activeTab === 'registrations' && isCreator) {
            fetchRegistrations();
        }
    }, [activeTab, isCreator]);

    // Fetch shortlisted teams
    const fetchShortlistedTeams = async () => {
        try {
            setShortlistedLoading(true);
            setShortlistedError(null);
            const response = await fetch(`/api/hackathons/${params.id}/shortlisted`);
            const data = await response.json();
            if (data.success) {
                setShortlistedTeams(data.data);
            } else {
                setShortlistedError(data.error || 'Failed to fetch shortlisted teams');
            }
        } catch (err) {
            setShortlistedError('Failed to fetch shortlisted teams');
        } finally {
            setShortlistedLoading(false);
        }
    };

    // Fetch shortlisted teams when tab is active
    useEffect(() => {
        if (activeTab === 'shortlisted' && isCreator) {
            fetchShortlistedTeams();
        }
    }, [activeTab, isCreator, params.id]);

    const fetchRegistrations = async () => {
        try {
            setRegistrationsLoading(true);
            const response = await fetch(`/api/hackathons/${params.id}/registrations`);
            const data = await response.json();
            
            if (data.success) {
                setRegistrations(data.data);
            } else {
                setError(data.error || 'Failed to fetch registrations');
            }
        } catch (err) {
            setError('Failed to fetch registrations');
            console.error('Error fetching registrations:', err);
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
        setFormData(prev => ({
            ...prev,
            [name]: value
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const submitData = new FormData();
            
            // Add form fields
            Object.keys(formData).forEach(key => {
                if (formData[key] !== '') {
                    submitData.append(key, formData[key]);
                }
            });

            // Add files if selected
            const bannerFile = document.getElementById('banner-upload').files[0];
            if (bannerFile) {
                submitData.append('banner_url', bannerFile);
            }

            const pfpFile = document.getElementById('pfp-upload').files[0];
            if (pfpFile) {
                submitData.append('pfp_url', pfpFile);
            }

            const response = await fetch(`/api/hackathons/${params.id}`, {
                method: 'PUT',
                body: submitData
            });

            const data = await response.json();
            
            if (data.success) {
                setHackathon(data.data);
                setIsEditing(false);
                setBannerPreview(null);
                setPfpPreview(null);
                // Reset file inputs
                document.getElementById('banner-upload').value = '';
                document.getElementById('pfp-upload').value = '';
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

    const getStatus = () => {
        if (!hackathon || !hackathon.registration_deadline) return 'Unknown';
        const now = new Date();
        const deadline = new Date(hackathon.registration_deadline);
        return now <= deadline ? 'Active' : 'Closed';
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
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 md:gap-0">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => router.back()}
                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                            >
                                <ArrowLeft className="w-5 h-5 text-white" />
                            </button>
                            <div>
                                <span className="text-3xl font-semibold text-white">
                                    {isEditing ? 'Edit' : 'View'}
                                </span>
                                <span className="ml-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6a00] to-[#ee0979]">
                                    Hackathon
                                </span>
                            </div>
                        </div>
                        {isCreator && (
                            <div className="flex gap-3">
                                {!isEditing ? (
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white font-semibold rounded-lg hover:from-[#ee0979] hover:to-[#ff6a00] transition-all duration-200"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => {
                                                setIsEditing(false);
                                                setBannerPreview(null);
                                                setPfpPreview(null);
                                                // Reset form data
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
                                            }}
                                            className="px-4 py-2 border cursor-pointer border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleSubmit}
                                            disabled={saving}
                                            className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" />
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tab Navigation */}
                    {isCreator && !isEditing && (
                        <div className="mb-8">
                            <div className="flex gap-1 bg-white/10 border border-white/20 rounded-xl p-1">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                                        activeTab === 'details'
                                            ? 'bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white shadow-lg'
                                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    Details
                                </button>
                                <button
                                    onClick={() => setActiveTab('registrations')}
                                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                                        activeTab === 'registrations'
                                            ? 'bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white shadow-lg'
                                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Registrations
                                        {registrations.length > 0 && (
                                            <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                                                {registrations.length}
                                            </span>
                                        )}
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('shortlisted')}
                                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                                        activeTab === 'shortlisted'
                                            ? 'bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white shadow-lg'
                                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Trophy className="w-4 h-4" />
                                        Shortlisted
                                        {shortlistedTeams.length > 0 && (
                                            <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                                                {shortlistedTeams.length}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tab Content */}
                    {activeTab === 'details' ? (
                        <>
                            {/* Banner Section */}
                            <div className="mb-8">
                                <div className="h-64 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl relative overflow-hidden">
                                    {(bannerPreview || hackathon.banner_url) ? (
                                        <img 
                                            src={bannerPreview || hackathon.banner_url} 
                                            alt={hackathon.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Calendar className="w-16 h-16 text-white/50" />
                                        </div>
                                    )}
                                    
                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <label className="cursor-pointer">
                                                <input
                                                    type="file"
                                                    id="banner-upload"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, 'banner')}
                                                    className="hidden"
                                                />
                                                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                                                    <Upload className="w-4 h-4 text-white" />
                                                    <span className="text-white">Upload Banner</span>
                                                </div>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
                                {/* Left Column - Main Info */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Title and Description */}
                                    <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-white font-semibold mb-2">Title</label>
                                                    <input
                                                        type="text"
                                                        name="title"
                                                        value={formData.title}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff6a00]"
                                                        placeholder="Enter hackathon title"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-white font-semibold mb-2">Description</label>
                                                    <textarea
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleInputChange}
                                                        rows={4}
                                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff6a00] resize-none"
                                                        placeholder="Enter hackathon description"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <h1 className="text-3xl font-bold text-white mb-4">{hackathon.title}</h1>
                                                <p className="text-gray-300 text-lg leading-relaxed">{hackathon.description}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Team Size */}
                                        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Users className="w-5 h-5 text-[#ff6a00]" />
                                                <h3 className="text-lg font-semibold text-white">Team Size</h3>
                                            </div>
                                            {isEditing ? (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-white text-sm mb-1">Min</label>
                                                        <input
                                                            type="number"
                                                            name="team_min"
                                                            value={formData.team_min}
                                                            onChange={handleInputChange}
                                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff6a00]"
                                                            placeholder="Min"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-white text-sm mb-1">Max</label>
                                                        <input
                                                            type="number"
                                                            name="team_max"
                                                            value={formData.team_max}
                                                            onChange={handleInputChange}
                                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff6a00]"
                                                            placeholder="Max"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-gray-300">
                                                    {hackathon.team_min && hackathon.team_max 
                                                        ? `${hackathon.team_min}-${hackathon.team_max} members`
                                                        : hackathon.team_min 
                                                            ? `Min ${hackathon.team_min} members`
                                                            : hackathon.team_max 
                                                                ? `Max ${hackathon.team_max} members`
                                                                : 'Not specified'
                                                }
                                                </p>
                                            )}
                                        </div>

                                        {/* Registration Deadline */}
                                        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Clock className="w-5 h-5 text-[#ff6a00]" />
                                                <h3 className="text-lg font-semibold text-white">Registration Deadline</h3>
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    type="date"
                                                    name="registration_deadline"
                                                    value={formData.registration_deadline}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#ff6a00]"
                                                />
                                            ) : (
                                                <p className="text-gray-300">{formatDate(hackathon.registration_deadline)}</p>
                                            )}
                                        </div>

                                        {/* Venue */}
                                        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <MapPin className="w-5 h-5 text-[#ff6a00]" />
                                                <h3 className="text-lg font-semibold text-white">Venue</h3>
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    name="venue"
                                                    value={formData.venue}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff6a00]"
                                                    placeholder="Enter venue"
                                                />
                                            ) : (
                                                <p className="text-gray-300">{hackathon.venue || 'Not specified'}</p>
                                            )}
                                        </div>

                                        {/* Winners */}
                                        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Trophy className="w-5 h-5 text-[#ff6a00]" />
                                                <h3 className="text-lg font-semibold text-white">Winners</h3>
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    name="top_n_selections"
                                                    value={formData.top_n_selections}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff6a00]"
                                                    placeholder="Number of winners"
                                                />
                                            ) : (
                                                <p className="text-gray-300">{hackathon.top_n_selections ? `${hackathon.top_n_selections} winners` : 'Not specified'}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Prizes */}
                                        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-white mb-4">Prizes</h3>
                                            {isEditing ? (
                                                <textarea
                                                    name="prizes"
                                                    value={formData.prizes}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff6a00] resize-none"
                                                    placeholder="Enter prize details"
                                                />
                                            ) : (
                                                <p className="text-gray-300">{hackathon.prizes || 'Not specified'}</p>
                                            )}
                                        </div>

                                        {/* Timeline */}
                                        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
                                            {isEditing ? (
                                                <textarea
                                                    name="timeline"
                                                    value={formData.timeline}
                                                    onChange={handleInputChange}
                                                    rows={3}
                                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff6a00] resize-none"
                                                    placeholder="Enter timeline details"
                                                />
                                            ) : (
                                                <p className="text-gray-300">{hackathon.timeline || 'Not specified'}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Profile Picture and Meta Info */}
                                <div className="space-y-6">
                                    {/* Profile Picture */}
                                    <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>
                                        <div className="flex justify-center">
                                            <div className="relative">
                                                <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden bg-gradient-to-br from-slate-600 to-slate-700">
                                                    {(pfpPreview || hackathon.pfp_url) ? (
                                                        <img 
                                                            src={pfpPreview || hackathon.pfp_url} 
                                                            alt="Profile"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Users className="w-12 h-12 text-white/70" />
                                                        </div>
                                                    )}
                                                </div>
                                                {isEditing && (
                                                    <label className="absolute -bottom-2 -right-2 cursor-pointer">
                                                        <input
                                                            type="file"
                                                            id="pfp-upload"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileChange(e, 'pfp')}
                                                            className="hidden"
                                                        />
                                                        <div className="p-2 bg-[#ff6a00] rounded-full hover:bg-[#ee0979] transition-colors">
                                                            <Upload className="w-4 h-4 text-white" />
                                                        </div>
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Meta Information */}
                                    <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">Meta Information</h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">Created:</span>
                                                <span className="text-white">{formatDate(hackathon.created_at)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">Last Updated:</span>
                                                <span className="text-white">{formatDate(hackathon.updated_at)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-300">Status:</span>
                                                <span className={getStatus() === 'Active' ? "text-green-400" : "text-red-400"}>{getStatus()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : activeTab === 'registrations' ? (
                        /* Registrations Tab Content */
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid gap-6 md:grid-cols-4">
                                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-500/20 rounded-lg">
                                            <Users className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-blue-300 text-sm">Total Teams</p>
                                            <p className="text-2xl font-bold text-white">{registrations.length}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-green-500/20 rounded-lg">
                                            <Users className="w-6 h-6 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-green-300 text-sm">Total Participants</p>
                                            <p className="text-2xl font-bold text-white">
                                                {registrations.reduce((total, reg) => {
                                                    const filteredTeammates = reg.teammates?.filter(t => t.id !== reg.team_leader?.id) || [];
                                                    return total + 1 + filteredTeammates.length;
                                                }, 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-purple-500/20 rounded-lg">
                                            <Clock className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-purple-300 text-sm">Avg Team Size</p>
                                            <p className="text-2xl font-bold text-white">
                                                {registrations.length > 0 
                                                    ? Math.round((registrations.reduce((total, reg) => {
                                                        const filteredTeammates = reg.teammates?.filter(t => t.id !== reg.team_leader?.id) || [];
                                                        return total + 1 + filteredTeammates.length;
                                                    }, 0) / registrations.length) * 10) / 10
                                                    : 0
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-orange-500/20 rounded-lg">
                                            <Clock className="w-6 h-6 text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-orange-300 text-sm">Latest Registration</p>
                                            <p className="text-sm font-semibold text-white">
                                                {registrations.length > 0 ? formatDate(registrations[0].submitted_at) : 'None'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Registrations List */}
                            <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">Team Registrations</h2>
                                    <button
                                        onClick={fetchRegistrations}
                                        disabled={registrationsLoading}
                                        className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
                                    >
                                        {registrationsLoading ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                </div>

                                {registrationsLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-white text-lg">Loading registrations...</div>
                                    </div>
                                ) : registrations.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-white mb-2">No Registrations Yet</h3>
                                        <p className="text-gray-300">Teams haven't started registering for your hackathon yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {registrations.map((registration, index) => {
                                            // Filter teammates to exclude the team leader
                                            const filteredTeammates = registration.teammates?.filter(
                                                (teammate) => teammate.id !== registration.team_leader?.id
                                            ) || [];
                                            const memberCount = 1 + filteredTeammates.length;
                                            return (
                                                <div 
                                                    key={registration.id}
                                                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="w-8 h-8 bg-gradient-to-r from-[#ff6a00] to-[#ee0979] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                                    {index + 1}
                                                                </div>
                                                                <h3 className="text-xl font-bold text-white">{registration.team_name}</h3>
                                                                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                                                                    <span className="text-green-400 text-sm font-medium">
                                                                        {memberCount} members
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-gray-300">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    Registered: {formatDate(registration.submitted_at)}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Crown className="w-4 h-4" />
                                                                    Leader: {registration.team_leader?.name || 'Unknown'}
                                                                </span>
                                                            </div>
                                                            {/* PDF Submission Info */}
                                                            <div className="mt-2 text-sm">
                                                                <span className="font-semibold text-gray-300">Project PDF: </span>
                                                                {registration.idea_pdf_url ? (
                                                                    <a href={registration.idea_pdf_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">View PDF</a>
                                                                ) : (
                                                                    <span className="text-red-400">Not submitted</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Team Members */}
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Team Members</h4>
                                                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                                            {/* Team Leader as first member */}
                                                            <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-gradient-to-r from-[#ff6a00] to-[#ee0979] rounded-full flex items-center justify-center">
                                                                        <Crown className="w-5 h-5 text-white" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="font-semibold text-white">{registration.team_leader?.name || 'Unknown'}</p>
                                                                        <p className="text-sm text-gray-400">Team Leader</p>
                                                                        <p className="text-xs text-gray-500">{registration.team_leader?.email || 'No email'}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* Teammates (excluding leader) */}
                                                            {filteredTeammates.map((teammate) => (
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
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : activeTab === 'shortlisted' && isCreator ? (
                        <div className="space-y-6">
                            {/* Shortlist Button */}
                            <div className="mb-4">
                                {/* Shortlist Best Ideas Button - only in Shortlisted tab */}
                                <div className="flex flex-col gap-2 items-start">
                                    <button
                                        onClick={async () => {
                                            setShortlisting(true);
                                            setShortlistError(null);
                                            try {
                                                // Collect all valid PDF URLs from registrations
                                                const urls = registrations
                                                    .map(r => r.idea_pdf_url)
                                                    .filter(url => url && url.trim() !== '');
                                                if (!urls.length) {
                                                    setShortlistError('No valid PDF URLs found.');
                                                    setShortlisting(false);
                                                    return;
                                                }
                                                const response = await fetch('/api/shortlist-ideas', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ pdfUrls: urls, n: Number(hackathon.top_n_selections) })
                                                });
                                                const data = await response.json();
                                                // Refetch shortlisted teams after shortlisting
                                                fetchShortlistedTeams();
                                                if (!data.shortlisted) {
                                                    setShortlistError('No shortlist returned.');
                                                }
                                            } catch (err) {
                                                setShortlistError('Failed to shortlist ideas.');
                                            } finally {
                                                setShortlisting(false);
                                            }
                                        }}
                                        disabled={
                                            shortlisting ||
                                            !hackathon.top_n_selections ||
                                            isNaN(Number(hackathon.top_n_selections)) ||
                                            Number(hackathon.top_n_selections) < 1
                                        }
                                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50"
                                    >
                                        {shortlisting
                                            ? <><Loader size={18} className="mr-2 align-middle" /> Shortlisting...</>
                                            : `Shortlist Best ${hackathon.top_n_selections || ''} Ideas`}
                                    </button>
                                </div>
                                {/* Display loading/error only, not the list */}
                                {shortlisting && (
                                    <div className="mt-4 text-white">Shortlisting ideas, please wait...</div>
                                )}
                                {shortlistError && (
                                    <div className="mt-4 text-red-400">{shortlistError}</div>
                                )}
                            </div>
                            {/* Shortlisted Teams List */}
                            <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">Shortlisted Teams</h2>
                                    <button
                                        onClick={fetchShortlistedTeams}
                                        disabled={shortlistedLoading}
                                        className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
                                    >
                                        {shortlistedLoading ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                </div>
                                {shortlistedLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-white text-lg">Loading shortlisted teams...</div>
                                    </div>
                                ) : shortlistedTeams.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-white mb-2">No Teams Shortlisted Yet</h3>
                                        <p className="text-gray-300">Run the shortlisting to select the best teams.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {shortlistedTeams.map((registration, index) => {
                                            const filteredTeammates = registration.teammates?.filter(
                                                (teammate) => teammate.id !== registration.team_leader?.id
                                            ) || [];
                                            const memberCount = 1 + filteredTeammates.length;
                                            return (
                                                <div 
                                                    key={registration.id}
                                                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="w-8 h-8 bg-gradient-to-r from-[#ff6a00] to-[#ee0979] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                                    {index + 1}
                                                                </div>
                                                                <h3 className="text-xl font-bold text-white">{registration.team_name}</h3>
                                                                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                                                                    <span className="text-green-400 text-sm font-medium">
                                                                        {memberCount} members
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-gray-300">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    Registered: {formatDate(registration.submitted_at)}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Crown className="w-4 h-4" />
                                                                    Leader: {registration.team_leader?.name || 'Unknown'}
                                                                </span>
                                                            </div>
                                                            {/* PDF Submission Info */}
                                                            <div className="mt-2 text-sm">
                                                                <span className="font-semibold text-gray-300">Project PDF: </span>
                                                                {registration.idea_pdf_url ? (
                                                                    <a href={registration.idea_pdf_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">View PDF</a>
                                                                ) : (
                                                                    <span className="text-red-400">Not submitted</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Team Members */}
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Team Members</h4>
                                                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                                            {/* Team Leader as first member */}
                                                            <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-gradient-to-r from-[#ff6a00] to-[#ee0979] rounded-full flex items-center justify-center">
                                                                        <Crown className="w-5 h-5 text-white" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="font-semibold text-white">{registration.team_leader?.name || 'Unknown'}</p>
                                                                        <p className="text-sm text-gray-400">Team Leader</p>
                                                                        <p className="text-xs text-gray-500">{registration.team_leader?.email || 'No email'}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* Teammates (excluding leader) */}
                                                            {filteredTeammates.map((teammate) => (
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
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Registrations Tab Content */
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid gap-6 md:grid-cols-4">
                                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-500/20 rounded-lg">
                                            <Users className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-blue-300 text-sm">Total Teams</p>
                                            <p className="text-2xl font-bold text-white">{registrations.length}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-green-500/20 rounded-lg">
                                            <Users className="w-6 h-6 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-green-300 text-sm">Total Participants</p>
                                            <p className="text-2xl font-bold text-white">
                                                {registrations.reduce((total, reg) => {
                                                    const filteredTeammates = reg.teammates?.filter(t => t.id !== reg.team_leader?.id) || [];
                                                    return total + 1 + filteredTeammates.length;
                                                }, 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-purple-500/20 rounded-lg">
                                            <Clock className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-purple-300 text-sm">Avg Team Size</p>
                                            <p className="text-2xl font-bold text-white">
                                                {registrations.length > 0 
                                                    ? Math.round((registrations.reduce((total, reg) => {
                                                        const filteredTeammates = reg.teammates?.filter(t => t.id !== reg.team_leader?.id) || [];
                                                        return total + 1 + filteredTeammates.length;
                                                    }, 0) / registrations.length) * 10) / 10
                                                    : 0
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-orange-500/20 rounded-lg">
                                            <Clock className="w-6 h-6 text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="text-orange-300 text-sm">Latest Registration</p>
                                            <p className="text-sm font-semibold text-white">
                                                {registrations.length > 0 ? formatDate(registrations[0].submitted_at) : 'None'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Registrations List */}
                            <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">Team Registrations</h2>
                                    <button
                                        onClick={fetchRegistrations}
                                        disabled={registrationsLoading}
                                        className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
                                    >
                                        {registrationsLoading ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                </div>

                                {registrationsLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-white text-lg">Loading registrations...</div>
                                    </div>
                                ) : registrations.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-white mb-2">No Registrations Yet</h3>
                                        <p className="text-gray-300">Teams haven't started registering for your hackathon yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {registrations.map((registration, index) => {
                                            // Filter teammates to exclude the team leader
                                            const filteredTeammates = registration.teammates?.filter(
                                                (teammate) => teammate.id !== registration.team_leader?.id
                                            ) || [];
                                            const memberCount = 1 + filteredTeammates.length;
                                            return (
                                                <div 
                                                    key={registration.id}
                                                    className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="w-8 h-8 bg-gradient-to-r from-[#ff6a00] to-[#ee0979] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                                    {index + 1}
                                                                </div>
                                                                <h3 className="text-xl font-bold text-white">{registration.team_name}</h3>
                                                                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                                                                    <span className="text-green-400 text-sm font-medium">
                                                                        {memberCount} members
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-gray-300">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    Registered: {formatDate(registration.submitted_at)}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Crown className="w-4 h-4" />
                                                                    Leader: {registration.team_leader?.name || 'Unknown'}
                                                                </span>
                                                            </div>
                                                            {/* PDF Submission Info */}
                                                            <div className="mt-2 text-sm">
                                                                <span className="font-semibold text-gray-300">Project PDF: </span>
                                                                {registration.idea_pdf_url ? (
                                                                    <a href={registration.idea_pdf_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">View PDF</a>
                                                                ) : (
                                                                    <span className="text-red-400">Not submitted</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Team Members */}
                                                    <div className="space-y-3">
                                                        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Team Members</h4>
                                                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                                            {/* Team Leader as first member */}
                                                            <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 bg-gradient-to-r from-[#ff6a00] to-[#ee0979] rounded-full flex items-center justify-center">
                                                                        <Crown className="w-5 h-5 text-white" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="font-semibold text-white">{registration.team_leader?.name || 'Unknown'}</p>
                                                                        <p className="text-sm text-gray-400">Team Leader</p>
                                                                        <p className="text-xs text-gray-500">{registration.team_leader?.email || 'No email'}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* Teammates (excluding leader) */}
                                                            {filteredTeammates.map((teammate) => (
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
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HackathonDetail; 