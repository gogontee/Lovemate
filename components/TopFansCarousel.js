// components/TopFansCarousel.js
import { useState } from "react";
import { User, Crown, Heart, ArrowRight, Ticket, Star, Award, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// Helper to format name (first name + first letter of second name)
const formatName = (fullName) => {
  if (!fullName) return "Anonymous Fan";
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1].charAt(0)}.`;
};

// Helper to get rank icon and color based on position
const getRankStyle = (index) => {
  const styles = [
    { icon: <Crown className="w-4 h-4 md:w-5 md:h-5 text-white" />, bg: "bg-[#DC143C] shadow-[0_0_15px_rgba(220,20,60,0.6)]" },
    { icon: <Crown className="w-4 h-4 md:w-5 md:h-5 text-white" />, bg: "bg-rose-600" },
    { icon: <Crown className="w-4 h-4 md:w-5 md:h-5 text-white" />, bg: "bg-rose-700" },
    { icon: <Crown className="w-4 h-4 md:w-5 md:h-5 text-white" />, bg: "bg-rose-800" },
  ];
  return styles[index] || styles[0];
};

// Helper to get motivational message
const getMotivation = (index) => {
  const messages = [
    { text: "Leading the Pack", icon: "👑" },
    { text: "Rising Star", icon: "⭐" },
    { text: "Top Contender", icon: "🚀" },
    { text: "Fan Favorite", icon: "💝" },
  ];
  return messages[index] || messages[0];
};

// Helper to get milestone based on points
const getMilestone = (points) => {
  if (points < 1) return "New Fan";
  if (points < 10) return "Bronze Fan";
  if (points < 50) return "Silver Fan";
  if (points < 100) return "Gold Fan";
  if (points < 500) return "Platinum Fan";
  return "Oracle Fan";
};

export default function TopFansCarousel({ fans = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  // --- EMPTY STATE: Top Fan Challenge ---
  if (!fans || fans.length === 0) {
    return (
      <section className="bg-[#0a0a0f] py-12 md:py-20 px-4 relative overflow-hidden">
        {/* Reddish Glow Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#DC143C]/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3 z-0"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-600/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/4 translate-y-1/4 z-0"></div>

        {/* Animated Background Hearts */}
        <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: Math.random() * 100 + "vw", y: Math.random() * 100 + "vh", scale: 0 }}
              animate={{ y: ["0vh", "-20vh", "0vh"], rotate: [0, 360], scale: [0, 1, 0] }}
              transition={{ duration: 15 + i * 2, repeat: Infinity, delay: i * 2 }}
              className="absolute text-[#DC143C]"
            >
              <Heart size={30 + i * 10} fill="currentColor" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          {/* Decorative Crown */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <Crown className="w-12 h-12 md:w-16 md:h-16 text-[#DC143C] drop-shadow-[0_0_15px_rgba(220,20,60,0.5)]" />
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-white">The Ultimate </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC143C] to-rose-500">
              Fan Challenge
            </span>
          </h2>

          <p className="text-gray-400 text-sm md:text-lg mb-8 max-w-2xl mx-auto">
            The leaderboard is waiting for its first legends! Step up, support your favorite LoveMate, and unlock insane rewards.
          </p>

          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-[#121216]/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 md:p-10 border border-[#DC143C]/30 max-w-3xl mx-auto"
          >
            <h3 className="text-xl md:text-2xl font-bold text-white mb-6">
              Why Join the Top Fan Ranks?
            </h3>
            
            {/* Perks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                <Award className="w-5 h-5 text-[#DC143C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white text-sm font-semibold">Exclusive Top Fan Badge</h4>
                  <p className="text-xs text-gray-400">Stand out with a unique profile badge.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                <Ticket className="w-5 h-5 text-[#DC143C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white text-sm font-semibold">Free VIP Grand Finale Tickets</h4>
                  <p className="text-xs text-gray-400">Watch the LoveMate finale live in VIP style.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                <Star className="w-5 h-5 text-[#DC143C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white text-sm font-semibold">Exclusive Recognition</h4>
                  <p className="text-xs text-gray-400">Get a shoutout on the official broadcast.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                <Sparkles className="w-5 h-5 text-[#DC143C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white text-sm font-semibold">LoveMate Top Prizes</h4>
                  <p className="text-xs text-gray-400">Mystery boxes, merch, and so much more.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#DC143C] to-rose-600 text-white rounded-full text-sm font-bold hover:from-rose-600 hover:to-[#DC143C] transition-all shadow-[0_0_20px_rgba(220,20,60,0.4)] hover:shadow-[0_0_30px_rgba(220,20,60,0.6)] transform hover:-translate-y-0.5 group"
              >
                <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Sign Up as a Fan & Support Your Mate
              </Link>
              <Link
                href="/vote"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent text-white rounded-full text-sm font-semibold border border-white/20 hover:bg-white/10 transition-all"
              >
                <Heart className="w-4 h-4 text-[#DC143C]" />
                Vote Now
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>
    );
  }

  // --- ACTIVE STATE: Render Top Fans ---
  return (
    <section className="bg-[#0a0a0f] py-12 md:py-20 px-4 relative overflow-hidden">
      {/* Reddish Glow Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#DC143C]/10 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3 z-0"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-600/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/4 translate-y-1/4 z-0"></div>

      {/* Floating Hearts Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * 100 + "vw", y: Math.random() * 100 + "vh" }}
            animate={{ 
              y: ["0vh", "-30vh", "0vh"],
              x: ["0vw", `${(Math.random() - 0.5) * 20}vw`, "0vw"],
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 20 + i * 3, repeat: Infinity, delay: i * 2, ease: "easeInOut" }}
            className="absolute text-[#DC143C]"
          >
            <Heart size={20 + i * 5} fill="currentColor" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-block mb-2"
          >
            <Crown className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
            <span className="text-white">Top </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC143C] to-rose-500">
              Fans
            </span>
          </h2>
          <p className="text-sm md:text-base text-gray-400">
            The most dedicated supporters leading the charge this season
          </p>
        </div>

        {/* Grid designed for up to 4 fans */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {fans.slice(0, 4).map((fan, index) => {
            const rankStyle = getRankStyle(index);
            const motivation = getMotivation(index);
            
            return (
              <motion.div
                key={fan.id || index}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="relative group"
              >
                {/* Glow Effect behind the card */}
                <motion.div
                  animate={{ 
                    scale: hoveredIndex === index ? 1.05 : 1,
                    opacity: hoveredIndex === index ? 0.5 : 0.2
                  }}
                  className="absolute inset-0 bg-[#DC143C] rounded-2xl blur-xl -z-10 transition-all duration-300"
                />

                {/* Redesigned Card */}
                <div className="relative bg-[#121216] rounded-2xl shadow-xl overflow-hidden border border-[#DC143C]/30 group-hover:border-[#DC143C]/60 transition-colors duration-300">
                  
                  {/* Image Section */}
                  <div className="relative h-40 sm:h-52 md:h-64 w-full bg-[#181820]">
                    
                    {/* Rank Icon - Top Right */}
                    <div className={`absolute top-3 right-3 z-20 ${rankStyle.bg} rounded-full p-2 shadow-lg border border-white/20`}>
                      {rankStyle.icon}
                    </div>
                    
                    {/* Milestone Tag - Top Left */}
                    <div className="absolute top-3 left-3 z-20 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-md">
                      <span className="text-[9px] md:text-[11px] font-bold tracking-wider text-white uppercase">
                        {getMilestone(fan.points)}
                      </span>
                    </div>
                    
                    {/* Profile Image */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {fan.photo_url ? (
                        <Image
                          src={fan.photo_url}
                          alt={fan.full_name || "Fan"}
                          fill
                          unoptimized 
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#181820]">
                          <User className="w-12 h-12 md:w-16 md:h-16 text-[#DC143C]/50" />
                        </div>
                      )}
                      {/* Gradient Overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-[#121216]/40 to-transparent" />
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="relative p-3 md:p-4 text-center -mt-6 z-20">
                    {/* Name */}
                    <h3 className="text-sm md:text-lg font-bold text-white truncate mb-1">
                      {formatName(fan.full_name)}
                    </h3>

                    {/* Motivational Badge */}
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#DC143C]/10 border border-[#DC143C]/20">
                      <span className="text-xs">{motivation.icon}</span>
                      <span className="text-[9px] md:text-xs font-bold text-[#DC143C] uppercase tracking-wide">
                        {motivation.text}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-10"
        >
          <Link
            href="/vote"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#DC143C] to-rose-600 text-white rounded-full text-sm font-bold hover:from-rose-600 hover:to-[#DC143C] transition-all shadow-[0_0_20px_rgba(220,20,60,0.3)] hover:shadow-[0_0_30px_rgba(220,20,60,0.5)] transform hover:-translate-y-0.5 group"
          >
            <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Climb the Leaderboard - Vote Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}