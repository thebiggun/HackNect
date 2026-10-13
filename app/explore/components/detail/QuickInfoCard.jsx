"use client";
import { formatDetailDate } from "../utils";

const QuickInfoCard = ({ hackathon }) => {
    if (!hackathon) return null;

    return (
        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Info</h3>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-300">Created:</span>
                    <span className="text-white">{formatDetailDate(hackathon.created_at)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-300">Last Updated:</span>
                    <span className="text-white">{formatDetailDate(hackathon.updated_at)}</span>
                </div>
                {hackathon.creator && (
                    <div className="flex justify-between">
                        <span className="text-gray-300">Organizer:</span>
                        <span className="text-white">{hackathon.creator.name || 'Anonymous'}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuickInfoCard;
