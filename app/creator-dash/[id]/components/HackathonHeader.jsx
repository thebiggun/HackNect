"use client";
import React from "react";
import { ArrowLeft, Edit, Save } from "lucide-react";

const HackathonHeader = ({
    isCreator,
    isEditing,
    saving,
    onBack,
    onEdit,
    onCancel,
    onSave,
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 md:gap-0">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                    aria-label="Go back"
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
                            onClick={onEdit}
                            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white font-semibold rounded-lg hover:from-[#ee0979] hover:to-[#ff6a00] transition-all duration-200"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 border cursor-pointer border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onSave}
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
    );
};

export default HackathonHeader;
