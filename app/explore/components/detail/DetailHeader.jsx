"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const DetailHeader = ({ title, creator, onBack }) => {
    return (
        <div className="relative z-30 px-2 sm:px-4 md:px-6 mb-6 -mt-6 sm:-mt-6">
            <div className="flex flex-col pt-4 gap-2 sm:gap-3">
                <Link
                    href="/explore"
                    onClick={onBack}
                    className="flex items-center gap-2 text-white hover:text-gray-300 cursor-pointer transition-colors w-fit text-sm sm:text-base"
                >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Back to Explore</span>
                </Link>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{title}</h1>
                    {creator && (
                        <p className="text-gray-300 text-xs sm:text-sm">
                            by {creator.name || 'Anonymous'}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetailHeader;
