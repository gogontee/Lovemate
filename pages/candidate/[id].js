import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import VoteSection from "../../components/candidate/VoteSection";
import GiftSection from "../../components/candidate/GiftSection";
import { motion } from "framer-motion";

function formatNaira(n) {
  if (n == null) return "₦0";
  const formatted = Number(n).toLocaleString("en-NG");
  return `₦${formatted}`;
}

// Digital Stats Component - Integrated into Hero
function DigitalStats({ candidate, formatNaira, onVoteClick, onGiftClick }) {
  const [animatedVotes, setAnimatedVotes] = useState(0);
  const [animatedGifts, setAnimatedGifts] = useState(0);
  const [animatedWorth, setAnimatedWorth] = useState(0);

  // Animate numbers when they change
  useEffect(() => {
    if (candidate?.votes !== undefined) {
      setAnimatedVotes(candidate.votes);
    }
  }, [candidate?.votes]);

  useEffect(() => {
    if (candidate?.gifts !== undefined) {
      setAnimatedGifts(candidate.gifts);
    }
  }, [candidate?.gifts]);

  useEffect(() => {
    if (candidate?.gift_worth !== undefined) {
      setAnimatedWorth(candidate.gift_worth);
    }
  }, [candidate?.gift_worth]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-20"
    >
      {/* Desktop: Bottom Right */}
      <div className="hidden md:flex gap-4 bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-rose-500/30 shadow-2xl">
        {/* Votes - Clickable */}
        <button 
          onClick={onVoteClick}
          className="text-right hover:scale-105 transition-transform cursor-pointer group"
        >
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-rose-100 group-hover:from-rose-200 group-hover:to-rose-50">
            {Math.round(animatedVotes).toLocaleString()}
          </div>
          <div className="text-xs text-rose-300/80 uppercase tracking-wider flex items-center gap-1 group-hover:text-rose-200">
            <span className="text-rose-400 group-hover:text-rose-300">🗳️</span> Votes
          </div>
        </button>
        
        <div className="w-px bg-rose-500/30" />
        
        {/* Gifts - Clickable */}
        <button 
          onClick={onGiftClick}
          className="text-right hover:scale-105 transition-transform cursor-pointer group"
        >
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-rose-100 group-hover:from-rose-200 group-hover:to-rose-50">
            {Math.round(animatedGifts).toLocaleString()}
          </div>
          <div className="text-xs text-rose-300/80 uppercase tracking-wider flex items-center gap-1 group-hover:text-rose-200">
            <span className="text-rose-400 group-hover:text-rose-300">🎁</span> Gifts
          </div>
        </button>
        
        <div className="w-px bg-rose-500/30" />
        
        {/* Gift Worth - Not Clickable */}
        <div className="text-right">
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-rose-100">
            {formatNaira(Math.round(animatedWorth))}
          </div>
          <div className="text-xs text-rose-300/80 uppercase tracking-wider flex items-center gap-1">
            <span className="text-rose-400">💰</span> Worth
          </div>
        </div>
      </div>

      {/* Mobile: Bottom Right */}
      <div className="md:hidden flex flex-col gap-2 bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-md rounded-2xl p-3 max-w-[180px] border border-rose-500/30">
        {/* Votes - Clickable */}
        <button 
          onClick={onVoteClick}
          className="flex items-center justify-between hover:scale-105 transition-transform cursor-pointer group w-full"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-rose-400 text-xs group-hover:text-rose-300">🗳️</span>
            <span className="text-[8px] text-rose-300/80 uppercase group-hover:text-rose-200">Votes</span>
          </div>
          <div className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-rose-100 group-hover:from-rose-200 group-hover:to-rose-50">
            {Math.round(animatedVotes).toLocaleString()}
          </div>
        </button>
        
        {/* Gifts - Clickable */}
        <button 
          onClick={onGiftClick}
          className="flex items-center justify-between hover:scale-105 transition-transform cursor-pointer group w-full"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-rose-400 text-xs group-hover:text-rose-300">🎁</span>
            <span className="text-[8px] text-rose-300/80 uppercase group-hover:text-rose-200">Gifts</span>
          </div>
          <div className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-rose-100 group-hover:from-rose-200 group-hover:to-rose-50">
            {Math.round(animatedGifts).toLocaleString()}
          </div>
        </button>
        
        {/* Gift Worth - Not Clickable */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-rose-400 text-xs">💰</span>
            <span className="text-[8px] text-rose-300/80 uppercase">Worth</span>
          </div>
          <div className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-rose-100">
            {formatNaira(Math.round(animatedWorth))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CandidateProfile() {
  const router = useRouter();
  const { id } = router.query;
  const voteRef = useRef(null);
  const giftRef = useRef(null);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch candidate + subscribe to real-time updates
  useEffect(() => {
    if (!id) return;

    const fetchCandidate = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching candidate:", error);
        setCandidate(null);
      } else {
        setCandidate(data);
      }
      setLoading(false);
    };

    fetchCandidate();

    // Real-time subscription
    const channel = supabase
      .channel(`candidate-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "candidates",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          console.log("Real-time update received:", payload.new);
          setCandidate(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Scroll to vote or gift based on hash
  useEffect(() => {
    if (!router.isReady || !candidate) return;
    
    const hash = router.asPath.split("#")[1];
    
    if (hash === "vote") {
      const timer = setTimeout(() => {
        if (voteRef.current) {
          voteRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 800);
      return () => clearTimeout(timer);
    }
    
    if (hash === "gift") {
      const timer = setTimeout(() => {
        if (giftRef.current) {
          giftRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [router.asPath, router.isReady, candidate]);

  // Scroll handlers for clickable stats
  const scrollToVote = () => {
    if (voteRef.current) {
      voteRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToGift = () => {
    if (giftRef.current) {
      giftRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
        <div className="hidden md:block">
          <Footer />
        </div>
      </>
    );
  }

  if (!candidate) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Candidate Not Found</h2>
            <p className="text-gray-600 mb-4">The candidate you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
        <div className="hidden md:block">
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{candidate.name} – Lovemate Show</title>
        <meta name="description" content={`Support ${candidate.name} on Lovemate Show with votes and gifts`} />
      </Head>

      <Header />
      
      <main className="bg-gradient-to-br from-pink-50 via-white to-rose-50 min-h-screen pb-20 md:pb-0">
        {/* Hero Section with Integrated Stats */}
        <section className="relative h-[250px] md:h-[300px] bg-black">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={candidate.image_url}
              alt={candidate.name}
              fill
              className="object-cover opacity-80"
              priority
              sizes="100vw"
              unoptimized={true}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          
          {/* Digital Stats Overlay - Now clickable */}
          <DigitalStats 
            candidate={candidate} 
            formatNaira={formatNaira} 
            onVoteClick={scrollToVote}
            onGiftClick={scrollToGift}
          />
          
          {/* Candidate Info */}
          <div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-8 text-white">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-2xl md:text-4xl font-extrabold mb-1"
            >
              {candidate.name}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-sm md:text-lg flex items-center gap-1.5"
            >
              <span>📍</span> {candidate.country}
            </motion.p>
          </div>
        </section>

        {/* Small gap between hero and about section on mobile */}
        <div className="md:hidden h-3"></div>

        {/* Bio Section - Reduced top padding on desktop */}
        <section className="py-4 md:py-6 px-4 max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-xl"
          >
            <h2 className="text-lg md:text-2xl font-bold mb-3 text-center">
              <span className="text-gray-800">About</span>{" "}
              <span className="text-red-600">{candidate.name}</span>
            </h2>
            <p className="text-gray-700 text-sm md:text-base leading-relaxed text-center">
              {candidate.bio}
            </p>
          </motion.div>
        </section>

        {/* Gallery Section - No title */}
        {Array.isArray(candidate.gallery) && candidate.gallery.length > 0 && (
          <section className="py-4 md:py-5 px-4 max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              {candidate.gallery.map((img, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <Image
                    src={img}
                    alt={`${candidate.name} gallery ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    unoptimized={true}
                  />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Vote Section - Reduced gap */}
        <div ref={voteRef} id="vote" className="mt-2 md:mt-4">
          <VoteSection candidate={candidate} />
        </div>

        {/* Gift Section - Reduced gap */}
        <div ref={giftRef} id="gift" className="mt-2 md:mt-4">
          <GiftSection candidate={candidate} />
        </div>
      </main>

      {/* Footer - Hidden on mobile */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}