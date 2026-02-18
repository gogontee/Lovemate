import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

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
  const [votePackages, setVotePackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showGiftPrompt, setShowGiftPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch vote packages from database
  useEffect(() => {
    const fetchVotePackages = async () => {
      try {
        const { data, error } = await supabase
          .from('vote_packages')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) {
          console.error('Error fetching vote packages:', error);
          return;
        }

        if (data && data.length > 0) {
          // Transform database format to match your component's expected format
          const transformedPackages = data.map(pkg => ({
            points: pkg.votes,
            price: pkg.price,
            label: pkg.name.includes('THOR') ? 'THOR' : 
                   pkg.name.includes('WAR') ? 'WAR' : 
                   pkg.name.includes('GOZZ') ? 'GOZZ' : 
                   pkg.name.includes('CLOK') ? 'CLOK' :
                   pkg.votes.toString(),
            popular: pkg.is_popular || false,
            icon: pkg.icon || '🎯',
            packageName: pkg.display_name || pkg.name,
            discount: pkg.discount_percentage || 0,
            originalPrice: pkg.original_price || pkg.price
          }));
          setVotePackages(transformedPackages);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVotePackages();
  }, []);

  const handleVote = async () => {
    if (!selectedPackage) return;

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      alert("Login required to vote.");
      return router.push("/auth/login");
    }

    setIsProcessing(true);

    try {
      // 1. Check wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();

      if (walletError) {
        throw new Error("Could not fetch wallet balance");
      }

      if (!wallet || wallet.balance < selectedPackage.price) {
        alert(`Insufficient balance. You have ₦${wallet?.balance?.toLocaleString() || 0} but need ₦${selectedPackage.price.toLocaleString()}`);
        setIsProcessing(false);
        return;
      }

      // 2. Insert vote transaction FIRST - this triggers everything
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
        }, { returning: 'minimal' });

      if (transactionError) {
        console.error("Transaction error:", transactionError);
        throw new Error("Failed to record vote");
      }

      // 3. Deduct from wallet AFTER successful transaction
      const { error: deductError } = await supabase
        .from("wallets")
        .update({ 
          balance: wallet.balance - selectedPackage.price,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (deductError) {
        // If deduction fails, we have a problem - but vote is already recorded
        console.error("Failed to deduct from wallet but vote was recorded:", deductError);
        // You might want to log this for manual reconciliation
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

  if (loading) {
    return (
      <section className="py-6 md:py-10 px-3 md:px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse text-gray-500">Loading vote packages...</div>
        </div>
      </section>
    );
  }

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
            {votePackages.map((pkg, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => {
                  setSelectedPackage(pkg);
                  setShowConfirmModal(true);
                }}
                className={`relative bg-rose-100 hover:bg-rose-200 rounded-lg md:rounded-xl p-1.5 md:p-3 shadow-sm hover:shadow-md transition-all active:scale-95 text-center ${
                  pkg.popular ? 'ring-2 ring-red-500 bg-gradient-to-br from-rose-200 to-red-100' : ''
                }`}
              >
                {/* Discount Badge - Show when discount_percentage is not 0 */}
                {pkg.discount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[8px] md:text-[10px] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-bold shadow-sm z-10">
                    {pkg.discount}%
                  </span>
                )}
                
                {/* Popular Badge - Only show for CLOK, THOR, WAR, GOZZ packages */}
                {(pkg.label === 'CLOK' || pkg.label === 'THOR' || pkg.label === 'WAR' || pkg.label === 'GOZZ') && (
                  <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[8px] md:text-[10px] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-bold shadow-sm z-10">
                    ★
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
                
                {/* Price - smart formatting for k and M with discount indicator */}
                <div className="bg-white/80 backdrop-blur-sm rounded py-0.5 md:py-1 px-0.5 border border-rose-200">
                  {pkg.discount > 0 ? (
                    <div className="flex flex-col items-center">
                      <span className="text-[7px] md:text-[9px] line-through text-gray-400">
                        {formatPrice(pkg.originalPrice)}
                      </span>
                      <span className="text-[9px] md:text-xs font-bold text-red-600">
                        {formatPrice(pkg.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[9px] md:text-xs font-bold text-gray-800">
                      {formatPrice(pkg.price)}
                    </span>
                  )}
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