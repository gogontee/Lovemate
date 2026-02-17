// components/TopFansCarousel.js
import { useState, useEffect } from "react";
import { User, Crown, Heart, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    { icon: <Crown className="w-4 h-4 md:w-5 md:h-5 text-white" />, bg: "bg-red-700", border: "border-red-700" },
    { icon: <Crown className="w-4 h-4 md:w-5 md:h-5 text-white" />, bg: "bg-blue-600", border: "border-blue-600" },
    { icon: <Crown className="w-4 h-4 md:w-5 md:h-5 text-white" />, bg: "bg-green-600", border: "border-green-600" },
    { icon: <Crown className="w-4 h-4 md:w-5 md:h-5 text-white" />, bg: "bg-orange-500", border: "border-orange-500" },
  ];
  return styles[index] || styles[0];
};

// Helper to get motivational message
const getMotivation = (index) => {
  const messages = [
    { text: "Leading the Pack! 👑", icon: "👑" },
    { text: "Rising Star! ⭐", icon: "⭐" },
    { text: "Top Contender! 🚀", icon: "🚀" },
    { text: "Fan Favorite! 💝", icon: "💝" },
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
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  // If no fans yet, show call-to-action
  if (!fans || fans.length === 0) {
    return (
      <section className="bg-gradient-to-b from-white to-rose-50 py-8 md:py-12 px-4 relative overflow-hidden">
        {/* Animated Background Hearts */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 100 + "vw", 
                y: Math.random() * 100 + "vh",
                scale: 0
              }}
              animate={{ 
                y: ["0vh", "-20vh", "0vh"],
                rotate: [0, 360],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 15 + i * 2,
                repeat: Infinity,
                delay: i * 2
              }}
              className="absolute text-rose-200"
            >
              <Heart size={30 + i * 10} fill="currentColor" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          {/* Decorative Crown */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block mb-3"
          >
            <Crown className="w-10 h-10 md:w-12 md:h-12 text-rose-400" />
          </motion.div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
            <span className="text-gray-900">Top</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600">
              Fans
            </span>
          </h2>

          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-5 md:p-8 border border-rose-200 max-w-lg mx-auto"
          >
            <div className="text-5xl mb-3">🏆</div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
              Be the First Fan Leader!
            </h3>
            
            <p className="text-xs md:text-sm text-gray-600 mb-3">
              The leaderboard is empty and waiting for YOU! 🎯
            </p>

            <div className="bg-gradient-to-r from-rose-100 to-red-100 rounded-lg p-3 mb-4">
              <p className="text-xs text-gray-700">
                Support your favorite Mate with votes and gifts to earn points and climb the ranks. 
                The top 4 fans will be crowned here for all to see! 👑
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                href="/vote"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg text-sm font-semibold hover:from-red-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg group"
              >
                <Heart className="w-3 h-3 group-hover:scale-110 transition-transform" />
                Vote Now
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-rose-600 rounded-lg text-sm font-semibold border border-rose-200 hover:bg-rose-50 transition-all"
              >
                <User className="w-3 h-3" />
                Login to Support
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>
    );
  }

  // Render top fans
  return (
    <section className="bg-gradient-to-b from-white to-rose-50 py-8 md:py-12 px-4 relative overflow-hidden">
      {/* Floating Hearts Background - Reduced opacity */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "vw", 
              y: Math.random() * 100 + "vh"
            }}
            animate={{ 
              y: ["0vh", "-30vh", "0vh"],
              x: ["0vw", `${(Math.random() - 0.5) * 20}vw`, "0vw"],
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 20 + i * 3,
              repeat: Infinity,
              delay: i * 2,
              ease: "easeInOut"
            }}
            className="absolute text-rose-300"
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
        <div className="text-center mb-6 md:mb-8">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-block mb-1"
          >
            <Crown className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
          </motion.div>
          
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1">
            <span className="text-gray-900">Top</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600">
              Fans
            </span>
          </h2>
          <p className="text-xs md:text-sm text-gray-500">
            The most dedicated supporters this season
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          {fans.slice(0, 4).map((fan, index) => {
            const rankStyle = getRankStyle(index);
            const motivation = getMotivation(index);
            
            return (
              <motion.div
                key={fan.id || index}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="relative group"
              >
                {/* Reddish Glow Effect */}
                <motion.div
                  animate={{ 
                    scale: hoveredIndex === index ? 1.05 : 1,
                    opacity: hoveredIndex === index ? 0.5 : 0.2
                  }}
                  className="absolute inset-0 bg-red-500 rounded-xl blur-lg -z-10"
                />

                {/* Card */}
                <div className="relative bg-white rounded-lg shadow-md overflow-hidden border border-rose-100">
                  
                  {/* Image Section - 70% of card */}
                  <div className="relative h-32 sm:h-40 md:h-48 w-full bg-gradient-to-br from-rose-100 to-red-100">
                    
                    {/* Rank Icon - Top Right */}
                    <div className={`absolute top-2 right-2 z-20 ${rankStyle.bg} rounded-full p-1.5 shadow-lg`}>
                      {rankStyle.icon}
                    </div>
                    
                    {/* Milestone Tag - Top Left */}
                    <div className="absolute top-2 left-2 z-20 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      <span className="text-[8px] md:text-[10px] font-medium text-white">
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
                          unoptimized // ✅ Added unoptimized prop to skip Next.js image optimization
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-200 to-red-200">
                          <User className="w-10 h-10 md:w-12 md:h-12 text-rose-600" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Section - 30% of card */}
                  <div className="p-2 md:p-3 text-center bg-white">
                    {/* Name */}
                    <h3 className="text-xs md:text-sm font-bold text-gray-800 truncate">
                      {formatName(fan.full_name)}
                    </h3>

                    {/* Motivational Badge */}
                    <motion.div
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mt-0.5 text-[8px] md:text-[10px] text-rose-600 font-medium flex items-center justify-center gap-0.5"
                    >
                      <Heart className="w-2 h-2 fill-current" />
                      {motivation.text}
                    </motion.div>
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
          className="text-center mt-6 md:mt-8"
        >
          <Link
            href="/vote"
            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg text-sm font-semibold hover:from-red-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg group"
          >
            <Heart className="w-3 h-3 group-hover:scale-110 transition-transform" />
            Support Your Favorite Mate
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}