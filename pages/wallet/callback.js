// pages/wallet/callback.js
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader, AlertCircle } from "lucide-react";

export default function WalletCallback() {
  const router = useRouter();
  const { reference, trxref } = router.query;
  const paymentRef = reference || trxref;
  
  const [status, setStatus] = useState("checking"); // checking, success, failed, fallback
  const [message, setMessage] = useState("Checking payment status...");
  const [amount, setAmount] = useState(null);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  
  const attemptsRef = useRef(0);
  const intervalRef = useRef(null);
  const maxAttempts = 10; // 20 seconds with 2s interval

  useEffect(() => {
    if (!paymentRef) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `/api/payment-status?reference=${encodeURIComponent(paymentRef)}`
        );
        
        if (!res.ok) {
          setMessage("Error checking payment status...");
          return;
        }
        
        const data = await res.json();

        if (data.status === "success") {
          setStatus("success");
          setMessage("Payment confirmed! Redirecting...");
          setAmount(data.amount);
          clearInterval(intervalRef.current);
          setTimeout(() => router.push("/dashboard?payment=success"), 2000);
          return;
        }
        
        // Still pending
        setMessage("Waiting for confirmation...");
        
      } catch (e) {
        console.error("Status check error:", e);
        setMessage("Connection error. Retrying...");
      }

      attemptsRef.current += 1;
      
      // After max attempts, offer fallback
      if (attemptsRef.current >= maxAttempts) {
        setStatus("fallback");
        setMessage("Payment verification is taking longer than expected.");
        clearInterval(intervalRef.current);
      }
    };

    // Initial check
    checkStatus();
    
    // Poll every 2 seconds
    intervalRef.current = setInterval(checkStatus, 2000);
    
    return () => clearInterval(intervalRef.current);
  }, [paymentRef, router]);

  const triggerFallback = async () => {
    setFallbackLoading(true);
    setStatus("checking");
    setMessage("Attempting manual verification...");
    
    try {
      const response = await fetch(
        `/api/fallback-verify-and-credit?reference=${paymentRef}`,
        {
          headers: {
            "x-fallback-secret": process.env.NEXT_PUBLIC_FALLBACK_SECRET
          }
        }
      );
      
      const data = await response.json();
      
      if (data.status === "credited_fallback" || data.status === "already_recorded") {
        setStatus("success");
        setMessage("Payment verified! Redirecting...");
        setTimeout(() => router.push("/dashboard?payment=success"), 2000);
      } else {
        setStatus("failed");
        setMessage("Unable to verify payment automatically.");
      }
    } catch (error) {
      console.error("Fallback error:", error);
      setStatus("failed");
      setMessage("Manual verification failed.");
    } finally {
      setFallbackLoading(false);
    }
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8"
      >
        {/* Checking State */}
        {status === "checking" && (
          <div className="text-center">
            <Loader className="w-16 h-16 text-rose-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Reference: {paymentRef}</p>
            <p className="text-xs text-gray-400 mt-4">
              This usually takes a few seconds...
            </p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-green-600 mb-2">{message}</p>
            {amount && (
              <p className="text-lg font-semibold text-gray-800 mb-4">
                ₦{Number(amount).toLocaleString()}
              </p>
            )}
            <p className="text-sm text-gray-500">Reference: {paymentRef}</p>
          </div>
        )}

        {/* Fallback State - Offer manual verification */}
        {status === "fallback" && (
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Still Processing</h2>
            <p className="text-yellow-600 mb-4">{message}</p>
            <p className="text-sm text-gray-600 mb-2">Reference: {paymentRef}</p>
            <p className="text-xs text-gray-500 mb-6">
              Your payment was successful on Paystack, but we're having trouble confirming it automatically.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={triggerFallback}
                disabled={fallbackLoading}
                className="w-full bg-rose-600 text-white py-3 rounded-xl font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {fallbackLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Retry Verification"
                )}
              </button>
              
              <button
                onClick={goToDashboard}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Failed State */}
        {status === "failed" && (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-red-600 mb-4">{message}</p>
            <p className="text-sm text-gray-600 mb-2">Reference: {paymentRef}</p>
            <p className="text-xs text-gray-500 mb-6">
              Please save your reference number and contact support.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = "mailto:support@example.com?subject=Payment%20Verification%20Failed&body=Reference:%20" + paymentRef}
                className="w-full bg-rose-600 text-white py-3 rounded-xl font-semibold hover:bg-rose-700 transition-colors"
              >
                Contact Support
              </button>
              
              <button
                onClick={goToDashboard}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}