"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, MapPin, Trophy, Clock, Filter, Eye, User } from "lucide-react";
import Loader from '@/components/Loader';

const ExplorePage = () => {
    const router = useRouter();
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredHackathons, setFilteredHackathons] = useState([]);
    const [navLoading, setNavLoading] = useState(false);
    
    // Filter states
    const [filters, setFilters] = useState({
        type: "all", // "all", "offline", "virtual"
        city: "all",
        happening: "all" // "all", "this_week", "this_month", "this_year"
    });

    // Major Indian cities for filter
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

    useEffect(() => {
        fetchHackathons();
    }, []);

    useEffect(() => {
        // Filter hackathons based on current filters
        let filtered = hackathons;

        // First, filter out hackathons whose registration deadline has passed
        filtered = filtered.filter(hackathon => {
            if (!hackathon.registration_deadline) return true; // Keep hackathons without deadline
            const now = new Date();
            const deadline = new Date(hackathon.registration_deadline);
            return deadline > now; // Only keep hackathons where deadline hasn't passed
        });

        // Filter by type (virtual/offline)
        if (filters.type !== "all") {
            filtered = filtered.filter(hackathon => {
                if (filters.type === "virtual") {
                    return hackathon.venue === "Virtual Event";
                } else if (filters.type === "offline") {
                    return hackathon.venue !== "Virtual Event";
                }
                return true;
            });
        }

        // Filter by city
        if (filters.city !== "all") {
            filtered = filtered.filter(hackathon => {
                if (hackathon.venue === "Virtual Event") return false;
                return hackathon.venue && hackathon.venue.includes(filters.city);
            });
        }

        // Filter by happening time
        if (filters.happening !== "all") {
            const now = new Date();
            filtered = filtered.filter(hackathon => {
                if (!hackathon.registration_deadline) return false;
                const deadline = new Date(hackathon.registration_deadline);
                
                if (filters.happening === "this_week") {
                    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    return deadline >= now && deadline <= weekFromNow;
                } else if (filters.happening === "this_month") {
                    const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                    return deadline >= now && deadline <= monthFromNow;
                } else if (filters.happening === "this_year") {
                    const yearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
                    return deadline >= now && deadline <= yearFromNow;
                }
                return true;
            });
        }

        setFilteredHackathons(filtered);
    }, [filters, hackathons]);

    const fetchHackathons = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/hackathons/public');
            const data = await response.json();
            
            if (data.success) {
                setHackathons(data.data || []);
                setFilteredHackathons(data.data || []);
            } else {
                setError(data.error || 'Failed to fetch hackathons');
            }
        } catch (err) {
            setError('Failed to fetch hackathons');
            console.error('Error fetching hackathons:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleHackathonClick = async (hackathonId) => {
        setNavLoading(true);
        await router.push(`/explore/${hackathonId}`);
        setNavLoading(false);
    };

    const getTimeRemaining = (deadline) => {
        if (!deadline) return null;
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diff = deadlineDate - now;
        
        if (diff <= 0) return 'Registration Closed';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
        return 'Less than 1 hour left';
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            type: "all",
            city: "all",
            happening: "all"
        });
    };

    if (loading) {
        return (
            <div className="relative w-full p-8 pt-0">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-white text-xl">Discovering amazing hackathons...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full p-8 pt-0">
            <div className="px-2 sm:px-4 md:px-6">
                <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                    <div>
                        <span className="text-3xl font-semibold text-white">
                            Explore
                        </span>
                        <span className="ml-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6a00] to-[#ee0979]">
                            Hackathons
                        </span>
                    </div>
                    <div className="text-white text-lg">
                        {filteredHackathons.length} {filteredHackathons.length === 1 ? 'Hackathon' : 'Hackathons'} Available
                    </div>
                </div>

                {/* Filters Section */}
                <div className="mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-[#ff6a00] to-[#ee0979] rounded-lg">
                                    <Filter className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-lg">Filter Hackathons</h3>
                                    <p className="text-gray-300 text-sm">Find the perfect hackathon for you</p>
                                </div>
                            </div>
                            {(filters.type !== "all" || filters.city !== "all" || filters.happening !== "all") && (
                                <button
                                    onClick={clearFilters}
                                    disabled={navLoading}
                                    className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-200 text-sm font-medium"
                                >
                                    {navLoading ? <Loader size={18} className="mr-2 align-middle" /> : 'Clear All Filters'}
                                </button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {/* Type Filter */}
                            <div className="space-y-2">
                                <label className="block text-white font-medium text-sm">Event Type</label>
                                <div className="relative">
                                    <select
                                        value={filters.type}
                                        onChange={(e) => handleFilterChange("type", e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff6a00] focus:border-transparent backdrop-blur-md appearance-none cursor-pointer"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                            backgroundPosition: 'right 0.75rem center',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: '1.5em 1.5em',
                                            paddingRight: '2.5rem'
                                        }}
                                    >
                                        <option value="all" className="bg-slate-800 text-white">All Events</option>
                                        <option value="virtual" className="bg-slate-800 text-white">Virtual Events</option>
                                        <option value="offline" className="bg-slate-800 text-white">Offline Events</option>
                                    </select>
                                </div>
                            </div>

                            {/* City Filter */}
                            <div className="space-y-2">
                                <label className="block text-white font-medium text-sm">City</label>
                                <div className="relative">
                                    <select
                                        value={filters.city}
                                        onChange={(e) => handleFilterChange("city", e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff6a00] focus:border-transparent backdrop-blur-md appearance-none cursor-pointer"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                            backgroundPosition: 'right 0.75rem center',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: '1.5em 1.5em',
                                            paddingRight: '2.5rem'
                                        }}
                                    >
                                        <option value="all" className="bg-slate-800 text-white">All Cities</option>
                                        {indianCities.map((city) => (
                                            <option key={city} value={city} className="bg-slate-800 text-white">{city}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Happening Filter */}
                            <div className="space-y-2">
                                <label className="block text-white font-medium text-sm">Registration Deadline</label>
                                <div className="relative">
                                    <select
                                        value={filters.happening}
                                        onChange={(e) => handleFilterChange("happening", e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff6a00] focus:border-transparent backdrop-blur-md appearance-none cursor-pointer"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                            backgroundPosition: 'right 0.75rem center',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: '1.5em 1.5em',
                                            paddingRight: '2.5rem'
                                        }}
                                    >
                                        <option value="all" className="bg-slate-800 text-white">All Time</option>
                                        <option value="this_week" className="bg-slate-800 text-white">This Week</option>
                                        <option value="this_month" className="bg-slate-800 text-white">This Month</option>
                                        <option value="this_year" className="bg-slate-800 text-white">This Year</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {(filters.type !== "all" || filters.city !== "all" || filters.happening !== "all") && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <div className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                                    <span>Active Filters:</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {filters.type !== "all" && (
                                        <span className="px-3 py-1 bg-[#ff6a00]/20 border border-[#ff6a00]/30 text-[#ff6a00] rounded-full text-xs font-medium">
                                            Type: {filters.type === "virtual" ? "Virtual" : "Offline"}
                                        </span>
                                    )}
                                    {filters.city !== "all" && (
                                        <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full text-xs font-medium">
                                            City: {filters.city}
                                        </span>
                                    )}
                                    {filters.happening !== "all" && (
                                        <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 text-green-300 rounded-full text-xs font-medium">
                                            {filters.happening === "this_week" ? "This Week" : 
                                             filters.happening === "this_month" ? "This Month" : "This Year"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {filteredHackathons.length === 0 ? (
                    <div className="bg-white/10 border border-white/20 rounded-xl p-12 text-center">
                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-[#ff6a00] to-[#ee0979] flex items-center justify-center mb-6">
                            <Calendar className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">
                            No Hackathons Found
                        </h2>
                        <p className="text-gray-300 text-lg mb-6">
                            Try adjusting your filters or browse all available hackathons.
                        </p>
                        <button 
                            onClick={clearFilters}
                            disabled={navLoading}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white font-semibold rounded-lg hover:from-[#ee0979] hover:to-[#ff6a00] transition-all duration-200"
                        >
                            {navLoading ? <Loader size={18} className="mr-2 align-middle" /> : 'Clear Filters'}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {filteredHackathons.map((hackathon) => (
                            <div 
                                key={hackathon.id} 
                                className="group bg-white/10 border border-white/20 rounded-xl overflow-hidden backdrop-blur-md hover:bg-white/15 transition-all duration-300 relative cursor-pointer hover:scale-105 transform"
                                onClick={() => handleHackathonClick(hackathon.id)}
                            >
                                {/* Banner Image */}
                                <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-800 relative overflow-hidden">
                                    {hackathon.banner_url ? (
                                        <img 
                                            src={hackathon.banner_url} 
                                            alt={hackathon.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Calendar className="w-16 h-16 text-white/50" />
                                        </div>
                                    )}
                                    
                                    {/* Creator Info Overlay */}
                                    {hackathon.creator && (
                                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-white/80" />
                                                <span className="text-white/90 text-sm font-medium">
                                                    {hackathon.creator.name || 'Anonymous'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Time Remaining Badge */}
                                    {hackathon.registration_deadline && (
                                        <div className="absolute top-4 right-4">
                                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                getTimeRemaining(hackathon.registration_deadline) === 'Registration Closed'
                                                    ? 'bg-red-500/80 text-white'
                                                    : 'bg-green-500/80 text-white'
                                            }`}>
                                                {getTimeRemaining(hackathon.registration_deadline)}
                                            </div>
                                        </div>
                                    )}

                                    {/* View Details Button */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-white" />
                                            <span className="text-white font-semibold">View Details</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white line-clamp-2 mb-3 group-hover:text-[#ff6a00] transition-colors">
                                        {hackathon.title}
                                    </h3>
                                    
                                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                                        {hackathon.description || 'No description available'}
                                    </p>

                                    <div className="space-y-3">
                                        {hackathon.venue && (
                                            <div className="flex items-center gap-2 text-gray-300 text-sm">
                                                <MapPin className="w-4 h-4" />
                                                <span className="line-clamp-1">{hackathon.venue}</span>
                                            </div>
                                        )}

                                        {hackathon.registration_deadline && (
                                            <div className="flex items-center gap-2 text-gray-300 text-sm">
                                                <Clock className="w-4 h-4" />
                                                <span>Deadline: {formatDate(hackathon.registration_deadline)}</span>
                                            </div>
                                        )}

                                        {(hackathon.team_min || hackathon.team_max) && (
                                            <div className="flex items-center gap-2 text-gray-300 text-sm">
                                                <Users className="w-4 h-4" />
                                                <span>
                                                    {hackathon.team_min && hackathon.team_max 
                                                        ? `${hackathon.team_min}-${hackathon.team_max} members`
                                                        : hackathon.team_min 
                                                            ? `Min ${hackathon.team_min} members`
                                                            : `Max ${hackathon.team_max} members`
                                                    }
                                                </span>
                                            </div>
                                        )}

                                        {hackathon.prizes && (
                                            <div className="flex items-center gap-2 text-gray-300 text-sm">
                                                <Trophy className="w-4 h-4" />
                                                <span className="line-clamp-1">{hackathon.prizes}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExplorePage;
