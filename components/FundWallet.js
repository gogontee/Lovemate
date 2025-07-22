// components/FundWallet.js
import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function FundWallet() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const startPayment = async () => {
    if (!amount || isNaN(amount) || Number(amount) < 100) {
      alert("Enter a valid amount (minimum ₦100)");
      return;
    }

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      alert("User not logged in");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/fund-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: form.amount,
          email: user.email,
          user_id: user.id,
          redirect_url: "https://lovemate-zeta.vercel.app/wallet/callback", // ✅ correct domain
        }),
      });

      const data = await response.json();

      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert("Error initializing payment: " + (data?.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong. Try again later.");
    }

    setLoading(false);
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
      />
      <button
        onClick={startPayment}
        className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700 w-full"
        disabled={loading}
      >
        {loading ? "Processing..." : "Proceed to Pay"}
      </button>
    </div>
  );
}
