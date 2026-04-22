// pages/auth/update-password.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import { motion } from "framer-motion";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    if (token) {
      verifyToken();
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`/api/auth/verify-reset-token?token=${token}`);
      const data = await response.json();

      if (response.ok && data.valid) {
        setValidToken(true);
      } else {
        setError(data.error || "Invalid or expired reset link");
      }
    } catch (err) {
      setError("Invalid reset link");
    } finally {
      setVerifying(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Update password in Supabase auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      // Mark token as used
      await fetch('/api/auth/mark-token-used', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      setMessage("Password updated successfully! Redirecting to login...");
      
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      
    } catch (err) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying reset link...</p>
        </div>
      </section>
    );
  }

  if (!validToken) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">
            {error || "This password reset link is invalid or has expired."}
          </p>
          <a
            href="/auth/reset"
            className="inline-block w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-xl font-semibold text-center"
          >
            Request New Reset Link
          </a>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Create New Password</h2>
          <p className="text-sm text-gray-600">
            Choose a strong password for your account
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <p className="text-sm text-green-700">{message}</p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-3 rounded-xl font-semibold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </span>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </motion.div>
    </section>
  );
}