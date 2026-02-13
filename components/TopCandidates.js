import { useEffect, useState } from "react";
import CandidateCard from "./CandidateCard";
import { supabase } from "@/utils/supabaseClient";

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
      <section className="py-16 px-4 bg-gradient-to-b from-white to-pink-50 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">
          Top Candidates
        </h2>
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-rose-400"></div>
        </div>
      </section>
    );
  }

  // Empty state - no candidates with votes yet
  if (topCandidates.length === 0) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-white via-rose-50 to-pink-100 max-w-6xl mx-auto rounded-3xl shadow-lg my-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-600">
            ✨ Top Candidates ✨
          </h2>
          
          <div className="relative py-12 px-6">
            {/* Decorative hearts */}
            <div className="absolute top-0 left-0 text-6xl opacity-10 text-pink-400">❤️</div>
            <div className="absolute bottom-0 right-0 text-6xl opacity-10 text-rose-400">❤️</div>
            <div className="absolute top-1/2 left-10 text-4xl opacity-10 text-pink-300">❤️</div>
            <div className="absolute bottom-10 right-20 text-4xl opacity-10 text-rose-300">❤️</div>
            
            {/* Main content */}
            <div className="max-w-2xl mx-auto">
              <div className="mb-8 animate-pulse">
                <span className="inline-block text-7xl mb-4">💝</span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-pink-700">
                Get Ready for Love! 💕
              </h3>
              
              <p className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed">
                Our Top 4 Lovemate candidates are being prepared for their grand unveiling!
              </p>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-pink-200">
                <p className="text-gray-600 text-lg mb-3">
                  Keep your eyes glued 👀
                </p>
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 font-bold text-2xl mb-2">
                  Something beautiful is coming!
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  <span className="inline-block w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
                  <span className="inline-block w-3 h-3 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                  <span className="inline-block w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                  <span className="inline-block w-3 h-3 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></span>
                </div>
              </div>
              
              <p className="mt-8 text-pink-500 font-medium">
                The wait will be worth it! 🌹
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show top candidates
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white via-rose-50 to-pink-50 max-w-6xl mx-auto rounded-3xl my-8 shadow-md">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-pink-700 to-rose-600">
          🏆 Top 4 Lovemates 🏆
        </h2>
        <p className="text-pink-600 text-lg">The crowd favorites so far!</p>
        <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-rose-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {topCandidates.map((candidate, index) => (
          <div key={candidate.id} className="relative group">
            {/* Rank badge */}
            <div className="absolute -top-3 -left-3 z-10">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl
                ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-yellow-200' : 
                  index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 shadow-gray-200' :
                  index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 shadow-amber-200' :
                  'bg-gradient-to-br from-pink-400 to-rose-600 shadow-pink-200'}
                shadow-lg border-2 border-white
              `}>
                #{index + 1}
              </div>
            </div>
            
            {/* Crown for 1st place */}
            {index === 0 && (
              <div className="absolute -top-6 right-4 text-3xl animate-bounce">
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
            <div className="absolute -bottom-3 right-4 bg-white px-3 py-1 rounded-full shadow-md border border-pink-200">
              <span className="text-sm font-semibold text-pink-700">
                ❤️ {candidate.votes} votes
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Decorative footer */}
      <div className="text-center mt-12 text-pink-400">
        <span className="inline-block animate-pulse">✨</span> Cast your vote now! <span className="inline-block animate-pulse">✨</span>
      </div>
    </section>
  );
}