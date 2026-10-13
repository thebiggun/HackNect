"use client";
import { Users, Copy, Check } from "lucide-react";

const CreateTeamForm = ({
    hackathon,
    form,
    setForm,
    onSubmit,
    submitting = false,
    isRegistered = false,
    createdInviteCode = null,
    onCopy,
    copied = false
}) => {
    return (
        <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-md">
            <h3 className="text-xl font-semibold text-white mb-4">Create a New Team</h3>
            {isRegistered ? (
                <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-2">You are already registered for this hackathon.</p>
                    <p className="text-gray-400 text-sm">Check your registrations on the right side.</p>
                </div>
            ) : (
                <>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="block text-white font-medium mb-2">Team Name</label>
                            <input
                                type="text"
                                value={form.teamName}
                                onChange={(e) => setForm(prev => ({ ...prev, teamName: e.target.value }))}
                                className="w-full px-4 py-2 bg-slate-900/80 text-white border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none"
                                placeholder="Enter team name"
                                required
                            />
                        </div>
                        {hackathon && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <p className="text-blue-300 text-sm">
                                    <strong>Team Size:</strong> {hackathon.team_min && hackathon.team_max 
                                        ? `${hackathon.team_min}-${hackathon.team_max} members`
                                        : hackathon.team_min 
                                            ? `Minimum ${hackathon.team_min} members`
                                            : hackathon.team_max 
                                                ? `Maximum ${hackathon.team_max} members`
                                                : 'No size limit'
                                    }
                                </p>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Creating...' : 'Create Team'}
                        </button>
                    </form>

                    {/* Show invite code after creation */}
                    {createdInviteCode && (
                        <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                            <h4 className="text-green-300 font-semibold mb-2">Team Created Successfully!</h4>
                            <p className="text-green-300 text-sm mb-3">Share this invite code with your teammates:</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2">
                                    <span className="font-mono text-white font-semibold text-lg">{createdInviteCode}</span>
                                </div>
                                <button
                                    onClick={() => onCopy(createdInviteCode)}
                                    className="px-3 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CreateTeamForm;
