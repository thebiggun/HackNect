"use client";
import { Calendar } from "lucide-react";

const DetailHero = ({ hackathon }) => {
    if (!hackathon) return null;

    return (
        <div className="h-64 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl relative overflow-hidden">
            {hackathon.banner_url ? (
                <img
                    src={hackathon.banner_url}
                    alt={hackathon.title || "Hackathon Banner"}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="w-16 h-16 text-white/50" />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>
    );
};

export default DetailHero;
