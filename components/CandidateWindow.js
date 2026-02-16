import { useEffect, useState, useRef } from "react";
import CandidateCard from "./CandidateCard";
import { supabase } from "@/utils/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import { 
  Bot, 
  Star, 
  Gift, 
  Trophy, 
  Sparkles, 
  ChevronRight, 
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  PartyPopper,
  Rocket,
  Calendar,
  Camera,
  Heart,
  Crown,
  Zap,
  RefreshCw,
  Share2,
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  Link2,
  Send,
  MoreHorizontal,
  UserPlus,
  Users,
  Search,
  X,
  ThumbsUp,
  Award
} from "lucide-react";

import celebrationAnimation from "../public/animations/Fireworks.json";
import confettiAnimation from "../public/animations/confetti.json";
import starsWinnerAnimation from "../public/animations/Stars - winner.json";
import loveduckAnimation from "../public/animations/loveduck.json";
import cuteBearAnimation from "../public/animations/Cute bear dancing.json";

// Icon mapping for database-driven messages
const iconMap = {
  'Zap': <Zap className="w-4 h-4" />,
  'Rocket': <Rocket className="w-4 h-4" />,
  'Heart': <Heart className="w-4 h-4" />,
  'Star': <Star className="w-4 h-4" />,
  'Trophy': <Trophy className="w-4 h-4" />,
  'Crown': <Crown className="w-4 h-4" />,
  'Sparkles': <Sparkles className="w-4 h-4" />,
  'Bot': <Bot className="w-4 h-4" />,
  'Clock': <Clock className="w-4 h-4" />,
  'AlertCircle': <AlertCircle className="w-4 h-4" />,
  'PartyPopper': <PartyPopper className="w-4 h-4" />,
  'Camera': <Camera className="w-4 h-4" />,
  'Gift': <Gift className="w-4 h-4" />,
  'Award': <Award className="w-4 h-4" />,
  'Users': <Users className="w-4 h-4" />,
  'UserPlus': <UserPlus className="w-4 h-4" />
};

// These remain static as requested
const selectedMessages = [
  {
    id: 1,
    icon: <PartyPopper className="w-4 h-4" />,
    title: "🎉 THE STARS HAVE SPOKEN! 🎉",
    message: "You've been chosen as one of the 24 Mates! Your destiny awaits in the mansion!",
    color: "from-green-500 to-emerald-600",
    animation: celebrationAnimation,
    animationType: "celebration"
  },
  {
    id: 2,
    icon: <Camera className="w-4 h-4" />,
    title: "Time to Shine!",
    message: "Orakul says: 'Prepare your wardrobe, young star! Every moment will be legendary!' ✨",
    color: "from-purple-500 to-pink-600",
    animation: starsWinnerAnimation,
    animationType: "stars"
  },
  {
    id: 3,
    icon: <Heart className="w-4 h-4" />,
    title: "Love is Calling!",
    message: "The stars predict a romantic journey. Keep your heart open! 💕",
    color: "from-rose-500 to-red-600",
    animation: confettiAnimation,
    animationType: "confetti"
  },
  {
    id: 4,
    icon: <Trophy className="w-4 h-4" />,
    title: "Destiny Awaits!",
    message: "$10,000 worth of prizes await the worthy! Orakul believes in you! 🏆",
    color: "from-yellow-500 to-orange-600",
    animation: celebrationAnimation,
    animationType: "celebration"
  },
  {
    id: 5,
    icon: <Crown className="w-4 h-4" />,
    title: "A Star is Born!",
    message: "The prophecy unfolds! Nigeria will fall in love with you! 🌟",
    color: "from-blue-500 to-indigo-600",
    animation: starsWinnerAnimation,
    animationType: "stars"
  }
];

