'use client'
import Link from "next/link"
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs"
import { UserButton } from "@clerk/nextjs"

const Navbar = () => {
    const { isSignedIn, user } = useUser();
    return (
            <div className="flex items-center justify-between space-x-4 w-full border border-white/20 bg-white/10 backdrop-blur-[2px] rounded-md py-4 px-6 shadow-lg">
                <div className="flex items-center space-x-2">
                    <img
                        src="/icon.png"
                        alt="Logo"
                        className="w-10 h-10"
                    />
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                        HackNect
                    </h1>
                </div>
                <div>
                    {isSignedIn ? (
                        <div className="flex items-center gap-4">
                            <Link href="/dash" className="group relative inline-block text-md font-semibold text-transparent bg-[linear-gradient(to_right,_theme(colors.purple.500)_50%,_white_50%)] bg-[length:200%_100%] bg-[100%_0%] hover:bg-[0%_0%] bg-clip-text transition-all duration-300">
                                Dashboard
                                <span className="absolute bottom-0 right-0 h-[2px] bg-purple-500 w-0 group-hover:w-full transition-all duration-300 origin-right" />
                            </Link>

                            <UserButton appearance={{ elements: { avatarBox: 'w-12 h-12' } }} />
                        </div>
                    ) : (
                        <SignInButton>
                            <button className="text-white font-bold bg-gradient-to-r to-pink-500 via-purple-500 from-blue-500 py-2 px-4 rounded-md cursor-pointer hover:bg-gradient-to-l transition-all duration-200 hover:scale-105">Get Started</button>
                        </SignInButton>
                    )}
                </div>
            </div>
    )
}

export default Navbar