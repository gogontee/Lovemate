// components/directors/TopFansSection.js
import { motion } from "framer-motion";
import Image from "next/image";
import { Award } from "lucide-react";

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

export default function TopFansSection({ fans }) {
  return (
    <motion.div variants={fadeInUp} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-rose-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-yellow-500" />
        Top 3 Fans
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fans.map((fan, idx) => (
          <div key={fan.id} className="bg-gradient-to-br from-rose-50 to-red-50 rounded-lg p-3 flex items-center gap-3">
            <div className="relative">
              {fan.photo ? (
                <Image
                  src={fan.photo}
                  alt={fan.name}
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-red-600"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-rose-600 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-white">#{idx + 1}</span>
                </div>
              )}
              <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-white">
                {idx === 0 ? '👑' : idx + 1}
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-800">{formatName(fan.name)}</p>
              <p className="text-xs text-gray-500">{fan.points.toFixed(2)} pts</p>
              <p className="text-xs text-gray-400">ID: {fan.id.substring(0, 8)}...</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}