"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Shield } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      const res = await fetch("/api/send-reset-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("✅ Password reset link sent! Check your email 💌");
        setEmail(""); // Clear email after success
      } else {
        setStatus(`❌ ${data.error || "Something went wrong."}`);
      }
    } catch (err) {
      console.error("Reset error:", err);
      setStatus("❌ Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-700 via-rose-100 to-red-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-700 to-rose-600 flex justify-center py-6">
          <div className="relative w-32 h-32">
            <Image
              src="https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/lovemateshow/logo/lovemateicon.png"
              alt="Lovemate Show"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-rose-600 bg-clip-text text-transparent">
              Reset Password
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              Enter your email to receive a password reset link.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-red-700 outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-700 to-rose-600 hover:opacity-90"
              }`}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {status && (
            <p
              className={`mt-4 text-center text-sm ${
                status.startsWith("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {status}
            </p>
          )}

          <div className="mt-6 text-center">
            <a href="/auth/login" className="text-sm text-rose-600 hover:underline">
              Back to Login
            </a>
          </div>

          <div className="flex justify-center items-center gap-1 mt-6 pt-4 border-t border-rose-100">
            <Shield className="w-3 h-3 text-gray-400" />
            <span className="text-[10px] text-gray-400">
              Secure • Encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}