"use client";
import { Calendar } from "lucide-react";
import Loader from "@/components/Loader";

const EmptyHackathons = ({ onClearFilters, navLoading = false }) => {
    return (
        <div className="bg-white/10 border border-white/20 rounded-xl p-12 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-[#ff6a00] to-[#ee0979] flex items-center justify-center mb-6">
                <Calendar className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
                No Hackathons Found
            </h2>
            <p className="text-gray-300 text-lg mb-6">
                Try adjusting your filters or browse all available hackathons.
            </p>
            <button 
                onClick={onClearFilters}
                disabled={navLoading}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white font-semibold rounded-lg hover:from-[#ee0979] hover:to-[#ff6a00] transition-all duration-200"
            >
                {navLoading ? <Loader size={18} className="mr-2 align-middle" /> : 'Clear Filters'}
            </button>
        </div>
    );
};

export default EmptyHackathons;
