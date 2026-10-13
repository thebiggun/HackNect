import { Users, Copy, Check, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { formatDate } from "./utils";

const TeamInfoCard = ({
    registration,
    currentMemberCount,
    minTeamSize,
    maxTeamSize,
    isTeamSizeSufficient,
    neededMembers,
    copied,
    onCopyInviteCode,
}) => {
    if (!registration) return null;

    return (
        <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">{registration.team_name}</h1>
                    <p className="text-gray-300 text-sm">
                        Team ID: <span className="font-mono text-white">{registration.id}</span>
                    </p>
                    {registration.hackathons && (
                        <p className="text-gray-300 text-sm mt-1">
                            Hackathon: <span className="text-cyan-300 font-medium">{registration.hackathons.title}</span>
                        </p>
                    )}
                </div>
                {registration.invite_code && (
                    <div className="flex items-center gap-3">
                        <div className="text-left sm:text-right bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-lg border border-white/10 sm:border-0">
                            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Team Invite Code</p>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-white font-semibold text-base bg-slate-900/60 px-3 py-1 rounded border border-slate-700">
                                    {registration.invite_code}
                                </span>
                                <button
                                    onClick={() => onCopyInviteCode(registration.invite_code)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded text-xs transition-colors"
                                    title="Copy Invite Code"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copied ? "Copied" : "Copy"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 pt-3 border-t border-white/10">
                {/* Member Count & Min Requirement Badge */}
                <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>{currentMemberCount} member{currentMemberCount !== 1 ? 's' : ''}</span>
                    <span className="text-gray-500">•</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isTeamSizeSufficient 
                            ? "bg-green-500/20 text-green-300 border border-green-500/30" 
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>
                        {isTeamSizeSufficient 
                            ? `Min size met (${minTeamSize}${maxTeamSize ? `-${maxTeamSize}` : ''})` 
                            : `Min ${minTeamSize} required (${neededMembers} needed)`}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 text-gray-400">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>Registered {formatDate(registration.submitted_at)}</span>
                </div>

                {/* Idea PDF Status Badge */}
                <div className="ml-auto">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                        registration.idea_pdf_url 
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" 
                            : "bg-slate-700/50 text-slate-300 border border-slate-600/50"
                    }`}>
                        {registration.idea_pdf_url ? (
                            <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Idea PDF Submitted</span>
                            </>
                        ) : (
                            <>
                                <FileText className="w-3 h-3 text-slate-400" />
                                <span>No Idea PDF</span>
                            </>
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TeamInfoCard;
