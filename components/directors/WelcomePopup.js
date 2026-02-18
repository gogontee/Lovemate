// components/directors/WelcomePopup.js
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Shield } from "lucide-react";

export default function WelcomePopup({ isOpen, onClose, userName }) {
  const formatName = (fullName) => {
    if (!fullName) return "Director";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1].charAt(0)}.`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-rose-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="inline-block p-3 bg-gradient-to-r from-red-600 to-rose-600 rounded-full mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome, {formatName(userName)}!
              </h2>
              
              <p className="text-sm text-gray-600 mb-4">
                You're viewing this page as a <span className="font-bold text-red-600">Co-Owner & Organizer</span> of Lovemate Show.
              </p>

              <div className="bg-gradient-to-r from-rose-50 to-red-50 rounded-xl p-4 mb-4 border border-rose-200">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 text-left">
                    Please keep your director's code confidential to prevent unauthorized access to this analytics dashboard.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all"
              >
                Continue to Dashboard
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}