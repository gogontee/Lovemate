import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import VoteSection from "../../components/candidate/VoteSection";
import GiftSection from "../../components/candidate/GiftSection";
import Gallery from "../../components/candidate/Gallery";
import CrushChallenge from "../../components/CrushChallenge"; // <-- Imported Crush Challenge
import { motion, AnimatePresence } from "framer-motion";
import { Share2, CheckCircle, MoreHorizontal, Heart, Eye, X, AlertTriangle } from "lucide-react";

function formatNaira(n) {
  if (n == null) return "₦0";
  const formatted = Number(n).toLocaleString("en-NG");
  return `₦${formatted}`;
}

// ─── Qualification helper ──────────────────────────────────────────
const QUALIFICATION_WINDOW_DAYS = 5;
const GRACE_WINDOW_DAYS = 3;
const MIN_GIFTS = 2;

function computeQualification(candidate) {
  if (!candidate) return null;

  const gifts = candidate.gifts || 0;
  const created = candidate.created_at ? new Date(candidate.created_at) : new Date();
  const now = new Date();
  const daysSinceCreated = (now - created) / (1000 * 60 * 60 * 24);

  if (gifts >= MIN_GIFTS) {
    return { status: "approved", graceActive: false, daysLeft: 0 };
  }

  if (daysSinceCreated < QUALIFICATION_WINDOW_DAYS) {
    return {
      status: "pending",
      graceActive: false,
      daysLeft: QUALIFICATION_WINDOW_DAYS - daysSinceCreated,
    };
  }

  if (gifts === 1 && daysSinceCreated < QUALIFICATION_WINDOW_DAYS + GRACE_WINDOW_DAYS) {
    return {
      status: "grace",
      graceActive: true,
      daysLeft: QUALIFICATION_WINDOW_DAYS + GRACE_WINDOW_DAYS - daysSinceCreated,
    };
  }

  return { status: "disqualified", graceActive: false, daysLeft: 0 };
}

// Approval Badge Component
function ApprovalBadge({ approval, qualification, status }) {
  if (status === "disqualified" || qualification?.status === "disqualified") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="absolute top-4 left-4 z-30 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-800 text-red-400 border border-red-500/50 shadow-lg flex items-center gap-1.5"
      >
        <span className="w-2 h-2 rounded-full bg-red-500" />
        Disqualified
      </motion.div>
    );
  }

  if (approval === true) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="absolute top-4 left-4 z-30 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-green-600 text-white shadow-lg flex items-center gap-1.5"
      >
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        Approved
      </motion.div>
    );
  }
  if (approval === false) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="absolute top-4 left-4 z-30 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600 text-white shadow-lg flex items-center gap-1.5"
      >
        <span className="w-2 h-2 rounded-full bg-white" />
        Approval Declined
      </motion.div>
    );
  }
  if (qualification?.graceActive) {
    const days = Math.ceil(qualification.daysLeft);
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="absolute top-4 left-4 z-30 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500 text-white shadow-lg flex items-center gap-1.5"
      >
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        Grace · {days}d left
      </motion.div>
    );
  }
  const days = Math.ceil(qualification?.daysLeft || 0);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="absolute top-4 left-4 z-30 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-yellow-400 text-yellow-900 shadow-lg flex items-center gap-1.5"
    >
      <span className="w-2 h-2 rounded-full bg-yellow-800 animate-pulse" />
      Pending · {days}d left
    </motion.div>
  );
}

