// pages/wallet/callback.js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function WalletCallback() {
  const router = useRouter();
  const { reference } = router.query;
  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    const verifyAndUpdateWallet = async () => {
      if (!reference) {
        setMessage("No reference provided.");
        return;
      }

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setMessage("User not logged in.");
          return;
        }

        // Verify transaction from Paystack
        const response = await fetch(`/api/verify-transaction?reference=${reference}`);
        const result = await response.json();

        if (result.status !== "success") {
          setMessage("Payment verification failed.");
          return;
        }

        const amount = result.amount / 100; // Paystack returns amount in kobo

        // Update user's wallet
        const { error } = await supabase
          .from("wallet")
          .update({ balance: supabase.rpc("increment_wallet_balance", { user_id_input: user.id, amount_input: amount }) }) // or your logic
          .eq("user_id", user.id);

        if (error) {
          console.error("Wallet update error:", error.message);
          setMessage("Failed to update wallet.");
        } else {
          setMessage("Payment successful. Wallet funded.");
          setTimeout(() => router.push("/dashboard"), 2000);
        }
      } catch (err) {
        console.error("Verification error:", err);
        setMessage("Error verifying transaction.");
      }
    };

    if (router.isReady) verifyAndUpdateWallet();
  }, [router.isReady, reference]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>
        <h2 className="text-xl font-bold mb-4">{message}</h2>
        <p>Redirecting to dashboard shortly...</p>
      </div>
    </div>
  );
}
