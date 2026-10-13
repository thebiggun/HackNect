"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Background from "@/components/Background";
import {
    DetailHeader,
    DetailHero,
    DetailAbout,
    DetailGrid,
    DetailTimeline,
    RegistrationStatusCard,
    QuickInfoCard,
    PrizesCard
} from "../components";

const HackathonDetail = () => {
    const params = useParams();
    const router = useRouter();
    const [hackathon, setHackathon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (params.id) {
            fetchHackathon();
        }
    }, [params.id]);

    const fetchHackathon = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/hackathons/public/${params.id}`);
            const data = await response.json();

            if (data.success) {
                setHackathon(data.data);
            } else {
                setError(data.error || 'Failed to fetch hackathon');
            }
        } catch (err) {
            setError('Failed to fetch hackathon');
            console.error('Error fetching hackathon:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div>
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <Background />
                </div>
                <div className="relative w-full p-8 pt-0">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-white text-xl">Loading...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !hackathon) {
        return (
            <div>
                <div className="fixed inset-0 z-0 overflow-hidden">
                    <Background />
                </div>
                <div className="relative w-full p-8 pt-0">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="text-red-400 text-xl mb-4">{error || 'Hackathon not found'}</div>
                            <button
                                onClick={() => router.push('/explore')}
                                className="text-cyan-400 hover:text-cyan-300"
                            >
                                ← Back to Explore
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="fixed inset-0 z-0 overflow-hidden">
                <Background />
            </div>
            <div className="relative w-full px-4 sm:px-6 md:px-8 pb-8 pt-0">
                <DetailHeader
                    title={hackathon.title}
                    creator={hackathon.creator}
                    onBack={() => router.push('/explore')}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <DetailHero hackathon={hackathon} />
                        <DetailAbout description={hackathon.description} />
                        <DetailGrid hackathon={hackathon} />
                        <DetailTimeline timeline={hackathon.timeline} />
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        <RegistrationStatusCard
                            deadline={hackathon.registration_deadline}
                            onRegisterClick={() => router.push(`/explore/${params.id}/register`)}
                        />
                        <QuickInfoCard hackathon={hackathon} />
                        <PrizesCard prizes={hackathon.prizes} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HackathonDetail;
