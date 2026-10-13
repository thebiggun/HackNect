"use client";
import React from "react";
import { Users, Clock, MapPin, Trophy } from "lucide-react";
import BannerSection from "./BannerSection";
import SidebarMeta from "./SidebarMeta";

const DetailsTab = ({
    hackathon,
    formData,
    isEditing,
    bannerPreview,
    pfpPreview,
    onInputChange,
    onFileChange,
    formatDate,
    status,
}) => {
    return (
        <>
            {/* Banner Section */}
            <BannerSection
                bannerUrl={hackathon.banner_url}
                bannerPreview={bannerPreview}
                isEditing={isEditing}
                title={hackathon.title}
                onFileChange={onFileChange}
            />

            {/* Main Content Grid */}
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
                                        value={formData.title || ''}
                                        onChange={onInputChange}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff6a00]"
                                        placeholder="Enter hackathon title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-white font-semibold mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description || ''}
                                        onChange={onInputChange}
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
                                            value={formData.team_min || ''}
                                            onChange={onInputChange}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff6a00]"
                                            placeholder="Min"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white text-sm mb-1">Max</label>
                                        <input
                                            type="number"
                                            name="team_max"
                                            value={formData.team_max || ''}
                                            onChange={onInputChange}
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
                                                : 'Not specified'}
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
                                    value={formData.registration_deadline || ''}
                                    onChange={onInputChange}
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
                                    value={formData.venue || ''}
                                    onChange={onInputChange}
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
                                    value={formData.top_n_selections || ''}
                                    onChange={onInputChange}
                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#ff6a00]"
                                    placeholder="Number of winners"
                                />
                            ) : (
                                <p className="text-gray-300">
                                    {hackathon.top_n_selections ? `${hackathon.top_n_selections} winners` : 'Not specified'}
                                </p>
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
                                    value={formData.prizes || ''}
                                    onChange={onInputChange}
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
                                    value={formData.timeline || ''}
                                    onChange={onInputChange}
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
                <SidebarMeta
                    pfpUrl={hackathon.pfp_url}
                    pfpPreview={pfpPreview}
                    isEditing={isEditing}
                    onFileChange={onFileChange}
                    createdAt={hackathon.created_at}
                    updatedAt={hackathon.updated_at}
                    status={status}
                    formatDate={formatDate}
                />
            </div>
        </>
    );
};

export default DetailsTab;
