import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Send, Share2, X, Sparkles, MessageCircle } from "lucide-react";

// Helper for image URL just like your other components
const FALLBACK_IMAGE = "https://via.placeholder.com/400x400?text=Image+Missing";
function getFullImageUrl(url) {
  if (!url) return FALLBACK_IMAGE;
  if (url.startsWith("http")) return url;
  return `https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/candidates/${url}`;
}

export default function CrushChallenge({ 
  candidateId, 
  candidateName, 
  imageUrl, 
  isOpen, 
  onClose 
}) {
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const fullImageUrl = getFullImageUrl(imageUrl);
  
  // Customize your challenge message here
  const challengeMessage = `I've been secretly crushing on you... 💖 I'm stepping into the Lovemate Show to test find Love. Are you brave enough to join me? Let's find out if we're soulmates. 💍`;
  
  // The link to the show/candidate profile
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/candidate/${candidateId}` 
    : `https://lovemateshow.com/candidate/${candidateId}`;

  // Share handlers
  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${challengeMessage}\n\nJoin me here: ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareToTelegram = () => {
    const text = encodeURIComponent(`${challengeMessage}\n\nJoin me here: ${shareUrl}`);
    window.open(`https://t.me/share/url?url=${shareUrl}&text=${text}`, "_blank");
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "A Secret Crush Challenge 💌",
          text: challengeMessage,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${challengeMessage}\n\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-sm bg-[#0f0f0f] border border-rose-600/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)]"
        >
          {/* Top Glow Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-rose-600/30 blur-[60px] pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/80 text-gray-400 hover:text-white rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Card Content */}
          <div className="relative z-10 p-6 flex flex-col items-center text-center">
            
            {/* Gamified Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/10 border border-rose-600/20 text-rose-500 text-[10px] font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" /> Secret Admirer Challenge
            </div>

            {/* Candidate Image with Roses */}
            <div className="relative mb-6">
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-3 border border-rose-500/30 rounded-full border-dashed"
              />
              <div className="relative w-28 h-28 rounded-full border-2 border-rose-500 overflow-hidden shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                <Image
                  src={fullImageUrl}
                  alt={candidateName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              {/* Floating Rose */}
              <motion.div 
                animate={{ y: [0, -10, 0], rotate: [0, 15, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-2 -right-2 text-3xl drop-shadow-lg"
              >
                🌹
              </motion.div>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">
              Hey Secret Admirer...
            </h2>
            
            <p className="text-sm text-gray-400 leading-relaxed mb-6 italic">
              "{challengeMessage}"
            </p>

            {/* Action Buttons */}
            <div className="w-full space-y-3">
              <button
                onClick={shareToWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm rounded-xl transition-all shadow-lg"
              >
                <MessageCircle className="w-4 h-4" /> Share on WhatsApp
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={shareToTelegram}
                  className="flex items-center justify-center gap-2 py-3 bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold text-sm rounded-xl transition-all shadow-lg"
                >
                  <Send className="w-4 h-4" /> Telegram
                </button>
                <button
                  onClick={shareNative}
                  className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-sm rounded-xl transition-all"
                >
                  <Share2 className="w-4 h-4" /> More
                </button>
              </div>
            </div>

            {/* Copied Feedback */}
            <AnimatePresence>
              {copied && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-2 text-xs text-rose-400 font-medium"
                >
                  Link & message copied to clipboard!
                </motion.p>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}