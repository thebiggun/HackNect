"use client";
import React from "react";
import { Users, Upload } from "lucide-react";

const SidebarMeta = ({
    pfpUrl,
    pfpPreview,
    isEditing,
    onFileChange,
    createdAt,
    updatedAt,
    status,
    formatDate,
}) => {
    const displayPfp = pfpPreview || pfpUrl;

    return (
        <div className="space-y-6">
            {/* Profile Picture */}
            <div className="bg-white/10 border border-white/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-white/20 overflow-hidden bg-gradient-to-br from-slate-600 to-slate-700">
                            {displayPfp ? (
                                <img
                                    src={displayPfp}
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
                                    onChange={(e) => onFileChange(e, 'pfp')}
                                    className="hidden"
                                />
                                <div className="p-2 bg-[#ff6a00] rounded-full hover:bg-[#ee0979] transition-colors shadow-md">
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
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Created:</span>
                        <span className="text-white">{formatDate(createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Last Updated:</span>
                        <span className="text-white">{formatDate(updatedAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Status:</span>
                        <span className={status === 'Active' ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                            {status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SidebarMeta;
