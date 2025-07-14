"use client";
import { useEffect, useState } from "react";
import Background from "@/components/Background";
import { Users, Trophy, Plus, Eye, MapPin, Calendar, User } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: <Eye className="w-7 h-7 text-[#ff6a00]" />, title: "Explore Hackathons", desc: "Browse, filter, and discover hackathons from all over India and beyond."
  },
  {
    icon: <Plus className="w-7 h-7 text-[#ee0979]" />, title: "Host Your Own", desc: "Easily create and manage your own hackathons with custom banners, prizes, and more."
  },
  {
    icon: <Users className="w-7 h-7 text-cyan-400" />, title: "Team Up", desc: "Form or join teams, invite friends, and compete together. Unique invite codes for easy joining."
  },
  {
    icon: <Trophy className="w-7 h-7 text-yellow-400" />, title: "Track Progress", desc: "Dashboards for participants and creators. See your wins, registrations, and stats."
  },
  {
    icon: <User className="w-7 h-7 text-purple-400" />, title: "Secure Accounts", desc: "Sign in securely with Clerk. Your data and teams are always safe."
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Home() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHackathons() {
      setLoading(true);
      // Fetch all hackathons
      const res = await fetch("/api/hackathons/public");
      const data = await res.json();
      if (!data.success) return setLoading(false);
      const all = data.data || [];
      // For each hackathon, fetch registrations and count participants
      const hackathonsWithCounts = await Promise.all(
        all.map(async (hack) => {
          try {
            const regRes = await fetch(`/api/hackathons/${hack.id}/registrations`);
            const regData = await regRes.json();
            if (!regData.success) return { ...hack, participantCount: 0 };
            // Count participants: each registration has a team_leader and teammates[]
            let count = 0;
            regData.data.forEach((reg) => {
              // teammates may include leader, so filter
              const teammates = reg.teammates?.filter(t => t.id !== reg.team_leader?.id) || [];
              count += 1 + teammates.length;
            });
            return { ...hack, participantCount: count };
          } catch {
            return { ...hack, participantCount: 0 };
          }
        })
      );
      // Sort by participantCount desc, take top 3
      hackathonsWithCounts.sort((a, b) => b.participantCount - a.participantCount);
      setHackathons(hackathonsWithCounts.slice(0, 3));
      setLoading(false);
    }
    fetchHackathons();
  }, []);

  return (
    <div>
      <div className="fixed inset-0 z-0 overflow-hidden">
        <Background />
      </div>
      <main className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-16 pt-8 pb-24 px-2 sm:px-4 md:px-8">
        {/* Top Hackathons */}
        <section className="mb-12 px-2 sm:px-4 md:px-0">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-2 drop-shadow-lg">
            <span className="bg-gradient-to-r from-[#ff6a00] to-[#ee0979] bg-clip-text text-transparent">India's Hottest Hackathons</span>
          </h1>
          <p className="text-center text-lg text-gray-300 mb-8">Join the most popular hackathons with the biggest crowds!</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-72 bg-white/10 rounded-2xl animate-pulse" />
              ))
            ) : hackathons.length === 0 ? (
              <div className="col-span-3 text-center text-gray-400">No hackathons found.</div>
            ) : (
              hackathons.map((hack) => (
                <Link
                  href={`/explore/${hack.id}`}
                  key={hack.id}
                  className={classNames(
                    "group relative rounded-2xl overflow-hidden shadow-xl border border-white/20 bg-gradient-to-br from-[#181c23] to-[#232935] hover:scale-105 transition-transform duration-300 cursor-pointer",
                    "flex flex-col"
                  )}
                  style={{ minHeight: 280 }}
                >
                  {/* Banner */}
                  {hack.banner_url ? (
                    <img src={hack.banner_url} alt={hack.title} className="h-36 w-full object-cover" />
                  ) : (
                    <div className="h-36 w-full bg-gradient-to-r from-[#ff6a00] to-[#ee0979] flex items-center justify-center">
                      <Trophy className="w-12 h-12 text-white/60" />
                    </div>
                  )}
                  {/* Content */}
                  <div className="flex-1 flex flex-col p-6 gap-2">
                    <h2 className="text-2xl font-bold text-white group-hover:text-[#ff6a00] transition-colors line-clamp-2">{hack.title}</h2>
                    <p className="text-gray-300 text-sm line-clamp-3 mb-2">{hack.description || "No description available."}</p>
                    <div className="flex items-center gap-2 mt-auto">
                      <Users className="w-5 h-5 text-cyan-400" />
                      <span className="font-semibold text-cyan-200 text-lg">{hack.participantCount}</span>
                      <span className="text-gray-400 text-sm ml-1">participants</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{hack.venue || "Venue TBA"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <Calendar className="w-4 h-4" />
                      <span>{hack.registration_deadline ? new Date(hack.registration_deadline).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "No deadline"}</span>
                    </div>
                  </div>
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-white" />
                      <span className="text-white font-semibold">View Details</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16 px-2 sm:px-4 md:px-0">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-2 drop-shadow-lg">
            <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-300 bg-clip-text text-transparent">Why HackNect?</span>
          </h2>
          <p className="text-center text-lg text-gray-300 mb-8">Everything you need for the ultimate hackathon experience.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg hover:bg-white/15 transition-all duration-300">
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                <p className="text-gray-300 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
