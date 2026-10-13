import Background from "@/components/Background";

const RegistrationLoading = () => {
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
};

export default RegistrationLoading;
