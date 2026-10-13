"use client";
import { getDetailTimeRemaining, getRegistrationStatus } from "../utils";

const RegistrationStatusCard = ({ deadline, onRegisterClick }) => {
    const registrationStatus = getRegistrationStatus(deadline);
    const timeRemaining = getDetailTimeRemaining(deadline);
    const isClosed = timeRemaining === 'Registration Closed';

    return (
        <div className="bg-white/10 border border-white/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Registration Status</h3>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-gray-300">Status:</span>
                    <span className={`font-semibold ${registrationStatus.color}`}>
                        {registrationStatus.status}
                    </span>
                </div>
                {deadline && (
                    <div className="flex items-center justify-between">
                        <span className="text-gray-300">Time Left:</span>
                        <span className={`font-semibold ${isClosed ? 'text-red-400' : 'text-green-400'}`}>
                            {timeRemaining}
                        </span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
                <button
                    onClick={onRegisterClick}
                    disabled={isClosed}
                    className={`w-full py-3 font-semibold rounded-lg transition-all duration-200 transform cursor-pointer ${
                        isClosed
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-[#ff6a00] to-[#ee0979] text-white hover:from-[#ee0979] hover:to-[#ff6a00] hover:scale-105'
                    }`}
                >
                    {isClosed ? 'Registration Closed' : 'Register for Teams'}
                </button>
            </div>
        </div>
    );
};

export default RegistrationStatusCard;
