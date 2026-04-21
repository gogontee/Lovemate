import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import FundWalletModal from "../../components/dashboard/FundWalletModal";

const GIFTS = [
  { type: "Flower", price: 10000, icon: "🌸", color: "from-pink-300 to-pink-400", bg: "bg-pink-50", description: "A beautiful bouquet of fresh flowers" },
  { type: "Teddy", price: 20000, icon: "🧸", color: "from-yellow-300 to-yellow-400", bg: "bg-yellow-50", description: "A cuddly teddy bear to keep them company" },
  { type: "Champagne", price: 100000, icon: "🍾", color: "from-amber-300 to-amber-400", bg: "bg-amber-50", description: "Premium champagne for celebration" },
  { type: "Heart", price: 250000, icon: "❤️", color: "from-red-300 to-red-400", bg: "bg-red-50", description: "A heartfelt gift of pure love" },
  { type: "Ring", price: 400000, icon: "💍", color: "from-blue-300 to-blue-400", bg: "bg-blue-50", description: "A stunning ring symbolizing commitment" },
  { type: "Crown", price: 500000, icon: "👑", color: "from-purple-300 to-purple-400", bg: "bg-purple-50", description: "Make them feel like royalty" },
  { type: "Gold", price: 700000, icon: "🪙", color: "from-orange-300 to-orange-400", bg: "bg-orange-50", description: "Luxurious gold gift" },
  { type: "Love", price: 1000000, icon: "💝", color: "from-rose-300 to-rose-400", bg: "bg-rose-50", description: "The ultimate expression of love" },
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
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [showZeroBalanceModal, setShowZeroBalanceModal] = useState(false);
  const [showFundWalletModal, setShowFundWalletModal] = useState(false);
  const [suggestedGift, setSuggestedGift] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Get current user and wallet balance - EXACTLY like VoteSection
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: wallet, error } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", user.id)
          .single();
        
        if (error) {
          console.error("Error fetching wallet:", error);
          setUserBalance(0);
        } else if (wallet) {
          console.log("Wallet balance found:", wallet.balance);
          setUserBalance(wallet.balance);
        }
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const findAffordableGifts = (balance, currentGiftPrice) => {
    const affordable = GIFTS.filter(gift => gift.price <= balance && gift.price < currentGiftPrice)
      .sort((a, b) => b.price - a.price);
    return affordable;
  };

  const refreshBalance = async () => {
    if (user) {
      const { data: wallet, error } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .single();
      
      if (!error && wallet) {
        setUserBalance(wallet.balance);
        return wallet.balance;
      }
    }
    return 0;
  };

  const handleGiftClick = async (gift) => {
    console.log("Selected gift:", gift.type, "Price:", gift.price);
    console.log("Current user:", user);
    console.log("Current balance:", userBalance);
    
    if (!user) {
      alert("Login required to send gift.");
      return router.push("/auth/login");
    }

    // Refresh balance before checking
    const currentBalance = await refreshBalance();
    console.log(`Refreshed balance: ${currentBalance}`);

    // Case 1: Balance is 0
    if (currentBalance === 0) {
      setSelectedGift(gift);
      setShowZeroBalanceModal(true);
      return;
    }

    // Case 2: Balance is less than gift price
    if (currentBalance < gift.price) {
      setSelectedGift(gift);
      const affordableGifts = findAffordableGifts(currentBalance, gift.price);
      
      if (affordableGifts.length > 0) {
        setSuggestedGift(affordableGifts[0]);
        setShowInsufficientModal(true);
      } else {
        setSuggestedGift(null);
        setShowInsufficientModal(true);
      }
      return;
    }

    // Case 3: Sufficient balance - proceed to confirm modal
    setSelectedGift(gift);
    setShowConfirmModal(true);
  };

  const handleGift = async () => {
    if (!selectedGift || !user) return;

    // Refresh balance and check again
    const currentBalance = await refreshBalance();
    
    if (currentBalance < selectedGift.price) {
      setShowConfirmModal(false);
      handleGiftClick(selectedGift);
      return;
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
        setShowConfirmModal(false);
        await refreshBalance();
        handleGiftClick(selectedGift);
      } else {
        alert("Gift failed. Try again.");
      }
      setIsProcessing(false);
      return;
    }

    await refreshBalance();
    setIsProcessing(false);
    setShowConfirmModal(false);
    setShowThankYou(true);
  };

  const handleSuggestedGift = () => {
    if (suggestedGift) {
      setShowInsufficientModal(false);
      handleGiftClick(suggestedGift);
    }
  };

  const handleFundWallet = () => {
    setShowZeroBalanceModal(false);
    setShowInsufficientModal(false);
    setShowFundWalletModal(true);
  };

  const handleFundWalletSuccess = async () => {
    const newBalance = await refreshBalance();
    setShowFundWalletModal(false);
    
    if (selectedGift) {
      if (newBalance >= selectedGift.price) {
        setShowConfirmModal(true);
      } else if (newBalance > 0 && newBalance < selectedGift.price) {
        const affordableGifts = findAffordableGifts(newBalance, selectedGift.price);
        if (affordableGifts.length > 0) {
          setSuggestedGift(affordableGifts[0]);
          setShowInsufficientModal(true);
        } else {
          setSuggestedGift(null);
          setShowInsufficientModal(true);
        }
      } else if (newBalance === 0) {
        setShowZeroBalanceModal(true);
      }
    }
  };

  if (loading) {
    return (
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse text-gray-500">Loading wallet...</div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500">Please login to send gifts to {candidate?.name}</p>
          <button 
            onClick={() => router.push("/auth/login")}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm"
          >
            Login Now
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">
              Send Gift to <span className="text-red-600">{candidate?.name}</span>
            </h2>
            <p className="text-sm text-gray-500">Show your love with a special gift 💝</p>
            
            {/* Wallet Balance Display - Same as VoteSection */}
            <div className="mt-2 inline-flex items-center gap-2 bg-gray-100 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200">
              <span className="text-xs text-gray-600">Wallet:</span>
              <span className="text-sm font-bold text-green-600">{formatPrice(userBalance)}</span>
              <span className="text-[10px] text-gray-500">available</span>
            </div>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {GIFTS.map((gift, index) => (
              <motion.button
                key={gift.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => handleGiftClick(gift)}
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

      {/* Fund Wallet Modal */}
      <FundWalletModal 
        isOpen={showFundWalletModal}
        onClose={() => setShowFundWalletModal(false)}
        onSuccess={handleFundWalletSuccess}
      />

      {/* Zero Balance Modal */}
      <AnimatePresence>
        {showZeroBalanceModal && selectedGift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowZeroBalanceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                  💝
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Wallet Balance Empty! 💔</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Oops! Your wallet balance is ₦0. You need to fund your wallet to send <span className="font-semibold text-rose-600">{selectedGift.type}</span> to <span className="font-semibold text-rose-600">{candidate?.name}</span>.
                </p>
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-700">
                    💡 <span className="font-semibold">Quick Tip:</span> Fund your wallet now and make your favorite housemate feel special! Every gift counts and shows your support.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleFundWallet}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-md"
                  >
                    💰 Fund Wallet Now
                  </button>
                  <button
                    onClick={() => setShowZeroBalanceModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insufficient Balance Modal */}
      <AnimatePresence>
        {showInsufficientModal && selectedGift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowInsufficientModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                  😢
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Insufficient Balance!</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Your balance is <span className="font-bold text-gray-800">{formatPrice(userBalance)}</span>, but <span className="font-semibold text-rose-600">{selectedGift.type}</span> costs <span className="font-bold text-rose-600">{formatPrice(selectedGift.price)}</span>.
                </p>
                
                {suggestedGift ? (
                  <>
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-700 mb-2">
                        💡 <span className="font-semibold">Hey Love! 💕</span> Here's a sweet idea:
                      </p>
                      <p className="text-sm text-gray-800">
                        Why not send a <span className="font-bold text-rose-600">{suggestedGift.icon} {suggestedGift.type}</span> instead? 
                        It costs only <span className="font-bold">{formatPrice(suggestedGift.price)}</span> and fits your current balance perfectly!
                      </p>
                    </div>
                    
                    <button
                      onClick={handleSuggestedGift}
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:from-rose-600 hover:to-pink-600 transition-all shadow-md mb-2"
                    >
                      Send {suggestedGift.type} instead 💝
                    </button>
                  </>
                ) : (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-700 text-center">
                      💡 <span className="font-semibold">Quick Suggestion:</span> Fund your wallet to send this amazing gift!
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {!suggestedGift && (
                    <button
                      onClick={handleFundWallet}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-md"
                    >
                      💰 Fund Wallet
                    </button>
                  )}
                  <button
                    onClick={() => setShowInsufficientModal(false)}
                    className={`${suggestedGift ? 'w-full' : 'flex-1'} bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <p className="text-xs text-gray-600 mb-2">{selectedGift.description}</p>
                <p className="text-lg font-extrabold text-gray-800">{formatPrice(selectedGift.price)}</p>
              </div>

              <p className="text-sm text-gray-600 mb-4 text-center">
                Your balance: <span className="font-bold text-green-600">{formatPrice(userBalance)}</span>
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
                      Sending...
                    </span>
                  ) : 'Send Gift 💝'}
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
              >
                🎁💝
              </motion.div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Gift Sent Successfully! 🎉</h3>
              <p className="text-sm text-gray-600 mb-2">
                Your <span className="font-bold text-rose-600">{selectedGift?.icon} {selectedGift?.type}</span> has been sent to <span className="font-semibold text-rose-600">{candidate?.name}</span>!
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Thank you for showing your love and support! 💕
              </p>
              <button
                onClick={() => setShowThankYou(false)}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:from-rose-600 hover:to-pink-600 transition-all shadow-md"
              >
                Continue Supporting 💪
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}