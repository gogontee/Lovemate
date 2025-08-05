import { useEffect, useState } from "react";
import CandidateCard from "./CandidateCard";
import { supabase } from "../lib/supabaseClient";

export default function TopCandidates() {
  const [topCandidates, setTopCandidates] = useState([]);

  useEffect(() => {
    const fetchTopCandidates = async () => {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .order("votes", { ascending: false }) // ✅ Fixed here
        .limit(4);

      if (error) {
        console.error("Error fetching top candidates:", error);
      } else {
        setTopCandidates(data);
      }
    };

    fetchTopCandidates();
  }, []);

  return (
    <section className="bg-rose-100 py-6 px-4">
      <h2 className="text-2xl font-bold text-center text-rose-600 mb-6">
        Top Candidates
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {topCandidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            id={candidate.id}
            name={candidate.name}
            imageUrl={candidate.image_url}
            votes={candidate.votes} // ✅ Also fixed here
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <a
          href="/vote"
          className="inline-block bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-3 rounded-full shadow transition"
        >
          Discover More
        </a>
      </div>
    </section>
  );
}