const approvedMessages = [
  {
    id: 1,
    icon: <Zap className="w-4 h-4" />,
    message: "⚡ APPROVED! The cosmic energy is with you. Time to prove you're worthy of the green star!",
    action: "Share your profile and gather those votes!",
    animation: confettiAnimation,
    animationType: "confetti"
  },
  {
    id: 2,
    icon: <Rocket className="w-4 h-4" />,
    message: "🚀 Launch sequence initiated! The 24-seat vote challenge awaits your greatness!",
    action: "Every vote is a step toward destiny. Campaign NOW!",
    animation: celebrationAnimation,
    animationType: "celebration"
  },
  {
    id: 3,
    icon: <Heart className="w-4 h-4" />,
    message: "💖 The Lovemate nation is waiting to meet you! Let them feel your energy!",
    action: "Share your story, share your dreams!",
    animation: starsWinnerAnimation,
    animationType: "stars"
  },
  {
    id: 4,
    icon: <Star className="w-4 h-4" />,
    message: "⭐ The yellow light shines upon you! One step closer to stardom!",
    action: "Get your fans ready. The cosmic battle begins soon!",
    animation: confettiAnimation,
    animationType: "confetti"
  },
  {
    id: 5,
    icon: <Trophy className="w-4 h-4" />,
    message: "🏆 Orakul sees greatness in your future! The journey to the top 24 starts today!",
    action: "Dream big, vote bigger!",
    animation: celebrationAnimation,
    animationType: "celebration"
  }
];

