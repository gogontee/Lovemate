import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

const GIFTS = [
  { type: "Flower", price: 10000, icon: "🌸", color: "from-pink-300 to-pink-400", bg: "bg-pink-50" },
  { type: "Teddy", price: 20000, icon: "🧸", color: "from-yellow-300 to-yellow-400", bg: "bg-yellow-50" },
  { type: "Champagne", price: 100000, icon: "🍾", color: "from-amber-300 to-amber-400", bg: "bg-amber-50" },
  { type: "Heart", price: 250000, icon: "❤️", color: "from-red-300 to-red-400", bg: "bg-red-50" },
  { type: "Ring", price: 400000, icon: "💍", color: "from-blue-300 to-blue-400", bg: "bg-blue-50" },
  { type: "Crown", price: 500000, icon: "👑", color: "from-purple-300 to-purple-400", bg: "bg-purple-50" },
  { type: "Gold", price: 700000, icon: "🪙", color: "from-orange-300 to-orange-400", bg: "bg-orange-50" },
  { type: "Love", price: 1000000, icon: "💝", color: "from-rose-300 to-rose-400", bg: "bg-rose-50" },
];

// Helper function to format price nicely
const formatPrice = (price) => {
  if (price >= 1000000) {
    return `₦${(price / 1000000).toFixed(0)}M`;
  } else if (price >= 1000) {
    return `₦${(price / 1000).toFixed(0)}k`;
  }
  return `₦${price}`;
};

export default function GiftSection({ candidate }) {
  const [selectedGift, setSelectedGift] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleGift = async () => {
    if (!selectedGift) return;

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      alert("Login required to send gift.");
      return router.push("/auth/login");
    }

    setIsProcessing(true);

    const { error } = await supabase.rpc("send_gift", {
      p_user_id: user.id,
      p_candidate_id: candidate.id,
      p_gift_type: selectedGift.type,
    });

    if (error) {
      console.error("send_gift error:", error);
      if (error.message.includes("insufficient_balance")) {
        alert("Insufficient balance. Please top up your wallet.");
      } else {
        alert("Gift failed. Try again.");
      }
      setIsProcessing(false);
      return;
    }

    setIsProcessing(false);
    setShowConfirmModal(false);
    setShowThankYou(true);
  };

  return (
    <>
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
              Send Gift to <span className="text-red-600">{candidate?.name}</span>
            </h2>
            <p className="text-sm text-gray-500">Gifts belong to {candidate?.name} — show you care</p>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {GIFTS.map((gift, index) => (
              <motion.button
                key={gift.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => {
                  setSelectedGift(gift);
                  setShowConfirmModal(true);
                }}
                className="group"
              >
                <div className={`${gift.bg} rounded-lg p-2 shadow-sm hover:shadow-md transition-all hover:scale-105 text-center border border-gray-100`}>
                  <div className="text-xl mb-0.5 group-hover:scale-110 transition-transform">
                    {gift.icon}
                  </div>
                  <h3 className="font-medium text-[10px] text-gray-700 mb-0.5 truncate">
                    {gift.type}
                  </h3>
                  <div className="bg-white/60 rounded py-0.5 px-0.5">
                    <span className="text-[8px] font-bold text-gray-800">
                      {formatPrice(gift.price)}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Confirm Gift Modal */}
      <AnimatePresence>
        {showConfirmModal && selectedGift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-xl p-5 max-w-sm w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
                Send {selectedGift.type} to {candidate?.name}
              </h3>
              
              <div className={`${selectedGift.bg} rounded-lg p-4 mb-4 text-center`}>
                <div className="text-4xl mb-2">{selectedGift.icon}</div>
                <h4 className="font-bold text-gray-800 mb-1">{selectedGift.type}</h4>
                <p className="text-lg font-extrabold text-gray-800">{formatPrice(selectedGift.price)}</p>
              </div>

              <p className="text-sm text-gray-600 mb-4 text-center">
                This gift will be sent to {candidate?.name}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleGift}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:from-red-600 hover:to-rose-600 transition-all disabled:opacity-50 shadow-md"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-1">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ...
                    </span>
                  ) : 'Send Gift'}
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isProcessing}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thank You Modal */}
      <AnimatePresence>
        {showThankYou && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowThankYou(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
                🎁💝
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">Gift Sent!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your {selectedGift?.type} has been sent to <span className="font-semibold text-red-600">{candidate?.name}</span>
              </p>
              <button
                onClick={() => setShowThankYou(false)}
                className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:from-red-600 hover:to-rose-600 transition-all shadow-md"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}