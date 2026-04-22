"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../utils/supabaseClient";
import { Eye, EyeOff, Shield } from "lucide-react";
import Image from "next/image";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [checking, setChecking] = useState(true);

  // Verify token with proper timezone handling
  useEffect(() => {
    const verifyToken = async () => {
      console.log("Token from URL:", token);
      console.log("Email from URL:", email);
      
      if (!token || !email) {
        setError("Invalid reset link. Please request a new one.");
        setChecking(false);
        return;
      }

      try {
        // Use ISO string for current time to match database format
        const currentTimeUTC = new Date().toISOString();
        
        // Query with database-side expiration check
        const { data, error } = await supabase
          .from('password_resets')
          .select('*')
          .eq('token', token)
          .eq('email', email)
          .eq('used', false)
          .gte('expires_at', currentTimeUTC) // Compare using UTC
          .single();

        console.log("Current time (UTC):", currentTimeUTC);
        console.log("Query result:", { data, error });

        if (error || !data) {
          // Check if token exists but is expired
          const { data: tokenExists } = await supabase
            .from('password_resets')
            .select('expires_at')
            .eq('token', token)
            .single();
          
          if (tokenExists) {
            console.log("Token exists but expired. Expires at:", tokenExists.expires_at);
            setError("This reset link has expired. Please request a new one.");
          } else {
            setError("Invalid reset link. Please request a new one.");
          }
          setChecking(false);
          return;
        }

        console.log("Token is valid!");
        setValidToken(true);
        setChecking(false);
        
      } catch (err) {
        console.error("Verification error:", err);
        setError("An error occurred. Please try again.");
        setChecking(false);
      }
    };

    verifyToken();
  }, [token, email]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setMessage("✅ Password updated successfully!");

      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
      
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-700 via-rose-100 to-red-800">
        <div className="text-white">Verifying reset link...</div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-700 via-rose-100 to-red-800 p-4">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a href="/auth/reset" className="inline-block px-6 py-2 bg-gradient-to-r from-red-700 to-rose-600 text-white rounded-xl">
            Request New Link
          </a>
        </div>
      </div>
    );
  }

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
              Create New Password
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-red-700 outline-none pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-red-700 outline-none"
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
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-center text-sm text-green-600">{message}</p>
          )}
          {error && (
            <p className="mt-4 text-center text-sm text-red-600">{error}</p>
          )}

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