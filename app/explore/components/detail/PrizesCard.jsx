"use client";
import { Trophy } from "lucide-react";

const PrizesCard = ({ prizes }) => {
    return (
        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-[#ff6a00]" />
                <h3 className="text-xl font-semibold text-white">Prizes</h3>
            </div>
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-gray-300 leading-relaxed">
                    {prizes || 'No prize details specified'}
                </p>
            </div>
        </div>
    );
};

export default PrizesCard;