// More Dropdown Menu Component
function MoreMenu({ onShare, onCrushChallenge, onSeeGifters, isActive }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`px-4 rounded-lg text-sm md:text-base font-semibold capitalize transition-all inline-flex items-center justify-center h-8 md:h-10 gap-1 ${
          open
            ? "bg-red-600 text-white shadow-lg"
            : "bg-white text-black hover:bg-green-600 hover:text-white hover:shadow"
        }`}
        style={{ lineHeight: '1' }}
      >
        <span>more</span>
        <MoreHorizontal className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          >
            <button
              onClick={() => { setOpen(false); onShare(); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 transition-colors"
            >
              <Share2 className="w-4 h-4 text-red-600" />
              Share
            </button>
            <button
              onClick={() => { setOpen(false); onCrushChallenge(); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 transition-colors"
            >
              <Heart className="w-4 h-4 text-red-600" />
              Crush Challenge
            </button>
            <button
              onClick={() => { setOpen(false); onSeeGifters(); }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 transition-colors"
            >
              <Eye className="w-4 h-4 text-red-600" />
              See Who Sent You Gift
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Pending Approval Popup
function PendingApprovalPopup({ onDismiss, onLearnMore }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8"
        >
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-red-100">
            <Heart className="w-8 h-8 text-red-600" />
          </div>

          <h2 className="text-xl md:text-2xl font-extrabold text-center text-gray-900 mb-3">
            Prove You Are Lovable 💕
          </h2>

          <p className="text-gray-600 text-sm md:text-base text-center leading-relaxed mb-4">
            To get a spot on the show, you need to prove that you are lovable.
            You need at least <span className="font-bold text-red-600">2 gifts</span> to
            show that you have what it takes to earn your place.
          </p>

          <p className="text-gray-500 text-xs md:text-sm text-center mb-6">
            Your profile is currently pending approval. Get someone to gift you to get approved for the show.
          </p>

          <button
            onClick={onLearnMore}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-green-600 text-white font-bold text-sm md:text-base shadow-lg transition-colors"
          >
            Learn More
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Disqualification warning popup
function QualificationWarningPopup({ onDismiss, onLearnMore, daysLeft, graceActive }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 border-2 border-orange-400"
        >
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>

          <h2 className="text-xl md:text-2xl font-extrabold text-center text-gray-900 mb-3">
            ⏳ Time Is Running Out
          </h2>

          <p className="text-gray-700 text-sm md:text-base text-center leading-relaxed mb-3">
            You have{" "}
            <span className="font-bold text-orange-600">
              {Math.ceil(daysLeft)} day{Math.ceil(daysLeft) === 1 ? "" : "s"}
            </span>{" "}
            {graceActive ? "of grace period left" : "left"} to collect at least{" "}
            <span className="font-bold text-red-600">2 gifts</span>.
          </p>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3 mb-5">
            <p className="text-xs md:text-sm text-gray-700 text-center">
              If you cannot get at least 2 gifts before the deadline, it means you
              cannot match the energy of the LoveMate Show and you will be{" "}
              <span className="font-bold text-red-600">automatically disqualified</span>.
            </p>
          </div>

          <button
            onClick={onLearnMore}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-green-600 text-white font-bold text-sm md:text-base shadow-lg transition-colors"
          >
            Learn More
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Digital Stats Component
function DigitalStats({ candidate, currentUser, formatNaira, onVoteClick, onGiftClick, isApproved }) {
  const [animatedVotes, setAnimatedVotes] = useState(0);
  const [animatedGifts, setAnimatedGifts] = useState(0);
  const [animatedWorth, setAnimatedWorth] = useState(0);

  const isOwner = currentUser && candidate.user_id === currentUser.id;
  const secret = candidate.secret;

  const shouldShowVotes = () => {
    if (!isApproved) return false;
    if (secret === 'hidevote') return isOwner;
    if (secret === 'hideall') return isOwner;
    return true;
  };

  const shouldShowGifts = () => {
    if (secret === 'hideall') return isOwner;
    return true;
  };

  const shouldShowWorth = () => {
    if (!isApproved) return false;
    if (secret === 'hideall') return isOwner;
    return true;
  };

  useEffect(() => {
    if (candidate?.votes !== undefined) setAnimatedVotes(candidate.votes);
  }, [candidate?.votes]);

  useEffect(() => {
    if (candidate?.gifts !== undefined) setAnimatedGifts(candidate.gifts);
  }, [candidate?.gifts]);

  useEffect(() => {
    if (candidate?.gift_worth !== undefined) setAnimatedWorth(candidate.gift_worth);
  }, [candidate?.gift_worth]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-20"
    >
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-4 bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-red-500/30 shadow-2xl">
        {shouldShowVotes() && (
          <>
            <button onClick={onVoteClick} className="text-right hover:scale-105 transition-transform cursor-pointer group">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-100 group-hover:from-red-200 group-hover:to-red-50">
                {Math.round(animatedVotes).toLocaleString()}
              </div>
              <div className="text-xs text-red-300/80 uppercase tracking-wider flex items-center gap-1 group-hover:text-red-200">
                <span className="text-red-400 group-hover:text-red-300">🗳️</span> Votes
              </div>
            </button>
            <div className="w-px bg-red-500/30" />
          </>
        )}

        {shouldShowGifts() && (
          <>
            <button onClick={onGiftClick} className="text-right hover:scale-105 transition-transform cursor-pointer group">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-100 group-hover:from-red-200 group-hover:to-red-50">
                {Math.round(animatedGifts).toLocaleString()}
              </div>
              <div className="text-xs text-red-300/80 uppercase tracking-wider flex items-center gap-1 group-hover:text-red-200">
                <span className="text-red-400 group-hover:text-red-300">🎁</span> Gifts
              </div>
            </button>
            {shouldShowWorth() && <div className="w-px bg-red-500/30" />}
          </>
        )}

        {shouldShowWorth() && (
          <div className="text-right">
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-100">
              {formatNaira(Math.round(animatedWorth))}
            </div>
            <div className="text-xs text-red-300/80 uppercase tracking-wider flex items-center gap-1">
              <span className="text-red-400">💰</span> Worth
            </div>
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden flex flex-col gap-2 bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-md rounded-2xl p-3 max-w-[180px] border border-red-500/30">
        {shouldShowVotes() && (
          <button onClick={onVoteClick} className="flex items-center justify-between hover:scale-105 transition-transform cursor-pointer group w-full">
            <div className="flex items-center gap-1.5">
              <span className="text-red-600 text-xs group-hover:text-red-300">🗳️</span>
              <span className="text-[8px] text-red-300/80 uppercase group-hover:text-red-200">Votes</span>
            </div>
            <div className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-100 group-hover:from-red-200 group-hover:to-red-50">
              {Math.round(animatedVotes).toLocaleString()}
            </div>
          </button>
        )}

        {shouldShowGifts() && (
          <button
            onClick={onGiftClick}
            className="flex items-center justify-between hover:scale-105 transition-transform cursor-pointer group w-full"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-red-600 text-sm group-hover:text-red-300">🎁</span>
            </div>
            <div className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-100 group-hover:from-red-200 group-hover:to-red-50 drop-shadow-[0_0_4px_rgba(220,38,38,0.6)]">
              {Math.round(animatedGifts).toLocaleString()}
            </div>
          </button>
        )}

        {shouldShowWorth() && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-red-400 text-xs">💰</span>
              <span className="text-[8px] text-red-300/80 uppercase">Worth</span>
            </div>
            <div className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-100">
              {formatNaira(Math.round(animatedWorth))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Send Gift Tab Button
function SendGiftTabButton({ isActive, onClick, isApproved }) {
  if (!isApproved) {
    return (
      <motion.button
        onClick={onClick}
        animate={{
          boxShadow: [
            "0 0 6px 1px rgba(255, 255, 255, 0.5)",
            "0 0 20px 8px rgba(220, 38, 38, 0.7)",
            "0 0 6px 1px rgba(255, 255, 255, 0.5)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`relative px-7 md:px-10 rounded-lg text-sm md:text-base font-semibold capitalize transition-all inline-flex items-center justify-center h-8 md:h-10 ${
          isActive
            ? "bg-red-600 text-white"
            : "bg-white text-black hover:bg-green-600 hover:text-white"
        }`}
        style={{ lineHeight: '1' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.animationPlayState = 'paused';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.animationPlayState = 'running';
        }}
      >
        <span className="relative z-10 flex items-center gap-1.5">
          <span>🎁</span>
          Send Gift
        </span>
      </motion.button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`px-4 rounded-lg text-sm md:text-base font-semibold capitalize transition-all inline-flex items-center justify-center h-8 md:h-10 ${
        isActive
          ? "bg-red-600 text-white shadow-lg"
          : "bg-white text-gray-700 hover:bg-green-600 hover:text-white hover:shadow"
      }`}
      style={{ lineHeight: '1' }}
    >
      send gift
    </button>
  );
}

export default function CandidateProfile() {
  const router = useRouter();
  const { id } = router.query;
  const voteRef = useRef(null);
  const giftRef = useRef(null);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState("send gift");
  const [uploading, setUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const refreshIntervalRef = useRef(null);
  const [shareToast, setShareToast] = useState(false);
  
  // ✅ New State for Crush Challenge Modal
  const [challengeOpen, setChallengeOpen] = useState(false);

  const [showPendingPopup, setShowPendingPopup] = useState(false);
  const [showQualificationWarning, setShowQualificationWarning] = useState(false);
  const pendingPopupTimerRef = useRef(null);
  const qualificationTimerRef = useRef(null);
  const qualificationCheckRef = useRef(null);

  const defaultBanner = "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/lovemateshow/logo/banner.png";

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  const formatGalleryImages = (galleryData) => {
    if (!Array.isArray(galleryData)) return [];
    return galleryData.map(item => {
      if (typeof item === 'string') {
        try { return JSON.parse(item); } catch { return { url: item, caption: '' }; }
      }
      return item;
    });
  };

  const refreshCandidateData = async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase.from("candidates").select("*").eq("id", id).single();
      if (!error && data) {
        if (JSON.stringify(candidate) !== JSON.stringify(data)) {
          setCandidate(data);
          setGalleryImages(formatGalleryImages(data.gallery));
        }
      }
    } catch (error) {
      console.error("Silent refresh error:", error);
    }
  };

  useEffect(() => {
    if (!id) return;
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    refreshIntervalRef.current = setInterval(() => { refreshCandidateData(); }, 3000);
    return () => { if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current); };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchCandidate = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("candidates").select("*").eq("id", id).single();
      if (error) {
        console.error("Error fetching candidate:", error);
        setCandidate(null);
      } else {
        setCandidate(data);
        setGalleryImages(formatGalleryImages(data.gallery));
      }
      setLoading(false);
    };

    fetchCandidate();

    const channel = supabase
      .channel(`candidate-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "candidates", filter: `id=eq.${id}` },
        (payload) => {
          setCandidate(payload.new);
          setGalleryImages(formatGalleryImages(payload.new.gallery));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  useEffect(() => {
    if (candidate && currentUser) setIsOwner(candidate.user_id === currentUser.id);
    else setIsOwner(false);
  }, [candidate, currentUser]);

  useEffect(() => {
    if (!candidate) return;
    if (candidate.status === "disqualified") return;
    if (qualificationCheckRef.current) clearTimeout(qualificationCheckRef.current);

    qualificationCheckRef.current = setTimeout(async () => {
      const q = computeQualification(candidate);
      if (!q) return;

      const gifts = candidate.gifts || 0;
      const isApprovedInDb = candidate.approval === true;
      const isDisqualified = candidate.status === "disqualified";

      if (gifts >= MIN_GIFTS && !isApprovedInDb) {
        const { error } = await supabase
          .from("candidates")
          .update({ approval: true, status: "approved" })
          .eq("id", candidate.id);
        if (error) console.error("Auto-approve failed:", error);
      } else if (q.status === "disqualified" && !isDisqualified) {
        const { error } = await supabase
          .from("candidates")
          .update({ approval: false, status: "disqualified" })
          .eq("id", candidate.id);
        if (error) console.error("Auto-disqualify failed:", error);
      }
    }, 2000);

    return () => {
      if (qualificationCheckRef.current) clearTimeout(qualificationCheckRef.current);
    };
  }, [candidate]);

  useEffect(() => {
    if (!candidate) return;
    if (candidate.approval !== null) return;
    if (candidate.status === "disqualified") return;

    const storageKey = `pending-popup-last-shown-${candidate.id}`;
    const intervalMs = 20 * 60 * 1000; 
    const now = Date.now();
    const lastShown = Number(localStorage.getItem(storageKey) || 0);

    const schedulePopup = (delayMs) => {
      if (pendingPopupTimerRef.current) clearTimeout(pendingPopupTimerRef.current);
      pendingPopupTimerRef.current = setTimeout(() => {
        setShowPendingPopup(true);
        localStorage.setItem(storageKey, String(Date.now()));
      }, delayMs);
    };

    if (now - lastShown >= intervalMs) {
      schedulePopup(1200);
    } else {
      schedulePopup(intervalMs - (now - lastShown));
    }

    return () => {
      if (pendingPopupTimerRef.current) clearTimeout(pendingPopupTimerRef.current);
    };
  }, [candidate]);

  useEffect(() => {
    if (!candidate) return;
    if (candidate.status === "disqualified") return;
    if (candidate.approval === true) return;
    if ((candidate.gifts || 0) >= MIN_GIFTS) return;

    const q = computeQualification(candidate);
    if (!q) return;
    if (q.status !== "pending" && q.status !== "grace") return;

    const sessionKey = `qual-warn-${candidate.id}`;
    if (sessionStorage.getItem(sessionKey)) return;

    const threshold = q.status === "grace" ? 3 : 2;
    if (q.daysLeft > threshold) return;

    const timer = setTimeout(() => {
      setShowQualificationWarning(true);
      sessionStorage.setItem(sessionKey, "1");
    }, 2500);

    return () => clearTimeout(timer);
  }, [candidate]);

  useEffect(() => {
    if (!router.isReady || !candidate) return;
    const hash = router.asPath.split("#")[1];
    if (hash === "vote" && candidate.approval === true) {
      setActiveTab("vote");
      const timer = setTimeout(() => {
        if (voteRef.current) voteRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 800);
      return () => clearTimeout(timer);
    }
    if (hash === "gift") {
      setActiveTab("send gift");
      const timer = setTimeout(() => {
        if (giftRef.current) giftRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [router.asPath, router.isReady, candidate]);

  const scrollToVote = () => {
    setActiveTab("vote");
    if (voteRef.current) voteRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToGift = () => {
    setActiveTab("send gift");
    if (giftRef.current) giftRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleShare = async () => {
    if (!candidate) return;
    const shareUrl = `https://www.lovemateshow.com/candidate/${candidate.id}`;
    const shareData = {
      title: `${candidate.name} on Lovemate Show`,
      text: `Support ${candidate.name} with votes and gifts!`,
      url: shareUrl,
    };
    if (navigator.share && /(iPhone|iPad|iPod|Android)/i.test(navigator.userAgent)) {
      try { await navigator.share(shareData); }
      catch (err) { if (err.name !== 'AbortError') { fallbackCopy(); } }
    } else { fallbackCopy(); }
  };

  const fallbackCopy = async () => {
    const shareUrl = `https://www.lovemateshow.com/candidate/${candidate.id}`;
    await navigator.clipboard.writeText(shareUrl);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3000);
  };

  // ✅ Trigger the Crush Challenge Modal
  const handleCrushChallenge = () => {
    setChallengeOpen(true);
  };

  const handleSeeGifters = () => {
    router.push(`/candidate/${candidate.id}?tab=gifters`);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "vote" && voteRef.current) {
      voteRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (tab === "send gift" && giftRef.current) {
      giftRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (tab === "gallery" || tab === "about") {
      const contentSection = document.querySelector('.content-section');
      if (contentSection) contentSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !candidate || !isOwner) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${candidate.id}-profile-${Date.now()}.${fileExt}`;
      const filePath = `candidate-profiles/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('candidate-images').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('candidate-images').getPublicUrl(filePath);
      const { error: updateError } = await supabase.from('candidates').update({ image_url: publicUrl }).eq('id', candidate.id);
      if (updateError) throw updateError;
      alert('Profile photo updated successfully!');
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      alert('Error uploading photo. Please try again.');
    } finally { setUploading(false); }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !candidate || !isOwner) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${candidate.id}-banner-${Date.now()}.${fileExt}`;
      const filePath = `candidate-banners/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('candidate-images').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('candidate-images').getPublicUrl(filePath);
      const { error: updateError } = await supabase.from('candidates').update({ banner: publicUrl }).eq('id', candidate.id);
      if (updateError) throw updateError;
      alert('Banner updated successfully!');
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Error uploading banner. Please try again.');
    } finally { setUploading(false); }
  };

  const handleGalleryUpload = async (uploadData) => {
    if (!uploadData.length || !candidate || !isOwner) return;
    setUploading(true);
    try {
      const uploadedImages = [];
      for (const item of uploadData) {
        const { file, caption } = item;
        const fileExt = file.name.split('.').pop();
        const fileName = `${candidate.id}-gallery-${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `candidate-gallery/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('candidate-images').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('candidate-images').getPublicUrl(filePath);
        uploadedImages.push({ url: publicUrl, caption: caption || '' });
      }
      const currentGallery = galleryImages || [];
      const updatedGallery = [...currentGallery, ...uploadedImages];
      const { error: updateError } = await supabase.from('candidates').update({ gallery: updatedGallery }).eq('id', candidate.id);
      if (updateError) throw updateError;
      alert(`${uploadedImages.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      alert('Error uploading images. Please try again.');
    } finally { setUploading(false); }
  };

  const handleDeleteImage = async (index) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      const updatedGallery = galleryImages.filter((_, i) => i !== index);
      const { error: updateError } = await supabase.from('candidates').update({ gallery: updatedGallery }).eq('id', candidate.id);
      if (updateError) throw updateError;
      alert('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image. Please try again.');
    }
  };

  const handleAddCaption = async (index, caption) => {
    try {
      const updatedGallery = [...galleryImages];
      updatedGallery[index] = { ...updatedGallery[index], caption };
      const { error: updateError } = await supabase.from('candidates').update({ gallery: updatedGallery }).eq('id', candidate.id);
      if (updateError) throw updateError;
      setGalleryImages(updatedGallery);
    } catch (error) {
      console.error('Error saving caption:', error);
      alert('Error saving caption. Please try again.');
    }
  };

  if (loading) {
    return (
      <>
        <Head><title>Loading Candidate Profile – Lovemate Show</title></Head>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
        <div className="hidden md:block"><Footer /></div>
      </>
    );
  }

  if (!candidate) {
    return (
      <>
        <Head><title>Candidate Not Found – Lovemate Show</title></Head>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Candidate Not Found</h2>
            <p className="text-gray-600 mb-4">The candidate you're looking for doesn't exist.</p>
            <button onClick={() => router.push('/')} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-green-600 transition-colors">
              Go Home
            </button>
          </div>
        </div>
        <div className="hidden md:block"><Footer /></div>
      </>
    );
  }

  const isApproved = (candidate.gifts || 0) >= MIN_GIFTS || candidate.approval === true;
  const qualification = computeQualification(candidate);
  const isDisqualified = candidate.status === "disqualified" || qualification?.status === "disqualified";

  const candidateImageUrl = candidate.image_url?.startsWith('http')
    ? candidate.image_url
    : candidate.image_url
    ? `https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/candidates/${candidate.image_url}`
    : 'https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/lovemateshow/logo/logo.png';

  const tabs = [];
  tabs.push("gallery");
  if (isApproved) tabs.push("vote");
  tabs.push("send gift");
  tabs.push("about");

  return (
    <>
      <Head>
        <title>{candidate.name} – Lovemate Show</title>
        <meta name="description" content={`Support ${candidate.name} on Lovemate Show with votes and gifts.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://www.lovemateshow.com/candidate/${candidate.id}`} />
        <meta property="og:title" content={`${candidate.name} – Lovemate Show Contestant`} />
        <meta property="og:description" content={`Join me on Lovemate Show! Vote or send gifts to help ${candidate.name} win the grand prize.`} />
        <meta property="og:image" content={candidateImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`https://www.lovemateshow.com/candidate/${candidate.id}`} />
        <meta name="twitter:title" content={`${candidate.name} – Lovemate Show Contestant`} />
        <meta name="twitter:description" content={`Support ${candidate.name} with votes and gifts!`} />
        <meta name="twitter:image" content={candidateImageUrl} />
      </Head>

      <Header />

      <main className="bg-gradient-to-br from-pink-50 via-white to-rose-50 min-h-screen pb-20 md:pb-0">
        <section className="relative h-[250px] md:h-[300px] bg-black">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={candidate.banner || defaultBanner}
              alt={`${candidate.name} banner`}
              fill
              className="object-cover opacity-60"
              priority
              sizes="100vw"
              unoptimized={true}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

          <ApprovalBadge
            approval={candidate.approval}
            qualification={qualification}
            status={candidate.status}
          />

          {isOwner && (
            <div className="absolute top-4 right-4 z-30">
              <label className="cursor-pointer bg-black/50 hover:bg-green-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/30 transition-all">
                {uploading ? 'Uploading...' : 'Change Banner'}
                <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          )}

          <DigitalStats
            candidate={candidate}
            currentUser={currentUser}
            formatNaira={formatNaira}
            onVoteClick={scrollToVote}
            onGiftClick={scrollToGift}
            isApproved={isApproved}
          />

          <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 z-10 flex items-end gap-4 md:gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative group"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 10px 2px rgba(255, 255, 255, 0.5)",
                    "0 0 30px 12px rgba(220, 38, 38, 0.6)",
                    "0 0 10px 2px rgba(255, 255, 255, 0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full"
              />

              <div className="relative w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/90 shadow-2xl">
                <Image
                  src={candidate.image_url}
                  alt={`${candidate.name} profile`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 96px, 160px"
                  unoptimized={true}
                />
              </div>

              {isOwner && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                  <span className="text-white text-xs font-semibold">
                    {uploading ? '...' : 'Change'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleProfilePhotoUpload} className="hidden" disabled={uploading} />
                </label>
              )}
            </motion.div>

            <div className="text-white pb-2 md:pb-4">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-2xl md:text-4xl font-extrabold mb-1"
              >
                {candidate.name}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-sm md:text-lg flex items-center gap-1.5"
              >
                <span>📍</span> {candidate.country}
              </motion.p>
            </div>
          </div>
        </section>

        <div className="sticky top-0 z-20 bg-black/100 shadow-md">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-center h-14 md:h-16 gap-2 md:gap-4">
              {tabs.map((tab) => {
                if (tab === "send gift") {
                  return (
                    <SendGiftTabButton
                      key={tab}
                      isActive={activeTab === tab}
                      onClick={() => handleTabChange(tab)}
                      isApproved={isApproved}
                    />
                  );
                }
                return (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-4 rounded-lg text-sm md:text-base font-semibold capitalize transition-all inline-flex items-center justify-center h-8 md:h-10 ${
                      activeTab === tab
                        ? "bg-red-600 text-white shadow-lg"
                        : "bg-white text-gray-600 hover:bg-green-600 hover:text-white hover:shadow"
                    }`}
                    style={{ lineHeight: '1' }}
                  >
                    {tab}
                  </button>
                );
              })}

              <MoreMenu
                onShare={handleShare}
                onCrushChallenge={handleCrushChallenge}
                onSeeGifters={handleSeeGifters}
                isActive={false}
              />
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="content-section"
          >
            {activeTab === "gallery" && (
              <Gallery
                images={galleryImages}
                isOwner={isOwner}
                onUpload={handleGalleryUpload}
                onDelete={handleDeleteImage}
                onAddCaption={handleAddCaption}
              />
            )}

            {activeTab === "vote" && isApproved && (
              <div ref={voteRef} id="vote" className="py-6 md:py-8 px-4">
                <VoteSection candidate={candidate} />
              </div>
            )}

            {activeTab === "send gift" && (
              <div ref={giftRef} id="gift" className="py-6 md:py-8 px-4">
                <GiftSection candidate={candidate} />
              </div>
            )}

            {activeTab === "about" && (
              <section className="py-6 md:py-8 px-4 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-xl"
                >
                  <h2 className="text-lg md:text-2xl font-bold mb-3 text-center">
                    <span className="text-gray-800">About</span>{" "}
                    <span className="text-red-600">{candidate.name}</span>
                  </h2>
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed text-center">
                    {candidate.bio}
                  </p>
                </motion.div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="hidden md:block"><Footer /></div>

      {/* Pending Approval Popup */}
      {showPendingPopup && (
        <PendingApprovalPopup
          onDismiss={() => setShowPendingPopup(false)}
          onLearnMore={() => {
            setShowPendingPopup(false);
            router.push('/learnmore');
          }}
        />
      )}

      {/* Qualification Warning Popup */}
      {showQualificationWarning && qualification && (
        <QualificationWarningPopup
          daysLeft={qualification.daysLeft}
          graceActive={qualification.graceActive}
          onDismiss={() => setShowQualificationWarning(false)}
          onLearnMore={() => {
            setShowQualificationWarning(false);
            router.push('/learnmore');
          }}
        />
      )}

      {/* ✅ Crush Challenge Modal */}
      <CrushChallenge
        candidateId={candidate.id}
        candidateName={candidate.name}
        imageUrl={candidate.image_url}
        isOpen={challengeOpen}
        onClose={() => setChallengeOpen(false)}
      />

      {/* Share Toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm"
          >
            <CheckCircle className="w-4 h-4 text-green-600" />
            Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}