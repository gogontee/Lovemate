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
      className="group relative"
    >
      {/* Animated Background Glow */}
      <motion.div
        animate={{
          scale: isHovered ? 1.05 : 1,
          opacity: isHovered ? 0.6 : 0.3
        }}
        className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl blur-xl -z-10"
      />

      {/* Main Card */}
      <div className="relative bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-rose-100/50 transform transition-all duration-300 hover:shadow-2xl">
        
        {/* Decorative Corner Elements */}
        <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-red-600/10 to-transparent rounded-br-3xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-rose-600/10 to-transparent rounded-tl-3xl" />
        
        {/* Floating Hearts (visible on hover) */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: isHovered ? 0.2 : 0,
            scale: isHovered ? 1 : 0,
            y: [0, -10, 0]
          }}
          transition={{ duration: 0.3, repeat: isHovered ? Infinity : 0, repeatDelay: 1 }}
          className="absolute top-4 right-4 text-rose-200"
        >
          <Heart size={24} fill="currentColor" />
        </motion.div>

        {/* Image Container */}
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Date Badge (if provided) */}
          {formattedDate && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
              <Calendar className="w-3 h-3 text-rose-300" />
              <span className="text-[10px] font-medium text-white">{formattedDate}</span>
            </div>
          )}
          
          {/* Views Badge */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/20">
            <Eye className="w-3 h-3 text-rose-300" />
            <span className="text-[10px] font-medium text-white">
              {(views || 0).toLocaleString()}
            </span>
          </div>

          {/* Animated Corner Accent */}
          <motion.div
            animate={{ rotate: isHovered ? 90 : 0 }}
            className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-rose-400 rounded-tl-lg"
          />
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Title with Gradient on Hover */}
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-rose-600 transition-all duration-300">
            {title}
          </h3>
          
          {/* Summary with animated underline */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 relative">
            {summary}
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: isHovered ? '100%' : 0 }}
              className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-red-600 to-rose-600"
            />
          </p>

          {/* Read More Link */}
          {link && (
            <Link href={link} className="group/link inline-flex items-center gap-2">
              <span className="text-sm font-semibold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                Read Article
              </span>
              <motion.div
                animate={{ x: isHovered ? 3 : 0 }}
                className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-red-600 to-rose-600"
              >
                <ChevronRight className="w-3 h-3 text-white" />
              </motion.div>
            </Link>
          )}

          {/* Decorative Elements */}
          <div className="absolute bottom-0 right-0 w-20 h-20 opacity-5 pointer-events-none">
            <Sparkles className="w-full h-full text-rose-600" />
          </div>
        </div>

        {/* Bottom Gradient Bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 origin-left"
        />
      </div>
    </motion.div>
  );
}