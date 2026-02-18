import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Camera, Mail, Phone, MapPin, Calendar, Heart, Gift, TrendingUp } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";

export default function ProfileHeader({ profile, avatarUrl, onUpload, stats }) {
  const fileInputRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format compact number (e.g., 1.5k, 2.3M)
  const formatCompactNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl md:rounded-3xl shadow-xl p-3 md:p-6 text-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-white/10 rounded-full -mr-16 md:-mr-20 -mt-16 md:-mt-20"></div>
      <div className="absolute bottom-0 left-0 w-36 md:w-48 h-36 md:h-48 bg-white/5 rounded-full -ml-12 md:-ml-16 -mb-12 md:-mb-16"></div>
      
      <div className="relative z-10 flex flex-row items-center gap-2 md:gap-6">
        {/* Avatar with Upload */}
        <div 
          className="relative group flex-shrink-0"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-24 lg:h-24">
            <Image
              src={avatarUrl || "/default-avatar.png"}
              alt="Profile"
              fill
              sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, (max-width: 1024px) 80px, 96px"
              className="rounded-lg md:rounded-xl border-2 md:border-4 border-white/30 object-cover shadow-lg md:shadow-xl"
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
              className="absolute inset-0 bg-black/50 rounded-lg md:rounded-xl flex items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-white" />
            </motion.div>
          </div>
        </div>

        {/* Profile Info - Takes remaining space */}
        <div className="flex-1 min-w-0">
          <h1 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold mb-0.5 truncate">
            {profile?.full_name || "Welcome Back!"}
          </h1>
          <p className="text-rose-100 text-[10px] sm:text-xs md:text-sm mb-1 truncate flex items-center gap-1">
            <Mail className="w-2.5 h-2.5 md:w-3 md:h-3 inline flex-shrink-0" />
            <span className="truncate">{profile?.email || "Fan Account"}</span>
          </p>
          
          <div className="flex flex-wrap gap-1 md:gap-2 text-[8px] sm:text-[10px] md:text-xs">
            {profile?.phone && (
              <div className="flex items-center gap-0.5 md:gap-1 bg-white/20 px-1.5 md:px-2 py-0.5 rounded-full">
                <Phone className="w-2 h-2 md:w-2.5 md:h-2.5" />
                <span className="truncate max-w-[60px] sm:max-w-[80px] md:max-w-none">{profile.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-0.5 md:gap-1 bg-white/20 px-1.5 md:px-2 py-0.5 rounded-full">
              <Calendar className="w-2 h-2 md:w-2.5 md:h-2.5" />
              <span>Joined {new Date(profile?.created_at || Date.now()).getFullYear()}</span>
            </div>
            <div className="flex items-center gap-0.5 md:gap-1 bg-white/20 px-1.5 md:px-2 py-0.5 rounded-full">
              <MapPin className="w-2 h-2 md:w-2.5 md:h-2.5" />
              <span>Nigeria</span>
            </div>
          </div>
        </div>

        {/* Stats - Using passed stats prop */}
        <div className="flex gap-1.5 md:gap-3 lg:gap-4 flex-shrink-0">
          {/* Votes Stats */}
          <div className="text-center min-w-[45px] md:min-w-[60px] lg:min-w-[80px]">
            {stats?.loading ? (
              <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
                <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-0.5 md:gap-1">
                  <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 text-rose-200" />
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg font-bold leading-tight">
                    {formatCompactNumber(stats?.votesCount || 0)}
                  </p>
                </div>
                <p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-rose-100 whitespace-nowrap">
                  Votes
                </p>
                <p className="text-[6px] sm:text-[7px] md:text-[8px] lg:text-[10px] text-rose-200 whitespace-nowrap">
                  {formatCurrency(stats?.votesWorth || 0)}
                </p>
              </>
            )}
          </div>

          {/* Gifts Stats */}
          <div className="text-center min-w-[45px] md:min-w-[60px] lg:min-w-[80px]">
            {stats?.loading ? (
              <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
                <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-0.5 md:gap-1">
                  <Gift className="w-2.5 h-2.5 md:w-3 md:h-3 lg:w-4 lg:h-4 text-rose-200" />
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg font-bold leading-tight">
                    {formatCompactNumber(stats?.giftsCount || 0)}
                  </p>
                </div>
                <p className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs text-rose-100 whitespace-nowrap">
                  Gifts
                </p>
                <p className="text-[6px] sm:text-[7px] md:text-[8px] lg:text-[10px] text-rose-200 whitespace-nowrap">
                  {formatCurrency(stats?.giftsWorth || 0)}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}