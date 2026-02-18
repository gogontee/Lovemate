// components/directors/DirectorAuthGuard.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";

export default function DirectorAuthGuard({ children, onAccessGranted }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");
  const [directorCode, setDirectorCode] = useState(null);
  const [fetchingCode, setFetchingCode] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    setLoading(true);
    
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      router.push("/auth/login");
      return;
    }

    setUser(authUser);

    // First, fetch the director's code from lovemate table
    await fetchDirectorCode();

    // Check if user has saved code in localStorage
    const savedCode = localStorage.getItem(`director_code_${authUser.id}`);
    if (savedCode && directorCode && savedCode === directorCode) {
      setAccessGranted(true);
      onAccessGranted?.(authUser);
    }

    setLoading(false);
  };

  const fetchDirectorCode = async () => {
    setFetchingCode(true);
    try {
      const { data, error } = await supabase
        .from("lovemate")
        .select("directors_code")
        .eq("id", "ffb2d356-0dc8-4da8-a79c-8676efec0156")
        .single();

      if (error) {
        console.error("Error fetching director code:", error);
        setCodeError("Failed to verify access. Please try again.");
      } else {
        setDirectorCode(data?.directors_code || null);
        console.log("Director code fetched successfully");
      }
    } catch (err) {
      console.error("Error:", err);
      setCodeError("Failed to verify access. Please try again.");
    } finally {
      setFetchingCode(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setCodeError("");

    // If we don't have the director code yet, fetch it first
    if (!directorCode) {
      await fetchDirectorCode();
    }

    // Check if the entered code matches
    if (codeInput === directorCode) {
      setAccessGranted(true);
      localStorage.setItem(`director_code_${user.id}`, directorCode);
      onAccessGranted?.(user);
    } else {
      setCodeError("Invalid director code. Access denied.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-red-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-red-50 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-rose-200">
            <div className="text-center mb-6">
              <div className="inline-block p-3 bg-gradient-to-r from-red-600 to-rose-600 rounded-full mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Director's Portal</h2>
              <p className="text-sm text-gray-500 mt-1">Enter your secret code to access</p>
            </div>

            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Enter director code"
                  className="w-full px-4 py-3 bg-rose-50/50 border border-rose-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all outline-none"
                  autoFocus
                  disabled={fetchingCode}
                />
              </div>

              {codeError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center"
                >
                  {codeError}
                </motion.div>
              )}

              {fetchingCode && (
                <div className="flex justify-center">
                  <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              <button
                type="submit"
                disabled={fetchingCode}
                className={`w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold transition-all shadow-lg ${
                  fetchingCode ? 'opacity-50 cursor-not-allowed' : 'hover:from-red-700 hover:to-rose-700'
                }`}
              >
                {fetchingCode ? 'Verifying...' : 'Access Dashboard'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                ⚠️ This area is restricted to authorized personnel only
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return children;   
}