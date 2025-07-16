// pages/wallet/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";

export default function WalletCallback() {
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      const { reference } = router.query;
      if (!reference) return;

      const res = await fetch(`/api/verify-payment?reference=${reference}`);
      const data = await res.json();

      if (data?.status === "success") {
        // Save wallet funding
        await supabase.from("wallets").upsert([
          {
            user_id: data.metadata.user_id,
            amount: data.amount / 100, // convert to ₦
            type: "funding",
            status: "completed",
            reference,
          },
        ]);

        alert("Wallet funded successfully");
        router.push("/dashboard").then(() => {
          router.reload(); // 🔄 Refresh dashboard to reflect updated balance
        });
      } else {
        alert("Payment failed or not verified.");
        router.push("/dashboard");
      }
    };

    verify();
  }, [router]);

  return <p className="text-center p-20">Verifying payment...</p>;
}
