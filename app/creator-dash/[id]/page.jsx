"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import BackgroundEffects from "@/components/Background";
import { Calendar, Users, MapPin, Trophy, Clock, Edit, Save, ArrowLeft, Upload, X } from "lucide-react";

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

    useEffect(() => {
        if (params.id) {
            fetchHackathon();
        }
    }, [params.id]);

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
            <div className="relative w-full p-8 pt-0">
                <div className="px-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => router.back()}
                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
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
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white font-semibold rounded-lg hover:from-[#ee0979] hover:to-[#ff6a00] transition-all duration-200"
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
                                            className="px-4 py-2 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleSubmit}
                                            disabled={saving}
                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" />
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

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
                    <div className="grid gap-8 lg:grid-cols-3">
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
                            <div className="grid gap-6 md:grid-cols-2">
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
                            <div className="grid gap-6 md:grid-cols-2">
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
                                        <span className="text-green-400">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HackathonDetail; 