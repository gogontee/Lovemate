import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Camera, Mail, Phone, MapPin, Calendar } from "lucide-react";

export default function ProfileHeader({ profile, avatarUrl, onUpload }) {
  const fileInputRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

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
          <p className="text-rose-100 text-xs sm:text-sm md:text-base mb-1.5 md:mb-3 truncate">
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
              <span>Joined {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-0.5 md:gap-1 bg-white/20 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
              <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3" />
              <span>Nigeria</span>
            </div>
          </div>
        </div>

        {/* Quick Stats - Hidden on very small screens, shown as icons on medium */}
        <div className="hidden sm:flex gap-2 md:gap-4 lg:gap-6 flex-shrink-0">
          <div className="text-center">
            <p className="text-lg sm:text-xl md:text-2xl font-bold">47</p>
            <p className="text-[8px] sm:text-[10px] md:text-xs text-rose-100">Votes</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-xl md:text-2xl font-bold">12</p>
            <p className="text-[8px] sm:text-[10px] md:text-xs text-rose-100">Gifts</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}