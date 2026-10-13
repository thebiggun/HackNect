"use client";
import React from "react";
import { Calendar, Upload } from "lucide-react";

const BannerSection = ({
    bannerUrl,
    bannerPreview,
    isEditing,
    title,
    onFileChange,
}) => {
    const displayBanner = bannerPreview || bannerUrl;

    return (
        <div className="mb-8">
            <div className="h-64 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl relative overflow-hidden">
                {displayBanner ? (
                    <img
                        src={displayBanner}
                        alt={title || "Hackathon Banner"}
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
                                onChange={(e) => onFileChange(e, 'banner')}
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
    );
};

export default BannerSection;
