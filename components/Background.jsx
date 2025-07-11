import '@/app/globals.css';

const BackgroundEffects = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden">
            {/* Main gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>

            {/* Circuit pattern overlay using inline styles */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `
            linear-gradient(45deg, transparent 30%, rgba(0, 212, 255, 0.1) 30%, rgba(0, 212, 255, 0.1) 70%, transparent 70%),
            linear-gradient(-45deg, transparent 30%, rgba(139, 92, 246, 0.1) 30%, rgba(139, 92, 246, 0.1) 70%, transparent 70%)
            `,
                    backgroundSize: '20px 20px, 20px 20px',
                    backgroundPosition: '0 0, 10px 10px'
                }}
            ></div>

            {/* Animated gradient orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-cyan-300/30 rounded-full blur-2xl" style={{ animationDelay: '4s' }}></div>
        </div>
    );
};

export default BackgroundEffects;
