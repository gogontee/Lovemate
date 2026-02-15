import { useEffect, useState } from "react";
import CandidateCard from "./CandidateCard";
import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";

const fallbackImage = "https://via.placeholder.com/300x400?text=No+Image";

export default function TopCandidate() {
  const [topCandidates, setTopCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopCandidates = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("role", "Yes")
        .gt("votes", 0)               // Only candidates with votes > 0
        .order("votes", { ascending: false })
        .limit(4);                   // Limit to 4 highest voted

      if (error) {
        console.error("Error fetching top candidates:", error);
        setLoading(false);
        return;
      }

      const processed = data.map((item) => ({
        ...item,
        imageUrl:
          item.image_url && item.image_url.startsWith("http")
            ? item.image_url
            : item.image_url
            ? `https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/candidates/${item.image_url}`
            : fallbackImage,
      }));

      setTopCandidates(processed);
      setLoading(false);
    };

    fetchTopCandidates();
  }, []);

  // Loading state
  if (loading) {
    return (
      <section className="py-8 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          <span className="text-gray-900">Top</span>{" "}
          <span className="text-red-600">Candidates</span>
        </h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-rose-400"></div>
        </div>
      </section>
    );
  }

  // Empty state - no candidates with votes yet
  if (topCandidates.length === 0) {
    return (
      <section className="py-8 px-4 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-rose-50 via-white to-rose-100 rounded-2xl p-6 shadow-lg border border-rose-200">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              <span className="text-gray-900">Top</span>{" "}
              <span className="text-red-600">Candidates</span>
            </h2>
            
            <div className="relative py-6 px-4">
              {/* Decorative hearts */}
              <div className="absolute top-0 left-0 text-4xl opacity-10 text-rose-400">❤️</div>
              <div className="absolute bottom-0 right-0 text-4xl opacity-10 text-rose-400">❤️</div>
              
              {/* Main content */}
              <div className="max-w-2xl mx-auto">
                <div className="mb-4">
                  <span className="inline-block text-5xl">💝</span>
                </div>
                
                <h3 className="text-xl md:text-2xl font-semibold mb-3 text-rose-700">
                  Get Ready for Love! 💕
                </h3>
                
                <p className="text-base md:text-lg text-gray-700 mb-4">
                  Our Top 4 Lovemate candidates are being prepared for their grand unveiling!
                </p>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-rose-200 mb-4">
                  <p className="text-gray-600 mb-2">
                    Keep your eyes glued 👀
                  </p>
                  <p className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 font-bold text-xl">
                    Something beautiful is coming!
                  </p>
                  <div className="flex justify-center gap-2 mt-3">
                    <span className="inline-block w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
                    <span className="inline-block w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                    <span className="inline-block w-2 h-2 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                    <span className="inline-block w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></span>
                  </div>
                </div>
                
                <p className="text-rose-500 font-medium text-sm">
                  The wait will be worth it! 🌹
                </p>
              </div>
            </div>

            {/* See All Candidates Button - with responsive spacing */}
            <div className="mt-8 md:mt-4">
              <Link href="/vote" className="inline-block">
                <motion.button
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(244, 114, 182, 0.4)",
                      "0 0 0 10px rgba(244, 114, 182, 0)",
                      "0 0 0 0 rgba(244, 114, 182, 0.4)"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 0 0 0 rgba(244, 114, 182, 0)",
                    transition: { duration: 0.2 }
                  }}
                  className="relative px-4 md:px-8 py-1.5 md:py-3 bg-rose-100 text-rose-700 rounded-full font-semibold shadow-lg hover:bg-rose-200 transition-colors text-xs md:text-base"
                >
                  <span className="relative z-10">See All Candidates</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show top candidates
  return (
    <section className="py-8 px-4 max-w-6xl mx-auto">
      <div className="bg-gradient-to-br from-rose-50 via-white to-rose-100 rounded-2xl p-6 shadow-lg border border-rose-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            <span className="text-gray-900">Top</span>{" "}
            <span className="text-red-600">Candidates</span>
          </h2>
          <p className="text-rose-600 text-sm">The crowd favorites so far!</p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-rose-400 to-rose-600 mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Responsive grid: 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {topCandidates.map((candidate, index) => (
            <div key={candidate.id} className="relative group">
              {/* Rank badge */}
              <div className="absolute -top-2 -left-2 z-10">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                  ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                    'bg-gradient-to-br from-rose-400 to-pink-600'}
                  shadow-md border border-white
                `}>
                  #{index + 1}
                </div>
              </div>
              
              {/* Crown for 1st place */}
              {index === 0 && (
                <div className="absolute -top-5 right-2 text-xl animate-bounce">
                  👑
                </div>
              )}
              
              <CandidateCard
                id={candidate.id}
                name={candidate.name}
                country={candidate.country}
                votes={candidate.votes}
                imageUrl={candidate.imageUrl}
              />
              
              {/* Vote count badge */}
              <div className="absolute -bottom-2 right-2 bg-white px-2 py-0.5 rounded-full shadow-sm border border-rose-200">
                <span className="text-xs font-semibold text-rose-600">
                  ❤️ {candidate.votes}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* See All Candidates Button - Added responsive padding for mobile */}
        <div className="text-center mt-8 md:mt-6">
          <Link href="/vote" className="inline-block">
            <motion.button
              initial={{ scale: 1 }}
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 0 0 rgba(244, 114, 182, 0.4)",
                  "0 0 0 10px rgba(244, 114, 182, 0)",
                  "0 0 0 0 rgba(244, 114, 182, 0.4)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 0 0 rgba(244, 114, 182, 0)",
                transition: { duration: 0.2 }
              }}
              className="relative px-4 md:px-8 py-1.5 md:py-3 bg-rose-100 text-rose-700 rounded-full font-semibold shadow-lg hover:bg-rose-200 transition-colors text-xs md:text-base"
            >
              <span className="relative z-10">See All Candidates</span>
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
}