// components/directors/StatsCards.js
import { motion } from "framer-motion";
import { Users, UserCheck, TrendingUp, DollarSign, Gift, Award } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

// Format currency in NGN
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export default function StatsCards({ stats }) {
  // Calculate additional stats
  const totalVoteWorth = stats.totalVoteWorth || 0;
  const totalGiftWorth = stats.totalGiftWorth || 0;
  const totalRevenue = totalVoteWorth + totalGiftWorth;
  const totalGifts = stats.totalGifts || 0;
  const totalVotes = stats.totalVotes || 0;

  const cards = [
    { 
      label: "Total Profiles", 
      value: stats.totalProfiles.toLocaleString(), 
      icon: Users, 
      color: "from-blue-500 to-blue-600",
      size: "small"
    },
    { 
      label: "Total Candidates", 
      value: stats.totalCandidates.toLocaleString(), 
      icon: UserCheck, 
      color: "from-purple-500 to-purple-600",
      size: "small"
    },
    { 
      label: "Votes Cast", 
      value: totalVotes.toLocaleString(), 
      subValue: formatCurrency(totalVoteWorth),
      subLabel: "Worth",
      icon: TrendingUp, 
      color: "from-green-500 to-green-600",
      size: "medium"
    },
    { 
      label: "Gifts Received", 
      value: totalGifts.toLocaleString(), 
      subValue: formatCurrency(totalGiftWorth),
      subLabel: "Worth",
      icon: Gift, 
      color: "from-pink-500 to-pink-600",
      size: "medium"
    },
    { 
      label: "Total Revenue", 
      value: formatCurrency(totalRevenue), 
      icon: DollarSign, 
      color: "from-yellow-500 to-yellow-600",
      size: "large"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
      {cards.map((stat, idx) => (
        <motion.div
          key={idx}
          variants={fadeInUp}
          custom={idx}
          className="bg-white/90 backdrop-blur-sm rounded-lg md:rounded-xl shadow-md md:shadow-lg p-2 md:p-3 border border-rose-100 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <div className={`p-1.5 md:p-2 bg-gradient-to-r ${stat.color} rounded-lg`}>
              <stat.icon className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
            <span className="text-[8px] md:text-xs text-gray-400 bg-rose-50 px-1.5 py-0.5 rounded-full">
              Last 30d
            </span>
          </div>
          
          {/* Main Value */}
          <p className="text-sm md:text-xl lg:text-2xl font-bold text-gray-800 leading-tight">
            {stat.value}
          </p>
          
          {/* Sub Value (if exists) */}
          {stat.subValue && (
            <div className="mt-0.5 md:mt-1">
              <p className="text-[10px] md:text-xs text-gray-500">
                {stat.subLabel}: <span className="font-semibold text-rose-600">{stat.subValue}</span>
              </p>
            </div>
          )}
          
          {/* Label */}
          <p className="text-[8px] md:text-xs text-gray-500 mt-0.5 md:mt-1 truncate">
            {stat.label}
          </p>

          {/* Mobile: Show sub value inline for small cards */}
          {!stat.subValue && stat.size === "small" && (
            <div className="md:hidden h-4" /> // Spacer for alignment
          )}
        </motion.div>
      ))}
    </div>
  );
}