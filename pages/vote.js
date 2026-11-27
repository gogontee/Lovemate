import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SponsorCarousel from "../components/SponsorCarousel";
import CandidateCard from "../components/CandidateCard";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, X } from "lucide-react";

const fallbackImage = "https://via.placeholder.com/300x400?text=No+Image";
const PAGE_SIZE = 50;
const DEBOUNCE_DELAY = 500;

export default function VotePage() {
  const [candidates, setCandidates] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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

  const debounceTimer = useRef(null);

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

  // Fetch ONLY visible candidates (visibility = true) – paginated
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

  // Unified search across name, full_name, and code
  const searchCandidates = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    try {
      const term = searchTerm.trim();
      
      // Search by name, full_name, or code (ignores visibility for direct code match)
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("role", "Yes")
        .or(`name.ilike.%${term}%,full_name.ilike.%${term}%,code.ilike.%${term}%`)
        .order("votes", { ascending: false });

      if (error) throw error;

      const processed = data.map((item) => ({
        ...item,
        imageUrl:
          item.image_url && item.image_url.startsWith("http")
            ? item.image_url
            : item.image_url
            ? `https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/candidates/${item.image_url}`
            : fallbackImage,
      }));
      setSearchResults(processed);
    } catch (error) {
      console.error("Error searching candidates:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Debounced search handling
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!value.trim()) {
      setSearchResults(null);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      searchCandidates(value);
    }, DEBOUNCE_DELAY);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    searchCandidates(search);
  };

  const clearSearch = () => {
    setSearch("");
    setSearchResults(null);
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

  // Real-time updates for visible candidates + search results
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
          setSearchResults((prev) => {
            if (!prev) return prev;
            return prev.map((c) =>
              c.id === payload.new.id
                ? {
                    ...c,
                    votes: payload.new.votes,
                    gifts: payload.new.gifts,
                    gift_worth: payload.new.gift_worth,
                  }
                : c
            );
          });
          if (isAdmin) fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  // Determine which candidates to display
  const getDisplayCandidates = () => {
    if (searchResults !== null) return searchResults;
    return candidates;
  };

  const displayCandidates = getDisplayCandidates();

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

      <style jsx global>{`
        @media (max-width: 767px) {
          header,
          .site-header,
          [data-site-header] {
            position: relative;
            z-index: 9999;
          }
        }
      `}</style>

      <Header />

      <main className="bg-[#0a0a0a] min-h-screen pb-32 md:pb-0 font-sans">
        {/* ===== HERO SECTION ===== */}
        <section className="relative w-full min-h-[85vh] flex items-center overflow-hidden">
          {/* Background Image & Overlays */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/hero/hero11.jpg"
              alt="Ready to show Solidarity?"
              fill
              className="object-cover object-[75%_center] md:object-center opacity-80"
              priority
              sizes="100vw"
              unoptimized={true}
            />
            {/* Dark gradient from left to right to make text readable */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-12">
            <div className="max-w-3xl">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-[1.1] mb-4"
              >
                Ready to show <br />
                <span className="text-red-600 italic pr-2">Solidarity?</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                className="text-lg md:text-2xl text-gray-200 font-medium mb-8"
              >
                Send some gift to support your <span className="text-red-600 italic font-semibold">Favorite</span> candidate.
              </motion.p>

              {/* Unified Search Bar */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                onSubmit={handleSearchSubmit}
                className="relative w-full max-w-2xl group"
              >
                {/* Glow effect behind input */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-500 rounded-full opacity-40 group-hover:opacity-70 blur transition duration-500" />
                
                <div className="relative flex items-center bg-[#111] border border-red-600/30 rounded-full p-1.5 pr-2 shadow-2xl">
                  <Search className="w-5 h-5 md:w-6 md:h-6 text-gray-400 ml-3 md:ml-4 shrink-0" />
                  
                  <input
                    type="text"
                    placeholder="Search for candidates name, nick name or use their code..."
                    className="w-full bg-transparent text-white px-3 md:px-4 py-2 md:py-3 text-sm md:text-base focus:outline-none placeholder-gray-500"
                    value={search}
                    onChange={handleSearchChange}
                  />
                  
                  {/* Clear Button */}
                  {search && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="p-2 text-gray-500 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="flex items-center gap-1 md:gap-2 bg-red-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-full font-bold text-sm md:text-base hover:bg-red-700 transition-all shrink-0"
                  >
                    Search
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </motion.form>

              {/* Admin Stats Overlay (Optional, placed subtly below search) */}
              {isAdmin && hasEligibleCandidates && candidates.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 flex flex-wrap gap-4 text-xs md:text-sm text-gray-400 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/5 w-fit"
                >
                  <div><span className="font-bold text-red-500">{formatNumber(stats.totalVotes)}</span> Votes</div>
                  <div><span className="font-bold text-red-500">{formatNumber(stats.totalGifts)}</span> Gifts</div>
                  <div><span className="font-bold text-red-500">₦{formatNumber(stats.totalGiftWorth)}</span> Worth</div>
                  <div><span className="font-bold text-red-500">{formatNumber(stats.activeVoters)}</span> Voters</div>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* ===== MAIN CONTENT ===== */}
        <section className="relative isolate py-8 md:py-12 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Loading State */}
            {candidatesLoading && displayCandidates.length === 0 && !searching && (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
              </div>
            )}

            {/* Candidate Grid */}
            {(!candidatesLoading || displayCandidates.length > 0 || searching) && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                  {displayCandidates.map((candidate, index) => (
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
  gifts={candidate.gifts}     // <--- Changed from votes
  imageUrl={candidate.imageUrl}
  secret={candidate.secret}
/>
                    </motion.div>
                  ))}
                </div>

                {/* No Search Results */}
                {search.trim() && !searching && searchResults !== null && searchResults.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-gray-400 text-lg md:text-xl mb-4">
                      No candidates found for <span className="text-white font-bold">"{search}"</span>.
                    </p>
                    <button
                      onClick={clearSearch}
                      className="text-red-500 font-semibold hover:text-red-400 underline underline-offset-4"
                    >
                      Clear search and view all candidates
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Load More (only when not searching) */}
            {!searchResults && hasMore && displayCandidates.length === candidates.length && !candidatesLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-12">
                <button
                  onClick={() => {
                    const nextPage = page + 1;
                    fetchCandidates(nextPage, false);
                    setPage(nextPage);
                  }}
                  className="relative group inline-block"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-500 rounded-full opacity-50 group-hover:opacity-100 blur transition duration-300" />
                  <div className="relative px-8 py-3 bg-[#111] text-white rounded-full text-sm font-semibold border border-red-600/30 hover:border-red-600 transition-colors">
                    Load More Candidates
                  </div>
                </button>
              </motion.div>
            )}
          </div>
        </section>

        {/* ===== SPONSORS ===== */}
        <section className="relative isolate py-8 px-4 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/5">
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