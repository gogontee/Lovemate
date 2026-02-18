import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Camera, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";

export default function ProfileHeader({ profile, avatarUrl, onUpload }) {
  const fileInputRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [stats, setStats] = useState({
    totalVotes: 0,
    totalGifts: 0,
    loading: true
  });

  // Fetch user's vote and gift stats
  useEffect(() => {
    if (!profile?.id) return;

    const fetchUserStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true }));

        // Fetch total votes from vote_transactions
        const { data: votesData, error: votesError } = await supabase
          .from("vote_transactions")
          .select("votes")
          .eq("user_id", profile.id)
          .eq("status", "completed");

        if (votesError) {
          console.error("Error fetching votes:", votesError);
        }

        // Fetch total gifts count from gift_transactions
        const { data: giftsData, error: giftsError } = await supabase
          .from("gift_transactions")
          .select("id", { count: 'exact', head: false })
          .eq("user_id", profile.id)
          .eq("status", "completed");

        if (giftsError) {
          console.error("Error fetching gifts:", giftsError);
        }

        // Calculate total votes
        const totalVotes = votesData?.reduce((sum, transaction) => sum + (transaction.votes || 0), 0) || 0;
        
        // Get total gifts count
        const totalGifts = giftsData?.length || 0;

        setStats({
          totalVotes,
          totalGifts,
          loading: false
        });

      } catch (error) {
        console.error("Error fetching user stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchUserStats();

    // Set up real-time subscription for vote transactions
    const voteSubscription = supabase
      .channel('user_vote_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'vote_transactions',
          filter: `user_id=eq.${profile.id}`
        },
        () => {
          fetchUserStats(); // Refresh stats when votes change
        }
      )
      .subscribe();

    // Set up real-time subscription for gift transactions
    const giftSubscription = supabase
      .channel('user_gift_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'gift_transactions',
          filter: `user_id=eq.${profile.id}`
        },
        () => {
          fetchUserStats(); // Refresh stats when gifts change
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(voteSubscription);
      supabase.removeChannel(giftSubscription);
    };
  }, [profile?.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl md:rounded-3xl shadow-xl p-4 md:p-6 text-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-white/10 rounded-full -mr-16 md:-mr-20 -mt-16 md:-mt-20"></div>
      <div className="absolute bottom-0 left-0 w-36 md:w-48 h-36 md:h-48 bg-white/5 rounded-full -ml-12 md:-ml-16 -mb-12 md:-mb-16"></div>
      
      <div className="relative z-10 flex flex-row items-center gap-3 md:gap-6">
        {/* Avatar with Upload */}
        <div 
          className="relative group flex-shrink-0"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28">
            <Image
              src={avatarUrl || "/default-avatar.png"}
              alt="Profile"
              fill
              sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, 112px"
              className="rounded-xl md:rounded-2xl border-2 md:border-4 border-white/30 object-cover shadow-lg md:shadow-xl"
            />
            
            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/png, image/jpeg"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) onUpload(file);
              }}
              className="hidden"
            />
            
            {/* Upload Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovering ? 1 : 0 }}
              className="absolute inset-0 bg-black/50 rounded-xl md:rounded-2xl flex items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-white" />
            </motion.div>
          </div>
        </div>

        {/* Profile Info - Takes remaining space */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-0.5 md:mb-1 truncate">
            {profile?.full_name || "Welcome Back!"}
          </h1>
          <p className="text-rose-100 text-xs sm:text-sm md:text-base mb-1.5 md:mb-3 truncate flex items-center gap-1">
            <Mail className="w-3 h-3 inline" />
            {profile?.email || "Fan Account"}
          </p>
          
          <div className="flex flex-wrap gap-1.5 md:gap-2 lg:gap-4 text-[10px] sm:text-xs md:text-sm">
            {profile?.phone && (
              <div className="flex items-center gap-0.5 md:gap-1 bg-white/20 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
                <Phone className="w-2.5 h-2.5 md:w-3 md:h-3" />
                <span className="truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">{profile.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-0.5 md:gap-1 bg-white/20 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
              <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3" />
              <span>Joined {new Date(profile?.created_at || Date.now()).getFullYear()}</span>
            </div>
            <div className="flex items-center gap-0.5 md:gap-1 bg-white/20 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
              <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3" />
              <span>Nigeria</span>
            </div>
          </div>
        </div>

        {/* Quick Stats - Shows real data from database */}
        <div className="flex gap-2 md:gap-4 lg:gap-6 flex-shrink-0">
          <div className="text-center">
            {stats.loading ? (
              <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">{stats.totalVotes}</p>
                <p className="text-[8px] sm:text-[10px] md:text-xs text-rose-100">Votes Cast</p>
              </>
            )}
          </div>
          <div className="text-center">
            {stats.loading ? (
              <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">{stats.totalGifts}</p>
                <p className="text-[8px] sm:text-[10px] md:text-xs text-rose-100">Gifts Sent</p>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}