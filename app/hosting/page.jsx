"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Loader from '@/components/Loader';

const HackathonForm = () => {
    const router = useRouter();
    const [form, setForm] = useState({
        title: "",
        venue_type: "virtual", // "virtual" or "offline"
        venue: "",
        city: "",
        detailed_venue: "",
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
    const [submitting, setSubmitting] = useState(false);

    // Major Indian cities
    const indianCities = [
        "Agartala", "Agra", "Ahmedabad", "Ahmednagar", "Aizawl", "Ajmer", "Akola",
        "Aligarh", "Alwar", "Ambala", "Ambattur", "Amravati", "Amritsar", "Anantapur",
        "Asansol", "Avadi", "Aurangabad", "Bangalore", "Baranagar", "Bareilly",
        "Bathinda", "Begusarai", "Belgaum", "Bharatpur", "Bhatpara", "Bhavnagar",
        "Bhilai", "Bhilwara", "Bhiwandi", "Bhiwani", "Bhopal", "Bhubaneswar",
        "Bhagalpur", "Bikaner", "Bilaspur", "Bokaro", "Chandigarh", "Charkhi Dadri",
        "Chennai", "Coimbatore", "Cuttack", "Darbhanga", "Davanagere", "Dehradun",
        "Delhi", "Delhi Cantonment", "Dhanbad", "Durgapur", "Erode", "Faridabad",
        "Fatehabad", "Firozabad", "Gandhidham", "Gandhinagar", "Gaya", "Ghaziabad",
        "Gopalpur", "Gorakhpur", "Gulbarga", "Guntur", "Gurgaon", "Guwahati",
        "Gwalior", "Hardwar", "Hisar", "Howrah", "Hubli-Dharwad", "Hyderabad",
        "Ichalkaranji", "Indore", "Jabalpur", "Jaipur", "Jalandhar", "Jalgaon",
        "Jammu", "Jamnagar", "Jamshedpur", "Jhansi", "Jind", "Jodhpur", "Kadapa",
        "Kakinada", "Kalyan-Dombivali", "Kanchipuram", "Kanpur", "Kaithal", "Karnal",
        "Karur", "Katihar", "Kharagpur", "Kochi", "Kolhapur", "Kolkata", "Kollam",
        "Korba", "Kota", "Kozhikode", "Kurnool", "Kurukshetra", "Latur", "Lucknow",
        "Loni", "Ludhiana", "Madurai", "Mahendragarh", "Maheshtala", "Malegaon",
        "Mangalore", "Mathura", "Meerut", "Moradabad", "Modinagar", "Mumbai",
        "Murwara", "Muzaffarnagar", "Muzaffarpur", "Mysore", "Nagercoil", "Nagpur",
        "Nanded", "Nashik", "Nellore", "New Delhi", "Nizamabad", "Noida", "Nuh",
        "Panihati", "Panipat", "Pali", "Palwal", "Panchkula", "Patiala", "Patna",
        "Pimpri-Chinchwad", "Puducherry", "Pune", "Raipur", "Rajahmundry",
        "Rajkot", "Rajpur Sonarpur", "Rampur", "Ranchi", "Ratlam", "Rewari",
        "Rohtak", "Rourkela", "Sagar", "Saharanpur", "Salem", "Sangli-Miraj",
        "Satna", "Sikar", "Siliguri", "Sirsa", "Solapur", "Sonipat", "South Dumdum",
        "Srinagar", "Surat", "Tiruchirappalli", "Tirunelveli", "Tirupati",
        "Tirupur", "Tiruvannamalai", "Tiruvottiyur", "Tenali", "Thane", "Thanjavur",
        "Thrissur", "Tumkur", "Udaipur", "Ujjain", "Ulhasnagar", "Vadodara",
        "Varanasi", "Vasai-Virar", "Vijayawada", "Visakhapatnam", "Vizianagaram",
        "Warangal", "Yamunanagar"
    ];


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

        // Construct venue string based on venue type
        let venueString = "";
        if (form.venue_type === "virtual") {
            venueString = "Virtual Event";
        } else {
            venueString = `${form.detailed_venue}, ${form.city}, India`;
        }

        for (const key in form) {
            if (key === "bannerPreview" || key === "pfpPreview" || key === "city" || key === "detailed_venue" || key === "venue_type") continue; // skip previews and individual venue fields
            if (form[key]) formData.append(key, form[key]);
        }

        // Add the constructed venue string
        formData.append("venue", venueString);

        try {
            setSubmitting(true);
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
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto mt-6 sm:mt-10 bg-white/10 border border-white/20 rounded-xl shadow-lg p-4 sm:p-6 md:p-8 backdrop-blur-md">
            <form className="space-y-6" onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="flex flex-col gap-4 md:flex-row md:gap-8">
                    <div className="flex-1">
                        <label className="block text-white font-semibold mb-1">Title<span className="text-pink-400">*</span></label>
                        <input type="text" name="title" required value={form.title} onChange={handleChange} className="w-full rounded-lg px-4 py-2 bg-slate-900/80 text-white border border-slate-700 focus:ring-2 focus:ring-pink-400 outline-none" placeholder="Hackathon Title" />
                    </div>
                </div>

                {/* Venue Type Selection */}
                <div>
                    <label className="block text-white font-semibold mb-3">Event Type<span className="text-pink-400">*</span></label>
                    <div className="flex gap-6">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="venue_type"
                                value="virtual"
                                checked={form.venue_type === "virtual"}
                                onChange={handleChange}
                                className="mr-2 text-pink-400 focus:ring-pink-400"
                            />
                            <span className="text-white">Virtual Event</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="venue_type"
                                value="offline"
                                checked={form.venue_type === "offline"}
                                onChange={handleChange}
                                className="mr-2 text-pink-400 focus:ring-pink-400"
                            />
                            <span className="text-white">Offline Event</span>
                        </label>
                    </div>
                </div>

                {/* Conditional Offline Venue Fields */}
                {form.venue_type === "offline" && (
                    <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700">
                        <div>
                            <label className="block text-white font-semibold mb-1">City<span className="text-pink-400">*</span></label>
                            <select
                                name="city"
                                required
                                value={form.city}
                                onChange={handleChange}
                                className="w-full rounded-lg px-4 py-2 bg-slate-900/80 text-white border border-slate-700 focus:ring-2 focus:ring-pink-400 outline-none"
                            >
                                <option value="">Select a city</option>
                                {indianCities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-white font-semibold mb-1">Detailed Venue<span className="text-pink-400">*</span></label>
                            <input
                                type="text"
                                name="detailed_venue"
                                required
                                value={form.detailed_venue}
                                onChange={handleChange}
                                className="w-full rounded-lg px-4 py-2 bg-slate-900/80 text-white border border-slate-700 focus:ring-2 focus:ring-pink-400 outline-none"
                                placeholder="e.g., Tech Park Building, Floor 3, Room 301"
                            />
                        </div>
                    </div>
                )}

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
                    <button type="submit" className="w-full py-3 rounded-lg font-bold text-lg bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white shadow-lg hover:from-[#ee0979] hover:to-[#ff6a00] transition-all duration-200 cursor-pointer" disabled={submitting}>
                        {submitting ? <Loader size={20} className="mr-2 align-middle" /> : 'Create Hackathon'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const page = () => {
    return (
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
    )
}

export default page;
