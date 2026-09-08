import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import CandidateWindow from "../components/CandidateWindow";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Shield, Heart, Sparkles, Crown, Star, Users, UserCog } from "lucide-react";

// Import dashboard components
import ProfileHeader from "../components/dashboard/ProfileHeader";
import WalletCard from "../components/dashboard/WalletCard";
import RankCard from "../components/dashboard/RankCard";
import TransactionsList from "../components/dashboard/TransactionsList";
import SettingsPanel from "../components/dashboard/SettingsPanel";
import FundWalletModal from "../components/dashboard/FundWalletModal";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("/placeholder-profile.png");
  const [walletBalance, setWalletBalance] = useState(0);
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [showFundModal, setShowFundModal] = useState(false);
  
  // New state for director access
  const [isDirector, setIsDirector] = useState(false);
  const [checkingDirector, setCheckingDirector] = useState(true);

  // New state for rank data
  const [rankData, setRankData] = useState({
    points: 0,
    totalVotes: 0,
    totalGifts: 0,
    userRank: 0,
    totalUsers: 0
  });

  // New state for profile stats (votes and gifts)
  const [profileStats, setProfileStats] = useState({
    votesCount: 0,
    votesWorth: 0,
    giftsCount: 0,
    giftsWorth: 0,
    loading: true
  });

  // Progressive Onboarding States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [isCandidate, setIsCandidate] = useState(false);

  // Check if current user is a director
  const checkDirectorStatus = async (userId) => {
    try {
      setCheckingDirector(true);
      
      const { data, error } = await supabase
        .from("lovemate")
        .select("directors_id")
        .maybeSingle();

      if (error) {
        console.error("Error fetching directors list:", error);
        setIsDirector(false);
        return;
      }

      if (data?.directors_id && Array.isArray(data.directors_id)) {
        const hasAccess = data.directors_id.includes(userId);
        setIsDirector(hasAccess);
        
        if (hasAccess) {
          console.log("👑 User is a director - showing dashboard link");
        }
      } else {
        setIsDirector(false);
      }
    } catch (err) {
      console.error("Error checking director status:", err);
      setIsDirector(false);
    } finally {
      setCheckingDirector(false);
    }
  };

  // Check if user is a candidate
  const checkCandidateStatus = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("candidates")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error checking candidate status:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };

  // Check if user has seen onboarding
  const checkOnboardingStatus = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profile")
        .select("has_seen_onboarding")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error checking onboarding status:", error);
        return false;
      }

      return data?.has_seen_onboarding || false;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };

  // Update onboarding status
  const updateOnboardingStatus = async (userId) => {
    try {
      const { error } = await supabase
        .from("profile")
        .update({ has_seen_onboarding: true })
        .eq("id", userId);

      if (error) {
        console.error("Error updating onboarding status:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };

  const fetchWallet = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching wallet:", error);
        return null;
      }
      return data;
    } catch (error) {
      console.error("Error in fetchWallet:", error);
      return null;
    }
  };

  // Fetch user stats for profile header
  const fetchUserStats = async (profileId) => {
    if (!profileId) return;

    try {
      setProfileStats(prev => ({ ...prev, loading: true }));

      // Fetch vote transactions
      const { data: votesData, error: votesError } = await supabase
        .from("vote_transactions")
        .select("votes, total_amount")
        .eq("user_id", profileId);

      if (votesError) {
        console.error("Error fetching votes:", votesError);
      }

      // Fetch gift transactions
      const { data: giftsData, error: giftsError } = await supabase
        .from("gift_transactions")
        .select("amount, created_at")
        .eq("user_id", profileId);

      if (giftsError) {
        console.error("Error fetching gifts:", giftsError);
      }

      // Calculate vote stats
      const votesCount = votesData?.reduce((sum, transaction) => sum + (transaction.votes || 0), 0) || 0;
      const votesWorth = votesData?.reduce((sum, transaction) => sum + (transaction.total_amount || 0), 0) || 0;

      // Calculate gift stats
      const giftsCount = giftsData?.length || 0;
      const giftsWorth = giftsData?.reduce((sum, transaction) => sum + (transaction.amount || 0), 0) || 0;

      setProfileStats({
        votesCount,
        votesWorth,
        giftsCount,
        giftsWorth,
        loading: false
      });

    } catch (error) {
      console.error("Error fetching user stats:", error);
      setProfileStats(prev => ({ ...prev, loading: false }));
    }
  };

  // Fetch rank data
  const fetchRankData = async (profileId) => {
    if (!profileId) return;

    try {
      const points = profile?.points || 0;
      
      const { data: voteData, error: voteError } = await supabase
        .from('vote_transactions')
        .select('votes')
        .eq('user_id', profileId);
      
      if (voteError) {
        console.error("Error fetching vote data:", voteError);
      }
      
      const totalVotes = voteData?.reduce((sum, item) => sum + (item.votes || 0), 0) || 0;
      
      const { data: giftsData, error: giftError } = await supabase
        .from('gift_transactions')
        .select('id, amount')
        .eq('user_id', profileId);
      
      if (giftError) {
        console.error("Error fetching gift data:", giftError);
      }
      
      const totalGifts = giftsData?.length || 0;
      
      const { data: allUsers, error: usersError } = await supabase
        .from('profile')
        .select('id, points')
        .order('points', { ascending: false });
      
      if (usersError) {
        console.error("Error fetching users for ranking:", usersError);
      } else {
        const userRank = allUsers.findIndex(u => u.id === profileId) + 1;
        const totalUsers = allUsers.length;
        
        setRankData({
          points,
          totalVotes,
          totalGifts,
          userRank,
          totalUsers
        });
      }
    } catch (err) {
      console.error("Error in fetchRankData:", err);
    }
  };

  // Generate random positions for floating hearts
  const getRandomPosition = () => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: 12 + Math.random() * 25,
    duration: 12 + Math.random() * 20,
    delay: Math.random() * 15,
    rotation: Math.random() * 360
  });

  const floatingHearts = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    ...getRandomPosition(),
    isBroken: i % 3 === 0
  }));

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      fetchRankData(profile.id);
      fetchUserStats(profile.id);
    }
  }, [profile]);

  // Initialize onboarding when profile loads - ONLY ONCE
  useEffect(() => {
    const initializeOnboarding = async () => {
      if (profile?.id && !onboardingChecked) {
        // Check if user is a candidate
        const isUserCandidate = await checkCandidateStatus(profile.id);
        setIsCandidate(isUserCandidate);
        
        // Check if user has seen onboarding
        const hasSeen = await checkOnboardingStatus(profile.id);
        setHasSeenOnboarding(hasSeen);
        setOnboardingChecked(true);
        
        // Skip onboarding for candidates
        if (isUserCandidate) {
          console.log("🎯 User is a candidate - skipping onboarding");
          return;
        }
        
        // Skip onboarding if already seen
        if (hasSeen) {
          console.log("🎯 User has already seen onboarding - skipping");
          return;
        }
        
        // Show onboarding after a short delay
        setTimeout(() => {
          setShowOnboarding(true);
          // If user is admin, start with admin welcome step
          if (profile?.role === 'admin') {
            setOnboardingStep(5); // Admin step
          } else {
            setOnboardingStep(0); // Regular user step
          }
        }, 500);
      }
    };

    initializeOnboarding();
  }, [profile?.id, onboardingChecked]);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setTransactions(data);
      }
    };

    fetchTransactions();
  }, [profile]);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        router.push("/auth/login");
        return;
      }

      const { data: fetchedProfile, error: profileError } = await supabase
        .from("profile")
        .select("id, email, role, photo_url, full_name, phone, points, has_seen_onboarding")
        .eq("id", authUser.id)
        .maybeSingle();

      if (profileError || !fetchedProfile || fetchedProfile.role !== "fan") {
        console.error("Profile fetch error:", profileError);
        router.push("/auth/login");
        return;
      }

      setUser(authUser);
      setProfile(fetchedProfile);
      if (fetchedProfile.photo_url) {
        setAvatarUrl(fetchedProfile.photo_url);
      }

      // Check if user is a director
      await checkDirectorStatus(authUser.id);

      setLoading(false);
    };

    fetchData();
  }, [router]);

  // Fetch wallet balance
  useEffect(() => {
    if (user?.id) {
      fetchWallet(user.id).then((data) => {
        if (data) {
          setWalletBalance(data.balance || 0);
        }
      });

      const interval = setInterval(() => {
        fetchWallet(user.id).then((data) => {
          if (data) {
            setWalletBalance(data.balance || 0);
          }
        });
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // Listen for payment redirect
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      localStorage.getItem("wallet_updated") === "true" &&
      user?.id
    ) {
      fetchWallet(user.id).then((data) => {
        if (data) {
          setWalletBalance(data.balance || 0);
        }
      });
      localStorage.removeItem("wallet_updated");
    }
  }, [user]);

  // Subscribe to wallet updates
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel("realtime-wallets")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "wallets",
          filter: `user_id=eq.${profile.id}`,
        },
        async () => {
          const { data, error } = await supabase
            .from("wallets")
            .select("balance")
            .eq("user_id", profile.id)
            .maybeSingle();

          if (!error && data) {
            setWalletBalance(data.balance || 0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  const handleUpload = async (file) => {
    if (!file || !profile) return;

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("Only JPG and PNG files are allowed.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Image is too large. Please upload a file less than 5MB.");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${profile.id}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      alert("Upload failed. Please try again.");
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData?.publicUrl;

    const { error: updateError } = await supabase
      .from("profile")
      .update({ photo_url: publicUrl })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Error updating profile photo URL:", updateError.message);
      alert("Failed to update your profile with the image URL.");
      return;
    }

    setAvatarUrl(publicUrl);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
      setMessage("User not authenticated");
      return;
    }

    setLoading(true);
    setMessage("");

    const updates = {
      id: user.id,
      full_name: fullName.trim(),
      phone: phone.trim(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from("profile").upsert(updates, {
        returning: "minimal",
      });

      if (error) {
        console.error("Profile update error:", error.message);
        setMessage("❌ Failed to update profile");
      } else {
        setMessage("✅ Profile updated successfully!");
        setProfile((prev) => ({
          ...prev,
          full_name: fullName,
          phone: phone,
        }));
      }
    } catch (err) {
      console.error("Unexpected update error:", err);
      setMessage("⚠️ An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Onboarding Handlers
  const handleOnboardingNext = () => {
    setOnboardingStep(prev => prev + 1);
  };

  const handleOnboardingChoice = (choice) => {
    if (choice === 'contest') {
      setOnboardingStep(2);
    } else if (choice === 'fan') {
      setOnboardingStep(3);
    }
  };

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    
    if (profile?.id) {
      const updated = await updateOnboardingStatus(profile.id);
      
      if (updated) {
        setHasSeenOnboarding(true);
        setOnboardingChecked(true);
        
        // Update the profile state
        setProfile(prev => ({
          ...prev,
          has_seen_onboarding: true
        }));
      }
    }
  };

  const handleAdminOnboardingComplete = async () => {
    setShowOnboarding(false);
    
    if (profile?.id) {
      const updated = await updateOnboardingStatus(profile.id);
      
      if (updated) {
        setHasSeenOnboarding(true);
        setOnboardingChecked(true);
        
        // Update the profile state
        setProfile(prev => ({
          ...prev,
          has_seen_onboarding: true
        }));
      }
    }
  };

  const handleContestRegistration = () => {
    setShowOnboarding(false);
    router.push('/register');
  };

  // Get first name from full name
  const getFirstName = (fullName) => {
    if (!fullName) return "User";
    return fullName.split(' ')[0];
  };

  // Onboarding Popup Component
  const OnboardingPopup = () => {
    const firstName = getFirstName(profile?.full_name);

    const renderStep = () => {
      switch(onboardingStep) {
        // STEP 0: Welcome Popup
        case 0:
          return (
            <motion.div
              key="step0"
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="text-center relative z-10"
            >
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <Heart className="w-14 h-14 text-white" fill="#fff" />
                  <Sparkles className="w-6 h-6 text-white/80 absolute -top-2 -right-2 animate-pulse" />
                </div>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                Welcome to <span className="text-white/90">Lovemate</span>
              </h2>
              <p className="text-white/90 text-sm md:text-base mb-5 leading-relaxed">
                Where passion, fame, and true connection collides. ✨
              </p>
              <button
                onClick={handleOnboardingNext}
                className="w-full bg-white text-rose-600 py-2.5 px-6 rounded-xl font-semibold text-sm md:text-base hover:shadow-2xl transition-all transform hover:scale-105"
              >
                Thank You ❤️
              </button>
            </motion.div>
          );
        
        // STEP 1: Choice Popup
        case 1:
          return (
            <motion.div
              key="step1"
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="text-center relative z-10"
            >
              <div className="flex justify-center mb-3">
                <Users className="w-14 h-14 text-white" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white mb-2">
                What brings you to Lovemate?
              </h2>
              <p className="text-white/90 text-sm md:text-base mb-5 leading-relaxed">
                Would you love to become one of the housemates for this edition or are you here to support someone?
              </p>
              <div className="space-y-2.5">
                <button
                  onClick={() => handleOnboardingChoice('contest')}
                  className="w-full bg-white text-rose-600 py-2.5 px-6 rounded-xl font-semibold text-sm md:text-base hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  <Crown className="inline-block w-4 h-4 mr-2" />
                  I Am Here to Contest
                </button>
                <button
                  onClick={() => handleOnboardingChoice('fan')}
                  className="w-full bg-white/20 backdrop-blur-sm text-white border-2 border-white/50 py-2.5 px-6 rounded-xl font-semibold text-sm md:text-base hover:bg-white/30 transition-all transform hover:scale-105"
                >
                  <Star className="inline-block w-4 h-4 mr-2" />
                  I Am Just a Fan
                </button>
              </div>
            </motion.div>
          );
        
        // STEP 2: Contest Registration Popup
        case 2:
          return (
            <motion.div
              key="step2"
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="text-center relative z-10"
            >
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <Crown className="w-14 h-14 text-white" />
                  <Sparkles className="w-6 h-6 text-white/80 absolute -top-2 -right-2 animate-pulse" />
                </div>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white mb-2">
                That Was a Good Decision, <span className="text-white/90">{firstName}</span>! 🎯
              </h2>
              <p className="text-white/90 text-sm md:text-base mb-5 leading-relaxed">
                Now click the button below to complete your registration.
                Make sure you provide all required information and be genuine, okay? 💪
              </p>
              <button
                onClick={handleContestRegistration}
                className="w-full bg-white text-rose-600 py-2.5 px-6 rounded-xl font-semibold text-sm md:text-base hover:shadow-2xl transition-all transform hover:scale-105"
              >
                Understood! Let's Go 🚀
              </button>
            </motion.div>
          );

        // STEP 3: Fan Welcome Popup
        case 3:
          return (
            <motion.div
              key="step3"
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="text-center relative z-10"
            >
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <Star className="w-14 h-14 text-white" />
                  <Sparkles className="w-6 h-6 text-white/80 absolute -top-2 -right-2 animate-pulse" />
                </div>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white mb-2">
                I Am So Happy You'll Be Supporting Someone on This Show! 🎉
              </h2>
              <p className="text-white/90 text-sm md:text-base mb-5 leading-relaxed">
                Kindly note that there are lots of goodies for fans on this show.
                You're in for an amazing experience! 🌟
              </p>
              <button
                onClick={handleOnboardingNext}
                className="w-full bg-white text-rose-600 py-2.5 px-6 rounded-xl font-semibold text-sm md:text-base hover:shadow-2xl transition-all transform hover:scale-105"
              >
                Yes, I Know! 💫
              </button>
            </motion.div>
          );

        // STEP 4: Final Welcome Popup
        case 4:
          return (
            <motion.div
              key="step4"
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="text-center relative z-10"
            >
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <Heart className="w-14 h-14 text-white" fill="#fff" />
                  <Sparkles className="w-6 h-6 text-white/80 absolute -top-2 -right-2 animate-pulse" />
                </div>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white mb-2">
                Once Again, Welcome Aboard, {firstName}! 🎊
              </h2>
              <p className="text-white/90 text-sm md:text-base mb-5 leading-relaxed">
                Expect maximum entertainment as we progress into the show.
                Let the love and excitement begin! 💖
              </p>
              <button
                onClick={handleOnboardingComplete}
                className="w-full bg-white text-rose-600 py-2.5 px-6 rounded-xl font-semibold text-sm md:text-base hover:shadow-2xl transition-all transform hover:scale-105"
              >
                Got It! Let's Enjoy the Show 🎭
              </button>
            </motion.div>
          );

        // STEP 5: Admin Welcome Popup
        case 5:
          return (
            <motion.div
              key="step5"
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="text-center relative z-10"
            >
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <UserCog className="w-14 h-14 text-white" />
                  <Sparkles className="w-6 h-6 text-white/80 absolute -top-2 -right-2 animate-pulse" />
                </div>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white mb-2">
                Welcome, <span className="text-white/90">{firstName}</span>! 👋
              </h2>
              <p className="text-white/90 text-sm md:text-base mb-5 leading-relaxed">
                I can see you are an admin. That's a huge responsibility and I hope you work to make sure that this show becomes one of the most anticipated lover reality shows in Africa. 🌍
              </p>
              <button
                onClick={handleAdminOnboardingComplete}
                className="w-full bg-white text-rose-600 py-2.5 px-6 rounded-xl font-semibold text-sm md:text-base hover:shadow-2xl transition-all transform hover:scale-105"
              >
                I Understand 🙌
              </button>
            </motion.div>
          );

        default:
          return null;
      }
    };

    return (
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            {/* Blurred Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-sm pointer-events-auto z-10">
              {/* Vibrant Pink/Crimson Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-2xl shadow-2xl overflow-hidden">
                {/* Floating Hearts in Background */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {floatingHearts.map((heart) => (
                    <motion.div
                      key={heart.id}
                      className="absolute opacity-25"
                      style={{
                        top: `${heart.top}%`,
                        left: `${heart.left}%`,
                        width: `${heart.size}px`,
                        height: `${heart.size}px`,
                      }}
                      animate={{
                        y: [0, -30, 0, 30, 0],
                        x: [0, 15, 0, -15, 0],
                        rotate: [0, heart.rotation, 360],
                      }}
                      transition={{
                        duration: heart.duration,
                        delay: heart.delay,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      {heart.isBroken ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-full h-full text-white/20"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          <path d="M12 14.5l-3-3 3-3 3 3-3 3z" fill="white" opacity="0.3" />
                          <path d="M9 11.5l3-3 3 3-3 3-3-3z" fill="white" opacity="0.5" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-full h-full text-white/20"
                        >
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Subtle Pattern Overlay */}
                <div className="absolute inset-0 opacity-5" style={{
                  backgroundImage: `radial-gradient(circle at 20px 20px, white 1px, transparent 1px)`,
                  backgroundSize: '40px 40px'
                }} />
              </div>

              {/* Content */}
              <div className="relative p-5 md:p-6">
                {renderStep()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  if (loading || checkingDirector) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-rose-50 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full"
          />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-rose-50 py-0 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Reduced space between Header and Dashboard Content */}
          <div className="w-full h-2 md:h-3"></div>

          {/* Director's Dashboard Link - Show if user is a director */}
          {isDirector && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-3 md:mb-4"
            >
              <Link
                href="/directors"
                className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg shadow-md hover:from-red-700 hover:to-rose-700 transition-all group"
              >
                <Shield className="w-3 h-3 md:w-4 md:h-4 group-hover:scale-110 transition-transform" />
                <span className="text-xs md:text-sm font-semibold">Go To Director's Dashboard</span>
              </Link>
            </motion.div>
          )}

          {/* Profile Header */}
          <ProfileHeader 
            profile={profile} 
            avatarUrl={avatarUrl} 
            onUpload={handleUpload}
            stats={profileStats}
          />

          {/* Mobile Layout: Candidate Window after Profile with reduced spacing */}
          <div className="lg:hidden">
            {/* Spacer between Profile and Candidate Window */}
            <div className="w-full h-3"></div>
            <div className="h-auto min-h-[400px]">
              <CandidateWindow profileId={profile?.id} />
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 md:gap-6 mt-2 md:mt-3">
            {/* Left Column - Wallet & Rank stacked */}
            <div className="lg:col-span-5 space-y-3 md:space-y-4">
              <WalletCard 
                balance={walletBalance} 
                onFundClick={() => setShowFundModal(true)} 
              />
              <RankCard 
                profileId={profile?.id}
                points={rankData.points}
                totalVotes={rankData.totalVotes}
                totalGifts={rankData.totalGifts}
                userRank={rankData.userRank}
                totalUsers={rankData.totalUsers}
              />
            </div>

            {/* Right Column - Candidate Window (Desktop only) */}
            <div className="lg:col-span-7">
              <div className="h-full flex items-stretch">
                <CandidateWindow profileId={profile?.id} />
              </div>
            </div>
          </div>

          {/* Mobile Layout: Wallet & Rank after Candidate Window with small gap */}
          <div className="lg:hidden">
            {/* Small spacer between Candidate Window and Wallet */}
            <div className="w-full h-2"></div>
            <div className="space-y-3">
              <WalletCard 
                balance={walletBalance} 
                onFundClick={() => setShowFundModal(true)} 
              />
              <RankCard 
                profileId={profile?.id}
                points={rankData.points}
                totalVotes={rankData.totalVotes}
                totalGifts={rankData.totalGifts}
                userRank={rankData.userRank}
                totalUsers={rankData.totalUsers}
              />
            </div>
          </div>

          {/* Bottom Grid - Transactions List only */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 md:gap-4 mt-3 md:mt-4">
            <TransactionsList transactions={transactions} />
          </div>

          {/* Settings Panel */}
          <div className="mt-3 md:mt-4">
            <SettingsPanel
              fullName={fullName}
              setFullName={setFullName}
              phone={phone}
              setPhone={setPhone}
              onUpdate={handleUpdate}
              loading={loading}
              message={message}
            />
          </div>
        </div>
      </main>

      {/* Fund Wallet Modal */}
      <FundWalletModal
        isOpen={showFundModal}
        onClose={() => setShowFundModal(false)}
        user={user}
      />

      {/* Onboarding Popup */}
      <OnboardingPopup />

      <Footer />
    </>
  );
}