// components/directors/FansTable.js
import { motion } from "framer-motion";
import Image from "next/image";
import { UserCheck } from "lucide-react";

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

export default function FansTable({ profiles, candidates }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-rose-100"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <UserCheck className="w-5 h-5 text-red-600" />
        All Fans
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-rose-50">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Favorite Candidates</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-100">
            {profiles.map((profile) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}