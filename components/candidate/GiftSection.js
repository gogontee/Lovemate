import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import FundWalletModal from "../../components/dashboard/FundWalletModal";

const GIFTS = [
  { type: "Flower", price: 5000, icon: "🌸", color: "from-pink-300 to-pink-400", bg: "bg-pink-50", glow: "rgba(236,72,153,0.7)", description: "A beautiful bouquet of fresh flowers" },
  { type: "Teddy", price: 20000, icon: "🧸", color: "from-yellow-300 to-yellow-400", bg: "bg-yellow-50", glow: "rgba(250,204,21,0.7)", description: "A cuddly teddy bear to keep them company" },
  { type: "Champagne", price: 100000, icon: "🍾", color: "from-amber-300 to-amber-400", bg: "bg-amber-50", glow: "rgba(245,158,11,0.7)", description: "Premium champagne for celebration" },
  { type: "Heart", price: 250000, icon: "❤️", color: "from-red-300 to-red-400", bg: "bg-red-50", glow: "rgba(220,38,38,0.7)", description: "A heartfelt gift of pure love" },
  { type: "Ring", price: 400000, icon: "💍", color: "from-blue-300 to-blue-400", bg: "bg-blue-50", glow: "rgba(59,130,246,0.7)", description: "A stunning ring symbolizing commitment" },
  { type: "Crown", price: 500000, icon: "👑", color: "from-purple-300 to-purple-400", bg: "bg-purple-50", glow: "rgba(168,85,247,0.7)", description: "Make them feel like royalty" },
  { type: "Gold", price: 700000, icon: "🪙", color: "from-orange-300 to-orange-400", bg: "bg-orange-50", glow: "rgba(249,115,22,0.7)", description: "Luxurious gold gift" },
  { type: "Love", price: 1000000, icon: "💝", color: "from-rose-300 to-rose-400", bg: "bg-rose-50", glow: "rgba(244,63,94,0.7)", description: "The ultimate expression of love" },
  { type: "Rose", price: 8000, icon: "🌹", color: "from-red-400 to-red-500", bg: "bg-red-50", glow: "rgba(239,68,68,0.7)", description: "A single red rose to melt their heart" },
  { type: "Chocolate", price: 15000, icon: "🍫", color: "from-amber-400 to-amber-500", bg: "bg-amber-50", glow: "rgba(217,119,6,0.7)", description: "Sweet chocolates to sweeten their day" },
  { type: "Diamond", price: 600000, icon: "💎", color: "from-cyan-300 to-cyan-400", bg: "bg-cyan-50", glow: "rgba(6,182,212,0.7)", description: "A sparkling diamond for the one who shines" },
  { type: "Ferrari", price: 800000, icon: "🏎️", color: "from-red-300 to-red-400", bg: "bg-red-50", glow: "rgba(185,28,28,0.7)", description: "A dream car for a dream person" },
  { type: "Yacht", price: 1200000, icon: "🛥️", color: "from-blue-300 to-blue-400", bg: "bg-blue-50", glow: "rgba(37,99,235,0.7)", description: "Sail away on a luxury yacht" },
  { type: "Castle", price: 1500000, icon: "🏰", color: "from-purple-300 to-purple-400", bg: "bg-purple-50", glow: "rgba(126,34,206,0.7)", description: "A castle to rule their heart" },
  { type: "Rocket", price: 2000000, icon: "🚀", color: "from-indigo-300 to-indigo-400", bg: "bg-indigo-50", glow: "rgba(79,70,229,0.7)", description: "Send their love to the stars" },
  { type: "Universe", price: 3000000, icon: "🌌", color: "from-fuchsia-300 to-fuchsia-400", bg: "bg-fuchsia-50", glow: "rgba(192,38,211,0.7)", description: "Give them the entire universe" },
];

const FLOATING_ICONS = ["❤️", "💖", "💘", "💝", "💕", "🌹", "💎", "👑", "🎁", "✨"];

const formatPrice = (price) => {
  if (price >= 1000000) return `₦${(price / 1000000).toFixed(0)}M`;
  if (price >= 1000) return `₦${(price / 1000).toFixed(0)}k`;
  return `₦${price}`;
};

