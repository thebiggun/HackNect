"use client";
import { Filter } from "lucide-react";
import Loader from "@/components/Loader";

const ExploreFilters = ({
    filters,
    onFilterChange,
    onClearFilters,
    navLoading = false,
    cities = []
}) => {
    const hasActiveFilters = filters.type !== "all" || filters.city !== "all" || filters.happening !== "all";

    return (
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
                    {hasActiveFilters && (
                        <button
                            onClick={onClearFilters}
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
                                onChange={(e) => onFilterChange("type", e.target.value)}
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
                                onChange={(e) => onFilterChange("city", e.target.value)}
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
                                {cities.map((city) => (
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
                                onChange={(e) => onFilterChange("happening", e.target.value)}
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
                {hasActiveFilters && (
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
    );
};

export default ExploreFilters;
