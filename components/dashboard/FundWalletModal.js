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
            className="fixed inset-0 flex items-center justify-center z-50 p-1"
            onClick={onClose}
          >
            {/* Clickable backdrop area */}
            <div className="absolute inset-0" onClick={onClose} />
            
            {/* Modal Content */}
            <div 
              className="relative bg-white rounded-lg shadow-2xl w-full max-w-sm mx-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxHeight: 'calc(100vh - 20px)',
                marginTop: 'auto',
                marginBottom: 'auto'
              }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-2 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-1 right-1 p-1 hover:bg-white/20 rounded-full transition-colors z-10"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="flex items-center gap-1">
                  <div className="p-1 bg-white/20 rounded">
                    <CreditCard className="w-3 h-3" />
                  </div>
                  <h2 className="text-sm font-bold">Fund Wallet</h2>
                </div>
                <p className="text-[10px] text-rose-100">Add funds to vote</p>
              </div>

              {/* Body */}
              <div className="p-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
                <form onSubmit={handleSubmit} className="space-y-2">
                  {/* Amount Input */}
                  <div>
                    <label className="block text-[10px] font-medium text-gray-700 mb-0.5">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-xs">₦</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        min="1000"
                        step="100"
                        disabled={loading}
                        className={`w-full pl-5 pr-2 py-1.5 border rounded-lg focus:ring-1 transition-all text-sm font-medium ${getInputBorderColor()} ${getInputTextColor()} ${
                          error ? 'border-red-500 focus:border-red-500' : ''
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    </div>
                    
                    {/* Error Message */}
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[8px] text-red-500 mt-1 flex items-center gap-0.5"
                      >
                        <span>⚠️</span> {error}
                      </motion.p>
                    )}
                    
                    {/* Amount display */}
                    {amount && Number(amount) >= 1000 && !error && !loading && (
                      <p className="text-[8px] text-gray-500 mt-1">
                        Add ₦{Number(amount).toLocaleString()}
                      </p>
                    )}
                    
                    {/* Minimum amount notice */}
                    {(!amount || Number(amount) < 1000) && !error && !loading && (
                      <p className="text-[8px] text-gray-500 mt-1">Min: ₦1,000</p>
                    )}
                  </div>

                  {/* User info - helpful for debugging */}
                  {user && !loading && (
                    <div className="text-[8px] text-gray-500 bg-gray-50 p-1 rounded">
                      {user.email}
                    </div>
                  )}

                  {/* Benefits Section */}
                  <div className="bg-gray-50 rounded-lg p-1.5">
                    <div className="flex items-center gap-1 mb-1">
                      <Zap className="w-3 h-3 text-rose-600" />
                      <span className="text-[9px] font-medium text-gray-700">Benefits</span>
                    </div>
                    <ul className="space-y-0.5 text-[8px] text-gray-600">
                      <li className="flex items-center gap-1">
                        <div className="w-0.5 h-0.5 bg-rose-600 rounded-full"></div>
                        Vote for favorites
                      </li>
                      <li className="flex items-center gap-1">
                        <div className="w-0.5 h-0.5 bg-rose-600 rounded-full"></div>
                        Send gifts
                      </li>
                      <li className="flex items-center gap-1">
                        <div className="w-0.5 h-0.5 bg-rose-600 rounded-full"></div>
                        Unlock rewards
                      </li>
                    </ul>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center gap-1 text-[8px] text-gray-500">
                    <Shield className="w-2 h-2" />
                    <span>Secured by Paystack</span>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: loading ? 1 : 1.01 }}
                    whileTap={{ scale: loading ? 1 : 0.99 }}
                    disabled={loading || !user?.id}
                    className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-1.5 rounded-lg font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow flex items-center justify-center gap-1"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-3 h-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Pay"
                    )}
                  </motion.button>

                  {/* Login reminder */}
                  {!user && !loading && (
                    <p className="text-[8px] text-center text-gray-500 mt-1">
                      Log in to fund wallet
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