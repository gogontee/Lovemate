import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

// Helper function to format price nicely
const formatPrice = (price, currency = 'NGN') => {
  if (currency === 'USD') {
    return `$${price}`;
  }
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

// Payment Method Icons
const PaymentIcons = {
  wallet: '💳',
  paystack: '🇳🇬',
  paypal: '🇺🇸'
};

export default function VoteSection({ candidate }) {
  const [votePackages, setVotePackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showGiftPrompt, setShowGiftPrompt] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState('NGN');
  const router = useRouter();

  // Get current user and wallet balance
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
          const transformedPackages = data.map(pkg => ({
            id: pkg.id,
            points: pkg.votes,
            price_ngn: pkg.price,
            price_usd: pkg.price_usd || Math.round(pkg.price / 1500),
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

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setShowPaymentModal(true);
  };

  // Create pending transaction in database
  const createPendingTransaction = async (paymentMethod, currency) => {
    if (!selectedPackage || !candidate) {
      console.error("Missing selectedPackage or candidate");
      return null;
    }

    const price = currency === 'USD' ? selectedPackage.price_usd : selectedPackage.price_ngn;
    const pricePerVote = Math.round(price / selectedPackage.points);
    const reference = generateReference();

    console.log("Creating pending transaction:", {
      user_id: user?.id || null,
      candidate_id: candidate.id,
      package_name: selectedPackage.packageName,
      votes: selectedPackage.points,
      price_per_vote: pricePerVote,
      total_amount: price,
      currency: currency,
      payment_method: paymentMethod,
      reference: reference
    });

    try {
      const { data, error } = await supabase
        .from("vote_transactions")
        .insert({
          user_id: user?.id || null,
          candidate_id: candidate.id,
          package_name: selectedPackage.packageName,
          votes: selectedPackage.points,
          price_per_vote: pricePerVote,
          total_amount: price,
          discount_percentage: selectedPackage.discount || 0,
          original_amount: currency === 'USD' ? selectedPackage.price_usd : selectedPackage.price_ngn,
          payment_method: paymentMethod,
          status: "pending",
          currency: currency,
          reference: reference,
          metadata: {
            package_label: selectedPackage.label,
            candidate_name: candidate.name,
            timestamp: new Date().toISOString(),
            guest_email: !user ? 'guest' : undefined
          }
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating pending transaction:", error);
        return null;
      }

      console.log("Transaction created:", data);
      return { transaction: data, reference };
    } catch (error) {
      console.error("Unexpected error creating transaction:", error);
      return null;
    }
  };

  // Complete transaction after successful payment
  const completeTransaction = async (reference, paymentDetails) => {
    try {
      const { error } = await supabase
        .from("vote_transactions")
        .update({
          status: "completed",
          metadata: {
            ...paymentDetails,
            completed_at: new Date().toISOString()
          }
        })
        .eq("reference", reference);

      if (error) {
        console.error("Error completing transaction:", error);
        throw error;
      }

      console.log("Transaction completed:", reference);
    } catch (error) {
      console.error("Error completing transaction:", error);
      throw error;
    }
  };

  const handleWalletVote = async () => {
    if (!selectedPackage || !user) return;

    setIsProcessing(true);

    try {
      // Check wallet balance
      if (walletBalance < selectedPackage.price_ngn) {
        alert(`Insufficient balance. You have ${formatPrice(walletBalance)} but need ${formatPrice(selectedPackage.price_ngn)}`);
        setIsProcessing(false);
        return;
      }

      // Create pending transaction
      const result = await createPendingTransaction('wallet', 'NGN');
      if (!result) throw new Error("Failed to create transaction");
      
      const { transaction, reference } = result;

      // Deduct from wallet
      const { error: deductError } = await supabase
        .from("wallets")
        .update({ 
          balance: walletBalance - selectedPackage.price_ngn,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (deductError) throw deductError;

      // Complete transaction
      await completeTransaction(reference, {
        wallet_deduction: true,
        balance_after: walletBalance - selectedPackage.price_ngn,
        transaction_id: transaction.id
      });

      // Update local wallet balance
      setWalletBalance(prev => prev - selectedPackage.price_ngn);

      // Success!
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
      // Create pending transaction
      const result = await createPendingTransaction('paystack', 'NGN');
      if (!result) throw new Error("Failed to create transaction");
      
      const { transaction, reference } = result;

      // Check if Paystack is loaded
      if (!window.PaystackPop) {
        throw new Error("Paystack not loaded. Please refresh the page.");
      }

      // Initialize Paystack payment
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user?.email || 'guest@example.com',
        amount: selectedPackage.price_ngn * 100,
        currency: 'NGN',
        ref: reference,
        metadata: {
          transaction_id: transaction.id,
          candidate_id: candidate.id,
          candidate_name: candidate.name,
          package_name: selectedPackage.packageName,
          votes: selectedPackage.points,
          user_id: user?.id || 'guest'
        },
        callback: function(response) {
          console.log("Paystack callback received:", response);
          
          completeTransaction(response.reference, {
            paystack_ref: response.trxref,
            status: 'success',
            transaction_id: transaction.id
          }).then(() => {
            setIsProcessing(false);
            setShowPaymentModal(false);
            setShowSuccessModal(true);
          }).catch(error => {
            console.error("Error completing transaction:", error);
            alert("Payment successful but failed to record. Please contact support with reference: " + response.reference);
            setIsProcessing(false);
          });
        },
        onClose: function() {
          console.log("Paystack closed");
          
          supabase
            .from("vote_transactions")
            .update({ 
              status: "failed",
              metadata: {
                cancelled_at: new Date().toISOString(),
                reason: 'user_cancelled'
              }
            })
            .eq("reference", reference)
            .then(() => {
              setIsProcessing(false);
            })
            .catch(err => {
              console.error("Error updating cancelled transaction:", err);
              setIsProcessing(false);
            });
        }
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
      // Check if PayPal is loaded
      if (!window.paypal) {
        // Load PayPal dynamically
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      // Create pending transaction
      const result = await createPendingTransaction('paypal', 'USD');
      if (!result) throw new Error("Failed to create transaction");
      
      const { transaction, reference } = result;

      // Create PayPal order
      const response = await fetch('/api/create-paypal-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedPackage.price_usd,
          currency: 'USD',
          reference: reference,
          transaction_id: transaction.id,
          candidate_id: candidate.id,
          candidate_name: candidate.name,
          package_name: selectedPackage.packageName,
          votes: selectedPackage.points,
          user_id: user?.id
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PayPal order creation failed:', errorText);
        throw new Error('Failed to create PayPal order');
      }

      const order = await response.json();

      if (order.id) {
        // Clear any existing PayPal buttons
        const container = document.getElementById('paypal-button-container');
        if (container) container.innerHTML = '';
        
        // Render PayPal buttons
        window.paypal.Buttons({
          createOrder: function() {
            return order.id;
          },
          onApprove: function(data) {
            console.log("PayPal payment approved:", data);
            
            // Capture payment
            fetch('/api/capture-paypal-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                orderID: data.orderID,
                reference: reference
              })
            })
            .then(res => {
              if (!res.ok) {
                throw new Error('Failed to capture payment');
              }
              return res.json();
            })
            .then(captureData => {
              if (captureData.status === 'COMPLETED') {
                return completeTransaction(reference, {
                  paypal_order_id: data.orderID,
                  paypal_capture_id: captureData.purchase_units[0].payments.captures[0].id,
                  status: 'completed',
                  transaction_id: transaction.id
                }).then(() => {
                  setIsProcessing(false);
                  setShowPaymentModal(false);
                  setShowSuccessModal(true);
                });
              }
            })
            .catch(error => {
              console.error("Error capturing PayPal payment:", error);
              alert("Payment successful but failed to record. Please contact support.");
              setIsProcessing(false);
            });
          },
          onCancel: function() {
            console.log("PayPal payment cancelled");
            supabase
              .from("vote_transactions")
              .update({ 
                status: "failed",
                metadata: {
                  cancelled_at: new Date().toISOString(),
                  reason: 'user_cancelled'
                }
              })
              .eq("reference", reference)
              .then(() => {
                setIsProcessing(false);
              })
              .catch(err => {
                console.error("Error updating cancelled transaction:", err);
                setIsProcessing(false);
              });
          },
          onError: function(err) {
            console.error("PayPal error:", err);
            alert("PayPal payment failed. Please try again.");
            setIsProcessing(false);
          }
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

  if (loading) {
    return (
      <section className="py-6 md:py-10 px-3 md:px-4 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-pulse text-gray-400">Loading vote packages...</div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-6 md:py-10 px-3 md:px-4 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-white mb-0.5 md:mb-1">
              Support <span className="text-red-400">{candidate?.name}</span>
            </h2>
            <p className="text-xs md:text-sm text-gray-400">Choose your vote package below</p>
            
            {/* Wallet Balance - Only for auth users */}
            {user && (
              <div className="mt-2 inline-flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-700">
                <span className="text-xs text-gray-400">Wallet:</span>
                <span className="text-sm font-bold text-green-400">{formatPrice(walletBalance)}</span>
                <span className="text-[10px] text-gray-500">available</span>
              </div>
            )}
          </div>

          {/* Currency Toggle */}
          <div className="flex justify-center mb-4">
            <div className="bg-gray-800 p-1 rounded-full inline-flex border border-gray-700">
              <button
                onClick={() => setSelectedCurrency('NGN')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCurrency === 'NGN' 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🇳🇬 NGN
              </button>
              <button
                onClick={() => setSelectedCurrency('USD')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCurrency === 'USD' 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🇺🇸 USD
              </button>
            </div>
          </div>

          {/* Vote Packages Grid */}
          <div className="grid grid-cols-5 md:grid-cols-5 gap-1.5 md:gap-2">
            {votePackages.map((pkg, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => handlePackageSelect(pkg)}
                className={`relative bg-gray-800 hover:bg-gray-750 rounded-lg md:rounded-xl p-1.5 md:p-3 shadow-lg hover:shadow-xl transition-all active:scale-95 text-center border border-gray-700 ${
                  pkg.popular ? 'ring-2 ring-red-500 bg-gradient-to-br from-gray-800 to-red-900/30' : ''
                }`}
              >
                {/* Discount Badge */}
                {pkg.discount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[8px] md:text-[10px] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-bold shadow-sm z-10">
                    {pkg.discount}%
                  </span>
                )}
                
                {/* Popular Badge */}
                {(pkg.label === 'CLOK' || pkg.label === 'THOR' || pkg.label === 'WAR' || pkg.label === 'GOZZ') && (
                  <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-[8px] md:text-[10px] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-bold shadow-sm z-10">
                    ★
                  </span>
                )}
                
                {/* Icon */}
                <div className="text-base md:text-xl mb-0.5 md:mb-1 text-gray-300">{pkg.icon}</div>
                
                {/* Label */}
                <div className="font-bold text-[10px] md:text-sm text-white mb-0.5 truncate">
                  {pkg.label}
                </div>
                
                {/* Points */}
                <div className="text-sm md:text-base font-extrabold text-red-400">
                  {pkg.points < 1000 ? pkg.points : (pkg.points/1000).toFixed(0) + 'k'}
                </div>
                
                {/* "votes" text */}
                <div className="text-[8px] md:text-[10px] text-gray-500 mb-0.5 md:mb-1">
                  votes
                </div>
                
                {/* Price */}
                <div className="bg-gray-900/80 backdrop-blur-sm rounded py-0.5 md:py-1 px-0.5 border border-gray-700">
                  {pkg.discount > 0 ? (
                    <div className="flex flex-col items-center">
                      <span className="text-[7px] md:text-[9px] line-through text-gray-500">
                        {formatPrice(pkg.originalPrice, selectedCurrency)}
                      </span>
                      <span className="text-[9px] md:text-xs font-bold text-green-400">
                        {formatPrice(
                          selectedCurrency === 'USD' ? pkg.price_usd : pkg.price_ngn,
                          selectedCurrency
                        )}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[9px] md:text-xs font-bold text-white">
                      {formatPrice(
                        selectedCurrency === 'USD' ? pkg.price_usd : pkg.price_ngn,
                        selectedCurrency
                      )}
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Helper text */}
          <p className="text-center text-[10px] md:text-xs text-gray-500 mt-3 md:mt-4">
            ⚡ Premium packages: THOR (5% off), WAR & GOZZ (10% off)
          </p>
        </div>
      </section>

      {/* Payment Method Modal - FIXED: Properly sized for PayPal */}
      <AnimatePresence>
        {showPaymentModal && selectedPackage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
            onClick={() => setShowPaymentModal(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-gray-900 rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-gray-800 max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
              style={{ maxHeight: '85vh', overflowY: 'auto' }}
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-2xl">
                  {selectedPackage.icon}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-1 text-center">
                Choose Payment Method
              </h3>
              
              <p className="text-xs text-gray-400 mb-4 text-center">
                {selectedPackage.packageName} • {selectedPackage.points.toLocaleString()} votes
              </p>

              <div className="space-y-2 mb-4">
                {/* Wallet Option - Only for logged in users */}
                {user && (
                  <button
                    onClick={handleWalletVote}
                    disabled={walletBalance < selectedPackage.price_ngn}
                    className="w-full bg-gray-800 hover:bg-gray-750 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-xl border border-gray-700 flex items-center gap-3 transition-all group"
                  >
                    <span className="text-xl">{PaymentIcons.wallet}</span>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold text-white">Pay with Wallet</div>
                      <div className="text-xs text-gray-400">
                        Balance: {formatPrice(walletBalance)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-400">
                        {formatPrice(selectedPackage.price_ngn)}
                      </div>
                      {walletBalance < selectedPackage.price_ngn && (
                        <div className="text-[10px] text-red-400">Insufficient</div>
                      )}
                    </div>
                  </button>
                )}

                {/* Paystack Option (NGN) */}
                <button
                  onClick={handlePaystackPayment}
                  className="w-full bg-gray-800 hover:bg-gray-750 p-3 rounded-xl border border-gray-700 flex items-center gap-3 transition-all group"
                >
                  <span className="text-xl">{PaymentIcons.paystack}</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-white">Pay with Paystack</div>
                    <div className="text-xs text-gray-400">Visa, Mastercard, Bank Transfer</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      {formatPrice(selectedPackage.price_ngn, 'NGN')}
                    </div>
                    <div className="text-[10px] text-gray-500">NGN</div>
                  </div>
                </button>

                {/* PayPal Option (USD) */}
                <button
                  onClick={handlePayPalPayment}
                  className="w-full bg-gray-800 hover:bg-gray-750 p-3 rounded-xl border border-gray-700 flex items-center gap-3 transition-all group"
                >
                  <span className="text-xl">{PaymentIcons.paypal}</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-white">Pay with PayPal</div>
                    <div className="text-xs text-gray-400">International cards, PayPal balance</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      ${selectedPackage.price_usd}
                    </div>
                    <div className="text-[10px] text-gray-500">USD</div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full bg-gray-800 text-gray-400 py-2 rounded-xl text-sm font-semibold hover:bg-gray-750 transition-all border border-gray-700 mb-3"
              >
                Cancel
              </button>

              {/* PayPal Button Container - with proper spacing */}
              <div id="paypal-button-container" className="mt-2 pt-2 border-t border-gray-800"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal - REMOVED SEND GIFT BUTTON */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
            onClick={() => setShowSuccessModal(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center border border-gray-800"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
                🎉
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Votes Sent!</h3>
              <p className="text-sm text-gray-400 mb-4">
                Thank you for supporting <span className="font-semibold text-red-400">{candidate.name}</span>!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-3 rounded-xl text-sm font-semibold hover:from-red-600 hover:to-rose-600 transition-all shadow-lg"
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
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
            onClick={() => setShowGiftPrompt(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center border border-gray-800"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
                🎁
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Send a Gift?</h3>
              <p className="text-sm text-gray-400 mb-4">
                Show extra support to <span className="font-semibold text-red-400">{candidate.name}</span> with a special gift
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowGiftPrompt(false);
                    document.getElementById('gift')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-3 rounded-xl text-sm font-semibold hover:from-red-600 hover:to-rose-600 transition-all shadow-lg"
                >
                  Yes, Show Gifts
                </button>
                <button
                  onClick={() => setShowGiftPrompt(false)}
                  className="flex-1 bg-gray-800 text-gray-400 py-3 rounded-xl text-sm font-semibold hover:bg-gray-750 transition-all border border-gray-700"
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