// pages/vote.js
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SponsorCarousel from "../components/SponsorCarousel";
import CandidateCard from "../components/CandidateCard";
import { useState } from "react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";

const router = useRouter();

const handleVoteOrGift = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    alert("You must be logged in to vote or send gifts.");
    router.push("/auth/login");
    return;
  }

  // Proceed with vote/gift logic...
};
const handleVote = async (candidateId, voteCost = 100) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    router.push("/auth/login");
    return;
  }

  const { data: summary } = await supabase
    .from("wallet_summary")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  if (!summary || summary.balance < voteCost) {
    alert("Insufficient balance.");
    return;
  }

  // Deduct wallet
  await supabase.from("wallets").insert([
    {
      user_id: user.id,
      amount: -voteCost,
      type: "vote",
      status: "completed",
    },
  ]);

  // Update vote count
  await supabase.rpc("increment_vote", {
    candidate_id_param: candidateId,
    vote_count: 1,
  });

  alert("Vote submitted!");
};
const [candidates, setCandidates] = useState([]);
useEffect(() => {
  const fetchCandidates = async () => {
    const { data, error } = await supabase.from("candidates").select("*").order("id", { ascending: true });
    if (!error) setCandidates(data);
  };
  fetchCandidates();
}, []);

useEffect(() => {
  const channel = supabase
    .channel("votes-realtime")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "candidates",
      },
      (payload) => {
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === payload.new.id ? { ...c, votes: payload.new.votes } : c
          )
        );
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);


export default function VotePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filteredCandidates = candidates.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNavigate = (id) => {
    router.push(`/candidate/${id}`);
  };

  return (
    <>
      <Head>
        <title>Vote – Lovemate Show</title>
        <meta name="description" content="Vote for your favorite Lovemate contestant." />
      </Head>

      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-rose-100 via-white to-pink-50 py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-rose-600 mb-4">
            Ready to Vote for Your Favorite Lovemate?
          </h1>
          <p className="text-lg text-gray-700 mb-4">
            Show your support. Cast your vote. Make your voice count.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-gray-700 text-sm sm:text-base">
            <div className="bg-rose-50 px-6 py-2 rounded-full shadow border border-gray-300">
              Start Date: <strong>Aug 1, 2025</strong>
            </div>
            <div className="bg-rose-50 px-6 py-2 rounded-full shadow border border-gray-300">
              End Date: <strong>Aug 15, 2025</strong>
            </div>
            <div className="bg-rose-50 px-6 py-2 rounded-full shadow border border-gray-300">
              ⏳ Voting closes in: <strong>10d 5h 20m</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Search for a candidate..."
            className="w-full px-6 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      {/* Candidate Cards */}
      <section className="bg-gray-50 py-12 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">All Candidates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {filteredCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              {...candidate}
              onVote={() => handleNavigate(candidate.id)}
              onGift={() => handleNavigate(candidate.id)}
              onView={() => handleNavigate(candidate.id)}
            />
          ))}
        </div>
      </section>

      {/* Sponsors Section */}
      <SponsorCarousel sponsors={["/sponsors/logo1.png", "/sponsors/logo2.png", "/sponsors/logo3.png"]} />

      <Footer />
    </>
  );
}
