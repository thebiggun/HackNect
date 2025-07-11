import Background from "@/components/Background";
import { Plus, Calendar, Users, Clock, Trophy} from "lucide-react"
import Link from "next/link";
const page = () => {
    return (
        <div>
            <div className="fixed inset-0 z-0 overflow-hidden">
                <Background />
            </div>
            <div className='relative w-full p-8 pt-0'>
                <div className="px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-3xl font-semibold text-white">
                                Your
                            </span>
                            <span className="ml-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-300">
                                Dashboard
                            </span>
                        </div>

                        {/* Option 1: Button in header area */}
                        <Link href={"/hosting"} className="group relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold text-white transition-all duration-300 hover:from-cyan-400 hover:to-purple-400 hover:shadow-[0_0_24px_8px_rgba(147,51,234,0.3)] hover:scale-105 cursor-pointer">
                            <div className="flex items-center space-x-2">
                                <Plus className="w-5 h-5" />
                                <span>Host a Hackathon</span>
                            </div>
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </Link>
                    </div>

                    <div className="flex gap-8 pt-6">
                        <div className="bg-white/10 border-white/20 border backdrop-blur-[2px] rounded-md w-[70vw] flex flex-col items-center justify-center">
                            {/* Option 2: Main CTA in the large card */}
                            <div className="text-center space-y-6">
                                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mb-6">
                                    <Calendar className="w-12 h-12 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Ready to Host?</h2>
                                <p className="text-gray-300 text-lg max-w-md">
                                    Create an amazing hackathon experience for developers worldwide.
                                    Set up your event in minutes.
                                </p>
                                <button className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-white text-lg transition-all duration-300 hover:from-cyan-400 hover:to-purple-400 hover:shadow-[0_0_32px_12px_rgba(147,51,234,0.4)] hover:scale-105 transform">
                                    <div className="flex items-center space-x-3">
                                        <Plus className="w-6 h-6" />
                                        <span>Participate in a Hackathon</span>
                                    </div>
                                    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 rounded-md flex-1">
                            {/* Created Card */}
                            <div className="bg-[#181c23] rounded-md p-4 flex items-center border-2 border-[#232935] justify-between transition-all duration-300 hover:shadow-[0_0_24px_4px_rgba(59,130,246,0.15)] hover:border-blue-400/30">
                                <div>
                                    <div className="text-gray-300 text-sm">Created</div>
                                    <div className="text-3xl font-bold text-blue-400">2</div>
                                </div>
                                <Plus className="text-blue-400 w-8 h-8" />
                            </div>

                            {/* Participating Card */}
                            <div className="bg-[#181c23] rounded-md border-2 border-[#232935] p-4 flex items-center justify-between transition-all duration-300 hover:shadow-[0_0_24px_4px_rgba(34,197,94,0.15)] hover:border-green-400/30">
                                <div>
                                    <div className="text-gray-300 text-sm">Participating</div>
                                    <div className="text-3xl font-bold text-green-400">1</div>
                                </div>
                                <Users className="text-green-400 w-8 h-8" />
                            </div>

                            {/* Completed Card */}
                            <div className="bg-[#181c23] border-2 border-[#232935] rounded-md p-4 flex items-center justify-between transition-all duration-300 hover:shadow-[0_0_24px_4px_rgba(168,85,247,0.15)] hover:border-purple-400/30">
                                <div>
                                    <div className="text-gray-300 text-sm">Completed</div>
                                    <div className="text-3xl font-bold text-purple-400">1</div>
                                </div>
                                <Clock className="text-purple-400 w-8 h-8" />
                            </div>

                            {/* Wins Card */}
                            <div className="bg-[#181c23] border-2 border-[#232935] rounded-md p-4 flex items-center justify-between transition-all duration-300 hover:shadow-[0_0_24px_4px_rgba(251,191,36,0.15)] hover:border-yellow-400/30">
                                <div>
                                    <div className="text-gray-300 text-sm">Wins</div>
                                    <div className="text-3xl font-bold text-yellow-400">1</div>
                                </div>
                                <Trophy className="text-yellow-400 w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default page;