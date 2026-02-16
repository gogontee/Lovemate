import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import CandidateWindow from "../components/CandidateWindow";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

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
  const [amountToFund, setAmountToFund] = useState("");
  const [showFundModal, setShowFundModal] = useState(false);

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

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
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
        .select("id, email, role, photo_url, full_name, phone")
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
  };

  const handlePayNow = async () => {
    if (!amountToFund) {
      alert("Please enter an amount");
      return;
    }

    try {
      const response = await fetch("/api/fund-wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amountToFund),
          email: user.email,
          user_id: user.id,
          redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/wallet/callback`,
        }),
      });

      const data = await response.json();

      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert("Payment initialization failed: " + (data?.error || "Unknown"));
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong. Try again later.");
    }
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

  if (loading) {
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
          {/* Profile Header */}
          <ProfileHeader 
            profile={profile} 
            avatarUrl={avatarUrl} 
            onUpload={handleUpload}
          />

          {/* Desktop Layout - 2 column grid with left column stacked and right column for candidate */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 mt-4 md:mt-8">
            {/* Left Column - Wallet & Rank stacked (takes 5 columns) */}
            <div className="lg:col-span-5 space-y-4 md:space-y-6">
              <WalletCard 
                balance={walletBalance} 
                onFundClick={() => setShowFundModal(true)} 
              />
              <RankCard />
            </div>

            {/* Right Column - Candidate Window (takes 7 columns) - Flushed with left column height */}
            <div className="lg:col-span-7">
              <div className="h-full flex items-stretch">
                <CandidateWindow profileId={profile?.id} />
              </div>
            </div>
          </div>

          {/* Bottom Grid - 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
            <TransactionsList transactions={transactions} />
            <NotificationsPanel />
          </div>

          {/* Settings Panel - Full width */}
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

      {/* Fund Wallet Modal */}
      <FundWalletModal
        isOpen={showFundModal}
        onClose={() => setShowFundModal(false)}
        onConfirm={(amount) => {
          setAmountToFund(amount);
          handlePayNow();
        }}
      />

      <Footer />
    </>
  );
}