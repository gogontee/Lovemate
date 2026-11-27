import { useState, useEffect } from "react";
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

// Generate a simple reference ID (same style as VoteSection)
const generateReference = () => {
  return `GIFT_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`.toUpperCase();
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
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
          setWalletBalance(0);
        } else if (wallet) {
          setWalletBalance(wallet.balance);
        }
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const refreshBalance = async () => {
    if (user) {
      const { data: wallet, error } = await supabase
        .from("wallets").select("balance").eq("user_id", user.id).single();
      if (!error && wallet) {
        setWalletBalance(wallet.balance);
        return wallet.balance;
      }
    }
    return 0;
  };

  const triggerBurst = (gift) => {
    setBurstGift(gift);
    setTimeout(() => setBurstGift(null), 900);
  };

  // ─────────────────────────────────────────────
  // Transaction helpers (mirror VoteSection logic)
  // ─────────────────────────────────────────────
  const createPendingTransaction = async (paymentMethod, currency = "NGN") => {
    if (!selectedGift || !candidate) return null;

    const reference = generateReference();
    const transactionData = {
      user_id: user?.id || null,
      candidate_id: candidate.id,
      gift_type: selectedGift.type,
      amount: selectedGift.price,
      status: "pending",
      payment_method: paymentMethod,
      currency: currency,
      reference: reference,
      metadata: {
        gift_icon: selectedGift.icon,
        gift_description: selectedGift.description,
        candidate_name: candidate.name,
        timestamp: new Date().toISOString(),
        guest_email: !user ? "guest" : undefined,
      },
    };

    try {
      let data, error;
      if (user) {
        // Auth – direct Supabase insert
        const response = await supabase
          .from("gift_transactions")
          .insert(transactionData)
          .select()
          .single();
        data = response.data;
        error = response.error;
      } else {
        // Guest – API route bypasses RLS
        const response = await fetch('/api/gift-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionData),
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || 'API insert failed');
        data = json[0];
        error = null;
      }

      if (error) throw error;
      return { transaction: data, reference };
    } catch (error) {
      console.error("Error creating gift transaction:", error);
      return null;
    }
  };

  const completeTransaction = async (reference, paymentDetails) => {
    try {
      if (user) {
        const { error } = await supabase
          .from("gift_transactions")
          .update({
            status: "completed",
            metadata: { ...paymentDetails, completed_at: new Date().toISOString() },
          })
          .eq("reference", reference);
        if (error) throw error;
      } else {
        const response = await fetch('/api/gift-transaction', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference,
            updates: {
              status: "completed",
              metadata: { ...paymentDetails, completed_at: new Date().toISOString() },
            },
          }),
        });
        if (!response.ok) {
          const json = await response.json();
          throw new Error(json.error);
        }
      }
    } catch (error) {
      console.error("Error completing gift transaction:", error);
      throw error;
    }
  };

  const failTransaction = async (reference, reason = "user_cancelled") => {
    try {
      if (user) {
        await supabase
          .from("gift_transactions")
          .update({
            status: "failed",
            metadata: { cancelled_at: new Date().toISOString(), reason },
          })
          .eq("reference", reference);
      } else {
        await fetch('/api/gift-transaction', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference,
            updates: {
              status: "failed",
              metadata: { cancelled_at: new Date().toISOString(), reason },
            },
          }),
        });
      }
    } catch (err) {
      console.error("Error failing gift transaction:", err);
    }
  };

  // ─────────────────────────────────────────────
  // Pay with Wallet (auth only – guests have no wallet)
  // ─────────────────────────────────────────────
  const handleWalletGift = async () => {
    if (!selectedGift || !user) return;
    setIsProcessing(true);
    try {
      const currentBalance = await refreshBalance();
      if (currentBalance < selectedGift.price) {
        alert(
          `Insufficient balance. You have ${formatPrice(currentBalance)} but need ${formatPrice(
            selectedGift.price
          )}`
        );
        setIsProcessing(false);
        return;
      }

      const result = await createPendingTransaction("wallet", "NGN");
      if (!result) throw new Error("Failed to create transaction");
      const { transaction, reference } = result;

      // Use the existing send_gift RPC (auth users only)
      const { error } = await supabase.rpc("send_gift", {
        p_user_id: user.id,
        p_candidate_id: candidate.id,
        p_gift_type: selectedGift.type,
      });

      if (error) {
        await failTransaction(reference, "rpc_failed");
        throw error;
      }

      await completeTransaction(reference, {
        wallet_deduction: true,
        balance_after: currentBalance - selectedGift.price,
        transaction_id: transaction.id,
      });

      await refreshBalance();
      setIsProcessing(false);
      setShowPaymentModal(false);
      setShowThankYou(true);
    } catch (error) {
      console.error("Wallet gift error:", error);
      alert(error.message || "Gift failed. Try again.");
      setIsProcessing(false);
    }
  };

  // ─────────────────────────────────────────────
  // Pay with Paystack (works for guests + auth)
  // ─────────────────────────────────────────────
  const handlePaystackGift = async () => {
    if (!selectedGift) return;
    setIsProcessing(true);
    try {
      const result = await createPendingTransaction("paystack", "NGN");
      if (!result) throw new Error("Failed to create transaction");
      const { transaction, reference } = result;

      if (!window.PaystackPop) {
        throw new Error("Paystack not loaded. Please refresh the page.");
      }

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user?.email || "guest@example.com",
        amount: selectedGift.price * 100, // kobo
        currency: "NGN",
        ref: reference,
        metadata: {
          transaction_id: transaction.id,
          candidate_id: candidate.id,
          candidate_name: candidate.name,
          gift_type: selectedGift.type,
          user_id: user?.id || "guest",
        },
        callback: function (response) {
          completeTransaction(response.reference, {
            paystack_ref: response.trxref,
            status: "success",
            transaction_id: transaction.id,
          })
            .then(() => {
              setIsProcessing(false);
              setShowPaymentModal(false);
              setShowThankYou(true);
            })
            .catch((error) => {
              console.error("Error completing transaction:", error);
              alert(
                "Payment successful but failed to record. Please contact support with reference: " +
                  response.reference
              );
              setIsProcessing(false);
            });
        },
        onClose: function () {
          failTransaction(reference, "user_cancelled").finally(() => setIsProcessing(false));
        },
      });
      handler.openIframe();
    } catch (error) {
      console.error("Paystack error:", error);
      alert(error.message || "Payment initialization failed. Please try again.");
      setIsProcessing(false);
    }
  };

  // ─────────────────────────────────────────────
  // Pay with PayPal (works for guests + auth)
  // ─────────────────────────────────────────────
  const handlePayPalGift = async () => {
    if (!selectedGift) return;
    setIsProcessing(true);
    try {
      if (!window.paypal) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      // Convert to USD (same 1500 ratio as vote flow)
      const priceUsd = Math.max(1, Math.round(selectedGift.price / 1500));

      const result = await createPendingTransaction("paypal", "USD");
      if (!result) throw new Error("Failed to create transaction");
      const { transaction, reference } = result;

      const response = await fetch('/api/create-paypal-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: priceUsd,
          currency: 'USD',
          reference: reference,
          transaction_id: transaction.id,
          candidate_id: candidate.id,
          candidate_name: candidate.name,
          gift_type: selectedGift.type,
          user_id: user?.id || 'guest',
        }),
      });

      if (!response.ok) throw new Error('Failed to create PayPal order');
      const order = await response.json();

      if (order.id) {
        const container = document.getElementById('paypal-button-container');
        if (container) container.innerHTML = '';
        window.paypal.Buttons({
          createOrder: () => order.id,
          onApprove: (data) => {
            fetch('/api/capture-paypal-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderID: data.orderID, reference }),
            })
              .then(res => res.json())
              .then(captureData => {
                if (captureData.status === 'COMPLETED') {
                  return completeTransaction(reference, {
                    paypal_order_id: data.orderID,
                    paypal_capture_id: captureData.purchase_units[0].payments.captures[0].id,
                    status: 'completed',
                    transaction_id: transaction.id,
                  });
                }
              })
              .then(() => {
                setIsProcessing(false);
                setShowPaymentModal(false);
                setShowThankYou(true);
              })
              .catch(error => {
                console.error("Error capturing PayPal payment:", error);
                alert("Payment successful but failed to record. Please contact support.");
                setIsProcessing(false);
              });
          },
          onCancel: () => {
            failTransaction(reference, 'user_cancelled').finally(() => setIsProcessing(false));
          },
          onError: (err) => {
            console.error("PayPal error:", err);
            alert("PayPal payment failed. Please try again.");
            setIsProcessing(false);
          },
        }).render('#paypal-button-container');
      } else {
        throw new Error("Failed to create PayPal order");
      }
    } catch (error) {
      console.error("PayPal error:", error);
      alert(error.message || "Payment initialization failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleGiftClick = (gift) => {
    triggerBurst(gift);
    setSelectedGift(gift);
    setShowPaymentModal(true);
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
        <FloatingHearts />
        <BubbleBursts />

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
                  {formatPrice(walletBalance)}
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

      {/* Payment Method Modal (works for guest + auth) */}
      <AnimatePresence>
        {showPaymentModal && selectedGift && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={() => !isProcessing && setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-zinc-900 border border-red-500/40 rounded-2xl p-5 max-w-sm w-full shadow-2xl shadow-red-900/40 max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
              style={{ maxHeight: '85vh', overflowY: 'auto' }}
            >
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-14 h-14 bg-gradient-to-br from-red-600/30 to-fuchsia-600/20 rounded-full flex items-center justify-center text-2xl border border-red-500/50"
                >
                  {selectedGift.icon}
                </motion.div>
              </div>

              <h3 className="text-lg font-extrabold text-white mb-1 text-center">
                Choose Payment Method
              </h3>
              <p className="text-xs text-red-200/70 mb-4 text-center">
                {selectedGift.type} •{" "}
                <span className="font-bold text-red-400">{formatPrice(selectedGift.price)}</span>
              </p>

              <div className="space-y-2 mb-4">
                {/* Wallet – only for logged-in users */}
                {user && (
                  <button
                    onClick={handleWalletGift}
                    disabled={isProcessing || walletBalance < selectedGift.price}
                    className="w-full bg-zinc-800/70 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-xl border border-red-500/30 flex items-center gap-3 transition-all"
                  >
                    <span className="text-xl">💳</span>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold text-white">Pay with Wallet</div>
                      <div className="text-xs text-red-200/60">
                        Balance: {formatPrice(walletBalance)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-green-300">
                        {formatPrice(selectedGift.price)}
                      </div>
                      {walletBalance < selectedGift.price && (
                        <div className="text-[10px] text-red-400">Insufficient</div>
                      )}
                    </div>
                  </button>
                )}

                {/* Paystack */}
                <button
                  onClick={handlePaystackGift}
                  disabled={isProcessing}
                  className="w-full bg-zinc-800/70 hover:bg-zinc-800 disabled:opacity-50 p-3 rounded-xl border border-red-500/30 flex items-center gap-3 transition-all"
                >
                  <span className="text-xl">🇳🇬</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-white">Pay with Paystack</div>
                    <div className="text-xs text-red-200/60">Visa, Mastercard, Bank Transfer</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-white">
                      {formatPrice(selectedGift.price)}
                    </div>
                    <div className="text-[10px] text-red-200/50">NGN</div>
                  </div>
                </button>

                {/* PayPal */}
                <button
                  onClick={handlePayPalGift}
                  disabled={isProcessing}
                  className="w-full bg-zinc-800/70 hover:bg-zinc-800 disabled:opacity-50 p-3 rounded-xl border border-red-500/30 flex items-center gap-3 transition-all"
                >
                  <span className="text-xl">🇺🇸</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-white">Pay with PayPal</div>
                    <div className="text-xs text-red-200/60">International cards, PayPal balance</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-white">
                      ${Math.max(1, Math.round(selectedGift.price / 1500))}
                    </div>
                    <div className="text-[10px] text-red-200/50">USD</div>
                  </div>
                </button>
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-red-300 text-xs mb-3">
                  <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              )}

              <button
                onClick={() => setShowPaymentModal(false)}
                disabled={isProcessing}
                className="w-full bg-zinc-800 text-white py-2 rounded-xl text-sm font-semibold hover:bg-zinc-700 transition-all border border-red-500/20 mb-3 disabled:opacity-50"
              >
                Cancel
              </button>

              <div id="paypal-button-container" className="mt-2 pt-2 border-t border-red-500/20"></div>
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