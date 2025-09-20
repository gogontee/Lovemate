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

  // New vote button handler - navigate to candidate page #vote section
  const goToVoteSection = () => {
    router.push(`/candidate/${id}#vote`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden text-center p-4 border border-gray-100"
    >
      {/* Candidate Image */}
      <div className="w-full aspect-square relative overflow-hidden rounded-xl border-2 border-rose-500">
        <img
          src={imageUrl}
          alt={name}
          className="object-cover w-full h-full rounded-xl"
        />
      </div>

      {/* Candidate Info */}
      <h3 className="mt-4 text-lg font-semibold text-gray-800">{name}</h3>
      <p className="text-sm text-gray-500">{country}</p>
      <p className="text-sm text-gray-600 mt-1">
        Votes: <span className="font-bold text-rose-600">{votes}</span>
      </p>

      {/* Action Buttons - always in a row */}
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={goToVoteSection}
          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs sm:text-sm font-semibold transition duration-300 shadow"
        >
          Vote
        </button>

        {/* View button - hidden on mobile, visible on sm+ */}
        <Link
          href={`/candidate/${id}`}
          className="hidden sm:inline-flex px-3 py-1.5 border border-rose-600 text-rose-600 hover:bg-rose-50 rounded-full text-xs sm:text-sm font-semibold transition duration-300"
        >
          View
        </Link>

        <Link
          href={`/candidate/${id}#gift`}
          className="px-3 py-1.5 bg-yellow-400 text-yellow-900 hover:bg-yellow-500 rounded-full text-xs sm:text-sm font-semibold transition duration-300"
        >
          🎁 Gift
        </Link>
      </div>
    </motion.div>
  );
}
