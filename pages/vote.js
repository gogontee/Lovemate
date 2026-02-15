import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SponsorCarousel from "../components/SponsorCarousel";
import CandidateCard from "../components/CandidateCard";
import { useState, useEffect, useRef } from "react";
import EventSchedule from "@/components/EventSchedule";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";
import Image from "next/image";
import { motion } from "framer-motion";

const fallbackImage = "https://via.placeholder.com/300x400?text=No+Image";
const PAGE_SIZE = 50;

export default function VotePage() {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [heroDesktop, setHeroDesktop] = useState(null);
  const [heroMobile, setHeroMobile] = useState(null);
  const [stats, setStats] = useState({
    totalVotes: 0,
    totalGifts: 0,
    totalGiftWorth: 0,
    activeVoters: 0
  });
  const router = useRouter();

  // Fetch hero content
  useEffect(() => {
    const fetchHeroContent = async () => {
      const { data, error } = await supabase
        .from("lovemate")
        .select("vote_hero_desktop, vote_hero_mobile")
        .single();

      if (error) {
        console.error("Error fetching hero content:", error);
      } else {
        if (data?.vote_hero_desktop) {
          setHeroDesktop(data.vote_hero_desktop);
        }
        if (data?.vote_hero_mobile) {
          setHeroMobile(data.vote_hero_mobile);
        }
      }
    };

    fetchHeroContent();
  }, []);

  // Fetch candidates
  const fetchCandidates = async (pageNum = 1) => {
    const from = (pageNum - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("role", "Yes")
      .order("votes", { ascending: false })
      .range(from, to);

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

      if (data.length < PAGE_SIZE) setHasMore(false);

      setCandidates((prev) => [...prev, ...updated]);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    const { data, error } = await supabase
      .from("candidates")
      .select("votes, gifts, gift_worth");

    if (!error && data) {
      const totalVotes = data.reduce((sum, c) => sum + (c.votes || 0), 0);
      const totalGifts = data.reduce((sum, c) => sum + (c.gifts || 0), 0);
      const totalGiftWorth = data.reduce((sum, c) => sum + (c.gift_worth || 0), 0);
      
      // Get unique voters count (you'll need to implement this based on your data)
      const { count } = await supabase
        .from("vote_transactions")
        .select("*", { count: "exact", head: true });

      setStats({
        totalVotes,
        totalGifts,
        totalGiftWorth,
        activeVoters: count || 0
      });
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchStats();
  }, []);

  // Real-time updates
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
              c.id === payload.new.id ? { ...c, votes: payload.new.votes, gifts: payload.new.gifts, gift_worth: payload.new.gift_worth } : c
            )
          );
          // Update stats
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const filtered = candidates.filter((candidate) =>
      candidate.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredCandidates(filtered);
  }, [search, candidates]);

  // Format number for display
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <>
      <Head>
        <title>Vote – Lovemate Show</title>
        <meta name="description" content="Vote for your favorite Lovemate contestant." />
      </Head>

      <Header />
      
      <main className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
        {/* Desktop Hero - 1000:300 ratio */}
        <div className="hidden md:block relative w-full h-[300px] overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800">
          {heroDesktop?.image ? (
            <div className="relative w-full h-full">
              <Image
                src={heroDesktop.image}
                alt={heroDesktop.title || "Vote for your favorite"}
                fill
                className="object-cover opacity-70"
                priority
                sizes="100vw"
                unoptimized={true}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900" />
          )}
          
          {/* Hero Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-8 w-full">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold text-white mb-2"
              >
                {heroDesktop?.title || "Ready to Vote?"}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-gray-300 mb-4 max-w-2xl"
              >
                {heroDesktop?.subtitle || "Cast your votes and make your voice count"}
              </motion.p>
              
              {/* Stats Bar - Desktop */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-6 bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-purple-500/30 max-w-2xl"
              >
                <div className="flex-1 text-center">
                  <div className="text-sm font-bold text-red-500">
                    {formatNumber(stats.totalVotes)}
                  </div>
                  <div className="text-[8px] text-gray-400 uppercase tracking-wider">Total Votes</div>
                </div>
                <div className="w-px bg-purple-500/30" />
                <div className="flex-1 text-center">
                  <div className="text-sm font-bold text-red-500">
                    {formatNumber(stats.totalGifts)}
                  </div>
                  <div className="text-[8px] text-gray-400 uppercase tracking-wider">Total Gifts</div>
                </div>
                <div className="w-px bg-purple-500/30" />
                <div className="flex-1 text-center">
                  <div className="text-sm font-bold text-red-500">
                    ₦{formatNumber(stats.totalGiftWorth)}
                  </div>
                  <div className="text-[8px] text-gray-400 uppercase tracking-wider">Gift Worth</div>
                </div>
                <div className="w-px bg-purple-500/30" />
                <div className="flex-1 text-center">
                  <div className="text-sm font-bold text-red-500">
                    {formatNumber(stats.activeVoters)}
                  </div>
                  <div className="text-[8px] text-gray-400 uppercase tracking-wider">Active Voters</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile Hero - 1000:300 ratio */}
        <div className="md:hidden relative w-full h-[300px] overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800">
          {heroMobile?.image ? (
            <div className="relative w-full h-full">
              <Image
                src={heroMobile.image}
                alt={heroMobile.title || "Vote for your favorite"}
                fill
                className="object-cover opacity-70"
                priority
                sizes="100vw"
                unoptimized={true}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900" />
          )}
          
          {/* Mobile Hero Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-5">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-white mb-1"
            >
              {heroMobile?.title || "Ready to Vote?"}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xs text-gray-300 mb-3"
            >
              {heroMobile?.subtitle || "Cast your votes and make your voice count"}
            </motion.p>
            
            {/* Stats Grid - Mobile */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-4 gap-1 bg-black/30 backdrop-blur-md rounded-xl p-2 border border-purple-500/20"
            >
              <div className="text-center">
                <div className="text-[10px] font-bold text-red-500">
                  {formatNumber(stats.totalVotes)}
                </div>
                <div className="text-[6px] text-gray-400 uppercase">Votes</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-bold text-red-500">
                  {formatNumber(stats.totalGifts)}
                </div>
                <div className="text-[6px] text-gray-400 uppercase">Gifts</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-bold text-red-500">
                  ₦{formatNumber(stats.totalGiftWorth)}
                </div>
                <div className="text-[6px] text-gray-400 uppercase">Worth</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-bold text-red-500">
                  {formatNumber(stats.activeVoters)}
                </div>
                <div className="text-[6px] text-gray-400 uppercase">Voters</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Event Schedule - Integrated into hero flow */}
        <div className="max-w-7xl mx-auto px-4 -mt-8 md:-mt-10 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-purple-500/20"
          >
            <EventSchedule
              startDate="2025-08-01T00:00:00"
              endDate="2025-08-15T23:59:59"
            />
          </motion.div>
        </div>

        {/* Search Bar - Futuristic */}
        <section className="py-6 px-4">
          <div className="max-w-xs mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 blur" />
              <input
                type="text"
                placeholder="🔍 Search candidate..."
                className="relative w-full px-4 py-2 bg-gray-800 text-white border border-purple-500/30 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Candidate Cards */}
        <section className="py-4 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {filteredCandidates.map((candidate, index) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CandidateCard
                    id={candidate.id}
                    name={candidate.name}
                    country={candidate.country}
                    votes={candidate.votes}
                    imageUrl={candidate.imageUrl}
                  />
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mt-8"
              >
                <button
                  onClick={() => {
                    const nextPage = page + 1;
                    fetchCandidates(nextPage);
                    setPage(nextPage);
                  }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300" />
                  <div className="relative px-8 py-3 bg-gray-900 text-white rounded-full text-sm font-semibold">
                    Load More Candidates
                  </div>
                </button>
              </motion.div>
            )}
          </div>
        </section>

        {/* Sponsors - Futuristic with thinner borders */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-purple-500/10 md:border-purple-500/5">
              <SponsorCarousel
                sponsors={["/sponsors/logo1.png", "/sponsors/logo2.png", "/sponsors/logo3.png"]}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Hidden on mobile */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}