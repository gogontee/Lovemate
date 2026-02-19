import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import CandidateWindow from "../components/CandidateWindow";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import Link from "next/link";
import { Shield } from "lucide-react";

// Import dashboard components
import ProfileHeader from "../components/dashboard/ProfileHeader";
import WalletCard from "../components/dashboard/WalletCard";
import RankCard from "../components/dashboard/RankCard";
import TransactionsList from "../components/dashboard/TransactionsList";
import NotificationsPanel from "../components/dashboard/NotificationsPanel";
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
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  
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

  // Check if current user is a director
  const checkDirectorStatus = async (userId) => {
    try {
      setCheckingDirector(true);
      
      // Fetch directors_id from lovemate table
      const { data, error } = await supabase
        .from("lovemate")
        .select("directors_id")
        .single();

      if (error) {
        console.error("Error fetching directors list:", error);
        setIsDirector(false);
        return;
      }

      // Check if directors_id exists and is an array
      if (data?.directors_id && Array.isArray(data.directors_id)) {
        // Check if current user ID is in the directors array
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

  // Function to create notification
  const createNotification = async (userId, notificationData) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          data: notificationData.data || {}
        }]);

      if (error) {
        console.error('Error creating notification:', error);
      }
    } catch (err) {
      console.error('Failed to create notification:', err);
    }
  };

  // Function to fetch unread notifications count
  const fetchUnreadCount = async (userId) => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)
        .eq('dismissed', false);

      if (error) throw error;
      setUnreadNotificationsCount(count || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const fetchWallet = async (userId) => {
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching wallet:", error);
      return null;
    }
    return data;
  };

  // Fetch user stats for profile header
  const fetchUserStats = async (profileId) => {
    if (!profileId) return;

    try {
      setProfileStats(prev => ({ ...prev, loading: true }));

      console.log("🔍 Fetching stats for user:", profileId);

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

      console.log("📦 Gifts data received:", giftsData);

      // Calculate vote stats
      const votesCount = votesData?.reduce((sum, transaction) => sum + (transaction.votes || 0), 0) || 0;
      const votesWorth = votesData?.reduce((sum, transaction) => sum + (transaction.total_amount || 0), 0) || 0;

      // Calculate gift stats
      const giftsCount = giftsData?.length || 0;
      const giftsWorth = giftsData?.reduce((sum, transaction) => sum + (transaction.amount || 0), 0) || 0;

      console.log("📊 Profile Stats calculated:", {
        votesCount,
        votesWorth,
        giftsCount,
        giftsWorth
      });

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
      // Get user's points from profile
      const points = profile?.points || 0;
      
      // Get SUM of votes from vote_transactions
      const { data: voteData, error: voteError } = await supabase
        .from('vote_transactions')
        .select('votes')
        .eq('user_id', profileId);
      
      if (voteError) {
        console.error("Error fetching vote data:", voteError);
      }
      
      // Calculate total votes by summing the votes column
      const totalVotes = voteData?.reduce((sum, item) => sum + (item.votes || 0), 0) || 0;
      
      // Get total gifts data
      const { data: giftsData, error: giftError } = await supabase
        .from('gift_transactions')
        .select('id, amount')
        .eq('user_id', profileId);
      
      if (giftError) {
        console.error("Error fetching gift data:", giftError);
      }
      
      // Calculate total gifts count from actual data
      const totalGifts = giftsData?.length || 0;
      
      // Get user's rank based on points
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
        
        console.log("📊 Rank Data:", { points, totalVotes, totalGifts, userRank, totalUsers });
      }
    } catch (err) {
      console.error("Error in fetchRankData:", err);
    }
  };

  // Listen for real-time notifications
  useEffect(() => {
    if (!profile?.id) return;

    // Subscribe to new notifications
    const notificationChannel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`
        },
        (payload) => {
          console.log('🔔 New notification received:', payload);
          // Update unread count
          setUnreadNotificationsCount(prev => prev + 1);
          
          // Show browser notification if permitted
          if (Notification.permission === 'granted') {
            new Notification(payload.new.title, {
              body: payload.new.message,
              icon: '/notification-icon.png'
            });
          }
        }
      )
      .subscribe();

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, [profile?.id]);

  // Fetch unread count periodically
  useEffect(() => {
    if (!profile?.id) return;

    fetchUnreadCount(profile.id);
    
    const interval = setInterval(() => {
      fetchUnreadCount(profile.id);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [profile?.id]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      fetchRankData(profile.id);
      fetchUserStats(profile.id);
    }
  }, [profile]);

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
        .select("id, email, role, photo_url, full_name, phone, points")
        .eq("id", authUser.id)
        .single();

      if (profileError || !fetchedProfile || fetchedProfile.role !== "fan") {
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

      // Create welcome notification for new users (check if first login)
      const lastLogin = localStorage.getItem(`last_login_${authUser.id}`);
      if (!lastLogin) {
        createNotification(authUser.id, {
          type: 'alert',
          title: 'Welcome to the Platform! 🎉',
          message: 'Thanks for joining! Start by exploring candidates and casting your votes.',
          data: { action: 'explore' }
        });
        localStorage.setItem(`last_login_${authUser.id}`, new Date().toISOString());
      }

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
          
          // Create notification for successful funding
          createNotification(user.id, {
            type: 'promo',
            title: 'Wallet Funded Successfully! 💰',
            message: `Your wallet has been funded with ₦${data.balance?.toLocaleString() || '0'}`,
            data: { action: 'view_wallet' }
          });
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
            .from("wallet_summary")
            .select("balance")
            .eq("user_id", profile.id)
            .maybeSingle();

          if (!error) {
            setWalletBalance(data?.balance || 0);
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
    
    // Create notification for profile update
    createNotification(profile.id, {
      type: 'alert',
      title: 'Profile Updated',
      message: 'Your profile photo has been successfully updated!',
      data: { action: 'view_profile' }
    });
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
        
        // Create notification for profile update
        createNotification(user.id, {
          type: 'alert',
          title: 'Profile Updated',
          message: 'Your profile information has been successfully updated!',
          data: { action: 'view_profile' }
        });
      }
    } catch (err) {
      console.error("Unexpected update error:", err);
      setMessage("⚠️ An unexpected error occurred");
    } finally {
      setLoading(false);
    }
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
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-rose-50 py-6 md:py-8 lg:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Director's Dashboard Link - Show if user is a director */}
          {isDirector && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <Link
                href="/directors"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg shadow-md hover:from-red-700 hover:to-rose-700 transition-all group"
              >
                <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold">Go To Director's Dashboard</span>
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

          {/* Desktop Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mt-4 md:mt-8">
            {/* Left Column - Wallet & Rank stacked */}
            <div className="lg:col-span-5 space-y-4 md:space-y-6">
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

            {/* Right Column - Candidate Window */}
            <div className="lg:col-span-7">
              <div className="h-full flex items-stretch">
                <CandidateWindow profileId={profile?.id} />
              </div>
            </div>
          </div>

          {/* Bottom Grid - 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
            <TransactionsList transactions={transactions} />
            {/* Pass userId and unread count to NotificationsPanel */}
            <NotificationsPanel 
              userId={profile?.id}
              initialUnreadCount={unreadNotificationsCount}
            />
          </div>

          {/* Settings Panel */}
          <div className="mt-4 md:mt-6">
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

      {/* Fund Wallet Modal - Updated to pass user object directly */}
      <FundWalletModal
        isOpen={showFundModal}
        onClose={() => setShowFundModal(false)}
        user={user} // Pass the user object directly
      />

      <Footer />
    </>
  );
}