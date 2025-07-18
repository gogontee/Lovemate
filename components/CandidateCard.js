// components/CandidateCard.js
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";

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

  const handleVote = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to vote.");
      router.push("/auth/login");
      return;
    }

    const { data: summary } = await supabase
      .from("wallet_summary")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (!summary || summary.balance < 100) {
      alert("Insufficient balance.");
      return;
    }

    await supabase.from("wallets").insert([
      {
        user_id: user.id,
        amount: -100,
        type: "vote",
        status: "completed",
      },
    ]);

    await supabase.rpc("increment_vote", {
      candidate_id_param: id,
      vote_count: 1,
    });

    alert("Vote submitted!");
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden text-center p-4 border border-gray-100">
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

      {/* Action Buttons */}
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button
          onClick={handleVote}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-sm font-semibold transition duration-300 shadow"
        >
          Vote
        </button>

        <Link
          href={`/candidate/${id}`}
          className="px-4 py-2 border border-rose-600 text-rose-600 hover:bg-rose-50 rounded-full text-sm font-semibold transition duration-300"
        >
          View
        </Link>

        <Link
          href={`/candidate/${id}#gift`}
          className="px-4 py-2 bg-yellow-400 text-yellow-900 hover:bg-yellow-500 rounded-full text-sm font-semibold transition duration-300"
        >
          🎁 Gift
        </Link>
      </div>
    </div>
  );
}
