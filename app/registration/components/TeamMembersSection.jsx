import { Users, Crown, User } from "lucide-react";

const TeamMembersSection = ({
    currentMemberCount,
    maxTeamSize,
    isTeamSizeSufficient,
    neededMembers,
    leader,
    teammates = [],
}) => {
    return (
        <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    Team Members ({currentMemberCount}{maxTeamSize ? `/${maxTeamSize}` : ''})
                </h2>
                {!isTeamSizeSufficient && (
                    <span className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                        Need {neededMembers} more member{neededMembers !== 1 ? 's' : ''} to unlock idea submission
                    </span>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Team Leader */}
                {leader && (
                    <div className="bg-white/10 border border-white/20 rounded-lg p-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-500/20 to-transparent rounded-bl-full pointer-events-none" />
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-[#ff6a00] to-[#ee0979] rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                                <Crown className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate" title={leader.name}>{leader.name}</p>
                                <p className="text-xs text-amber-300 font-medium">Team Leader</p>
                                <p className="text-xs text-gray-400 truncate mt-0.5" title={leader.email}>{leader.email}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Teammates */}
                {teammates.map((teammate) => (
                    <div key={teammate.id} className="bg-white/10 border border-white/20 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate" title={teammate.name}>{teammate.name}</p>
                                <p className="text-xs text-cyan-300">Teammate</p>
                                <p className="text-xs text-gray-400 truncate mt-0.5" title={teammate.email}>{teammate.email}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamMembersSection;
