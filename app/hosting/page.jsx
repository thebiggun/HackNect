"use client";
import React, { useState } from "react";
import Background from "@/components/Background";
import { useRouter } from "next/navigation";

const HackathonForm = () => {
    const router = useRouter();
    const [form, setForm] = useState({
        title: "",
        venue: "",
        description: "",
        team_min: "",
        team_max: "",
        top_n_selections: "",
        registration_deadline: "",
        prizes: "",
        timeline: "",
        banner_url: null,
        bannerPreview: "./Banner.png",
        pfp_url: null,
        pfpPreview: "./user.png",
    });

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === "file") {
            const file = files[0];
            if (file) {
                setForm((prev) => ({
                    ...prev,
                    [name]: file,
                    [`${name === "banner_url" ? "bannerPreview" : "pfpPreview"}`]: URL.createObjectURL(file),
                }));
            }
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        for (const key in form) {
            if (key === "bannerPreview" || key === "pfpPreview") continue; // skip previews
            if (form[key]) formData.append(key, form[key]);
        }
        try {
            const res = await fetch("/api/hackathons", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                router.push("/creator-dash");
                // Optionally reset form or redirect
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            alert("Submission failed: " + err.message);
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto mt-10 bg-white/10 border border-white/20 rounded-xl shadow-lg p-8 backdrop-blur-md">
            <form className="space-y-6" onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="flex flex-col gap-4 md:flex-row md:gap-8">
                    <div className="flex-1">
                        <label className="block text-white font-semibold mb-1">Title<span className="text-pink-400">*</span></label>
                        <input type="text" name="title" required value={form.title} onChange={handleChange} className="w-full rounded-lg px-4 py-2 bg-slate-900/80 text-white border border-slate-700 focus:ring-2 focus:ring-pink-400 outline-none" placeholder="Hackathon Title" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-white font-semibold mb-1">Venue</label>
                        <input type="text" name="venue" value={form.venue} onChange={handleChange} className="w-full rounded-lg px-4 py-2 bg-slate-900/80 text-white border border-slate-700 focus:ring-2 focus:ring-pink-400 outline-none" placeholder="Venue" />
                    </div>
                </div>
                <div>
                    <label className="block text-white font-semibold mb-1">Description</label>
                    <textarea name="description" rows={3} value={form.description} onChange={handleChange} className="w-full rounded-lg px-4 py-2 bg-slate-900/80 text-white border border-slate-700 focus:ring-2 focus:ring-pink-400 outline-none" placeholder="Describe your hackathon..."></textarea>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-white font-semibold mb-1">Team Min</label>
                        <input type="number" name="team_min" min="1" value={form.team_min} onChange={handleChange} className="w-full rounded-lg px-4 py-2 bg-slate-900/80 text-white border border-slate-700 focus:ring-2 focus:ring-pink-400 outline-none" placeholder="Minimum team size" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-white font-semibold mb-1">Team Max</label>
                        <input type="number" name="team_max" min="1" value={form.team_max} onChange={handleChange} className="w-full rounded-lg px-4 py-2 bg-slate-900/80 text-white border border-slate-700 focus:ring-2 focus:ring-pink-400 outline-none" placeholder="Maximum team size" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-white font-semibold mb-1">Top N Selections</label>
                        <input type="number" name="top_n_selections" min="1" value={form.top_n_selections} onChange={handleChange} className="w-full rounded-lg px-4 py-2 bg-slate-900/80 text-white border border-slate-700 focus:ring-2 focus:ring-pink-400 outline-none" placeholder="Number of winners" />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-white font-semibold mb-1">Registration Deadline<span className="text-pink-400">*</span></label>
                        <input type="datetime-local" name="registration_deadline" required value={form.registration_deadline} onChange={handleChange} className="w-full rounded-lg px-4 py-2 bg-slate-900/80 text-white border border-slate-700 focus:ring-2 focus:ring-pink-400 outline-none" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-white font-semibold mb-1">Prizes</label>
                        <input type="text" name="prizes" value={form.prizes} onChange={handleChange} className="w-full rounded-lg px-4 py-2 bg-slate-900/80 text-white border border-slate-700 focus:ring-2 focus:ring-pink-400 outline-none" placeholder="Prize details" />
                    </div>
                </div>
                <div>
                    <label className="block text-white font-semibold mb-1">Timeline</label>
                    <textarea name="timeline" rows={2} value={form.timeline} onChange={handleChange} className="w-full rounded-lg px-4 py-2 bg-slate-900/80 text-white border border-slate-700 focus:ring-2 focus:ring-pink-400 outline-none" placeholder="Event timeline..."></textarea>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Banner Upload */}
                    <div className="flex-1">
                        <label className="block text-white text-center font-semibold mb-1">Banner Image</label>
                        <div className="flex items-center justify-center gap-4">
                            <input type="file" accept="image/*" name="banner_url" id="banner-upload" className="hidden" onChange={handleChange} />
                            <label htmlFor="banner-upload" className="cursor-pointer bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-cyan-400 hover:to-purple-400 transition-all duration-200">Upload Banner</label>
                            <img id="banner-preview" alt="Banner Preview" className="h-16 rounded-lg border border-slate-700 object-cover" style={{ display: 'inline-block' }} src={form.bannerPreview || undefined} />
                        </div>
                    </div>
                    {/* PFP Upload */}
                    <div className="flex-1">
                        <label className="block text-center text-white font-semibold mb-1">Profile Picture</label>
                        <div className="flex items-center justify-center gap-4">
                            <input type="file" accept="image/*" name="pfp_url" id="pfp-upload" className="hidden" onChange={handleChange} />
                            <label htmlFor="pfp-upload" className="cursor-pointer bg-gradient-to-r from-orange-400 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-orange-300 hover:to-pink-400 transition-all duration-200">Upload PFP</label>
                            <img id="pfp-preview" alt="PFP Preview" className="h-16 w-16 rounded-full border border-slate-700 object-cover" style={{ display: 'inline-block' }} src={form.pfpPreview || undefined} />
                        </div>
                    </div>
                </div>
                <div className="pt-4">
                    <button type="submit" className="w-full py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white shadow-lg hover:from-[#ee0979] hover:to-[#ff6a00] transition-all duration-200 cursor-pointer">Create Hackathon</button>
                </div>
            </form>
        </div>
    );
};

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
                                Host a
                            </span>
                            <span className="ml-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6a00] to-[#ee0979]">
                                Hackathon
                            </span>
                        </div>
                    </div>
                </div>
                <HackathonForm />
            </div>
        </div>
    )
}

export default page;
