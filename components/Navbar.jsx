'use client'
import Link from "next/link"
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs"
import { UserButton } from "@clerk/nextjs"
import { useState } from "react";

const Navbar = () => {
    const { isSignedIn, user } = useUser();
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <nav className="w-full">
            <div className="flex items-center justify-between w-full border border-white/20 bg-white/10 backdrop-blur-[2px] rounded-md py-4 px-4 sm:px-6 shadow-lg">
                <div className="flex items-center space-x-2">
                    <img
                        src="/icon.png"
                        alt="Logo"
                        className="w-10 h-10"
                    />
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                        HackNect
                    </h1>
                </div>
                <button
                    className="sm:hidden flex items-center justify-center p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-label="Toggle navigation menu"
                >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {menuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        )}
                    </svg>
                </button>
                <div className="hidden sm:flex items-center">
                    {isSignedIn ? (
                        <div className="flex items-center gap-4">
                            <Link href="/" className="group relative inline-block text-md font-semibold text-transparent bg-[linear-gradient(to_right,_theme(colors.green.500)_50%,_white_50%)] bg-[length:200%_100%] bg-[100%_0%] hover:bg-[0%_0%] bg-clip-text transition-all duration-300">
                                Home
                                <span className="absolute bottom-0 right-0 h-[2px] bg-green-500 w-0 group-hover:w-full transition-all duration-300 origin-right" />
                            </Link>
                            <Link href="/explore" className="group relative inline-block text-md font-semibold text-transparent bg-[linear-gradient(to_right,_theme(colors.orange.500)_50%,_white_50%)] bg-[length:200%_100%] bg-[100%_0%] hover:bg-[0%_0%] bg-clip-text transition-all duration-300">
                                Explore
                                <span className="absolute bottom-0 right-0 h-[2px] bg-orange-500 w-0 group-hover:w-full transition-all duration-300 origin-right" />
                            </Link>
                            <Link href="/dash" className="group relative inline-block text-md font-semibold text-transparent bg-[linear-gradient(to_right,_theme(colors.purple.500)_50%,_white_50%)] bg-[length:200%_100%] bg-[100%_0%] hover:bg-[0%_0%] bg-clip-text transition-all duration-300">
                                Dashboard
                                <span className="absolute bottom-0 right-0 h-[2px] bg-purple-500 w-0 group-hover:w-full transition-all duration-300 origin-right" />
                            </Link>
                            <UserButton appearance={{ elements: { avatarBox: 'w-12 h-12' } }} />
                        </div>
                    ) : (
                        <>
                            <Link href="/" className="group relative inline-block text-md font-semibold text-transparent bg-[linear-gradient(to_right,_theme(colors.green.500)_50%,_white_50%)] bg-[length:200%_100%] bg-[100%_0%] hover:bg-[0%_0%] bg-clip-text transition-all duration-300 mr-4">
                                Home
                                <span className="absolute bottom-0 right-0 h-[2px] bg-green-500 w-0 group-hover:w-full transition-all duration-300 origin-right" />
                            </Link>
                            <Link href="/explore" className="group relative inline-block text-md font-semibold text-transparent bg-[linear-gradient(to_right,_theme(colors.orange.500)_50%,_white_50%)] bg-[length:200%_100%] bg-[100%_0%] hover:bg-[0%_0%] bg-clip-text transition-all duration-300 mr-4">
                                Explore
                                <span className="absolute bottom-0 right-0 h-[2px] bg-orange-500 w-0 group-hover:w-full transition-all duration-300 origin-right" />
                            </Link>
                            <SignInButton>
                                <button className="text-white font-bold bg-gradient-to-r to-pink-500 via-purple-500 from-blue-500 py-2 px-4 rounded-md cursor-pointer hover:bg-gradient-to-l transition-all duration-200 hover:scale-105">Get Started</button>
                            </SignInButton>
                        </>
                    )}
                </div>
            </div>
            {menuOpen && (
                <div className="sm:hidden flex flex-col gap-4 mt-2 border border-white/20 bg-white/10 backdrop-blur-[2px] rounded-md py-4 px-4 shadow-lg animate-fade-in">
                    {isSignedIn ? (
                        <>
                            <Link href="/" className="text-md font-semibold text-white py-2" onClick={() => setMenuOpen(false)}>Home</Link>
                            <Link href="/explore" className="text-md font-semibold text-white py-2" onClick={() => setMenuOpen(false)}>Explore</Link>
                            <Link href="/dash" className="text-md font-semibold text-white py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                            <div className="flex items-center mt-2">
                                <UserButton appearance={{ elements: { avatarBox: 'w-10 h-10' } }} />
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/" className="text-md font-semibold text-white py-2" onClick={() => setMenuOpen(false)}>Home</Link>
                            <Link href="/explore" className="text-md font-semibold text-white py-2" onClick={() => setMenuOpen(false)}>Explore</Link>
                            <SignInButton>
                                <button className="text-white font-bold bg-gradient-to-r to-pink-500 via-purple-500 from-blue-500 py-2 px-4 rounded-md cursor-pointer hover:bg-gradient-to-l transition-all duration-200 hover:scale-105 w-full">Get Started</button>
                            </SignInButton>
                        </>
                    )}
                </div>
            )}
        </nav>
    )
}

export default Navbar