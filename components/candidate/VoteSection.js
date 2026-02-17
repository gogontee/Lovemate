import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

// This would typically come from your database via a hook
// For now, keeping it as constant but ideally fetch from vote_packages table
const VOTE_PACKAGES = [
  { points: 1, price: 1000, label: "1", popular: false, icon: "🎯", packageName: "Basic 1" },
  { points: 5, price: 5000, label: "5", popular: false, icon: "🎯", packageName: "Basic 5" },
  { points: 20, price: 20000, label: "20", popular: false, icon: "🎯", packageName: "Basic 20" },
  { points: 50, price: 50000, label: "50", popular: false, icon: "🎯", packageName: "Basic 50" },
  { points: 100, price: 100000, label: "100", popular: false, icon: "🎯", packageName: "Basic 100" },
  { points: 300, price: 300000, label: "300", popular: false, icon: "🎯", packageName: "Basic 300" },
  { points: 500, price: 475000, label: "500", popular: false, icon: "⚡", packageName: "THOR 500", discount: 5, originalPrice: 500000 },
  { points: 1000, price: 950000, label: "THOR", popular: true, icon: "⚡", packageName: "THOR 1000", discount: 5, originalPrice: 1000000 },
  { points: 2000, price: 1800000, label: "WAR", popular: true, icon: "🔥", packageName: "WAR", discount: 10, originalPrice: 2000000 },
  { points: 5000, price: 4500000, label: "GOZZ", popular: true, icon: "🚀", packageName: "GOZZ", discount: 10, originalPrice: 5000000 },
];

