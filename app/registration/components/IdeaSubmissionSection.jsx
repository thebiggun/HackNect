import { 
    FileText, 
    ExternalLink, 
    Lock, 
    Copy, 
    Check, 
    Upload, 
    AlertCircle, 
    CheckCircle2 
} from "lucide-react";

const IdeaSubmissionSection = ({
    registration,
    isTeamSizeSufficient,
    isTeamLead,
    minTeamSize,
    currentMemberCount,
    neededMembers,
    leader,
    copied,
    onCopyInviteCode,
    selectedFile,
    uploading,
    uploadError,
    uploadSuccess,
    onFileChange,
    onPdfUpload,
    onCancelFile,
}) => {
    return (
        <div className="bg-white/10 border border-white/20 rounded-xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    Project Idea PDF Submission
                </h2>
                {registration.idea_pdf_url && (
                    <a 
                        href={registration.idea_pdf_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 rounded-lg text-sm transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span>View Current PDF</span>
                    </a>
                )}
            </div>

            {/* CASE 1: Minimum Team Size NOT Met */}
            {!isTeamSizeSufficient ? (
                <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-amber-200">
                                Idea Submission Locked: Minimum Team Size Not Met
                            </h3>
                            <p className="text-sm text-amber-300/90 mt-1">
                                This hackathon requires at least <strong className="text-amber-100">{minTeamSize} members</strong> before a team can submit their idea PDF. 
                                Your team currently has <strong className="text-amber-100">{currentMemberCount} member{currentMemberCount !== 1 ? 's' : ''}</strong>. 
                                You need <strong className="text-amber-100">{neededMembers} more member{neededMembers !== 1 ? 's' : ''}</strong> to join before submitting.
                            </p>
                        </div>
                    </div>

                    {registration.invite_code && (
                        <div className="pt-3 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <p className="text-xs text-amber-200">
                                Share your team invite code with your teammates to invite them:
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-white bg-slate-900/80 px-3 py-1 rounded border border-amber-500/30 text-sm">
                                    {registration.invite_code}
                                </span>
                                <button
                                    onClick={() => onCopyInviteCode(registration.invite_code)}
                                    className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded text-xs font-medium transition-colors"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copied ? "Copied" : "Copy Code"}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : isTeamLead ? (
                /* CASE 2: Team Leader & Team Size Requirement MET */
                <div>
                    <p className="text-gray-300 text-sm mb-4">
                        Upload your team's project idea PDF document (pitch deck, architecture diagram, or proposal).
                        {registration.idea_pdf_url && " You can upload a new PDF below to replace your existing submission."}
                    </p>

                    <form onSubmit={onPdfUpload} className="flex flex-col gap-4">
                        <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-6 transition-colors bg-slate-900/40 text-center">
                            <input 
                                id="pdf-upload" 
                                type="file" 
                                accept="application/pdf,.pdf" 
                                onChange={onFileChange}
                                className="hidden" 
                            />
                            <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                                <div className="p-3 bg-white/5 rounded-full text-cyan-400 group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6" />
                                </div>
                                {selectedFile ? (
                                    <div>
                                        <p className="text-white font-medium">{selectedFile.name}</p>
                                        <p className="text-xs text-gray-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to change file</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-white font-medium">Click to select PDF document</p>
                                        <p className="text-xs text-gray-400">Supports PDF up to 15MB</p>
                                    </div>
                                )}
                            </label>
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                type="submit" 
                                disabled={uploading || !selectedFile} 
                                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-semibold hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Uploading PDF...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        <span>{registration.idea_pdf_url ? 'Replace PDF' : 'Upload Idea PDF'}</span>
                                    </>
                                )}
                            </button>
                            
                            {selectedFile && !uploading && (
                                <button
                                    type="button"
                                    onClick={onCancelFile}
                                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                        {uploadError && (
                            <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{uploadError}</span>
                            </div>
                        )}
                        {uploadSuccess && (
                            <div className="p-3 bg-green-500/20 border border-green-500/40 rounded-lg text-green-300 text-sm flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>{uploadSuccess}</span>
                            </div>
                        )}
                    </form>
                </div>
            ) : (
                /* CASE 3: Teammate View (Non-Leader) & Size Requirement MET */
                <div className="p-5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-white">
                                {registration.idea_pdf_url ? "Idea PDF Uploaded" : "Awaiting Idea PDF Submission"}
                            </h3>
                            <p className="text-sm text-gray-300 mt-1">
                                {registration.idea_pdf_url ? (
                                    "The team leader has submitted the idea PDF for this registration."
                                ) : (
                                    `The minimum team size has been met! Only the team leader (${leader?.name || "Team Leader"}) can upload the project idea PDF.`
                                )}
                            </p>
                        </div>
                    </div>
                    {registration.idea_pdf_url && (
                        <div className="pt-2">
                            <a 
                                href={registration.idea_pdf_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-semibold hover:from-cyan-400 hover:to-purple-400 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                <span>View Submitted Idea PDF</span>
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default IdeaSubmissionSection;
