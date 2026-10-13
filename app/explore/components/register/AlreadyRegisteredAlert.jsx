"use client";
import { Crown } from "lucide-react";

const AlreadyRegisteredAlert = () => {
    return (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <h4 className="text-yellow-300 font-semibold">Already Registered</h4>
            </div>
            <p className="text-yellow-200 text-sm">
                You are already registered for this hackathon. You cannot create or join additional teams.
            </p>
        </div>
    );
};

export default AlreadyRegisteredAlert;
