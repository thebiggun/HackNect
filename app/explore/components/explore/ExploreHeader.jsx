"use client";

const ExploreHeader = ({ count = 0 }) => {
    return (
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
                {count} {count === 1 ? 'Hackathon' : 'Hackathons'} Available
            </div>
        </div>
    );
};

export default ExploreHeader;