// Helper function to format price nicely
const formatPrice = (price) => {
  if (price >= 1000000) {
    return `₦${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 1000) {
    return `₦${(price / 1000).toFixed(0)}k`;
  }
  return `₦${price}`;
};

// Generate a simple reference ID
const generateReference = () => {
  return `VOTE_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`.toUpperCase();
};

export default function VoteSection({ candidate }) {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showGiftPrompt, setShowGiftPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleVote = async () => {
    if (!selectedPackage) return;

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      alert("Login required to vote.");
      return router.push("/auth/login");
    }

    setIsProcessing(true);

    try {
      // 1. First check wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (walletError) {
        throw new Error("Could not fetch wallet balance");
      }

      if (!wallet || wallet.balance < selectedPackage.price) {
        alert("Insufficient balance. Please top up your wallet.");
        setIsProcessing(false);
        return;
      }

      // 2. Use your existing RPC function to cast vote (this handles wallet deduction and vote counting)
      const { error: voteError } = await supabase.rpc("cast_vote", {
        p_user_id: user.id,
        p_candidate_id: candidate.id,
        p_vote_count: selectedPackage.points,
      });

      if (voteError) {
        throw new Error(voteError.message);
      }

      // 3. Record vote transaction
      const pricePerVote = Math.round(selectedPackage.price / selectedPackage.points);
      const reference = generateReference();
      
      const { error: transactionError } = await supabase
        .from("vote_transactions")
        .insert({
          user_id: user.id,
          candidate_id: candidate.id,
          package_name: selectedPackage.packageName,
          votes: selectedPackage.points,
          price_per_vote: pricePerVote,
          total_amount: selectedPackage.price,
          discount_percentage: selectedPackage.discount || 0,
          original_amount: selectedPackage.originalPrice || selectedPackage.price,
          payment_method: "wallet",
          status: "completed",
          reference: reference,
          metadata: {
            package_label: selectedPackage.label,
            candidate_name: candidate.name,
            timestamp: new Date().toISOString()
          }
        });

      if (transactionError) {
        // Log but don't fail - the vote already succeeded
        console.error("Failed to record vote transaction:", transactionError);
      }

      // Success!
      setIsProcessing(false);
      setShowConfirmModal(false);
      setShowSuccessModal(true);

    } catch (error) {
      console.error("Vote error:", error);
      alert(error.message || "Vote failed. Try again.");
      setIsProcessing(false);
    }
  };

  return (
    <>
      <section className="py-6 md:py-10 px-3 md:px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-gray-800 mb-0.5 md:mb-1">
              Support <span className="text-red-600">{candidate?.name}</span> with Votes
            </h2>
            <p className="text-xs md:text-sm text-gray-500">Choose your vote package below</p>
          </div>

          {/* Mobile: 5 columns grid for compact view */}
          <div className="grid grid-cols-5 md:grid-cols-5 gap-1.5 md:gap-2">
            {VOTE_PACKAGES.map((pkg, index) => (
              <motion.button
                key={pkg.points}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => {
                  setSelectedPackage(pkg);
                  setShowConfirmModal(true);
                }}
                className={`relative bg-rose-50 hover:bg-rose-100 rounded-lg md:rounded-xl p-1.5 md:p-3 shadow-sm hover:shadow-md transition-all active:scale-95 text-center ${
                  pkg.popular ? 'ring-2 ring-red-500 bg-gradient-to-br from-rose-100 to-red-100' : ''
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[8px] md:text-[10px] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-bold shadow-sm">
                    {pkg.discount}%
                  </span>
                )}
                
                {/* Icon - smaller on mobile */}
                <div className="text-base md:text-xl mb-0.5 md:mb-1">{pkg.icon}</div>
                
                {/* Label - compact on mobile */}
                <div className="font-bold text-[10px] md:text-sm text-gray-800 mb-0.5 truncate">
                  {pkg.label}
                </div>
                
                {/* Points - prominent but compact */}
                <div className="text-sm md:text-base font-extrabold text-red-600">
                  {pkg.points < 1000 ? pkg.points : (pkg.points/1000).toFixed(0) + 'k'}
                </div>
                
                {/* "votes" text */}
                <div className="text-[8px] md:text-[10px] text-gray-400 mb-0.5 md:mb-1">
                  votes
                </div>
                
                {/* Price - smart formatting for k and M */}
                <div className="bg-white/80 backdrop-blur-sm rounded py-0.5 md:py-1 px-0.5 border border-rose-200">
                  <span className="text-[9px] md:text-xs font-bold text-gray-800">
                    {formatPrice(pkg.price)}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Small helper text for premium packages */}
          <p className="text-center text-[10px] md:text-xs text-gray-400 mt-3 md:mt-4">
            ⚡ Premium packages: THOR (5% off), WAR & GOZZ (10% off)
          </p>
        </div>
      </section>

      {/* Confirm Vote Modal - Sleek design */}
      <AnimatePresence>
        {showConfirmModal && selectedPackage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header with icon */}
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                  {selectedPackage.icon}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-1 text-center">
                Confirm {selectedPackage.label} vote
              </h3>
              
              <p className="text-xs text-gray-500 mb-4 text-center">
                You're about to support {candidate.name}
              </p>
              
              <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-4 mb-4 border border-red-100">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-bold text-gray-800">{selectedPackage.packageName}</span>
                </div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-gray-600">Votes:</span>
                  <span className="font-bold text-gray-800">{selectedPackage.points.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-gray-600">Price per vote:</span>
                  <span className="text-gray-800">₦{Math.round(selectedPackage.price/selectedPackage.points).toLocaleString()}</span>
                </div>
                {selectedPackage.discount > 0 && (
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-green-600 font-semibold">{selectedPackage.discount}%</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-red-200 text-base">
                  <span className="font-semibold text-gray-700">Total:</span>
                  <span className="font-bold text-red-600">₦{selectedPackage.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleVote}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-3 rounded-xl text-sm font-semibold hover:from-red-600 hover:to-rose-600 transition-all disabled:opacity-50 shadow-md"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-1">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ...
                    </span>
                  ) : 'Confirm Vote'}
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isProcessing}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal - Sleek design */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
                🎉
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">Votes Sent!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Thank you for supporting <span className="font-semibold text-red-600">{candidate.name}</span>!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setShowGiftPrompt(true);
                  }}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-3 rounded-xl text-sm font-semibold hover:from-red-600 hover:to-rose-600 transition-all shadow-md"
                >
                  Send Gift?
                </button>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gift Prompt Modal - Sleek design */}
      <AnimatePresence>
        {showGiftPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowGiftPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
                🎁
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">Send a Gift?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Show extra support to <span className="font-semibold text-red-600">{candidate.name}</span> with a special gift
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowGiftPrompt(false);
                    document.getElementById('gift')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-3 rounded-xl text-sm font-semibold hover:from-red-600 hover:to-rose-600 transition-all shadow-md"
                >
                  Yes, Show Gifts
                </button>
                <button
                  onClick={() => setShowGiftPrompt(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all"
                >
                  Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}