// components/NewsCard.js
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Eye, ChevronRight, Sparkles, Heart } from "lucide-react";
import { useState } from "react";

export default function NewsCard({ image, title, summary, views, link, date }) {
  const [isHovered, setIsHovered] = useState(false);

  // Format date if provided
  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative h-full"
    >
      {/* Animated Background Glow (Crimson Red) */}
      <motion.div
        animate={{
          scale: isHovered ? 1.02 : 1,
          opacity: isHovered ? 0.6 : 0.2
        }}
        className="absolute -inset-0.5 bg-[#DC143C] rounded-2xl blur-xl -z-10 transition-all duration-300"
      />

      {/* Main Glass Card */}
      <div className="relative bg-gradient-to-br from-[#E11845]/90 to-[#990B2A]/90 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-[#DC143C]/40 group-hover:border-[#DC143C] transition-all duration-300 flex flex-col h-full">
        
        {/* Decorative Corner Elements */}
        <div className="absolute top-0 left-0 w-16 h-16 bg-black/10 rounded-br-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/5 rounded-tl-3xl pointer-events-none" />
        
        {/* Floating Hearts (visible on hover) */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: isHovered ? 0.3 : 0,
            scale: isHovered ? 1 : 0,
            y: [0, -10, 0]
          }}
          transition={{ duration: 0.3, repeat: isHovered ? Infinity : 0, repeatDelay: 1 }}
          className="absolute top-4 right-4 text-white z-20 pointer-events-none"
        >
          <Heart size={24} fill="currentColor" />
        </motion.div>

        {/* Image Container */}
        <div className="relative w-full h-48 overflow-hidden shrink-0">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            priority
          />
          
          {/* Gradient Overlay to blend image into the glass card */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#990B2A] via-[#E11845]/20 to-transparent opacity-90" />
          
          {/* Date Badge */}
          {formattedDate && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
              <Calendar className="w-3 h-3 text-white" />
              <span className="text-[10px] font-medium text-white">{formattedDate}</span>
            </div>
          )}
          
          {/* Views Badge */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
            <Eye className="w-3 h-3 text-white" />
            <span className="text-[10px] font-medium text-white">
              {(views || 0).toLocaleString()}
            </span>
          </div>

          {/* Animated Corner Accent */}
          <motion.div
            animate={{ rotate: isHovered ? 90 : 0 }}
            className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-white/50 rounded-tl-lg pointer-events-none"
          />
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-1 relative z-10">
          
          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-tight">
            {title}
          </h3>
          
          {/* Summary */}
          <p className="text-sm text-white/80 mb-5 line-clamp-3 leading-relaxed">
            {summary}
          </p>

          {/* Read More Link */}
          {link && (
            <div className="mt-auto">
              <Link href={link} className="inline-flex items-center gap-2 group/link">
                <span className="text-sm font-bold text-white transition-colors">
                  Read Article
                </span>
                <motion.div
                  animate={{ x: isHovered ? 3 : 0 }}
                  className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-[#DC143C]"
                >
                  <ChevronRight className="w-3 h-3" />
                </motion.div>
              </Link>
            </div>
          )}
        </div>

        {/* Bottom Gradient Bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          className="absolute bottom-0 left-0 right-0 h-1 bg-white origin-left z-20"
        />
      </div>
    </motion.div>
  );
}