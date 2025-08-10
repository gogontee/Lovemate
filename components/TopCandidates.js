import { useEffect, useState } from "react";
import CandidateCard from "./CandidateCard";
import { supabase } from "@/utils/supabaseClient";

const fallbackImage = "https://via.placeholder.com/300x400?text=No+Image";

export default function TopCandidate() {
  const [topCandidates, setTopCandidates] = useState([]);

  useEffect(() => {
    const fetchTopCandidates = async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("role", "Yes")             // Only role = "Yes"
        .order("votes", { ascending: false })
        .limit(4);                    // Limit to 4 highest voted

      if (error) {
        console.error("Error fetching top candidates:", error);
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
    };

    fetchTopCandidates();
  }, []);

  return (
    <section className="py-10 px-4 bg-white max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Top Candidates
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {topCandidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            id={candidate.id}
            name={candidate.name}
            country={candidate.country}
            votes={candidate.votes}
            imageUrl={candidate.imageUrl}
          />
        ))}
      </div>
    </section>
  );
}
