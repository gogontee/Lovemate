import { useEffect, useState } from "react";
import CandidateCard from "./CandidateCard";
import { supabase } from "@/utils/supabaseClient";

const fallbackImage =
  "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/maingallery/Only%20successful%20Bachelors%20Zone.jpg";

export default function CandidateWindow({ userId }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("CandidateWindow fetch start:", { userId });

    if (!userId) {
      setCandidates([]);
      setLoading(false);
      return;
    }

    const fetchCandidates = async () => {
      setLoading(true);

      // Fetch candidates by user_id
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("user_id", userId); // <-- Match by foreign key

      console.log("CandidateWindow fetch result:", { data, error });

      if (error) {
        console.error("Error fetching candidates:", error);
        setCandidates([]);
      } else {
        setCandidates(data || []);
      }

      setLoading(false);
    };

    fetchCandidates();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-6 bg-rose-100 rounded-xl shadow-md text-center text-rose-600 font-semibold animate-pulse max-w-sm mx-auto">
        Loading candidate information...
      </div>
    );
  }

  if (!candidates.length) {
    return (
      <div className="p-6 bg-rose-50 rounded-xl shadow-md text-center text-rose-700 max-w-sm mx-auto">
        <p className="text-lg font-semibold mb-2">No candidate information found.</p>
        <p className="text-sm text-rose-600">
          This window is only for candidates registered with the Lovemate show.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {candidates.map((candidateData) => {
        const isApproved = candidateData.role === "Yes";
        const statusColor = isApproved ? "bg-green-500" : "bg-orange-400";
        const statusText = isApproved ? "Approved Candidate" : "Pending Approval";

        const imageUrl =
          candidateData.image_url && candidateData.image_url.startsWith("http")
            ? candidateData.image_url
            : candidateData.image_url
            ? `https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/candidates/${candidateData.image_url}`
            : fallbackImage;

        return (
          <div
            key={candidateData.id}
            className="bg-rose-50 rounded-2xl shadow-lg p-6 border border-rose-200"
          >
            <div className="flex items-center gap-3 mb-6 justify-center">
              <span
                className={`inline-block w-5 h-5 rounded-full ${statusColor} shadow-lg`}
                title={statusText}
                aria-label={statusText}
              />
              <h3 className="text-rose-700 font-bold text-lg">{statusText}</h3>
            </div>

            <CandidateCard
              id={candidateData.id}
              name={candidateData.name}
              country={candidateData.country}
              votes={candidateData.votes}
              imageUrl={imageUrl}
            />
          </div>
        );
      })}
    </div>
  );
}
