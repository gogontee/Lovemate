// components/directors/TopCandidatesSection.js
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Users, Gift, Trophy } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

export default function TopCandidatesSection({ candidates, isMobileGrid = false }) {
  if (!candidates || candidates.length === 0) {
    return (
      <motion.div variants={fadeInUp} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-rose-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Candidates
        </h3>
        <p className="text-gray-500 text-center py-8">No candidates found</p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeInUp} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 md:p-6 border border-rose-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top 10 Candidates
        </h3>
        <span className="text-xs text-gray-400 bg-rose-50 px-2 py-1 rounded-full">
          By votes
        </span>
      </div>

      {/* Mobile: 2-column grid */}
      <div className={`${isMobileGrid ? 'grid grid-cols-2 gap-3 md:hidden' : 'hidden md:hidden'}`}>
        {candidates.slice(0, 6).map((candidate, idx) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-2 border border-rose-100 shadow-sm"
          >
            <div className="relative mb-2">
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-red-100 to-rose-100">
                {candidate.image_url ? (
                  <Image
                    src={candidate.image_url}
                    alt={candidate.name}
                    width={100}
                    height={100}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-red-600 to-rose-600 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              
              {/* Rank badge - different colors for top 3 */}
              <div className={`absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${
                idx === 0 ? 'bg-yellow-500' :
                idx === 1 ? 'bg-gray-400' :
                idx === 2 ? 'bg-amber-600' :
                'bg-red-500'
              }`}>
                {idx + 1}
              </div>

              {/* Votes count badge */}
              <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                <span className="text-[10px] font-bold text-white">
                  {(candidate.votes || 0) > 999 
                    ? `${(candidate.votes / 1000).toFixed(1)}k` 
                    : candidate.votes || 0}
                </span>
              </div>
            </div>

            <p className="font-semibold text-gray-800 text-xs truncate">
              {candidate.name}
            </p>
            <p className="text-[10px] text-gray-500 mb-1 truncate">
              {candidate.country || 'Unknown'}
            </p>
            
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="font-medium text-gray-700">
                  {candidate.votes || 0}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <Gift className="w-3 h-3 text-rose-500" />
                <span className="font-medium text-gray-700">
                  {candidate.gifts || 0}
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Show remaining candidates in a "more" card if > 6 */}
        {candidates.length > 6 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-2 border border-gray-200 flex items-center justify-center"
          >
            <div className="text-center">
              <Users className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <p className="text-xs font-medium text-gray-500">
                +{candidates.length - 6} more
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Desktop: Original grid (5 columns) - hidden on mobile */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        {candidates.map((candidate, idx) => (
          <motion.div
            key={candidate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-gradient-to-br from-rose-50 to-red-50 rounded-lg p-3 border border-rose-100 hover:shadow-md transition-shadow"
          >
            <div className="relative mb-2">
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-red-100 to-rose-100">
                {candidate.image_url ? (
                  <Image
                    src={candidate.image_url}
                    alt={candidate.name}
                    width={100}
                    height={100}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-red-600 to-rose-600 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              
              {/* Rank badge */}
              <div className={`absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                idx === 0 ? 'bg-yellow-500' :
                idx === 1 ? 'bg-gray-400' :
                idx === 2 ? 'bg-amber-600' :
                'bg-red-500'
              }`}>
                {idx + 1}
              </div>
            </div>

            <p className="font-semibold text-gray-800 text-sm truncate" title={candidate.name}>
              {candidate.name}
            </p>
            <p className="text-xs text-gray-500 truncate" title={candidate.country || 'Unknown'}>
              {candidate.country || 'Unknown'}
            </p>
            
            <div className="flex justify-between items-center mt-2 text-xs">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500" />
                <span className="font-bold text-red-600">
                  {candidate.votes?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Gift className="w-3.5 h-3.5 text-rose-500" />
                <span className="font-medium text-gray-600">
                  {candidate.gifts?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View all link for mobile */}
      {candidates.length > 6 && (
        <button 
          onClick={() => window.location.href = '/directors?tab=candidates'}
          className="md:hidden mt-4 text-sm text-red-500 hover:text-red-600 font-medium flex items-center justify-center w-full py-2 border-t border-rose-100"
        >
          View all {candidates.length} candidates →
        </button>
      )}
    </motion.div>
  );
}