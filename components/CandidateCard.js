// components/CandidateCard.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";
import { motion } from "framer-motion";
import Image from "next/image";

const FALLBACK_IMAGE = "https://via.placeholder.com/400x400?text=Image+Missing";

// Helper: ensure we have a full public URL
function getFullImageUrl(url) {
  if (!url) return FALLBACK_IMAGE;
  // Already a full URL?
  if (url.startsWith("http")) return url;
  // Otherwise, assume it's a filename and build the Supabase URL
  return `https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/candidates/${url}`;
}

export default function CandidateCard({
  id,
  name,
  country,
  votes: initialVotes,
  imageUrl,
}) {
  const [votes, setVotes] = useState(initialVotes);
  const [imgSrc, setImgSrc] = useState(() => getFullImageUrl(imageUrl));
  const router = useRouter();

  // Real-time vote updates
  useEffect(() => {
    const channel = supabase
      .channel("candidate-votes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "candidates",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setVotes(payload.new.votes);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const goToCandidatePage = () => {
    router.push(`/candidate/${id}`);
  };

  const handleImageError = () => {
    console.warn(`Failed to load image for ${name}: ${imgSrc}`);
    setImgSrc(FALLBACK_IMAGE);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-rose-200 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden p-4 border border-rose-300"
    >
      <div className="flex flex-col gap-3">
        {/* Image – using unoptimized to bypass Next.js config issues */}
        <div className="w-full aspect-square relative overflow-hidden rounded-xl border-2 border-rose-500 bg-rose-100">
          <Image
            src={imgSrc}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-cover rounded-xl"
            quality={60}
            loading="lazy"
            onError={handleImageError}
            unoptimized={true}   // 👈 Bypass Next.js image optimization – ensures it works now
          />
        </div>

        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
          <p className="text-sm text-gray-600">{country}</p>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Vote</span>
          <span className="text-sm font-bold text-rose-700">{votes}</span>
        </div>

        <div className="mt-2">
          <button
            onClick={goToCandidatePage}
            className="w-full px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 rounded-full text-sm font-semibold transition duration-300 shadow-sm border border-rose-300"
          >
            View Candidate
          </button>
        </div>
      </div>
    </motion.div>
  );
}