// components/directors/CandidatesTable.js
import { motion } from "framer-motion";
import Image from "next/image";
import { Users, CheckCircle, Clock } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

export default function CandidatesTable({ candidates }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-rose-100"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-red-600" />
        All Candidates
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-rose-50">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Votes</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gifts</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rose-100">
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-rose-50/50 transition-colors">
                <td className="px-3 py-2">
                  {candidate.image_url ? (
                    <Image
                      src={candidate.image_url}
                      alt={candidate.name}
                      width={32}
                      height={32}
                      className="rounded-full object-cover w-8 h-8"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-rose-600 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 font-medium text-gray-800">{candidate.name}</td>
                <td className="px-3 py-2 text-xs text-gray-500">{candidate.id.substring(0, 8)}...</td>
                <td className="px-3 py-2 text-gray-600">{candidate.country}</td>
                <td className="px-3 py-2 text-gray-600">{candidate.age}</td>
                <td className="px-3 py-2 text-gray-600 capitalize">{candidate.gender}</td>
                <td className="px-3 py-2 font-bold text-red-600">{candidate.votes || 0}</td>
                <td className="px-3 py-2 font-bold text-rose-600">{candidate.gifts || 0}</td>
                <td className="px-3 py-2 font-mono text-xs bg-rose-50 px-2 py-1 rounded">{candidate.code}</td>
                <td className="px-3 py-2">
                  {candidate.role === "Yes" ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                      <CheckCircle className="w-3 h-3" />
                      Approved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}