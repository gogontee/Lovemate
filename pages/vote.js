import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SponsorCarousel from "../components/SponsorCarousel";
import CandidateCard from "../components/CandidateCard";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";

const fallbackImage = "https://via.placeholder.com/300x400?text=No+Image";

export default function VotePage() {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .order("votes", { ascending: false });

      if (error) {
        console.error("Error fetching candidates:", error);
      } else {
        const updated = data.map((item) => ({
          ...item,
          imageUrl:
            item.image_url && item.image_url.startsWith("http")
              ? item.image_url
              : item.image_url
              ? `https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/candidates/${item.image_url}`
              : fallbackImage,
        }));

        setCandidates(updated);
        setFilteredCandidates(updated);
      }
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleVoteOrGift = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to vote or send gifts.");
      router.push("/auth/login");
      return false;
    }
    return true;
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

    await supabase.from("wallets").insert([
      {
        user_id: user.id,
        amount: -voteCost,
        type: "vote",
        status: "completed",
      },
    ]);

    await supabase.rpc("increment_vote", {
      candidate_id_param: candidateId,
      vote_count: 1,
    });

    alert("Vote submitted!");
  };

  useEffect(() => {
  const filtered = candidates.filter((candidate) =>
    candidate.name.toLowerCase().includes(search.toLowerCase())
  );
  setFilteredCandidates(filtered);
}, [search, candidates]);


  return (
    <>
      <Head>
        <title>Vote – Lovemate Show</title>
        <meta
          name="description"
          content="Vote for your favorite Lovemate contestant."
        />
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
  className="w-full px-6 py-3 border border-gray-300 rounded-full shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

        </div>
      </section>

      {/* Candidate Cards */}
      <section className="bg-gray-50 py-12 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
          All Candidates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              id={candidate.id}
              name={candidate.name}
              country={candidate.country}
              votes={candidate.votes}
              imageUrl={candidate.imageUrl} // ✅ correct prop
            />
          ))}
        </div>
      </section>

      {/* Sponsors */}
      <SponsorCarousel
        sponsors={["/sponsors/logo1.png", "/sponsors/logo2.png", "/sponsors/logo3.png"]}
      />

      <Footer />
    </>
  );
}
