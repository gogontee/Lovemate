// pages/wallet/callback.js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function WalletCallback() {
  const router = useRouter();
  const { reference } = router.query;
  const [message, setMessage] = useState("Checking payment status...");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!reference) return;

    let interval;
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/payment-status?reference=${reference}`);
        const data = await res.json();

        if (data.status === "success") {
          setMessage("Payment confirmed. Redirecting...");
          setTimeout(() => router.push("/dashboard"), 1000);
          clearInterval(interval);
          return;
        } else {
          setMessage("Waiting for confirmation...");
        }
      } catch (err) {
        console.error("Status poll error:", err);
        setMessage("Error checking payment status.");
      }

      setAttempts((a) => a + 1);
      if (attempts >= 10) {
        setMessage("Taking longer than expected. Please refresh to retry.");
        clearInterval(interval);
      }
    };

    interval = setInterval(checkStatus, 2000);
    checkStatus();

    return () => clearInterval(interval);
  }, [reference, attempts, router]);

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
