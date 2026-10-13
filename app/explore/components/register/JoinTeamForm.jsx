"use client";
import { UserPlus } from "lucide-react";

const JoinTeamForm = ({
    form,
    setForm,
    onSubmit,
    submitting = false,
    isRegistered = false
}) => {
    return (
        <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-md">
            <h3 className="text-xl font-semibold text-white mb-4">Join an Existing Team</h3>
            {isRegistered ? (
                <div className="text-center py-8">
                    <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-2">You are already registered for this hackathon.</p>
                    <p className="text-gray-400 text-sm">Check your registrations on the right side.</p>
                </div>
            ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white font-medium mb-2">Invite Code</label>
                        <input
                            type="text"
                            value={form.inviteCode}
                            onChange={(e) => setForm(prev => ({ ...prev, inviteCode: e.target.value.toUpperCase() }))}
                            className="w-full px-4 py-2 bg-slate-900/80 text-white border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-400 outline-none font-mono"
                            placeholder="Enter invite code"
                            maxLength={8}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Joining...' : 'Join Team'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default JoinTeamForm;
