import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import { Eye, EyeOff, Heart, Sparkles, Shield, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Get the user ID from the session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError("Login succeeded but failed to get user data.");
      setLoading(false);
      return;
    }

    // Now fetch user profile by ID instead of email (more reliable)
    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("role")
      .eq("id", user.id)  // Use ID instead of email
      .single();

    if (profileError) {
      // If profile doesn't exist, create one
      if (profileError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from("profile")
          .insert([
            {
              id: user.id,
              email: user.email,
              role: "fan",
            }
          ]);
          
        if (insertError) {
          setError("Failed to create user profile.");
          setLoading(false);
          return;
        }
        
        // Redirect as fan
        router.push("/dashboard");
        setLoading(false);
        return;
      } else {
        setError("Login succeeded but failed to retrieve user role.");
        setLoading(false);
        return;
      }
    }

    // Redirect based on role
    if (profile.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }

    setLoading(false);
  };

  // Floating hearts animation variants - FIXED with deterministic values
  const floatingHearts = Array.from({ length: 15 }, (_, i) => {
    return {
      id: i,
      x: (i * 13) % 90 + 5, // Range: 5-95%
      y: (i * 17) % 90 + 5, // Range: 5-95%
      size: (i % 3) * 8 + 12, // Values: 12, 20, or 28
      duration: (i % 5) * 2 + 12, // Values: 12, 14, 16, 18, or 20 seconds
      delay: (i % 4) * 0.4, // Values: 0, 0.4, 0.8, or 1.2 seconds
    };
  });

  return (
    <section className="min-h-screen bg-gradient-to-br from-red-700 via-rose-100 to-red-800 flex items-center justify-center px-4 py-6 md:py-8 relative overflow-hidden">
      {/* Animated Background Hearts */}
      {floatingHearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute pointer-events-none text-rose-100/20"
          initial={{ 
            x: `${heart.x}vw`, 
            y: `${heart.y}vh`,
            scale: 0,
            opacity: 0.3
          }}
          animate={{ 
            y: [`${heart.y}vh`, `${heart.y - 20}vh`, `${heart.y}vh`],
            x: [`${heart.x}vw`, `${heart.x + 10}vw`, `${heart.x}vw`],
            rotate: [0, 180, 360],
            scale: [0, 1, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Heart 
            size={heart.size} 
            className="text-rose-100/20"
            fill="currentColor"
          />
        </motion.div>
      ))}

      {/* Pulsing Glow Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)",
            "radial-gradient(circle at 70% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)",
            "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[340px] md:max-w-md"
      >
        {/* Futuristic Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl overflow-hidden border border-rose-200/30"
        >
          {/* Animated Border Glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              boxShadow: [
                "0 0 20px rgba(190, 18, 60, 0.3), inset 0 0 20px rgba(190, 18, 60, 0.1)",
                "0 0 40px rgba(190, 18, 60, 0.5), inset 0 0 30px rgba(190, 18, 60, 0.2)",
                "0 0 20px rgba(190, 18, 60, 0.3), inset 0 0 20px rgba(190, 18, 60, 0.1)",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Header with Logo - Letterhead Style - No padding/gaps */}
          <div className="relative bg-gradient-to-r from-red-700 to-rose-600 flex items-center justify-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              {/* Logo */}
              <div className="relative w-32 h-32 md:w-36 md:h-36">
                <Image
                  src="https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/lovemateshow/logo/lovemateicon.png"
                  alt="Lovemate Show"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
              
              {/* Sparkles animation */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
              >
                <Sparkles className="w-5 h-5 text-rose-200" />
              </motion.div>
            </motion.div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
          </div>

          {/* Form Content */}
          <div className="p-5 md:p-6 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-700 to-rose-600 bg-clip-text text-transparent">
                Welcome Back
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Log in to continue your journey</p>
            </motion.div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email - FIXED with id, name, and htmlFor */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your@email.com"
                  className="w-full px-3.5 py-2.5 md:px-4 md:py-3 bg-rose-50/50 border border-rose-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-red-700 focus:border-transparent transition-all outline-none placeholder:text-gray-400"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </motion.div>

              {/* Password with Toggle - FIXED with id, name, and htmlFor */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    className="w-full px-3.5 py-2.5 md:px-4 md:py-3 bg-rose-50/50 border border-rose-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-red-700 focus:border-transparent transition-all outline-none pr-10"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-red-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </motion.div>

              {/* Forgot Password Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-right"
              >
                <Link
                  href="/auth/reset"
                  className="text-xs text-rose-600 hover:text-red-700 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </motion.div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[11px] text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-2.5 md:py-3 rounded-xl font-semibold text-white shadow-lg transition-all relative overflow-hidden group ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-800 hover:to-rose-700'
                }`}
              >
                {/* Button Glow Effect */}
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{
                    x: ["-100%", "200%"],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
                
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span className="text-sm">Logging in...</span>
                  </div>
                ) : (
                  <span className="text-sm relative z-10 flex items-center justify-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Log In
                  </span>
                )}
              </motion.button>

              {/* Sign Up Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center pt-2"
              >
                <p className="text-[11px] text-gray-500">
                  Don't have an account?{' '}
                  <Link
                    href="/auth/signup"
                    className="text-red-700 font-semibold hover:text-rose-600 hover:underline transition-colors"
                  >
                    Sign Up
                  </Link>
                </p>
              </motion.div>

              {/* Security Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex items-center justify-center gap-1 pt-1"
              >
                <Shield className="w-3 h-3 text-gray-400" />
                <span className="text-[8px] text-gray-400">Secure • Encrypted</span>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}