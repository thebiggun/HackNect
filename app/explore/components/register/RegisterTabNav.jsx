"use client";
import { Plus, UserPlus } from "lucide-react";

const RegisterTabNav = ({ activeTab, setActiveTab, isRegistered = false }) => {
    return (
        <div className="flex bg-white/10 border border-white/20 rounded-lg p-1">
            <button
                onClick={() => setActiveTab('create')}
                disabled={isRegistered}
                className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === 'create'
                        ? isRegistered 
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                        : isRegistered
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-white hover:bg-white/10'
                }`}
            >
                <Plus className="w-4 h-4" />
                Create Team
            </button>
            <button
                onClick={() => setActiveTab('join')}
                disabled={isRegistered}
                className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === 'join'
                        ? isRegistered 
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                        : isRegistered
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-white hover:bg-white/10'
                }`}
            >
                <UserPlus className="w-4 h-4" />
                Join Team
            </button>
        </div>
    );
};

export default RegisterTabNav;
