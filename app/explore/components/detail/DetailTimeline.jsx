"use client";
import { Calendar } from "lucide-react";

const DetailTimeline = ({ timeline }) => {
    if (!timeline) return null;

    return (
        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-[#ff6a00]" />
                <h3 className="text-xl font-semibold text-white">Timeline</h3>
            </div>
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">{timeline}</p>
            </div>
        </div>
    );
};

export default DetailTimeline;
