import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function FundWallet() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Load user on mount & listen for auth changes
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        console.log("Auth listener loaded user:", session.user);
      } else {
        setUser(null);
        console.log("Auth listener cleared user");
      }
    });

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
        console.log("Initial user loaded:", data.user);
      } else {
        console.log("No initial user session");
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const startPayment = async () => {
    console.log("Current user at payment time:", user);

    if (!amount || isNaN(amount) || Number(amount) < 100) {
      alert("Enter a valid amount (minimum ₦100)");
      return;
    }

    if (!user?.id) {
      alert("Please log in first. User ID missing.");
      return;
    }

    const redirectUrl =
      (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin) + "/wallet/callback";

    const payload = {
      amount: Number(amount),
      email: user.email,
      user_id: user.id,
      redirect_url: redirectUrl,
    };

    console.log("Payload being sent to API:", payload);

    setLoading(true);
    try {
      const res = await fetch("/api/fund-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON /api/fund-wallet response:", text);
        alert("Payment initialization failed unexpectedly. Check console for details.");
        return;
      }

      console.log("API fund-wallet response:", data);

      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert("Error initializing payment: " + (data?.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h3 className="font-bold mb-2">Fund Wallet</h3>
      <input
        type="number"
        placeholder="Enter amount (₦)"
        className="border px-3 py-2 rounded w-full mb-3"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={loading}
      />
      <button
        onClick={startPayment}
        className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700 w-full"
        disabled={loading || !user?.id}
      >
        {loading ? "Processing..." : "Proceed to Pay"}
      </button>
    </div>
  );
}
