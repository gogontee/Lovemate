import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SponsorCarousel from "../components/SponsorCarousel";
import CandidateCard from "../components/CandidateCard";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const fallbackImage = "https://via.placeholder.com/300x400?text=No+Image";
const PAGE_SIZE = 50;

export default function VotePage() {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [candidateCode, setCandidateCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeMatchCandidate, setCodeMatchCandidate] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [heroDesktop, setHeroDesktop] = useState(null);
  const [heroMobile, setHeroMobile] = useState(null);
  const [hasEligibleCandidates, setHasEligibleCandidates] = useState(true);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVotes: 0,
    totalGifts: 0,
    totalGiftWorth: 0,
    activeVoters: 0,
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  // Check admin status from profiles table
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAdmin(false);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();
      if (!error && data?.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

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
        if (data?.vote_hero_desktop) setHeroDesktop(data.vote_hero_desktop);
        if (data?.vote_hero_mobile) setHeroMobile(data.vote_hero_mobile);
      }
    };
    fetchHeroContent();
  }, []);

  // Fetch ONLY visible candidates (visibility = true)
  const fetchCandidates = async (pageNum = 1, reset = true) => {
    if (reset) setCandidatesLoading(true);
    const from = (pageNum - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("role", "Yes")
      .eq("visibility", true)
      .order("votes", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching candidates:", error);
    } else {
      if (pageNum === 1) {
        setHasEligibleCandidates(data.length > 0);
      }

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
      setCandidates((prev) => (reset ? updated : [...prev, ...updated]));
    }
    setCandidatesLoading(false);
  };

  // Fetch a single candidate by code (ignores visibility)
  const fetchCandidateByCode = async (code) => {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .ilike("code", code)
      .maybeSingle();

    if (error || !data) return null;

    return {
      ...data,
      imageUrl:
        data.image_url && data.image_url.startsWith("http")
          ? data.image_url
          : data.image_url
          ? `https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/candidates/${data.image_url}`
          : fallbackImage,
    };
  };

  // Fetch global stats (all candidates, visible or not) – only if admin
  const fetchStats = async () => {
    const { data, error } = await supabase
      .from("candidates")
      .select("votes, gifts, gift_worth");

    if (!error && data) {
      const totalVotes = data.reduce((sum, c) => sum + (c.votes || 0), 0);
      const totalGifts = data.reduce((sum, c) => sum + (c.gifts || 0), 0);
      const totalGiftWorth = data.reduce((sum, c) => sum + (c.gift_worth || 0), 0);

      const { count } = await supabase
        .from("vote_transactions")
        .select("*", { count: "exact", head: true });

      setStats({
        totalVotes,
        totalGifts,
        totalGiftWorth,
        activeVoters: count || 0,
      });
    }
  };

  useEffect(() => {
    fetchCandidates(1, true);
    if (isAdmin) fetchStats();
  }, [isAdmin]);

  // Real-time updates for visible candidates + code-matched candidate
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
              c.id === payload.new.id
                ? {
                    ...c,
                    votes: payload.new.votes,
                    gifts: payload.new.gifts,
                    gift_worth: payload.new.gift_worth,
                  }
                : c
            )
          );
          if (codeMatchCandidate && codeMatchCandidate.id === payload.new.id) {
            setCodeMatchCandidate((prev) => ({
              ...prev,
              votes: payload.new.votes,
              gifts: payload.new.gifts,
              gift_worth: payload.new.gift_worth,
            }));
          }
          if (isAdmin) fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [codeMatchCandidate, isAdmin]);

  // Filtering: code match takes precedence, then name search among visible candidates
  useEffect(() => {
    if (codeMatchCandidate) {
      setFilteredCandidates([codeMatchCandidate]);
      return;
    }

    if (search.trim() !== "") {
      const filtered = candidates.filter((candidate) =>
        candidate.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredCandidates(filtered);
    } else {
      setFilteredCandidates(candidates);
    }
  }, [codeMatchCandidate, search, candidates]);

  // Handle code search from either the global row or the empty state card
  const handleCodeSubmit = async (e, codeValue = null) => {
    e?.preventDefault();
    const val = (codeValue || candidateCode).toUpperCase();

    if (val.length !== 4) {
      setCodeError("Code must be exactly 4 characters");
      setCodeMatchCandidate(null);
      return;
    }

    if (!/^[A-Z0-9]{4}$/.test(val)) {
      setCodeError("Use only capital letters A-Z and numbers 0-9");
      setCodeMatchCandidate(null);
      return;
    }

    setCodeError("");
    const found = await fetchCandidateByCode(val);

    if (found) {
      setCodeMatchCandidate(found);
      setSearch("");
      setCandidateCode("");
    } else {
      setCodeError("No candidate found with that code");
      setCodeMatchCandidate(null);
    }
  };

  const handleCodeChange = (e) => {
    let value = e.target.value.toUpperCase().slice(0, 4);
    setCandidateCode(value);
    setSearch("");
    if (value.length === 0) {
      setCodeMatchCandidate(null);
      setCodeError("");
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCandidateCode("");
    setCodeMatchCandidate(null);
    setCodeError("");
  };

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
        {/* Desktop Hero */}
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

              {/* Admin‑only stats bar (existing) */}
              {isAdmin && hasEligibleCandidates && candidates.length > 0 && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="desktop-stats"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-6 bg-black/30 backdrop-blur-md rounded-2xl p-3 border border-purple-500/30 max-w-2xl"
                  >
                    <div className="flex-1 text-center">
                      <div className="text-sm font-bold text-red-500">{formatNumber(stats.totalVotes)}</div>
                      <div className="text-[8px] text-gray-400 uppercase tracking-wider">Total Votes</div>
                    </div>
                    <div className="w-px bg-purple-500/30" />
                    <div className="flex-1 text-center">
                      <div className="text-sm font-bold text-red-500">{formatNumber(stats.totalGifts)}</div>
                      <div className="text-[8px] text-gray-400 uppercase tracking-wider">Total Gifts</div>
                    </div>
                    <div className="w-px bg-purple-500/30" />
                    <div className="flex-1 text-center">
                      <div className="text-sm font-bold text-red-500">₦{formatNumber(stats.totalGiftWorth)}</div>
                      <div className="text-[8px] text-gray-400 uppercase tracking-wider">Gift Worth</div>
                    </div>
                    <div className="w-px bg-purple-500/30" />
                    <div className="flex-1 text-center">
                      <div className="text-sm font-bold text-red-500">{formatNumber(stats.activeVoters)}</div>
                      <div className="text-[8px] text-gray-400 uppercase tracking-wider">Active Voters</div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Hero */}
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

            {/* Admin‑only stats grid (mobile) */}
            {isAdmin && hasEligibleCandidates && candidates.length > 0 && (
              <AnimatePresence mode="wait">
                <motion.div
                  key="mobile-stats"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-4 gap-1 bg-black/30 backdrop-blur-md rounded-xl p-2 border border-purple-500/20"
                >
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-red-500">{formatNumber(stats.totalVotes)}</div>
                    <div className="text-[6px] text-gray-400 uppercase">Votes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-red-500">{formatNumber(stats.totalGifts)}</div>
                    <div className="text-[6px] text-gray-400 uppercase">Gifts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-red-500">₦{formatNumber(stats.totalGiftWorth)}</div>
                    <div className="text-[6px] text-gray-400 uppercase">Worth</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-red-500">{formatNumber(stats.activeVoters)}</div>
                    <div className="text-[6px] text-gray-400 uppercase">Voters</div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Search Row – only visible when there are public candidates */}
        {hasEligibleCandidates && candidates.length > 0 && (
          <section className="py-6 px-4">
            <div className="max-w-xl md:max-w-2xl mx-auto">
              <div className="flex gap-2 md:gap-3">
                <div className="relative group flex-1">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 blur" />
                  <input
                    type="text"
                    placeholder="🔍 Search name..."
                    className="relative w-full px-3 md:px-4 py-1.5 md:py-2 bg-gray-800 text-white border border-purple-500/30 rounded-full text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
                    value={search}
                    onChange={handleSearchChange}
                  />
                </div>

                <form onSubmit={handleCodeSubmit} className="flex gap-1 md:gap-2">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 blur" />
                    <input
                      type="text"
                      placeholder="Code"
                      className="relative w-24 md:w-32 px-2 md:px-3 py-1.5 md:py-2 bg-gray-800 text-white border border-cyan-500/30 rounded-full text-xs md:text-sm uppercase focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400 text-center"
                      value={candidateCode}
                      onChange={handleCodeChange}
                      maxLength={4}
                      pattern="[A-Z0-9]{4}"
                      title="4 characters: A-Z and 0-9"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full text-xs md:text-sm font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all"
                  >
                    Go
                  </button>
                </form>
              </div>
              {codeError && <p className="text-red-400 text-xs mt-2 text-center">{codeError}</p>}
            </div>
          </section>
        )}

        {/* Main Content */}
        <section className="py-4 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Empty State – No public candidates and no code match */}
            {!hasEligibleCandidates && !codeMatchCandidate && !candidatesLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-purple-500/20 text-center max-w-3xl mx-auto"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  Here to support your favorite candidate?
                </h2>
                <p className="text-rose-400 text-xl md:text-2xl font-semibold mb-6">
                  Oya! Enter his/her candidate code here.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const inputEl = e.currentTarget.querySelector('input[type="text"]');
                    const codeValue = inputEl?.value.toUpperCase() || "";
                    handleCodeSubmit(e, codeValue);
                  }}
                  className="flex flex-col sm:flex-row gap-3 justify-center items-center"
                >
                  <div className="relative group w-full sm:w-64">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 blur" />
                    <input
                      type="text"
                      placeholder="e.g., A1B2"
                      className="relative w-full px-4 py-3 bg-gray-800 text-white border border-cyan-500/30 rounded-full text-center text-lg uppercase focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400"
                      maxLength={4}
                      pattern="[A-Z0-9]{4}"
                      title="4 characters: A-Z and 0-9"
                      onChange={(e) => {
                        e.target.value = e.target.value.toUpperCase().slice(0, 4);
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full text-base font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg"
                  >
                    Search Candidate
                  </button>
                </form>
                {codeError && <p className="text-red-400 text-sm mt-4">{codeError}</p>}
              </motion.div>
            )}

            {/* Candidate Display – either visible list or code match */}
            {(hasEligibleCandidates || codeMatchCandidate) && (
              <>
                {candidatesLoading && candidates.length === 0 ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : (
                  <>
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

                    {filteredCandidates.length === 0 && (search || candidateCode) && (
                      <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">No candidates match your search.</p>
                        <button
                          onClick={() => {
                            setSearch("");
                            setCandidateCode("");
                            setCodeMatchCandidate(null);
                            setCodeError("");
                          }}
                          className="mt-4 text-rose-400 underline hover:text-rose-300"
                        >
                          Clear filters
                        </button>
                      </div>
                    )}
                  </>
                )}

                {hasMore && !codeMatchCandidate && filteredCandidates.length === candidates.length && !candidatesLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-8">
                    <button
                      onClick={() => {
                        const nextPage = page + 1;
                        fetchCandidates(nextPage, false);
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
              </>
            )}
          </div>
        </section>

        {/* Sponsors */}
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

      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}