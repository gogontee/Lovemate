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
      className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-3xl shadow-xl p-6 text-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-16 -mb-16"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Avatar with Upload */}
        <div 
          className="relative group"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="relative w-24 h-24 md:w-28 md:h-28">
            <Image
              src={avatarUrl || "/default-avatar.png"}
              alt="Profile"
              fill
              className="rounded-2xl border-4 border-white/30 object-cover shadow-xl"
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
              className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-8 h-8 text-white" />
            </motion.div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            {profile?.full_name || "Welcome Back!"}
          </h1>
          <p className="text-rose-100 text-sm md:text-base mb-3">
            {profile?.email || "Fan Account"}
          </p>
          
          <div className="flex flex-wrap gap-4 text-sm">
            {profile?.phone && (
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                <Phone className="w-3 h-3" />
                <span>{profile.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
              <Calendar className="w-3 h-3" />
              <span>Joined {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
              <MapPin className="w-3 h-3" />
              <span>Nigeria</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 md:gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold">47</p>
            <p className="text-xs text-rose-100">Votes Cast</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-rose-100">Gifts Sent</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}