"use client";

const DetailAbout = ({ description }) => {
    return (
        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">About</h2>
            <p className="text-gray-300 leading-relaxed">
                {description || 'No description available'}
            </p>
        </div>
    );
};

export default DetailAbout;
