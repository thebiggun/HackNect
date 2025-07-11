import Background from "@/components/Background";
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
                                Host
                            </span>
                            <span className="ml-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6a00] to-[#ee0979]">
                                Hackathon
                            </span>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page
