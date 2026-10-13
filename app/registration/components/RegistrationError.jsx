import Background from "@/components/Background";

const RegistrationError = ({ error, onBack }) => {
    return (
        <div>
            <div className="fixed inset-0 z-0 overflow-hidden">
                <Background />
            </div>
            <div className="relative w-full p-8 pt-0">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="text-red-400 text-xl mb-4">{error || "Registration not found"}</div>
                        <button
                            onClick={onBack}
                            className="text-cyan-400 hover:text-cyan-300"
                        >
                            ← Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationError;