// Floating background hearts
function FloatingHearts() {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const items = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      icon: FLOATING_ICONS[Math.floor(Math.random() * FLOATING_ICONS.length)],
      left: Math.random() * 100,
      size: 12 + Math.random() * 22,
      delay: Math.random() * 8,
      duration: 9 + Math.random() * 10,
      drift: (Math.random() - 0.5) * 80,
    }));
    setHearts(items);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          initial={{ y: "110%", opacity: 0 }}
          animate={{
            y: "-20%",
            x: [0, h.drift, 0],
            opacity: [0, 0.8, 0.8, 0],
            rotate: [0, 20, -20, 0],
          }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute"
          style={{ left: `${h.left}%`, fontSize: h.size }}
        >
          {h.icon}
        </motion.div>
      ))}
    </div>
  );
}

// Red bubble burst particles
function BubbleBursts() {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    const items = Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      bottom: Math.random() * 100,
      size: 30 + Math.random() * 90,
      delay: Math.random() * 6,
      duration: 5 + Math.random() * 6,
    }));
    setBubbles(items);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: [0, 1, 1.4], opacity: [0.6, 0.25, 0] }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute rounded-full"
          style={{
            left: `${b.left}%`,
            bottom: `${b.bottom}%`,
            width: b.size,
            height: b.size,
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,80,80,0.55), rgba(220,38,38,0.15) 60%, transparent 70%)",
            filter: "blur(1px)",
          }}
        />
      ))}
    </div>
  );
}

