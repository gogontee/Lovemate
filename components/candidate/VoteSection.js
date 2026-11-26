import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

// Format points (1 pt = 1 NGN) – never show ₦ in the UI
const formatPoints = (points) => {
  if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M pts`;
  if (points >= 1000) return `${(points / 1000).toFixed(0)}k pts`;
  return `${points} pts`;
};

// Generate a simple reference ID
const generateReference = () => {
  return `VOTE_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`.toUpperCase();
};

const PaymentIcons = {
  wallet: "💳",
  paystack: "🇳🇬",
  paypal: "🇺🇸",
};

// ─────────────────────────────────────────────
// Ambient FX: orbital particles + energy beams
// (deliberately different style from gifts)
// ─────────────────────────────────────────────
function OrbitalParticles() {
  const [particles, setParticles] = useState([]);
  const [orbs, setOrbs] = useState([]);

  useEffect(() => {
    const p = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      radius: 120 + Math.random() * 260,
      size: 1 + Math.random() * 3,
      speed: 8 + Math.random() * 10,
      delay: Math.random() * 8,
      color: Math.random() > 0.5 ? "rgba(255,80,80,0.55)" : "rgba(255,180,80,0.45)",
    }));
    setParticles(p);

    const o = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 80 + Math.random() * 160,
      delay: Math.random() * 4,
      duration: 6 + Math.random() * 6,
    }));
    setOrbs(o);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* big soft energy orbs – much dimmer */}
      {orbs.map((o) => (
        <motion.div
          key={`orb-${o.id}`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.18, 0.06, 0.18, 0],
            scale: [0.7, 1.15, 0.9, 1.05, 0.7],
          }}
          transition={{
            duration: o.duration,
            delay: o.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute rounded-full"
          style={{
            left: `${o.left}%`,
            top: `${o.top}%`,
            width: o.size,
            height: o.size,
            background:
              "radial-gradient(circle at 35% 35%, rgba(150,20,20,0.16), rgba(80,20,90,0.05) 50%, transparent 70%)",
            filter: "blur(10px)",
          }}
        />
      ))}

      {/* orbiting sparks */}
      {particles.map((p) => (
        <motion.div
          key={`p-${p.id}`}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{ rotate: [0, 360] }}
          transition={{
            duration: p.speed,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div style={{ transform: `translateX(${p.radius}px)` }} />
        </motion.div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Energy Beam dividers between cards
// ─────────────────────────────────────────────
function EnergyBeams() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ y: ["-20%", "120%"], opacity: [0, 0.25, 0] }}
          transition={{
            duration: 4 + i,
            delay: i * 0.9,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute w-px"
          style={{
            left: `${15 + i * 18}%`,
            height: "40%",
            background:
              "linear-gradient(to bottom, transparent, rgba(180,30,30,0.28), transparent)",
          }}
        />
      ))}
    </div>
  );
}

export default function VoteSection({ candidate }) {
  const [votePackages, setVotePackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showGiftPrompt, setShowGiftPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [cardBurst, setCardBurst] = useState(null);
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
        } else if (wallet) {
          setWalletBalance(wallet.balance);
        }
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchVotePackages = async () => {
      try {
        const { data, error } = await supabase
          .from("vote_packages")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (error) {
          console.error("Error fetching vote packages:", error);
          return;
        }

        if (data && data.length > 0) {
          const transformed = data.map((pkg) => ({
            id: pkg.id,
            points: pkg.votes,
            price_ngn: pkg.price,
            price_usd: pkg.price_usd || Math.round(pkg.price / 1500),
            label: pkg.name.includes("THOR")
              ? "THOR"
              : pkg.name.includes("WAR")
              ? "WAR"
              : pkg.name.includes("GOZZ")
              ? "GOZZ"
              : pkg.name.includes("CLOK")
              ? "CLOK"
              : pkg.votes.toString(),
            popular: pkg.is_popular || false,
            icon: pkg.icon || "🎯",
            packageName: pkg.display_name || pkg.name,
            discount: pkg.discount_percentage || 0,
            originalPrice: pkg.original_price || pkg.price,
          }));
          setVotePackages(transformed);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVotePackages();
  }, []);

  const triggerCardBurst = (pkg) => {
    setCardBurst(pkg);
    setTimeout(() => setCardBurst(null), 800);
  };

  const handlePackageSelect = (pkg) => {
    triggerCardBurst(pkg);
    setSelectedPackage(pkg);
    setShowPaymentModal(true);
  };

  const createPendingTransaction = async (paymentMethod, currency) => {
    if (!selectedPackage || !candidate) return null;

    const price = currency === "USD" ? selectedPackage.price_usd : selectedPackage.price_ngn;
    const pricePerVote = Math.round(price / selectedPackage.points);
    const reference = generateReference();

    const transactionData = {
      user_id: user?.id || null,
      candidate_id: candidate.id,
      package_name: selectedPackage.packageName,
      votes: selectedPackage.points,
      price_per_vote: pricePerVote,
      total_amount: price,
      discount_percentage: selectedPackage.discount || 0,
      original_amount:
        currency === "USD" ? selectedPackage.price_usd : selectedPackage.price_ngn,
      payment_method: paymentMethod,
      status: "pending",
      currency,
      reference,
      metadata: {
        package_label: selectedPackage.label,
        candidate_name: candidate.name,
        timestamp: new Date().toISOString(),
        guest_email: !user ? "guest" : undefined,
      },
    };

    try {
      let data, error;
      if (user) {
        const response = await supabase
          .from("vote_transactions")
          .insert(transactionData)
          .select()
          .single();
        data = response.data;
        error = response.error;
      } else {
        const response = await fetch("/api/vote-transaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transactionData),
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || "API insert failed");
        data = json[0];
        error = null;
      }
      if (error) throw error;
      return { transaction: data, reference };
    } catch (error) {
      console.error("Error creating transaction:", error);
      return null;
    }
  };

  const completeTransaction = async (reference, paymentDetails) => {
    try {
      if (user) {
        const { error } = await supabase
          .from("vote_transactions")
          .update({
            status: "completed",
            metadata: { ...paymentDetails, completed_at: new Date().toISOString() },
          })
          .eq("reference", reference);
        if (error) throw error;
      } else {
        const response = await fetch("/api/vote-transaction", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
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
      console.error("Error completing transaction:", error);
      throw error;
    }
  };

  const failTransaction = async (reference, reason = "user_cancelled") => {
    try {
      if (user) {
        await supabase
          .from("vote_transactions")
          .update({ status: "failed", metadata: { cancelled_at: new Date().toISOString(), reason } })
          .eq("reference", reference);
      } else {
        await fetch("/api/vote-transaction", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
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
      console.error("Error failing transaction:", err);
    }
  };

  const handleWalletVote = async () => {
    if (!selectedPackage || !user) return;
    setIsProcessing(true);
    try {
      if (walletBalance < selectedPackage.price_ngn) {
        alert(
          `Insufficient balance. You have ${formatPoints(walletBalance)} but need ${formatPoints(
            selectedPackage.price_ngn
          )}`
        );
        setIsProcessing(false);
        return;
      }

      const result = await createPendingTransaction("wallet", "NGN");
      if (!result) throw new Error("Failed to create transaction");
      const { transaction, reference } = result;

      const { error: deductError } = await supabase
        .from("wallets")
        .update({
          balance: walletBalance - selectedPackage.price_ngn,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      if (deductError) throw deductError;

      await completeTransaction(reference, {
        wallet_deduction: true,
        balance_after: walletBalance - selectedPackage.price_ngn,
        transaction_id: transaction.id,
      });

      setWalletBalance((prev) => prev - selectedPackage.price_ngn);
      setIsProcessing(false);
      setShowPaymentModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Vote error:", error);
      alert(error.message || "Vote failed. Try again.");
      setIsProcessing(false);
    }
  };

  const handlePaystackPayment = async () => {
    if (!selectedPackage) return;
    setIsProcessing(true);
    try {
      const result = await createPendingTransaction("paystack", "NGN");
      if (!result) throw new Error("Failed to create transaction");
      const { transaction, reference } = result;

      if (!window.PaystackPop) throw new Error("Paystack not loaded. Please refresh the page.");

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user?.email || "guest@example.com",
        amount: selectedPackage.price_ngn * 100,
        currency: "NGN",
        ref: reference,
        metadata: {
          transaction_id: transaction.id,
          candidate_id: candidate.id,
          candidate_name: candidate.name,
          package_name: selectedPackage.packageName,
          votes: selectedPackage.points,
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
              setShowSuccessModal(true);
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

  const handlePayPalPayment = async () => {
    if (!selectedPackage) return;
    setIsProcessing(true);
    try {
      if (!window.paypal) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const result = await createPendingTransaction("paypal", "USD");
      if (!result) throw new Error("Failed to create transaction");
      const { transaction, reference } = result;

      const response = await fetch("/api/create-paypal-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedPackage.price_usd,
          currency: "USD",
          reference,
          transaction_id: transaction.id,
          candidate_id: candidate.id,
          candidate_name: candidate.name,
          package_name: selectedPackage.packageName,
          votes: selectedPackage.points,
          user_id: user?.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to create PayPal order");
      const order = await response.json();

      if (order.id) {
        const container = document.getElementById("paypal-button-container");
        if (container) container.innerHTML = "";
        window.paypal
          .Buttons({
            createOrder: () => order.id,
            onApprove: (data) => {
              fetch("/api/capture-paypal-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: data.orderID, reference }),
              })
                .then((res) => res.json())
                .then((captureData) => {
                  if (captureData.status === "COMPLETED") {
                    return completeTransaction(reference, {
                      paypal_order_id: data.orderID,
                      paypal_capture_id: captureData.purchase_units[0].payments.captures[0].id,
                      status: "completed",
                      transaction_id: transaction.id,
                    });
                  }
                })
                .then(() => {
                  setIsProcessing(false);
                  setShowPaymentModal(false);
                  setShowSuccessModal(true);
                })
                .catch((error) => {
                  console.error("Error capturing PayPal payment:", error);
                  alert("Payment successful but failed to record. Please contact support.");
                  setIsProcessing(false);
                });
            },
            onCancel: () => {
              failTransaction(reference, "user_cancelled").finally(() => setIsProcessing(false));
            },
            onError: (err) => {
              console.error("PayPal error:", err);
              alert("PayPal payment failed. Please try again.");
              setIsProcessing(false);
            },
          })
          .render("#paypal-button-container");
      } else {
        throw new Error("Failed to create PayPal order");
      }
    } catch (error) {
      console.error("PayPal error:", error);
      alert(error.message || "Payment initialization failed. Please try again.");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <section className="py-8 px-4 bg-gradient-to-b from-black via-zinc-950 to-black">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse text-red-400">Loading vote portal...</div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative py-8 px-3 md:px-4 bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden">
        {/* Much darker, subtler nebula glows */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-red-900/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] bg-fuchsia-950/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute top-1/3 right-0 w-[400px] h-[400px] bg-purple-950/10 rounded-full blur-3xl" />

        <OrbitalParticles />
        <EnergyBeams />

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 16 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/40 border border-red-500/30 backdrop-blur-sm mb-3"
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-base"
              >
                ⚡
              </motion.span>
              <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.22em] text-red-300/90">
                Power Up Votes
              </span>
            </motion.div>

            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-1">
              Support{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-fuchsia-400 animate-pulse">
                {candidate?.name}
              </span>
            </h2>
            <p className="text-sm text-red-200/60">
              Stack points, break records, fuel the leaderboard 🚀
            </p>

            {user && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 inline-flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-red-500/30 shadow-lg shadow-black/40"
              >
                <span className="text-xs text-red-200/80">💳 Balance:</span>
                <span className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400">
                  {formatPoints(walletBalance)}
                </span>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-5 gap-1.5 md:gap-2">
            {votePackages.map((pkg, index) => (
              <motion.button
                key={pkg.id || index}
                initial={{ opacity: 0, y: 16, rotateX: -25 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: index * 0.04, type: "spring", stiffness: 160 }}
                whileHover={{ scale: 1.06, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePackageSelect(pkg)}
                className={`group relative rounded-lg md:rounded-xl text-center overflow-hidden border ${
                  pkg.popular
                    ? "border-red-500/50 bg-gradient-to-br from-red-950/40 to-black shadow-lg shadow-black/50"
                    : "border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-md"
                }`}
              >
                <motion.div
                  animate={{
                    boxShadow: pkg.popular
                      ? [
                          "0 0 0px rgba(220,38,38,0)",
                          "0 0 18px rgba(220,38,38,0.35)",
                          "0 0 0px rgba(220,38,38,0)",
                        ]
                      : [
                          "0 0 0px rgba(147,51,234,0)",
                          "0 0 10px rgba(147,51,234,0.2)",
                          "0 0 0px rgba(147,51,234,0)",
                        ],
                  }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.12,
                  }}
                  className="absolute inset-0 rounded-lg md:rounded-xl"
                />

                <motion.div
                  animate={{ y: ["-10%", "110%"], opacity: [0, 0.4, 0] }}
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: index * 0.2,
                  }}
                  className="absolute left-0 right-0 h-8 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent, rgba(180,30,30,0.18), transparent)",
                  }}
                />

                {pkg.discount > 0 && (
                  <span className="absolute top-1 left-1 md:top-1.5 md:left-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[8px] md:text-[9px] px-1.5 py-0.5 rounded-full font-extrabold shadow-md z-10">
                    -{pkg.discount}%
                  </span>
                )}
                {pkg.popular && (
                  <motion.span
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="absolute top-1 right-1 md:top-1.5 md:right-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[8px] md:text-[9px] px-1.5 py-0.5 rounded-full font-extrabold shadow-md z-10"
                  >
                    ★
                  </motion.span>
                )}

                <div className="relative p-1.5 md:p-3">
                  <div className="relative mx-auto w-7 h-7 md:w-9 md:h-9 mb-1">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border border-red-500/30"
                      style={{ borderStyle: "dashed" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-base md:text-xl drop-shadow-[0_0_6px_rgba(220,38,38,0.6)]">
                      {pkg.icon}
                    </div>
                  </div>

                  <div className="font-extrabold text-[10px] md:text-sm text-white mb-0.5 truncate">
                    {pkg.label}
                  </div>

                  <div className="text-sm md:text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-fuchsia-300 leading-none">
                    {pkg.points < 1000
                      ? `${pkg.points} pts`
                      : `${(pkg.points / 1000).toFixed(0)}k pts`}
                  </div>

                  <div className="text-[8px] md:text-[9px] text-red-200/50 mb-1">
                    points
                  </div>

                  <div className="rounded-md py-0.5 md:py-1 px-0.5 bg-red-950/50 border border-red-500/30">
                    {pkg.discount > 0 ? (
                      <div className="flex flex-col items-center leading-tight">
                        <span className="text-[7px] md:text-[8px] line-through text-red-200/30">
                          {formatPoints(pkg.originalPrice)}
                        </span>
                        <span className="text-[9px] md:text-[11px] font-extrabold text-green-300">
                          {formatPoints(pkg.price_ngn)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] md:text-[11px] font-extrabold text-white">
                        {formatPoints(pkg.price_ngn)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <p className="text-center text-[10px] md:text-xs text-red-200/40 mt-4">
            ⚡ Every point = 1 naira · Premium packs unlock bonus points & discounts
          </p>
        </div>

        <AnimatePresence>
          {cardBurst && (
            <motion.div
              key={cardBurst.id + Date.now()}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
            >
              {Array.from({ length: 18 }).map((_, i) => {
                const angle = (i / 18) * Math.PI * 2;
                const dist = 90 + Math.random() * 140;
                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.3 }}
                    animate={{
                      x: Math.cos(angle) * dist,
                      y: Math.sin(angle) * dist,
                      opacity: 0,
                      scale: 1.2,
                    }}
                    transition={{ duration: 0.75, ease: "easeOut" }}
                    className="absolute w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(220,38,38,0.8)]"
                  />
                );
              })}
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 5, opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute w-24 h-24 rounded-full border-2 border-red-500/60"
              />
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 3.5, opacity: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="absolute w-24 h-24 rounded-full border border-fuchsia-400/50"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Payment Method Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedPackage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={() => setShowPaymentModal(false)}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-zinc-900 rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-red-500/40 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: "85vh", overflowY: "auto" }}
            >
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-14 h-14 bg-gradient-to-br from-red-600/30 to-fuchsia-600/20 rounded-full flex items-center justify-center text-2xl border border-red-500/50"
                >
                  {selectedPackage.icon}
                </motion.div>
              </div>

              <h3 className="text-lg font-extrabold text-white mb-1 text-center">
                Choose Payment Method
              </h3>

              <p className="text-xs text-red-200/70 mb-4 text-center">
                {selectedPackage.packageName} •{" "}
                <span className="font-bold text-red-400">
                  {selectedPackage.points.toLocaleString()} pts
                </span>
              </p>

              <div className="space-y-2 mb-4">
                {user && (
                  <button
                    onClick={handleWalletVote}
                    disabled={walletBalance < selectedPackage.price_ngn}
                    className="w-full bg-zinc-800/70 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-xl border border-red-500/30 flex items-center gap-3 transition-all group"
                  >
                    <span className="text-xl">{PaymentIcons.wallet}</span>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold text-white">Pay with Wallet</div>
                      <div className="text-xs text-red-200/60">
                        Balance: {formatPoints(walletBalance)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-green-300">
                        {formatPoints(selectedPackage.price_ngn)}
                      </div>
                      {walletBalance < selectedPackage.price_ngn && (
                        <div className="text-[10px] text-red-400">Insufficient</div>
                      )}
                    </div>
                  </button>
                )}

                <button
                  onClick={handlePaystackPayment}
                  className="w-full bg-zinc-800/70 hover:bg-zinc-800 p-3 rounded-xl border border-red-500/30 flex items-center gap-3 transition-all group"
                >
                  <span className="text-xl">{PaymentIcons.paystack}</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-white">Pay with Paystack</div>
                    <div className="text-xs text-red-200/60">Visa, Mastercard, Bank Transfer</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-white">
                      {formatPoints(selectedPackage.price_ngn)}
                    </div>
                    <div className="text-[10px] text-red-200/50">NGN → Points</div>
                  </div>
                </button>

                <button
                  onClick={handlePayPalPayment}
                  className="w-full bg-zinc-800/70 hover:bg-zinc-800 p-3 rounded-xl border border-red-500/30 flex items-center gap-3 transition-all group"
                >
                  <span className="text-xl">{PaymentIcons.paypal}</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-white">Pay with PayPal</div>
                    <div className="text-xs text-red-200/60">International cards, PayPal balance</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-white">
                      ${selectedPackage.price_usd}
                    </div>
                    <div className="text-[10px] text-red-200/50">USD</div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full bg-zinc-800 text-white py-2 rounded-xl text-sm font-semibold hover:bg-zinc-700 transition-all border border-red-500/20 mb-3"
              >
                Cancel
              </button>

              <div id="paypal-button-container" className="mt-2 pt-2 border-t border-red-500/20"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={() => setShowSuccessModal(false)}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-zinc-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center border border-red-500/40"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
                className="w-16 h-16 bg-gradient-to-br from-green-500/30 to-emerald-500/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 border border-green-500/40"
              >
                🎉
              </motion.div>
              <h3 className="text-xl font-extrabold text-white mb-1">Votes Sent!</h3>
              <p className="text-sm text-red-100/80 mb-4">
                Thank you for supporting{" "}
                <span className="font-bold text-red-400">{candidate.name}</span>!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white py-3 rounded-xl text-sm font-bold hover:from-green-500 hover:to-emerald-600 transition-all shadow-lg shadow-red-900/40"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gift Prompt Modal */}
      <AnimatePresence>
        {showGiftPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={() => setShowGiftPrompt(false)}
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-zinc-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center border border-red-500/40"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-gradient-to-br from-red-600/30 to-fuchsia-600/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 border border-red-500/50"
              >
                🎁
              </motion.div>
              <h3 className="text-xl font-extrabold text-white mb-1">Send a Gift?</h3>
              <p className="text-sm text-red-100/80 mb-4">
                Show extra support to{" "}
                <span className="font-bold text-red-400">{candidate.name}</span> with a special gift
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowGiftPrompt(false);
                    document.getElementById("gift")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white py-3 rounded-xl text-sm font-bold hover:from-green-500 hover:to-emerald-600 transition-all shadow-lg shadow-red-900/40"
                >
                  Yes, Show Gifts
                </button>
                <button
                  onClick={() => setShowGiftPrompt(false)}
                  className="flex-1 bg-zinc-800 text-white py-3 rounded-xl text-sm font-semibold hover:bg-zinc-700 transition-all border border-red-500/20"
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