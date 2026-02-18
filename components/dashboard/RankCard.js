import { useState, useEffect } from "react";
import { Star, TrendingUp, Award, Crown, Zap, Sparkles, Medal, Rocket, Heart, Gift, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import confettiAnimation from "../../public/animations/confetti.json";

// Rank milestones based on points
const RANKS = [
  { name: "New", min: 0, max: 0.99, color: "from-gray-400 to-gray-500", icon: "🌟", next: "Bronze" },
  { name: "Bronze", min: 1, max: 9.99, color: "from-amber-600 to-amber-700", icon: "🥉", next: "Silver" },
  { name: "Silver", min: 10, max: 49.99, color: "from-slate-400 to-slate-500", icon: "🥈", next: "Gold" },
  { name: "Gold", min: 50, max: 99.99, color: "from-yellow-500 to-yellow-600", icon: "🥇", next: "Platinum" },
  { name: "Platinum", min: 100, max: 499.99, color: "from-cyan-400 to-cyan-500", icon: "💎", next: "Oracle" },
  { name: "Oracle", min: 500, max: Infinity, color: "from-purple-600 to-pink-600", icon: "🔮", next: "Oracle" },
];

// Helper to get rank based on points
const getRankFromPoints = (points) => {
  return RANKS.find(rank => points >= rank.min && points <= rank.max) || RANKS[0];
};

// Helper to calculate progress to next rank
const getProgressToNextRank = (points, currentRank) => {
  if (currentRank.name === "Oracle") return 100;
  
  const nextRank = RANKS.find(r => r.name === currentRank.next);
  if (!nextRank) return 0;
  
  const range = nextRank.min - currentRank.min;
  const progress = ((points - currentRank.min) / range) * 100;
  return Math.min(100, Math.max(0, progress));
};

// Helper to get points needed for next rank
const getPointsToNextRank = (points, currentRank) => {
  if (currentRank.name === "Oracle") return 0;
  
  const nextRank = RANKS.find(r => r.name === currentRank.next);
  if (!nextRank) return 0;
  
  return (nextRank.min - points).toFixed(2);
};

export default function RankCard({ 
  profileId,
  points = 0, 
  totalVotes = 0, 
  totalGifts = 0,
  userRank = 0,
  totalUsers = 0
}) {
  const [showMilestonePopup, setShowMilestonePopup] = useState(false);
  const [milestoneData, setMilestoneData] = useState(null);
  const [showRankTooltip, setShowRankTooltip] = useState(false);
  const [prevRank, setPrevRank] = useState(null);
  const [achievedRanks, setAchievedRanks] = useState([]); // Track which ranks have been celebrated

  // Get current rank based on points
  const currentRank = getRankFromPoints(points);
  const progress = getProgressToNextRank(points, currentRank);
  const pointsToNext = getPointsToNextRank(points, currentRank);

  // Check for milestone achievements on points change - ONLY ONCE PER RANK
  useEffect(() => {
    if (prevRank && prevRank.name !== currentRank.name) {
      // Check if this rank has already been achieved and celebrated
      if (!achievedRanks.includes(currentRank.name) && currentRank.name !== "New") {
        // New rank achieved that hasn't been celebrated yet
        setMilestoneData({
          fromRank: prevRank.name,
          toRank: currentRank.name,
          points: points
        });
        setShowMilestonePopup(true);
        
        // Add to achieved ranks
        setAchievedRanks(prev => [...prev, currentRank.name]);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowMilestonePopup(false);
        }, 5000);
      }
    }
    setPrevRank(currentRank);
  }, [points, currentRank.name, achievedRanks]);

  // Load achieved ranks from localStorage on mount (optional - to persist across sessions)
  useEffect(() => {
    if (profileId) {
      const storedRanks = localStorage.getItem(`achievedRanks_${profileId}`);
      if (storedRanks) {
        setAchievedRanks(JSON.parse(storedRanks));
      }
    }
  }, [profileId]);

  // Save achieved ranks to localStorage when they change
  useEffect(() => {
    if (profileId && achievedRanks.length > 0) {
      localStorage.setItem(`achievedRanks_${profileId}`, JSON.stringify(achievedRanks));
    }
  }, [achievedRanks, profileId]);

  return (
    <>
      {/* Full Screen Confetti Animation */}
      <AnimatePresence>
        {showMilestonePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <Lottie
              animationData={confettiAnimation}
              loop={false}
              className="w-full h-full object-cover"
            />
            
            {/* Milestone Message - Smaller */}
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: -50 }}
              className="absolute bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-rose-200 max-w-xs text-center"
              style={{ pointerEvents: 'none' }}
            >
              <div className="text-4xl mb-2">{currentRank.icon}</div>
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-rose-600">
                Rank Up!
              </h3>
              <p className="text-sm text-gray-700 mt-1">
                You've reached <span className="font-bold text-rose-600">{currentRank.name}</span>!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-white to-rose-50/50 rounded-xl shadow-lg p-4 border border-rose-100 relative overflow-hidden group"
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        
        {/* Floating Glow Effect */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-r from-red-600/20 to-rose-600/20 rounded-full blur-3xl"
        />

        <div className="relative z-10">
          {/* Header - More Compact */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg shadow-md">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-sm text-gray-800">Fan Rank</h3>
            </div>
            
            {/* Rank Badge with Hover Tooltip */}
            <div 
              className="relative"
              onMouseEnter={() => setShowRankTooltip(true)}
              onMouseLeave={() => setShowRankTooltip(false)}
            >
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${currentRank.color} shadow-sm cursor-help`}>
                #{userRank} • {currentRank.name}
              </div>
              
              {/* Tooltip */}
              <AnimatePresence>
                {showRankTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-1 w-40 bg-gray-900 text-white text-[10px] rounded-lg p-2 shadow-xl z-20"
                  >
                    <p className="font-semibold mb-1">Your Ranking</p>
                    <p>#{userRank} of {totalUsers} fans</p>
                    <div className="w-full h-1 bg-gray-700 rounded-full mt-1">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(userRank / totalUsers) * 100}%` }}
                        className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Rank Display - Compact */}
          <div className="mb-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl"
              >
                {currentRank.icon}
              </motion.div>
              <div>
                <h2 className={`text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r ${currentRank.color}`}>
                  {currentRank.name}
                </h2>
                <p className="text-[10px] text-gray-500">{points.toFixed(2)} pts</p>
              </div>
            </div>
          </div>

          {/* Progress Section - Compact */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1 text-[10px]">
              <span className="text-gray-500">Progress to {currentRank.next}</span>
              <span className="font-semibold text-rose-600">{progress.toFixed(0)}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="relative group/progress cursor-help">
              <div className="w-full h-1.5 bg-rose-100 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className={`h-full bg-gradient-to-r ${currentRank.color} rounded-full relative`}
                >
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
              </div>
            </div>

            {currentRank.name !== "Oracle" && (
              <p className="text-[9px] text-gray-400 mt-1 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-rose-400" />
                {pointsToNext} pts to {currentRank.next}
              </p>
            )}
          </div>

          {/* Stats Grid - More Compact */}
          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-rose-100">
            <div className="text-center bg-gradient-to-b from-white to-rose-50/50 rounded-lg p-1.5 shadow-xs">
              <div className="flex justify-center mb-0.5">
                <Medal className="w-3 h-3 text-rose-600" />
              </div>
              <p className="text-sm font-bold text-gray-800">{points.toFixed(1)}</p>
              <p className="text-[8px] text-gray-400">Points</p>
            </div>
            
            <div className="text-center bg-gradient-to-b from-white to-rose-50/50 rounded-lg p-1.5 shadow-xs">
              <div className="flex justify-center mb-0.5">
                <Heart className="w-3 h-3 text-rose-600" />
              </div>
              <p className="text-sm font-bold text-gray-800">{totalVotes}</p>
              <p className="text-[8px] text-gray-400">Votes</p>
            </div>
            
            <div className="text-center bg-gradient-to-b from-white to-rose-50/50 rounded-lg p-1.5 shadow-xs">
              <div className="flex justify-center mb-0.5">
                <Gift className="w-3 h-3 text-rose-600" />
              </div>
              <p className="text-sm font-bold text-gray-800">{totalGifts}</p>
              <p className="text-[8px] text-gray-400">Gifts</p>
            </div>
          </div>

          {/* Motivational Message - Minimal */}
          <div className="mt-2 p-1.5 bg-gradient-to-r from-rose-50 to-red-50 rounded-lg text-center">
            <p className="text-[8px] text-gray-600 flex items-center justify-center gap-1">
              <Rocket className="w-2.5 h-2.5 text-rose-600" />
              Keep supporting to win!
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}