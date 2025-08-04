// pages/wallet/callback.js
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";

export default function WalletCallback() {
  const router = useRouter();
  const { reference } = router.query;
  const [message, setMessage] = useState("Checking payment status...");
  const attemptsRef = useRef(0);
  const intervalRef = useRef(null);
  const maxAttempts = 15; // ~30 seconds with 2s interval

  useEffect(() => {
    if (!reference) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `/api/payment-status?reference=${encodeURIComponent(reference)}`
        );
        if (!res.ok) {
          setMessage("Error checking payment status. Retrying...");
          return;
        }
        const data = await res.json();

        if (data.status === "success") {
          setMessage("Payment confirmed. Redirecting...");
          clearInterval(intervalRef.current);
          setTimeout(() => router.push("/dashboard"), 1000);
          return;
        } else {
          setMessage("Waiting for confirmation...");
        }
      } catch (e) {
        console.error("Status check error:", e);
        setMessage("Error checking payment status. Retrying...");
      }

      attemptsRef.current += 1;
      if (attemptsRef.current >= maxAttempts) {
        setMessage(
          "Still pending. Payment may be processing on the server. Please refresh or contact support if it doesn't complete."
        );
        clearInterval(intervalRef.current);
      }
    };

    // initial check + polling
    checkStatus();
    intervalRef.current = setInterval(checkStatus, 2000);
    return () => clearInterval(intervalRef.current);
  }, [reference, router]);

  const handleRefresh = () => {
    attemptsRef.current = 0;
    setMessage("Re-checking payment status...");
    if (intervalRef.current) clearInterval(intervalRef.current);
    // kick off again
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/payment-status?reference=${encodeURIComponent(reference)}`
        );
        if (!res.ok) {
          setMessage("Error checking payment status. Retrying...");
          return;
        }
        const data = await res.json();
        if (data.status === "success") {
          setMessage("Payment confirmed. Redirecting...");
          clearInterval(intervalRef.current);
          setTimeout(() => router.push("/dashboard"), 1000);
          return;
        } else {
          setMessage("Waiting for confirmation...");
        }
      } catch (e) {
        console.error("Status check error:", e);
        setMessage("Error checking payment status. Retrying...");
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md p-6 bg-white shadow rounded">
        <h2 className="text-xl font-bold mb-4">{message}</h2>
        <p className="mb-2">Reference: {reference || "—"}</p>
        <div className="flex gap-2 justify-center mt-4">
          <button
            onClick={() => router.reload()}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Refresh Page
          </button>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-rose-600 text-white rounded"
          >
            Retry Status
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          If the payment shows successful on Paystack but this page remains pending,
          contact support with the reference.
        </p>
      </div>
    </div>
  );
}
