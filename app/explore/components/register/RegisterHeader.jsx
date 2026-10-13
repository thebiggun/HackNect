"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const RegisterHeader = ({ hackathonId, title }) => {
    return (
        <div className="px-6 mb-8">
            <div className="flex items-center gap-4 mb-6">
                <Link 
                    href={`/explore/${hackathonId}`} 
                    className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Hackathon</span>
                </Link>
            </div>
            <div>
                <span className="text-3xl font-semibold text-white">
                    Team Registration for
                </span>
                <span className="ml-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-300">
                    {title}
                </span>
            </div>
        </div>
    );
};

export default RegisterHeader;
