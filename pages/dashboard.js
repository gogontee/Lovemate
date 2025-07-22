// pages/dashboard.js
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import Image from "next/image";
import {
  UserCircle,
  Wallet,
  Settings,
  LogOut,
  Star,
  Bell,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("/placeholder-profile.png");
  const [walletBalance, setWalletBalance] = useState(0);
  const fileInputRef = useRef(null);
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("update");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

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
        .select("id, email, role, photo_url, full_name")
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
  const fetchWallet = async () => {
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user?.id)
      .single();

    if (!error) {
      setWallet(data.balance);
    }
  };

  fetchWallet();

  // Optional: auto-refresh every 30 seconds
  const interval = setInterval(fetchWallet, 30000);

  return () => clearInterval(interval); // cleanup
}, [user?.id]);

// 3. Second useEffect: listen for payment redirect
useEffect(() => {
  if (typeof window !== "undefined" && localStorage.getItem("wallet_updated") === "true") {
    fetchWallet();
    localStorage.removeItem("wallet_updated");
  }
}, []);



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
            .single();

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

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


  const [showFundModal, setShowFundModal] = useState(false);
const [fundAmount, setFundAmount] = useState("");

const handleFundWallet = () => {
  setShowFundModal(true);
};

const handlePayNow = async () => {
  if (!fundAmount || isNaN(fundAmount) || fundAmount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  const response = await fetch("/api/fund-wallet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: fundAmount,
      email: profile.email,
      user_id: profile.id,
    }),
  });

  const data = await response.json();

  if (data?.url) {
    window.location.href = data.url;
  } else {
    alert("Unable to initiate payment");
  }
};


  if (loading) return <div className="text-center p-20">Loading...</div>;
  if (!profile) return null;

  const handleUpdate = async (e) => {
  e.preventDefault();

  if (!user || !user.id) {
    setMessage("User not authenticated");
    console.error("User not authenticated");
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
      returning: "minimal", // Faster, only updates without returning row
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

 return (
  <>
    <Header />
    <section className="min-h-screen bg-rose-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="relative w-24 h-24">
  <Image
    src={avatarUrl || "/default-avatar.png"}
    alt="Profile"
    fill
    className="rounded-full border object-cover"
  />

  {/* Hidden File Input */}
  <input
    type="file"
    accept="image/png, image/jpeg"
    ref={fileInputRef}
    onChange={(e) => {
      const file = e.target.files[0];
      if (!file) return;

      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        alert("Only JPG and PNG files are allowed.");
        return;
      }

      handleUpload(file); // Make sure this function accepts `file` as a parameter
    }}
    className="hidden"
  />

  {/* Upload Button */}
  <button
    type="button"
    className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow"
    onClick={() => fileInputRef.current?.click()}
  >
    📷
  </button>
</div>

            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Welcome back</h2>
              <p className="text-sm text-gray-600">
                {profile.full_name || profile.email}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Wallet Balance</p>
                <h3 className="text-2xl font-bold text-gray-800">
                  ₦{walletBalance.toLocaleString()}
                </h3>
              </div>
              <Wallet className="text-rose-600" />
            </div>
            <button
              onClick={handleFundWallet}
              className="mt-4 w-full bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white py-2 rounded"
            >
              Fund Wallet
            </button>
          </div>
          {showFundModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
    <h2 className="text-xl font-semibold mb-4 text-gray-900">Fund Wallet</h2>
      <input
        type="number"
        placeholder="Enter amount (₦)"
        className="w-full border px-3 py-2 rounded mb-4 text-gray-800 placeholder-gray-500"
        value={fundAmount}
        onChange={(e) => setFundAmount(e.target.value)}
      />
      <div className="flex justify-end space-x-2">
        <button
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
          onClick={() => setShowFundModal(false)}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-rose-600 text-white rounded"
          onClick={handlePayNow}
        >
          Pay Now
        </button>
      </div>
    </div>
  </div>
)}

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Current Rank</p>
              <Star className="text-yellow-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">New</h3>
            <div className="w-full bg-rose-100 h-2 rounded mt-2">
              <div className="h-2 bg-rose-600 rounded w-0"></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Spend more to rank up</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-700">Settings</p>
        <Settings className="text-gray-600" />
      </div>

      <ul className="text-sm text-gray-700 space-y-2 mb-4">
        <li
          onClick={() => setActiveTab("update")}
          className={`cursor-pointer ${activeTab === "update" ? "text-rose-600 font-bold" : "hover:text-rose-600"}`}
        >
          Update Profile
        </li>
        <li
          onClick={() => setActiveTab("password")}
          className={`cursor-pointer ${activeTab === "password" ? "text-rose-600 font-bold" : "hover:text-rose-600"}`}
        >
          Change Password
        </li>
        <li
          onClick={() => setActiveTab("notifications")}
          className={`cursor-pointer ${activeTab === "notifications" ? "text-rose-600 font-bold" : "hover:text-rose-600"}`}
        >
          Notification Preferences
        </li>
      </ul>

      {/* Update Profile */}
      {activeTab === "update" && (
        <form className="space-y-4" onSubmit={handleUpdate}>
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full mt-1 border rounded text-gray-800 p-2"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-1 border rounded text-gray-800 p-2"
              placeholder="Enter phone number"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-rose-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          {message && <p className="text-sm mt-2">{message}</p>}
        </form>
      )}

      {/* Change Password */}
      {activeTab === "password" && (
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Current Password</label>
            <input type="password" className="w-full mt-1 border rounded text-gray-800 p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">New Password</label>
            <input type="password" className="w-full mt-1 border rounded text-gray-800 p-2" />
          </div>
          <button type="submit" className="bg-rose-600 text-white px-4 py-2 rounded">
            Update Password
          </button>
        </form>
      )}

      {/* Notifications */}
      {activeTab === "notifications" && (
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="accent-rose-600" />
            <span className="text-gray-800">Email Notifications</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="accent-rose-600" />
            <span className="text-gray-800">SMS Alerts</span>
          </label>
          <button className="mt-2 bg-rose-600 text-white px-4 py-2 rounded">
            Save Preferences
          </button>
  </div>
)}

          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Recent Transactions</h3>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((txn) => (
                  <div key={txn.id} className="flex justify-between text-sm border-b pb-2">
                    <span>
                      {txn.type === "vote" && `Voted for ${txn.recipient_name}`}
                      {txn.type === "gift" && `Gifted ${txn.recipient_name}`}
                      {txn.type === "funding" && `Wallet Funded`}
                      {!["vote", "gift", "funding"].includes(txn.type) && txn.type}
                    </span>
                    <span className={txn.type === "funding" ? "text-green-600" : "text-red-500"}>
                      {txn.type === "funding" ? `+₦${txn.amount}` : `-₦${txn.amount}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No transactions yet.</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
              <Bell className="text-rose-600" />
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>📢 New voting round begins tomorrow!</li>
              <li>🔥 Top 5 fans will win exclusive merch!</li>
              <li>🎉 Don’t miss the live show tonight.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </>
);
}