export default function GiftSection({ candidate }) {
  const [selectedGift, setSelectedGift] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [showZeroBalanceModal, setShowZeroBalanceModal] = useState(false);
  const [showFundWalletModal, setShowFundWalletModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [suggestedGift, setSuggestedGift] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [burstGift, setBurstGift] = useState(null);
  const router = useRouter();

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
          setUserBalance(wallet.balance);
        }
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const findAffordableGifts = (balance, currentGiftPrice) => {
    return GIFTS.filter(g => g.price <= balance && g.price < currentGiftPrice)
      .sort((a, b) => b.price - a.price);
  };

  const refreshBalance = async () => {
    if (user) {
      const { data: wallet, error } = await supabase
        .from("wallets").select("balance").eq("user_id", user.id).single();
      if (!error && wallet) {
        setUserBalance(wallet.balance);
        return wallet.balance;
      }
    }
    return 0;
  };

  const triggerBurst = (gift) => {
    setBurstGift(gift);
    setTimeout(() => setBurstGift(null), 900);
  };

  const handleGiftClick = async (gift) => {
    triggerBurst(gift);

    if (!user) {
      setSelectedGift(gift);
      setShowLoginModal(true);
      return;
    }

    const currentBalance = await refreshBalance();

    if (currentBalance === 0) {
      setSelectedGift(gift);
      setShowZeroBalanceModal(true);
      return;
    }

    if (currentBalance < gift.price) {
      setSelectedGift(gift);
      const affordable = findAffordableGifts(currentBalance, gift.price);
      setSuggestedGift(affordable[0] || null);
      setShowInsufficientModal(true);
      return;
    }

    setSelectedGift(gift);
    setShowConfirmModal(true);
  };

  const handleGift = async () => {
    if (!selectedGift || !user) return;

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
      } else if (newBalance > 0) {
        const affordable = findAffordableGifts(newBalance, selectedGift.price);
        setSuggestedGift(affordable[0] || null);
        setShowInsufficientModal(true);
      } else {
        setShowZeroBalanceModal(true);
      }
    }
  };

  if (loading) {
    return (
      <section className="py-10 px-4 bg-black">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse text-red-400">Loading gifting portal...</div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative py-8 px-4 bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden">
        {/* Floating love icons */}
        <FloatingHearts />
        {/* Red bubble bursts */}
        <BubbleBursts />

        {/* Neon glow accents */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-1">
              Send a Gift to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-400 to-fuchsia-400 animate-pulse">
                {candidate?.name}
              </span>
            </h2>
            <p className="text-sm text-red-200/70">Unlock love, climb the ranks, and make them feel legendary 💥</p>

            {user && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 inline-flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-red-500/40 shadow-lg shadow-red-900/40"
              >
                <span className="text-xs text-red-200">💰 Wallet:</span>
                <span className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400">
                  {formatPrice(userBalance)}
                </span>
                <span className="text-[10px] text-red-200/60">available</span>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
            {GIFTS.map((gift, index) => (
              <motion.button
                key={gift.type}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.02, type: "spring", stiffness: 150 }}
                whileHover={{ scale: 1.08, y: -4 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleGiftClick(gift)}
                className="group relative"
              >
                {/* Animated outer glow */}
                <motion.div
                  animate={{
                    boxShadow: [
                      `0 0 0px ${gift.glow}`,
                      `0 0 18px ${gift.glow}`,
                      `0 0 0px ${gift.glow}`,
                    ],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.1 }}
                  className="absolute inset-0 rounded-xl"
                />

                <div className="relative rounded-xl p-2 text-center border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] backdrop-blur-md shadow-lg overflow-hidden">
                  {/* Shimmer sweep */}
                  <motion.div
                    animate={{ x: ["-120%", "120%"] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.15 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
                  />

                  <motion.div
                    animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.12, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.08 }}
                    className="text-2xl md:text-3xl mb-1 drop-shadow-[0_0_8px_rgba(255,80,80,0.6)]"
                  >
                    {gift.icon}
                  </motion.div>
                  <h3 className="font-bold text-[10px] text-white/90 mb-1 truncate">{gift.type}</h3>
                  <div className="rounded-md py-0.5 px-0.5 bg-red-600/30 border border-red-500/40">
                    <span className="text-[9px] font-extrabold text-red-100">
                      {formatPrice(gift.price)}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <p className="text-center text-[10px] text-red-200/50 mt-5">
            Tap a gift to send love instantly ⚡ More gifts = more love unlocked 🚀
          </p>
        </div>

        {/* Localized gift burst when clicked */}
        <AnimatePresence>
          {burstGift && (
            <motion.div
              key={burstGift.type + Date.now()}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
            >
              {Array.from({ length: 14 }).map((_, i) => {
                const angle = (i / 14) * Math.PI * 2;
                const dist = 80 + Math.random() * 120;
                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                    animate={{
                      x: Math.cos(angle) * dist,
                      y: Math.sin(angle) * dist,
                      opacity: 0,
                      scale: 1.4,
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute text-2xl"
                  >
                    {burstGift.icon}
                  </motion.div>
                );
              })}
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 6, opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute w-24 h-24 rounded-full border-4 border-red-500"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <FundWalletModal
        isOpen={showFundWalletModal}
        onClose={() => setShowFundWalletModal(false)}
        onSuccess={handleFundWalletSuccess}
      />

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && selectedGift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-zinc-900 border border-red-500/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-red-900/40"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="w-20 h-20 bg-gradient-to-br from-red-500/30 to-fuchsia-500/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border border-red-500/50"
                >
                  🔐
                </motion.div>
                <h3 className="text-xl font-extrabold text-white mb-2">Login Required</h3>
                <p className="text-sm text-red-100/80 mb-4">
                  Login or sign up to send a{" "}
                  <span className="font-bold text-red-400">{selectedGift.type}</span> to{" "}
                  <span className="font-bold text-red-400">{candidate?.name}</span>!
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white py-2.5 rounded-lg text-sm font-bold hover:from-green-500 hover:to-emerald-600 transition-all shadow-lg shadow-red-900/40"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push("/auth/signup")}
                    className="flex-1 bg-zinc-800 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600 transition-all"
                  >
                    Sign Up
                  </button>
                </div>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="mt-3 text-xs text-red-200/60 hover:text-red-300"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zero Balance Modal */}
      <AnimatePresence>
        {showZeroBalanceModal && selectedGift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowZeroBalanceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-zinc-900 border border-red-500/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-red-900/40"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 bg-gradient-to-br from-amber-500/30 to-red-500/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border border-red-500/50"
                >
                  💝
                </motion.div>
                <h3 className="text-xl font-extrabold text-white mb-2">Wallet Empty! 💔</h3>
                <p className="text-sm text-red-100/80 mb-3">
                  Your wallet is ₦0. Fund it to send a{" "}
                  <span className="font-bold text-red-400">{selectedGift.type}</span> to{" "}
                  <span className="font-bold text-red-400">{candidate?.name}</span>.
                </p>
                <div className="bg-gradient-to-r from-red-600/20 to-fuchsia-600/20 border border-red-500/30 rounded-lg p-3 mb-4">
                  <p className="text-xs text-red-100/80">
                    💡 Fund your wallet now and make your favorite housemate feel legendary!
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleFundWallet}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-lg text-sm font-bold hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg shadow-green-900/40"
                  >
                    💰 Fund Wallet
                  </button>
                  <button
                    onClick={() => setShowZeroBalanceModal(false)}
                    className="flex-1 bg-zinc-800 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-700 transition-all"
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowInsufficientModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-zinc-900 border border-red-500/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-red-900/40"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500/30 to-red-500/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border border-red-500/50">
                  😢
                </div>
                <h3 className="text-xl font-extrabold text-white mb-2">Insufficient Balance!</h3>
                <p className="text-sm text-red-100/80 mb-3">
                  Your balance is{" "}
                  <span className="font-extrabold text-white">{formatPrice(userBalance)}</span>, but{" "}
                  <span className="font-bold text-red-400">{selectedGift.type}</span> costs{" "}
                  <span className="font-extrabold text-red-400">{formatPrice(selectedGift.price)}</span>.
                </p>

                {suggestedGift ? (
                  <>
                    <div className="bg-gradient-to-r from-amber-600/20 to-yellow-600/10 border border-amber-500/30 rounded-lg p-3 mb-3 text-left">
                      <p className="text-xs text-amber-200/90 mb-1">💡 Sweet idea:</p>
                      <p className="text-sm text-white/90">
                        Why not send a{" "}
                        <span className="font-bold text-red-400">
                          {suggestedGift.icon} {suggestedGift.type}
                        </span>{" "}
                        instead for just{" "}
                        <span className="font-bold text-green-400">{formatPrice(suggestedGift.price)}</span>?
                      </p>
                    </div>
                    <button
                      onClick={handleSuggestedGift}
                      className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white py-2.5 rounded-lg text-sm font-bold hover:from-green-500 hover:to-emerald-600 transition-all shadow-lg shadow-red-900/40 mb-2"
                    >
                      Send {suggestedGift.type} instead 💝
                    </button>
                  </>
                ) : (
                  <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/10 border border-blue-500/30 rounded-lg p-3 mb-3">
                    <p className="text-xs text-blue-100/90 text-center">
                      💡 Fund your wallet to send this amazing gift!
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {!suggestedGift && (
                    <button
                      onClick={handleFundWallet}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2.5 rounded-lg text-sm font-bold hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg shadow-green-900/40"
                    >
                      💰 Fund Wallet
                    </button>
                  )}
                  <button
                    onClick={() => setShowInsufficientModal(false)}
                    className={`${suggestedGift ? "w-full" : "flex-1"} bg-zinc-800 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-700 transition-all`}
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-zinc-900 border border-red-500/40 rounded-2xl p-5 max-w-sm w-full shadow-2xl shadow-red-900/40"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-extrabold text-white mb-3 text-center">
                Send {selectedGift.type} to {candidate?.name}
              </h3>

              <div className="rounded-xl p-4 mb-4 text-center bg-gradient-to-br from-red-600/20 to-fuchsia-600/10 border border-red-500/30">
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-5xl mb-2 drop-shadow-[0_0_12px_rgba(255,80,80,0.6)]"
                >
                  {selectedGift.icon}
                </motion.div>
                <h4 className="font-extrabold text-white mb-1">{selectedGift.type}</h4>
                <p className="text-xs text-red-100/70 mb-2">{selectedGift.description}</p>
                <p className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-fuchsia-300">
                  {formatPrice(selectedGift.price)}
                </p>
              </div>

              <p className="text-sm text-red-100/70 mb-4 text-center">
                Balance: <span className="font-extrabold text-green-400">{formatPrice(userBalance)}</span>
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleGift}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white py-2.5 rounded-lg text-sm font-bold hover:from-green-500 hover:to-emerald-600 transition-all disabled:opacity-50 shadow-lg shadow-red-900/40"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-1">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : "Send Gift 💝"}
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isProcessing}
                  className="flex-1 bg-zinc-800 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-700 transition-all"
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowThankYou(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-zinc-900 border border-red-500/40 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-red-900/40 text-center"
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-green-500/30 to-emerald-500/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border border-green-500/40"
              >
                🎁💝
              </motion.div>
              <h3 className="text-xl font-extrabold text-white mb-2">Gift Sent! 🎉</h3>
              <p className="text-sm text-red-100/80 mb-2">
                Your{" "}
                <span className="font-bold text-red-400">
                  {selectedGift?.icon} {selectedGift?.type}
                </span>{" "}
                has been sent to{" "}
                <span className="font-bold text-red-400">{candidate?.name}</span>!
              </p>
              <p className="text-xs text-red-200/60 mb-4">You just leveled up their love meter 💥</p>
              <button
                onClick={() => setShowThankYou(false)}
                className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white py-2.5 rounded-lg text-sm font-bold hover:from-green-500 hover:to-emerald-600 transition-all shadow-lg shadow-red-900/40"
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