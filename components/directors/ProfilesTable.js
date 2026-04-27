// components/directors/ProfilesTable.js
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";
import { UserCheck, Phone, Mail, Wallet, Award, Star, Lock, Eye, EyeOff, Copy, MessageCircle, PhoneCall, X } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

const formatName = (fullName) => {
  if (!fullName) return "Anonymous";
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1].charAt(0)}.`;
};

// Helper to format phone for WhatsApp (digits only)
const getWhatsAppNumber = (phone) => {
  if (!phone) return null;
  return phone.replace(/\D/g, "");
};

// Copy text to clipboard
const copyToClipboard = (text, setCopiedFeedback) => {
  navigator.clipboard.writeText(text).then(() => {
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2000);
  }).catch(err => {
    console.error("Failed to copy:", err);
    alert("Could not copy number");
  });
};

export default function ProfilesTable({ profiles, candidates, wallets }) {
  const router = useRouter();
  
  // PIN verification states
  const [pinVerified, setPinVerified] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("profilesTableVerified") === "true";
    }
    return false;
  });
  
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [storedPin, setStoredPin] = useState(null);
  const [loading, setLoading] = useState(!pinVerified);
  const [showPin, setShowPin] = useState(false);

  // Phone action modal states
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState("");
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  // Fetch the stored PIN from lovemate table only if not already verified
  useEffect(() => {
    if (pinVerified) {
      setLoading(false);
      return;
    }

    const fetchStoredPin = async () => {
      try {
        const { data, error } = await supabase
          .from("lovemate")
          .select("profile_pin")
          .eq("id", "ffb2d356-0dc8-4da8-a79c-8676efec0156")
          .single();

        if (error) {
          console.error("Error fetching PIN:", error);
          setPinError("Failed to load PIN configuration. Please contact support.");
        } else if (data) {
          const pinValue = data.profile_pin ? String(data.profile_pin).trim() : null;
          setStoredPin(pinValue);
          console.log("Stored PIN loaded (trimmed):", pinValue);
        } else {
          setPinError("PIN configuration not found.");
        }
      } catch (err) {
        console.error(err);
        setPinError("An error occurred while loading security settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchStoredPin();
  }, [pinVerified]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (!storedPin) {
      setPinError("PIN not loaded. Please try again.");
      return;
    }
    
    const userPin = pinInput.trim();
    const correctPin = storedPin;
    
    if (userPin === correctPin) {
      setPinVerified(true);
      sessionStorage.setItem("profilesTableVerified", "true");
      setPinError("");
    } else {
      setPinError("Incorrect PIN. Access denied.");
    }
  };

  // Phone action handlers
  const openPhoneModal = (phone) => {
    setSelectedPhone(phone);
    setShowPhoneModal(true);
  };

  const handleCall = () => {
    if (selectedPhone) {
      window.location.href = `tel:${selectedPhone}`;
    }
    setShowPhoneModal(false);
  };

  const handleWhatsApp = () => {
    const whatsappNumber = getWhatsAppNumber(selectedPhone);
    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber}`, "_blank");
    } else {
      alert("Invalid phone number for WhatsApp");
    }
    setShowPhoneModal(false);
  };

  const handleCopyNumber = () => {
    copyToClipboard(selectedPhone, setCopiedFeedback);
    // Keep modal open, show feedback, then close after short delay
    setTimeout(() => setShowPhoneModal(false), 1500);
  };

  // Create maps
  const walletMap = {};
  if (wallets) {
    wallets.forEach(wallet => {
      walletMap[wallet.user_id] = wallet.balance;
    });
  }

  const candidateMap = {};
  if (candidates) {
    candidates.forEach(candidate => {
      if (candidate.user_id) {
        candidateMap[candidate.user_id] = candidate;
      }
    });
  }

  const getWalletBalance = (profileId) => {
    const balance = walletMap[profileId];
    return balance !== undefined && balance !== null ? balance : 0;
  };

  const getCandidateByProfile = (profileId) => {
    return candidateMap[profileId] || null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-rose-100 text-center">
        <div className="flex justify-center items-center space-x-2">
          <div className="w-3 h-3 bg-rose-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-rose-500 rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-rose-500 rounded-full animate-bounce delay-200"></div>
        </div>
        <p className="mt-3 text-gray-500">Loading security settings...</p>
      </div>
    );
  }

  // PIN modal
  if (!pinVerified) {
    return (
      <motion.div
        variants={fadeInUp}
        className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-rose-100 max-w-md mx-auto"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-rose-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Restricted Access</h3>
          <p className="text-gray-500 text-sm mb-6">
            This detailed user directory is protected. Please enter the access PIN to continue.
          </p>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none text-center text-lg text-black"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {pinError && (
              <p className="text-red-500 text-xs mt-1">{pinError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white py-2 rounded-lg hover:shadow-lg transition-shadow"
            >
              Verify Access
            </button>
          </form>
        </div>
      </motion.div>
    );
  }

  // Main table
  return (
    <>
      <motion.div
        variants={fadeInUp}
        className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-rose-100"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-red-600" />
          User Directory — Detailed View
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead>
              <tr className="bg-rose-50">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Wallet Balance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Candidate Code</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Favorite Candidates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100">
              {profiles.map((profile) => {
                const candidateObj = getCandidateByProfile(profile.id);
                const isCandidate = !!candidateObj;
                const walletBalance = getWalletBalance(profile.id);
                
                return (
                  <tr key={profile.id} className="hover:bg-rose-50/50 transition-colors">
                    <td className="px-3 py-2">
                      {profile.photo_url ? (
                        <Image
                          src={profile.photo_url}
                          alt={profile.full_name}
                          width={32}
                          height={32}
                          className="rounded-full object-cover w-8 h-8"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-rose-600 rounded-full flex items-center justify-center">
                          <UserCheck className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 font-medium text-gray-800">{formatName(profile.full_name)}</td>
                    <td className="px-3 py-2 text-xs text-gray-500">{profile.id.substring(0, 8)}...</td>
                    <td className="px-3 py-2 font-bold text-red-600">{profile.points?.toFixed(2) || 0}</td>
                    <td className="px-3 py-2">
                      {profile.phone ? (
                        <button
                          onClick={() => openPhoneModal(profile.phone)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors group"
                          title="Click for options"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span className="text-xs underline-offset-2 group-hover:underline">{profile.phone}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {profile.email ? (
                        <button
                          onClick={() => handleEmailClick(profile.email)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors group"
                          title="Send email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span className="text-xs underline-offset-2 group-hover:underline truncate max-w-[150px]">
                            {profile.email}
                          </span>
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold text-emerald-700">
                          ₦{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {isCandidate ? (
                        <button
                          onClick={() => router.push(`/candidate/${candidateObj.id}`)}
                          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all hover:scale-105"
                        >
                          <Award className="w-3 h-3" />
                          Candidate
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-500 text-xs bg-gray-100 px-2.5 py-1 rounded-full">
                          <Star className="w-3 h-3" />
                          Fan
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isCandidate && candidateObj.code ? (
                        <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono">
                          {candidateObj.code}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {profile.favorite?.map((favId, idx) => {
                          const favCandidate = candidates.find(c => c.id === favId);
                          return favCandidate ? (
                            <span key={idx} className="inline-block bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs">
                              {favCandidate.name}
                            </span>
                          ) : null;
                        })}
                        {(!profile.favorite || profile.favorite.length === 0) && (
                          <span className="text-xs text-gray-400">No favorites</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {profiles.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No users found
          </div>
        )}
      </motion.div>

      {/* Custom Phone Action Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Choose Action</h3>
              <button
                onClick={() => setShowPhoneModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <button
                onClick={handleCall}
                className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition-colors"
              >
                <PhoneCall className="w-5 h-5" />
                <span className="font-medium">Call this user</span>
              </button>
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center gap-3 px-4 py-3 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">Chat on WhatsApp</span>
              </button>
              <button
                onClick={handleCopyNumber}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors"
              >
                <Copy className="w-5 h-5" />
                <span className="font-medium">Copy number</span>
              </button>
            </div>
            {copiedFeedback && (
              <div className="mx-4 mb-4 p-2 bg-green-100 text-green-700 text-xs rounded-lg text-center animate-pulse">
                ✓ Number copied to clipboard!
              </div>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
}

// Email click handler (moved outside component for consistency)
const handleEmailClick = (email) => {
  if (!email) return;
  window.location.href = `mailto:${email}`;
};