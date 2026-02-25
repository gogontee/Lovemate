// components/CandidateCard.js
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";
import { motion } from "framer-motion";

export default function CandidateCard({
  id,
  name,
  country,
  votes: initialVotes,
  imageUrl,
}) {
  const [votes, setVotes] = useState(initialVotes);
  const router = useRouter();

  // Real-time vote updates
  useEffect(() => {
    const channel = supabase
      .channel("candidate-votes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "candidates",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setVotes(payload.new.votes);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Navigate to candidate page
  const goToCandidatePage = () => {
    router.push(`/candidate/${id}`);
  };

  // Navigate to vote section
  const goToVoteSection = () => {
    router.push(`/candidate/${id}#vote`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-rose-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden p-4 border border-rose-300"
    >
      <div className="flex flex-col gap-3">
        {/* Image */}
        <div className="w-full aspect-square relative overflow-hidden rounded-xl border-2 border-rose-500 bg-white">
          <img
            src={imageUrl}
            alt={name}
            className="object-cover w-full h-full rounded-xl"
          />
        </div>

        {/* Row 1: Name (left) and Country (right) */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
          <p className="text-sm text-gray-600">{country}</p>
        </div>

        {/* Row 2: "Vote" label (left) and Vote count (right) */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Vote</span>
          <span className="text-sm font-bold text-rose-700">{votes}</span>
        </div>

        {/* Row 3: View button (left) and Vote button (right) */}
        <div className="flex justify-between items-center mt-2">
          <button
            onClick={goToCandidatePage}
            className="px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 rounded-full text-sm font-semibold transition duration-300 shadow-sm border border-rose-300"
          >
            View
          </button>

          <button
            onClick={goToVoteSection}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-sm font-semibold transition duration-300 shadow"
          >
            Vote
          </button>
        </div>
      </div>
    </motion.div>
  );
}