import { Star, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function RankCard({ rank = "New", progress = 0, nextRank = "Bronze" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Award className="w-5 h-5 text-yellow-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Fan Rank</h3>
        </div>
        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
          Level 1
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">Current Rank</span>
          <span className="text-sm font-semibold text-rose-600">{rank}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Next Rank</span>
          <span className="text-sm font-medium text-gray-800">{nextRank}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          Spend ₦5,000 more to reach {nextRank}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-500">Points</p>
          <p className="font-semibold text-gray-800">1,250</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Votes</p>
          <p className="font-semibold text-gray-800">47</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Rank</p>
          <p className="font-semibold text-gray-800">#892</p>
        </div>
      </div>
    </motion.div>
  );
}