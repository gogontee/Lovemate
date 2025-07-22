// pages/wallet/callback.js

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function WalletCallback() {
  const router = useRouter();

  useEffect(() => {
    // Let dashboard know it should refresh wallet
    localStorage.setItem("wallet_updated", "true");

    // Wait 1 second, then redirect
    const timer = setTimeout(() => {
      router.replace("/dashboard");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <p className="text-xl font-semibold">Thank you for your payment!</p>
        <p className="text-gray-600 mt-2">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
