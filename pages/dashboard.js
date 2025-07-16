// pages/dashboard.js
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import Image from "next/image";
import { UserCircle, Wallet, Settings, LogOut, Star, Bell } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("/placeholder-profile.png");
  const fileInputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    router.push("/auth/login");
    return;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, photo")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error.message);
  } else {
    setUser(profile);
    if (profile.photo) setAvatarUrl(profile.photo);
  }

  setLoading(false);
};

    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleUpload = async (event) => {
  const file = event.target.files[0];
  if (!file || !user) return;

  // 🔒 Enforce 5MB limit for users
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    alert("Image is too large. Please upload a file less than 5MB.");
    return;
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `avatars/${user.id}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error("Upload error:", uploadError.message);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData.publicUrl;

  // 💾 Save the public URL to the user's profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ photo: publicUrl })
    .eq("id", user.id);

  if (updateError) {
    console.error("Failed to update profile:", updateError.message);
  } else {
    setAvatarUrl(publicUrl); // ✅ update image preview
  }
};

  if (loading) return <div className="text-center p-20">Loading...</div>;
  if (!user) return null;

  return (
    <>
      <Header />
      <section className="min-h-screen bg-rose-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <Image
  src={avatarUrl}
  alt="Profile"
  fill
  className="rounded-full border object-cover"
/>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleUpload}
                  className="hidden"
                />
                <button
                  className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow"
                  onClick={() => fileInputRef.current.click()}
                >
                  📷
                </button>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Welcome back</h2>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>

          {/* Main Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Wallet */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Wallet Balance</p>
                  <h3 className="text-2xl font-bold text-gray-800">₦0.00</h3>
                </div>
                <Wallet className="text-rose-600" />
              </div>
              <button className="mt-4 w-full bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white py-2 rounded">
                Fund Wallet
              </button>
            </div>

            {/* Rank Progress */}
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

            {/* Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-700">Settings</p>
                <Settings className="text-gray-600" />
              </div>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="hover:text-rose-600 cursor-pointer">Update Profile</li>
                <li className="hover:text-rose-600 cursor-pointer">Change Password</li>
                <li className="hover:text-rose-600 cursor-pointer">Notification Preferences</li>
              </ul>
            </div>
          </div>

          {/* History & Activity */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {/* Transactions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Transaction History</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>🎁 Sent gift to Candidate A - ₦200</li>
                <li>🗳️ Voted for Candidate B - ₦100</li>
                <li>💰 Wallet funded - ₦1,000</li>
              </ul>
            </div>

            {/* Notifications */}
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
