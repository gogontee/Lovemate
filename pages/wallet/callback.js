// pages/wallet/callback.js
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";

export default function WalletCallback() {
  const router = useRouter();
  const { reference } = router.query;
  const [message, setMessage] = useState("Checking payment status...");
  const attemptsRef = useRef(0);
  const intervalRef = useRef(null);
  const fallbackTriedRef = useRef(false);

  useEffect(() => {
    if (!reference) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/payment-status?reference=${encodeURIComponent(reference)}`);
        if (!res.ok) {
          setMessage("Error checking payment status.");
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
        setMessage("Error checking payment status.");
      }

      attemptsRef.current += 1;

      if (attemptsRef.current >= 10 && !fallbackTriedRef.current) {
        // attempt fallback once
        fallbackTriedRef.current = true;
        setMessage("Taking longer than expected. Attempting fallback verification...");
        try {
          const fb = await fetch(`/api/fallback-verify-and-credit?reference=${encodeURIComponent(reference)}`);
          const fbData = await fb.json();
          console.log("Fallback result:", fbData);
          if (fbData.status === "credited_fallback" || fbData.status === "already_recorded") {
            setMessage("Payment confirmed via fallback. Redirecting...");
            setTimeout(() => router.push("/dashboard"), 1000);
            clearInterval(intervalRef.current);
            return;
          } else {
            setMessage("Fallback failed. Please refresh to retry.");
          }
        } catch (err) {
          console.error("Fallback error:", err);
          setMessage("Fallback verification error. Please refresh.");
        }
      } else if (attemptsRef.current >= 15) {
        setMessage("Still pending. Please refresh to retry.");
        clearInterval(intervalRef.current);
      }
    };

    checkStatus();
    intervalRef.current = setInterval(checkStatus, 2000);
    return () => clearInterval(intervalRef.current);
  }, [reference, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>
        <h2 className="text-xl font-bold mb-4">{message}</h2>
        <p>Reference: {reference}</p>
        <p>Redirecting to dashboard when confirmed...</p>
      </div>
    </div>
  );
}
