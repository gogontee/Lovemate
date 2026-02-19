import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Shield, Zap, Loader } from "lucide-react";
import { useState, useEffect } from "react";

export default function FundWalletModal({ isOpen, onClose, user }) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear any previous errors
    setError("");
    
    // Validate amount
    if (!amount || amount.trim() === "") {
      setError("Please enter an amount");
      return;
    }
    
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 1000) {
      setError(`Minimum amount is ₦1,000`);
      return;
    }

    // Check if user is logged in
    if (!user?.id) {
      setError("Please log in first");
      return;
    }

    if (!user?.email) {
      setError("User email not found");
      return;
    }

    // Start payment
    setLoading(true);
    
    try {
      const payload = {
        amount: numAmount,
        email: user.email,
        user_id: user.id,
      };

      console.log("Sending payment request:", payload);

      const res = await fetch("/api/fund-wallet", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // First check if response is ok
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", res.status, errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          setError(errorData.message || errorData.error || `Error ${res.status}: Failed to initialize payment`);
        } catch {
          setError(`Error ${res.status}: Failed to initialize payment`);
        }
        
        setLoading(false);
        return;
      }

      // Parse response
      const data = await res.json();
      console.log("Payment API response:", data);

      // Handle Paystack response
      if (data?.status === true && data?.data?.authorization_url) {
        // Success - redirect to Paystack
        console.log("Redirecting to:", data.data.authorization_url);
        window.location.href = data.data.authorization_url;
      } else if (data?.data?.authorization_url) {
        // Alternative response structure
        console.log("Redirecting to:", data.data.authorization_url);
        window.location.href = data.data.authorization_url;
      } else {
        console.error("Unexpected response structure:", data);
        setError(data?.message || data?.error || "Failed to initialize payment. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  // Get text color class for the input based on amount
  const getInputTextColor = () => {
    const numAmount = Number(amount);
    if (!amount || numAmount < 1000) return "text-gray-900";
    if (numAmount < 10000) return "text-red-600";
    if (numAmount >= 10000 && numAmount < 50000) return "text-orange-500";
    if (numAmount >= 50000 && numAmount < 200000) return "text-blue-600";
    if (numAmount >= 200000) return "text-green-600";
    return "text-gray-900";
  };

  // Determine input field border color
  const getInputBorderColor = () => {
    const numAmount = Number(amount);
    if (!amount || numAmount < 1000) return "border-gray-200";
    if (numAmount < 10000) return "border-red-600 focus:border-red-600";
    if (numAmount >= 10000 && numAmount < 50000) return "border-orange-500 focus:border-orange-500";
    if (numAmount >= 50000 && numAmount < 200000) return "border-blue-600 focus:border-blue-600";
    if (numAmount >= 200000) return "border-green-600 focus:border-green-600";
    return "border-gray-200";
  };

  // Reset error when amount changes
  useEffect(() => {
    if (error) {
      setError("");
    }
  }, [amount]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset state when modal opens
      setAmount("");
      setError("");
      setLoading(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4"
            onClick={onClose}
          >
            {/* Clickable backdrop area */}
            <div className="absolute inset-0" onClick={onClose} />
            
            {/* Modal Content */}
            <div 
              className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md mx-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxHeight: 'calc(100vh - 80px)',
                marginTop: 'auto',
                marginBottom: 'auto'
              }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-4 sm:p-5 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition-colors z-10"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg sm:rounded-xl">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold">Fund Your Wallet</h2>
                </div>
                <p className="text-xs sm:text-sm text-rose-100 mt-1">Add funds to vote and support contestants</p>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* Amount Input */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Enter Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">₦</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        min="1000"
                        step="100"
                        disabled={loading}
                        className={`w-full pl-7 pr-3 py-3 sm:py-4 border-2 rounded-xl focus:ring-1 transition-all text-base sm:text-lg font-medium ${getInputBorderColor()} ${getInputTextColor()} ${
                          error ? 'border-red-500 focus:border-red-500' : ''
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </div>
                    
                    {/* Error Message */}
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-500 mt-2 flex items-center gap-1"
                      >
                        <span>⚠️</span> {error}
                      </motion.p>
                    )}
                    
                    {/* Amount display */}
                    {amount && Number(amount) >= 1000 && !error && !loading && (
                      <p className="text-xs text-gray-500 mt-2">
                        You'll add ₦{Number(amount).toLocaleString()} to your wallet
                      </p>
                    )}
                    
                    {/* Minimum amount notice */}
                    {(!amount || Number(amount) < 1000) && !error && !loading && (
                      <p className="text-xs text-gray-500 mt-2">Minimum: ₦1,000</p>
                    )}

                  </div>

                  {/* User info - helpful for debugging */}
                  {user && !loading && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                      Funding as: {user.email}
                    </div>
                  )}

                  {/* Benefits Section */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-rose-600" />
                      <span className="text-sm font-medium text-gray-700">Why fund your wallet?</span>
                    </div>
                    <ul className="space-y-2 text-xs text-gray-600">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-rose-600 rounded-full"></div>
                        Vote for your favorite contestants
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-rose-600 rounded-full"></div>
                        Send gifts to support contestants
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-rose-600 rounded-full"></div>
                        Unlock exclusive fan rewards
                      </li>
                    </ul>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                    <Shield className="w-3 h-3" />
                    <span>Secured by Paystack</span>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: loading ? 1 : 1.01 }}
                    whileTap={{ scale: loading ? 1 : 0.99 }}
                    disabled={loading || !user?.id}
                    className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Continue to Payment"
                    )}
                  </motion.button>

                  {/* Login reminder */}
                  {!user && !loading && (
                    <p className="text-xs text-center text-gray-500 mt-2">
                      Please log in to fund your wallet
                    </p>
                  )}
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}