export default function CandidateWindow({ profileId }) {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [currentPopup, setCurrentPopup] = useState(null);
  const [popupType, setPopupType] = useState(null);
  const [lastPopupTime, setLastPopupTime] = useState(null);
  const [popupHistory, setPopupHistory] = useState([]);
  const [orakulMessage, setOrakulMessage] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showStarsWinner, setShowStarsWinner] = useState(false);
  const [showLoveduck, setShowLoveduck] = useState(false);
  const [showCuteBear, setShowCuteBear] = useState(false);

  // New states for database-driven messages
  const [orakulMessages, setOrakulMessages] = useState([]);
  const [eligibleMessages, setEligibleMessages] = useState([]);
  
  // New states for favorite candidates feature
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [candidateCode, setCandidateCode] = useState("");
  const [foundCandidate, setFoundCandidate] = useState(null);
  const [favoriteCandidates, setFavoriteCandidates] = useState([]);
  const [showAddFavorite, setShowAddFavorite] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Fetch Orakul messages from database
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("lovemate")
        .select("orakul_message, eligible_message")
        .single();

      if (!error && data) {
        if (data.orakul_message && Array.isArray(data.orakul_message)) {
          setOrakulMessages(data.orakul_message);
        }
        if (data.eligible_message && Array.isArray(data.eligible_message)) {
          setEligibleMessages(data.eligible_message);
        }
      }
    };

    fetchMessages();
  }, []);

  // Fetch favorite candidates
  useEffect(() => {
    if (!profileId) return;

    const fetchFavorites = async () => {
      setLoadingFavorites(true);
      
      // Get current user's profile with favorites
      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("favorite")
        .eq("id", profileId)
        .single();

      if (!profileError && profileData?.favorite) {
        const favoriteIds = profileData.favorite;
        
        if (favoriteIds.length > 0) {
          // Fetch candidate details for each favorite
          const { data: candidatesData, error: candidatesError } = await supabase
            .from("candidates")
            .select("id, name, image_url, votes, gifts, country, code")
            .in("id", favoriteIds);

          if (!candidatesError && candidatesData) {
            setFavorites(candidatesData);
          }
        } else {
          setFavorites([]);
        }
      }
      
      setLoadingFavorites(false);
    };

    fetchFavorites();
  }, [profileId]);

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // Load popup history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('candidatePopupHistory');
    if (history) {
      setPopupHistory(JSON.parse(history));
    }
    const lastTime = localStorage.getItem('lastPopupTime');
    if (lastTime) {
      setLastPopupTime(parseInt(lastTime));
    }

    const hasSeenStarsWinner = localStorage.getItem('hasSeenStarsWinner');
    if (hasSeenStarsWinner) {
      setShowStarsWinner(false);
    }
  }, []);

  // Handle character animations based on candidate status
  useEffect(() => {
    if (!candidate) return;

    if (candidate.role === "No") {
      setShowLoveduck(true);
      setShowCuteBear(false);
      setShowStarsWinner(false);
      
      const loveduckInterval = setInterval(() => {
        setShowLoveduck(prev => !prev);
      }, 30000);
      
      return () => clearInterval(loveduckInterval);
    }
    
    if (candidate.role === "Yes" && !candidate.selected_24) {
      setShowLoveduck(false);
      setShowCuteBear(true);
      setShowStarsWinner(false);
    }
    
    if (candidate.selected_24) {
      setShowLoveduck(false);
      setShowCuteBear(false);
      
      const hasSeenStarsWinner = localStorage.getItem('hasSeenStarsWinner');
      
      if (!hasSeenStarsWinner) {
        setShowStarsWinner(true);
        
        setTimeout(() => {
          setShowStarsWinner(false);
          setShowCuteBear(true);
          localStorage.setItem('hasSeenStarsWinner', 'true');
        }, 30000);
      } else {
        setShowCuteBear(true);
      }
    }
  }, [candidate]);

  // Check if candidate data has changed to trigger status popups
  useEffect(() => {
    if (!candidate) return;

    const checkForNewStatus = async () => {
      const history = popupHistory || [];
      
      if (candidate.selected_24 && !history.includes('selected_24')) {
        const randomIndex = Math.floor(Math.random() * selectedMessages.length);
        setCurrentPopup(selectedMessages[randomIndex]);
        setPopupType('selected');
        setShowPopup(true);
        setShowAnimation(true);
        
        const newHistory = [...history, 'selected_24'];
        setPopupHistory(newHistory);
        localStorage.setItem('candidatePopupHistory', JSON.stringify(newHistory));
      }
      else if (candidate.role === 'Yes' && !history.includes('approved')) {
        const randomIndex = Math.floor(Math.random() * approvedMessages.length);
        setCurrentPopup({
          ...approvedMessages[randomIndex],
          title: "🎯 THE STARS ALIGN! 🎯"
        });
        setPopupType('approved');
        setShowPopup(true);
        setShowAnimation(true);
        
        const newHistory = [...history, 'approved'];
        setPopupHistory(newHistory);
        localStorage.setItem('candidatePopupHistory', JSON.stringify(newHistory));
      }
    };

    checkForNewStatus();
  }, [candidate]);

  useEffect(() => {
    if (!profileId) {
      setCandidate(null);
      setLoading(false);
      return;
    }

    const fetchCandidate = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("user_id", profileId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching candidate:", error);
        setCandidate(null);
      } else {
        setCandidate(data);
      }

      setLoading(false);
    };

    fetchCandidate();
  }, [profileId]);

  const handleCheckStatus = () => {
    const now = Date.now();
    
    // If candidate is selected_24, show special message without rate limiting
    if (candidate?.selected_24) {
      setCurrentPopup({
        icon: <Crown className="w-8 h-8" />,
        title: "🏆 CONGRATULATIONS! 🏆",
        message: "You have been selected as one of the 24 Lovemate! Now it is time to give the world an unforgettable show.. congratulations!",
        color: "from-green-500 to-emerald-600"
      });
      setPopupType('selected');
      setShowPopup(true);
      setShowAnimation(true);
      return;
    }
    
    // Regular rate limiting for non-selected candidates
    if (lastPopupTime && now - lastPopupTime < 3600000) {
      const minutesLeft = Math.ceil((3600000 - (now - lastPopupTime)) / 60000);
      setOrakulMessage({
        icon: <Clock className="w-3 h-3" />,
        text: `🔮 Orakul needs to recharge... Check again in ${minutesLeft} minutes!`
      });
      setTimeout(() => setOrakulMessage(null), 3000);
      return;
    }

    setIsThinking(true);
    setOrakulMessage(null);

    setTimeout(() => {
      // Determine which message set to use based on candidate role
      const messageSet = candidate?.role === "Yes" ? eligibleMessages : orakulMessages;
      
      if (messageSet.length === 0) {
        // Fallback messages if database is empty
        const fallbackMessages = [
          {
            id: 1,
            icon: <Bot className="w-4 h-4" />,
            message: "🔮 Orakul is consulting the stars... Please check back soon!"
          }
        ];
        
        setCurrentPopup({
          icon: fallbackMessages[0].icon,
          message: fallbackMessages[0].message,
          title: "🔮 ORAKUL'S WISDOM"
        });
      } else {
        // Get messages that haven't been shown yet
        const availableMessages = messageSet.filter(
          msg => !popupHistory.includes(`check_${msg.id}`)
        );
        
        let messageToShow;
        let newHistory;
        
        if (availableMessages.length === 0) {
          const checkMessagesOnly = popupHistory.filter(item => !item.startsWith('check_'));
          messageToShow = messageSet[Math.floor(Math.random() * messageSet.length)];
          newHistory = [...checkMessagesOnly, `check_${messageToShow.id}`];
        } else {
          messageToShow = availableMessages[Math.floor(Math.random() * availableMessages.length)];
          newHistory = [...popupHistory, `check_${messageToShow.id}`];
        }

        // Replace placeholders with actual candidate values
        let processedMessage = messageToShow.message;
        if (candidate) {
          processedMessage = processedMessage
            .replace(/{votes}/g, candidate.votes || 0)
            .replace(/{gifts}/g, candidate.gifts || 0)
            .replace(/{giftWorth}/g, candidate.gift_worth || 0)
            .replace(/{name}/g, candidate.name || "Candidate")
            .replace(/{country}/g, candidate.country || "Nigeria");
        }

        // Get the icon component from the map or use Bot as fallback
        const iconComponent = iconMap[messageToShow.icon] || <Bot className="w-4 h-4" />;

        setCurrentPopup({
          icon: iconComponent,
          message: processedMessage,
          title: "🔮 ORAKUL'S WISDOM"
        });

        // Update history
        setPopupHistory(newHistory);
        localStorage.setItem('candidatePopupHistory', JSON.stringify(newHistory));
      }
      
      setPopupType('check');
      setShowPopup(true);
      setShowAnimation(true);
      
      localStorage.setItem('lastPopupTime', now.toString());
      setLastPopupTime(now);
      
      setIsThinking(false);
    }, 2000);
  };

  const handleShare = async (platform) => {
    if (!candidate) return;
    
    const shareUrl = `https://www.lovemateshow.com/candidate/${candidate.id}`;
    const shareText = `I'm a contestant on Lovemate Show! Support my journey to find love and win $10,000! Vote for me here:`;
    
    switch(platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'instagram':
        await navigator.clipboard.writeText(shareUrl);
        setOrakulMessage({
          icon: <CheckCircle className="w-3 h-3" />,
          text: "🔮 Link copied! Share it on your Instagram story!"
        });
        setTimeout(() => setOrakulMessage(null), 3000);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'messenger':
        window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=YOUR_FB_APP_ID&redirect_uri=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'copy':
        await navigator.clipboard.writeText(shareUrl);
        setOrakulMessage({
          icon: <CheckCircle className="w-3 h-3" />,
          text: "🔮 Link copied to clipboard! Share it everywhere!"
        });
        setTimeout(() => setOrakulMessage(null), 3000);
        break;
    }
    
    setShowShareOptions(false);
  };

  const handleAddFavorite = async () => {
    if (!foundCandidate || !profileId) return;

    // Get current favorites
    const { data: profileData } = await supabase
      .from("profile")
      .select("favorite")
      .eq("id", profileId)
      .single();

    const currentFavorites = profileData?.favorite || [];
    
    if (currentFavorites.includes(foundCandidate.id)) {
      setOrakulMessage({
        icon: <AlertCircle className="w-3 h-3" />,
        text: "🔮 This candidate is already in your favorites!"
      });
      setTimeout(() => setOrakulMessage(null), 3000);
      setShowAddFavorite(false);
      setFoundCandidate(null);
      setCandidateCode("");
      return;
    }

    // Add new favorite
    const newFavorites = [...currentFavorites, foundCandidate.id];
    
    const { error } = await supabase
      .from("profile")
      .update({ favorite: newFavorites })
      .eq("id", profileId);

    if (!error) {
      setFavorites([...favorites, foundCandidate]);
      setOrakulMessage({
        icon: <CheckCircle className="w-3 h-3" />,
        text: `🔮 ${foundCandidate.name} added to your favorites!`
      });
      setTimeout(() => setOrakulMessage(null), 3000);
      setShowAddFavorite(false);
      setFoundCandidate(null);
      setCandidateCode("");
    }
  };

  const handleSearchCandidate = async () => {
    if (!candidateCode) return;

    const { data, error } = await supabase
      .from("candidates")
      .select("id, name, image_url, votes, gifts, country")
      .eq("code", candidateCode)
      .maybeSingle();

    if (!error && data) {
      setFoundCandidate(data);
    } else {
      setOrakulMessage({
        icon: <AlertCircle className="w-3 h-3" />,
        text: "🔮 No candidate found with that code!"
      });
      setTimeout(() => setOrakulMessage(null), 3000);
    }
  };

  const getStatusIndicator = () => {
    if (!candidate) return null;
    
    if (candidate.selected_24) {
      return {
        color: "bg-green-500",
        text: "🌟 SELECTED FOR THE MANSION! 🌟",
        icon: <Crown className="w-3 h-3" />,
        glow: "shadow-[0_0_12px_rgba(34,197,94,0.5)]"
      };
    }
    if (candidate.role === "Yes") {
      return {
        color: "bg-yellow-400",
        text: "✅ APPROVED CANDIDATE",
        icon: <Star className="w-3 h-3" />,
        glow: "shadow-[0_0_12px_rgba(250,204,21,0.5)]"
      };
    }
    return {
      color: "bg-orange-400",
      text: "⏳ PENDING APPROVAL",
      icon: <Clock className="w-3 h-3" />,
      glow: "shadow-[0_0_12px_rgba(251,146,60,0.5)]"
    };
  };

  const getStats = () => {
    if (!candidate) return null;
    return {
      votes: candidate.votes || 0,
      gifts: candidate.gifts || 0,
      giftWorth: candidate.gift_worth || 0
    };
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-xl shadow-lg p-4 border border-purple-500/30 overflow-hidden w-full"
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Bot className="w-10 h-10 text-purple-400" />
          </motion.div>
          <p className="text-purple-300 font-mono text-xs animate-pulse">
            🔮 ORAKUL IS CONSULTING THE STARS...
          </p>
        </div>
      </motion.div>
    );
  }

  if (!candidate) {
    return (
      <>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-xl shadow-lg p-5 border border-purple-500/30 overflow-hidden w-full"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          
          <div className="relative z-10">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex justify-center mb-3"
            >
              <Bot className="w-14 h-14 text-purple-400" />
            </motion.div>
            
            <h3 className="text-lg font-bold text-white mb-3 text-center font-mono">
              🔮 ARE YOU HERE TO...
            </h3>
            
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCodeInput(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg py-2 px-3 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Heart className="w-3 h-3" />
                <span>CHEER A FAVORITE CANDIDATE</span>
              </motion.button>
              
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="/register"
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg py-2 px-3 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <UserPlus className="w-3 h-3" />
                <span>PARTICIPATE AS CANDIDATE</span>
              </motion.a>
            </div>

            {/* Code Input Modal */}
            <AnimatePresence>
              {showCodeInput && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-4 bg-purple-900/50 rounded-lg p-3 border border-purple-500/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-purple-300 text-[10px] font-mono">ENTER CANDIDATE CODE</p>
                    <button
                      onClick={() => {
                        setShowCodeInput(false);
                        setFoundCandidate(null);
                        setCandidateCode("");
                      }}
                      className="p-1 hover:bg-purple-800 rounded"
                    >
                      <X className="w-3 h-3 text-purple-300" />
                    </button>
                  </div>
                  
                  <div className="flex gap-1 mb-2">
                    <input
                      type="text"
                      value={candidateCode}
                      onChange={(e) => setCandidateCode(e.target.value.toUpperCase())}
                      placeholder="e.g. A1B2"
                      maxLength={4}
                      className="flex-1 bg-gray-900 text-white text-xs rounded-lg px-2 py-1.5 border border-purple-500/30 focus:outline-none focus:border-purple-400"
                    />
                    <button
                      onClick={handleSearchCandidate}
                      className="bg-purple-600 text-white px-2 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      <Search className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Found Candidate Preview */}
                  <AnimatePresence>
                    {foundCandidate && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="bg-gray-900/50 rounded-lg p-2 border border-purple-500/20"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded overflow-hidden bg-purple-900/30 flex-shrink-0">
                            {foundCandidate.image_url ? (
                              <img 
                                src={foundCandidate.image_url.startsWith("http") 
                                  ? foundCandidate.image_url 
                                  : `https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/candidates/${foundCandidate.image_url}`
                                } 
                                alt={foundCandidate.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Bot className="w-4 h-4 text-purple-400 m-auto" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-white text-xs font-bold">{foundCandidate.name}</p>
                            <p className="text-purple-300 text-[8px]">{foundCandidate.country}</p>
                          </div>
                          <button
                            onClick={handleAddFavorite}
                            className="bg-green-600 text-white px-2 py-1 rounded text-[8px] font-semibold flex items-center gap-1"
                          >
                            <ThumbsUp className="w-2 h-2" />
                            ADD
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Favorites Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-xl shadow-lg p-4 border border-purple-500/30 overflow-hidden w-full mt-3"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:15px_15px]"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-3">
              <Award className="w-4 h-4 text-yellow-400" />
              <h3 className="text-white text-xs font-bold">YOUR FAVORITE CANDIDATES</h3>
            </div>

            {loadingFavorites ? (
              <div className="flex justify-center py-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-4 h-4 text-purple-400" />
                </motion.div>
              </div>
            ) : favorites.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {favorites.map((fav) => (
                  <motion.a
                    key={fav.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={`/candidate/${fav.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-900/50 rounded-lg p-2 border border-purple-500/20 hover:border-purple-400 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded overflow-hidden bg-purple-900/30 flex-shrink-0">
                        {fav.image_url ? (
                          <img 
                            src={fav.image_url.startsWith("http") 
                              ? fav.image_url 
                              : `https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/candidates/${fav.image_url}`
                            } 
                            alt={fav.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Bot className="w-4 h-4 text-purple-400 m-auto" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-[9px] font-bold truncate">{fav.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-yellow-400 text-[7px]">⭐ {fav.votes || 0}</span>
                          <span className="text-pink-400 text-[7px]">🎁 {fav.gifts || 0}</span>
                        </div>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-purple-300 text-[10px] mb-2">No favorite candidates yet</p>
                <button
                  onClick={() => setShowCodeInput(true)}
                  className="text-[8px] bg-purple-600 text-white px-2 py-1 rounded-full font-semibold"
                >
                  + ADD FAVORITE
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </>
    );
  }

  const status = getStatusIndicator();
  const stats = getStats();
  
  const imageUrl = candidate.image_url?.startsWith("http")
    ? candidate.image_url
    : candidate.image_url
    ? `https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/candidates/${candidate.image_url}`
    : null;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-xl shadow-lg p-3 md:p-4 border border-purple-500/30 overflow-hidden w-full"
      >
        {/* Animated background grid - smaller pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:15px_15px]"></div>
        
        {/* Floating orbs - smaller and subtler */}
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -15, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-2 right-2 w-16 h-16 bg-purple-500/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -15, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-2 left-2 w-20 h-20 bg-pink-500/10 rounded-full blur-xl"
        />

        {/* Orakul Header - more compact */}
        <div className="relative z-10 flex items-start justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="relative"
            >
              <Bot className="w-6 h-6 text-purple-400" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-purple-400 rounded-full"
              />
            </motion.div>
            <div>
              <p className="text-purple-300 text-[10px] font-mono">
                {greeting}, <span className="text-white font-semibold">{candidate.name}</span>
              </p>
              <h2 className="text-white font-bold text-xs">Candidate Portal</h2>
            </div>
          </div>
          
          {/* Status Check Button - Updated for selected_24 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckStatus}
            disabled={isThinking}
            className="relative group"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${
              candidate?.selected_24 
                ? 'from-green-500 to-emerald-600' 
                : 'from-purple-600 to-pink-600'
            } rounded-full opacity-75 group-hover:opacity-100 blur-[2px] transition duration-300`}></div>
            <div className={`relative px-2 py-1 ${
              candidate?.selected_24 ? 'bg-green-600' : 'bg-gray-900'
            } text-white rounded-full text-[8px] md:text-[10px] font-semibold flex items-center gap-1`}>
              {isThinking ? (
                <>
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  <span>...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{candidate?.selected_24 ? "CONGRAT!" : "CHECK STATUS"}</span>
                </>
              )}
            </div>
          </motion.button>
        </div>

        {/* Orakul Message */}
        {orakulMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="relative z-10 mb-2 bg-purple-900/50 rounded-lg p-1.5 border border-purple-500/30 flex items-center gap-1"
          >
            {orakulMessage.icon}
            <span className="text-purple-200 text-[9px]">{orakulMessage.text}</span>
          </motion.div>
        )}

        {/* Status Indicator - smaller */}
        <div className="relative z-10 mb-2">
          <motion.div 
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`flex items-center justify-center gap-1.5 p-1.5 rounded-lg bg-gray-900/50 border ${status.glow}`}
          >
            <div className={`w-2 h-2 rounded-full ${status.color} animate-pulse`} />
            <span className="text-white text-[9px] font-bold">{status.text}</span>
            <span className="scale-75">{status.icon}</span>
          </motion.div>
        </div>

        {/* Candidate Stats Dashboard - smaller */}
        <div className="relative z-10 grid grid-cols-3 gap-1 mb-2">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-purple-900/30 rounded-lg p-1.5 text-center border border-purple-500/20"
          >
            <div className="text-sm font-bold text-white">{stats.votes.toLocaleString()}</div>
            <div className="text-[8px] text-purple-300">VOTES</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-pink-900/30 rounded-lg p-1.5 text-center border border-pink-500/20"
          >
            <div className="text-sm font-bold text-white">{stats.gifts.toLocaleString()}</div>
            <div className="text-[8px] text-pink-300">GIFTS</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-rose-900/30 rounded-lg p-1.5 text-center border border-rose-500/20"
          >
            <div className="text-sm font-bold text-white">₦{stats.giftWorth.toLocaleString()}</div>
            <div className="text-[8px] text-rose-300">WORTH</div>
          </motion.div>
        </div>

        {/* Candidate Card - compact version */}
        <div className="relative z-10 mb-2">
          <div className="flex items-center gap-2 bg-gray-900/50 rounded-lg p-2 border border-purple-500/20">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-purple-900/30 flex items-center justify-center">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={candidate.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Bot className="w-6 h-6 text-purple-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white text-sm font-bold truncate">{candidate.name}</h3>
              <p className="text-purple-300 text-[10px] truncate">{candidate.country}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-yellow-400 text-[10px] font-semibold">⭐ {stats.votes}</span>
                <span className="text-pink-400 text-[10px] font-semibold">🎁 {stats.gifts}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons with Share */}
        <div className="relative z-10 flex flex-row gap-1 mb-3">
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={`https://www.lovemateshow.com/candidate/${candidate.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg py-1.5 px-2 text-[9px] font-semibold flex items-center justify-center gap-1 group"
          >
            <span>VIEW</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </motion.a>
          
          <div className="flex-1 relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg py-1.5 px-2 text-[9px] font-semibold flex items-center justify-center gap-1"
            >
              <Share2 className="w-2.5 h-2.5" />
              <span>SHARE</span>
            </motion.button>
            
            {/* Share Options Dropdown - compact */}
            <AnimatePresence>
              {showShareOptions && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute bottom-full mb-1 left-0 right-0 bg-gray-900 rounded-lg p-1 border border-purple-500/30 shadow-xl z-20"
                >
                  <div className="grid grid-cols-4 gap-0.5">
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="p-1 hover:bg-purple-900/50 rounded transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-3 h-3 text-green-400 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleShare('telegram')}
                      className="p-1 hover:bg-purple-900/50 rounded transition-colors"
                      title="Telegram"
                    >
                      <Send className="w-3 h-3 text-blue-400 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleShare('instagram')}
                      className="p-1 hover:bg-purple-900/50 rounded transition-colors"
                      title="Instagram"
                    >
                      <Instagram className="w-3 h-3 text-pink-400 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="p-1 hover:bg-purple-900/50 rounded transition-colors"
                      title="Facebook"
                    >
                      <Facebook className="w-3 h-3 text-blue-400 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="p-1 hover:bg-purple-900/50 rounded transition-colors"
                      title="Twitter"
                    >
                      <Twitter className="w-3 h-3 text-sky-400 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleShare('messenger')}
                      className="p-1 hover:bg-purple-900/50 rounded transition-colors"
                      title="Messenger"
                    >
                      <MessageCircle className="w-3 h-3 text-blue-400 mx-auto" />
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="p-1 hover:bg-purple-900/50 rounded transition-colors"
                      title="Copy Link"
                    >
                      <Link2 className="w-3 h-3 text-gray-400 mx-auto" />
                    </button>
                    <button
                      onClick={() => setShowShareOptions(false)}
                      className="p-1 hover:bg-purple-900/50 rounded transition-colors"
                      title="Close"
                    >
                      <MoreHorizontal className="w-3 h-3 text-gray-400 mx-auto" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Animation Container - Small and after buttons */}
        <div className="relative z-10 mt-1 flex justify-center items-center h-12">
          <AnimatePresence mode="wait">
            {showLoveduck && (
              <motion.div
                key="loveduck"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="w-12 h-12"
              >
                <Lottie
                  animationData={loveduckAnimation}
                  loop={true}
                  className="w-full h-full"
                />
              </motion.div>
            )}
            
            {showCuteBear && (
              <motion.div
                key="cutebear"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="w-12 h-12"
              >
                <Lottie
                  animationData={cuteBearAnimation}
                  loop={true}
                  className="w-full h-full"
                />
              </motion.div>
            )}
            
            {showStarsWinner && (
              <motion.div
                key="starswinner"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="w-12 h-12"
              >
                <Lottie
                  animationData={starsWinnerAnimation}
                  loop={true}
                  className="w-full h-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* System Status - ultra compact */}
        <div className="relative z-10 mt-1 text-[7px] text-purple-500 font-mono flex items-center justify-between">
          <span>$ ORAKUL v2.0</span>
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></span>
            ACTIVE
          </span>
        </div>
      </motion.div>

      {/* Full Screen Celebration Popup */}
      <AnimatePresence>
        {showPopup && currentPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPopup(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            {/* Full Screen Animation */}
            {(popupType === 'selected' || popupType === 'approved') && currentPopup.animation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 pointer-events-none z-50"
              >
                <Lottie
                  animationData={currentPopup.animation}
                  loop={true}
                  className="w-full h-full"
                />
              </motion.div>
            )}
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-3"
            >
              <div className={`bg-gradient-to-br ${currentPopup.color || 'from-purple-600 to-pink-600'} rounded-xl shadow-2xl max-w-xs w-full overflow-hidden relative`}>
                <div className="p-3 text-white relative z-10">
                  <div className="flex items-center gap-1.5 mb-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                      className="p-1 bg-white/20 rounded-lg"
                    >
                      {currentPopup.icon}
                    </motion.div>
                    <h3 className="text-sm font-bold">{currentPopup.title || "🔮 ORAKUL SPEAKS"}</h3>
                  </div>
                  
                  <p className="text-xs mb-2">{currentPopup.message}</p>
                  
                  {currentPopup.action && (
                    <div className="bg-white/20 rounded-lg p-1.5 mb-2">
                      <p className="text-[10px] font-semibold">🚀 NEXT STEP:</p>
                      <p className="text-[10px]">{currentPopup.action}</p>
                    </div>
                  )}
                  
                  {popupType === 'approved' && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold">🎯 THE 24-SEAT VOTE CHALLENGE:</p>
                      <ul className="text-[9px] space-y-0.5">
                        <li>• Share your profile with friends & family</li>
                        <li>• Campaign on social media</li>
                        <li>• Ask for votes daily</li>
                      </ul>
                    </div>
                  )}
                  
                  {popupType === 'selected' && (
                    <div className="space-y-1">
                      <p className="text-[10px]">✨ Your journey includes:</p>
                      <ul className="text-[9px] space-y-0.5">
                        <li>• Finding love on national TV</li>
                        <li>• Competing for $10,000 in prizes</li>
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="bg-black/20 p-2 relative z-10">
                  <button
                    onClick={() => {
                      setShowPopup(false);
                      setShowAnimation(false);
                    }}
                    className="w-full bg-white text-gray-900 rounded-lg py-1.5 text-xs font-semibold hover:bg-gray-100 transition-colors"
                  >
                    THANKS, ORAKUL! 🔮
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}