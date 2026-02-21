import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import { Eye, EyeOff, Upload, Check, X, Heart, Sparkles, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function SignUp() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    photo: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasLower: false,
    hasUpper: false,
    hasNumber: false,
    hasSpecial: false,
    minLength: false,
  });

  // Check password strength - updated to 6 characters
  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      score: password.length > 0 ? Math.min(4, Math.floor(password.length / 2)) : 0,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
      minLength: password.length >= 6,
    });
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setForm({ ...form, password });
    checkPasswordStrength(password);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setForm({ ...form, photo: null });
    setPhotoPreview(null);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (!acceptedTerms) {
      setError("You must accept the Terms of Participation to continue.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.email) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate password requirements (6 chars, uppercase, lowercase, number)
    const { hasLower, hasUpper, hasNumber, minLength } = passwordStrength;
    if (!minLength || !hasLower || !hasUpper || !hasNumber) {
      setError("Password must be at least 6 characters and contain uppercase, lowercase, and number.");
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const {
      data: userData,
      error: userFetchError,
    } = await supabase.auth.getUser();

    if (userFetchError || !userData?.user?.id) {
      setError("Could not get user after sign up.");
      setLoading(false);
      return;
    }

    const userId = userData.user.id;

    let photo_url = null;

    if (form.photo) {
      const fileExt = form.photo.name.split(".").pop();
      const filePath = `${userId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, form.photo, {
          upsert: true,
          contentType: form.photo.type,
        });

      if (uploadError) {
        console.error("Photo upload error:", uploadError.message);
        setError("Failed to upload profile photo.");
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      photo_url = urlData?.publicUrl;
    }

    const { data: existingProfile, error: fetchProfileError } = await supabase
      .from("profile")
      .select("id")
      .eq("id", userId)
      .single();

    if (fetchProfileError && fetchProfileError.code !== "PGRST116") {
      setError("Failed to check existing profile.");
      setLoading(false);
      return;
    }

    if (existingProfile) {
      const { error: updateError } = await supabase
        .from("profile")
        .update({
          full_name: form.fullName,
          email: form.email,
          photo_url,
        })
        .eq("id", userId);

      if (updateError) {
        setError("Profile update failed: " + updateError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("profile").insert([
        {
          id: userId,
          email: form.email,
          full_name: form.fullName,
          role: "fan",
          photo_url,
        },
      ]);

      if (insertError) {
        setError("Profile insert failed: " + insertError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    router.push("/auth/login");
  };

  // Get password strength color - updated for 6 chars
  const getStrengthColor = () => {
    const { hasLower, hasUpper, hasNumber, minLength } = passwordStrength;
    const checks = [hasLower, hasUpper, hasNumber, minLength].filter(Boolean).length;
    
    if (checks <= 2) return "bg-red-500";
    if (checks <= 3) return "bg-rose-500";
    return "bg-red-700";
  };

  // Get strength text - updated for 6 chars
  const getStrengthText = () => {
    const { hasLower, hasUpper, hasNumber, minLength } = passwordStrength;
    const checks = [hasLower, hasUpper, hasNumber, minLength].filter(Boolean).length;
    
    if (checks <= 2) return "Weak";
    if (checks <= 3) return "Medium";
    return "Strong";
  };

  // FIXED: Floating hearts animation variants with deterministic values
  const floatingHearts = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: (i * 13) % 90 + 5,      // Range: 5-95%
    y: (i * 17) % 90 + 5,      // Range: 5-95%
    size: (i % 3) * 8 + 12,    // Values: 12, 20, or 28
    duration: (i % 5) * 2 + 12, // Values: 12, 14, 16, 18, or 20
    delay: (i % 4) * 0.4,       // Values: 0, 0.4, 0.8, or 1.2
  }));

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
              {/* Logo - Doubled size with no padding */}
              <div className="relative w-32 h-32 md:w-36 md:h-36">
                <Image
                  src="https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/lovemateshow/logo/lovemateicon.png"
                  alt="Lovemate Show"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
              
              {/* Sparkles animation - positioned absolutely relative to logo */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-4 left-1/2 transform -translate-x-1/2"
              >
                <Sparkles className="w-5 h-5 text-rose-200" />
              </motion.div>
            </motion.div>
            
            {/* Decorative Elements - Adjusted for flush design */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />
          </div>

          {/* Form Content - Same size as before */}
          <div className="p-5 md:p-6 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-700 to-rose-600 bg-clip-text text-transparent">
                Create Account
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Join the ultimate love experience</p>
            </motion.div>

            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Full Name - FIXED with id, name, and htmlFor */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="fullName" className="block text-xs font-medium text-gray-600 mb-1 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 md:px-4 md:py-3 bg-rose-50/50 border border-rose-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-red-700 focus:border-transparent transition-all outline-none placeholder:text-gray-400"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                />
              </motion.div>

              {/* Email - FIXED with id, name, and htmlFor */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
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

              {/* Profile Photo Upload */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label htmlFor="photo-upload" className="block text-xs font-medium text-gray-600 mb-1 ml-1">
                  Profile Picture
                </label>
                
                {!photoPreview ? (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-upload"
                      name="photo"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="flex items-center justify-center gap-2 w-full px-3.5 py-2.5 md:px-4 md:py-3 bg-gradient-to-r from-red-700/10 to-rose-600/10 border-2 border-dashed border-rose-300 rounded-xl text-red-700 hover:border-red-700 hover:bg-red-50/50 transition-all cursor-pointer group"
                    >
                      <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">Upload Photo</span>
                    </label>
                  </div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-3 p-2 bg-rose-50 rounded-xl border border-rose-200"
                  >
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-red-700">
                      <Image
                        src={photoPreview}
                        alt="Profile preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{form.photo?.name}</p>
                      <p className="text-[10px] text-gray-500">
                        {(form.photo?.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="p-1.5 hover:bg-rose-200 rounded-full transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-red-700" />
                    </button>
                  </motion.div>
                )}
              </motion.div>

              {/* Password - FIXED with id, name, and htmlFor */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1 ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Create a strong password"
                    className="w-full px-3.5 py-2.5 md:px-4 md:py-3 bg-rose-50/50 border border-rose-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-red-700 focus:border-transparent transition-all outline-none pr-10"
                    value={form.password}
                    onChange={handlePasswordChange}
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

                {/* Password Strength Indicator */}
                <AnimatePresence>
                  {form.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 space-y-1.5"
                    >
                      {/* Strength Bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-rose-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                            className={`h-full ${getStrengthColor()}`}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-gray-600">
                          {getStrengthText()}
                        </span>
                      </div>

                      {/* Requirements Grid */}
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <div className="flex items-center gap-1">
                          {passwordStrength.minLength ? (
                            <Check className="w-2.5 h-2.5 text-green-500" />
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full border border-gray-300" />
                          )}
                          <span className="text-gray-600">6+ chars</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {passwordStrength.hasLower ? (
                            <Check className="w-2.5 h-2.5 text-green-500" />
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full border border-gray-300" />
                          )}
                          <span className="text-gray-600">Lowercase</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {passwordStrength.hasUpper ? (
                            <Check className="w-2.5 h-2.5 text-green-500" />
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full border border-gray-300" />
                          )}
                          <span className="text-gray-600">Uppercase</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {passwordStrength.hasNumber ? (
                            <Check className="w-2.5 h-2.5 text-green-500" />
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full border border-gray-300" />
                          )}
                          <span className="text-gray-600">Number</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Confirm Password - FIXED with id, name, and htmlFor */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-600 mb-1 ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    className="w-full px-3.5 py-2.5 md:px-4 md:py-3 bg-rose-50/50 border border-rose-200 rounded-xl text-sm text-gray-800 focus:ring-2 focus:ring-red-700 focus:border-transparent transition-all outline-none pr-10"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-red-700 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Match Indicator */}
                <AnimatePresence>
                  {form.confirmPassword && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-1"
                    >
                      {form.password === form.confirmPassword ? (
                        <p className="text-[10px] text-green-600 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Passwords match
                        </p>
                      ) : (
                        <p className="text-[10px] text-red-500">Passwords do not match</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Terms Acceptance - FIXED with id, name, and htmlFor */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
              >
                <label htmlFor="terms" className="flex items-start gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      id="terms"
                      name="terms"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="w-4 h-4 opacity-0 absolute cursor-pointer"
                    />
                    <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all ${
                      acceptedTerms 
                        ? 'bg-red-700 border-red-700' 
                        : 'border-rose-300 group-hover:border-red-700'
                    }`}>
                      {acceptedTerms && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-600 leading-tight">
                    I agree to the{' '}
                    <Link 
                      href="/termsofparticipation" 
                      className="text-red-700 font-semibold hover:text-rose-600 hover:underline transition-colors"
                      target="_blank"
                    >
                      Terms of Participation
                    </Link>
                  </span>
                </label>
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
                disabled={loading || !acceptedTerms}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-2.5 md:py-3 rounded-xl font-semibold text-white shadow-lg transition-all relative overflow-hidden group ${
                  loading || !acceptedTerms
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
                    <span className="text-sm">Creating...</span>
                  </div>
                ) : (
                  <span className="text-sm relative z-10">Create Account</span>
                )}
              </motion.button>

              {/* Login Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-center pt-1"
              >
                <p className="text-[11px] text-gray-500">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="text-red-700 font-semibold hover:text-rose-600 hover:underline transition-colors"
                  >
                    Sign In
                  </Link>
                </p>
              </motion.div>

              {/* Security Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
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