// components/SponsorCarousel.js
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, Users, Gem, Handshake, ArrowRight } from "lucide-react";

export default function SponsorCarousel() {
  return (
    <section className="bg-[#0a0a0f] py-8 md:py-12 px-4 relative overflow-hidden">
      
      {/* --- Background Effects --- */}
      {/* Subtle Red Glows in Corners */}
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-[#DC143C]/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#DC143C]/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Randomly Scattered Floating Animated Red Love Icons (Across the whole section) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => {
          // Generate random initial positions across the whole width and height
          const topPos = Math.random() * 100;
          const leftPos = Math.random() * 100;
          const size = Math.random() * 15 + 8; // Small, subtle icons (8px to 23px)
          
          return (
            <motion.div
              key={i}
              initial={{ 
                top: `${topPos}%`, 
                left: `${leftPos}%`,
                opacity: Math.random() * 0.2 + 0.05,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{ 
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                rotate: [0, Math.random() * 360, 0]
              }}
              transition={{ 
                duration: Math.random() * 10 + 10, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: Math.random() * 5
              }}
              className="absolute text-[#DC143C]"
            >
              <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </motion.div>
          );
        })}
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* --- Main Card Box --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="group relative bg-gradient-to-br from-[#E11845] to-[#B80B35] rounded-2xl md:rounded-3xl p-5 md:p-8 border border-[#DC143C]/50 shadow-xl overflow-hidden"
        >
          {/* Decorative Top-Right Bubble Effect */}
          <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-black/10 rounded-full -translate-y-1/2 translate-x-1/4 group-hover:scale-110 transition-transform duration-700 pointer-events-none"></div>
          
          {/* Decorative Bottom-Left Subtle Bubble */}
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2 group-hover:scale-125 transition-transform duration-700 pointer-events-none"></div>

          {/* Header Content */}
          <div className="text-center mb-6 relative z-10">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-3xl font-extrabold text-white mb-2 tracking-tight"
            >
              Be a Part of Our <span className="text-white/80">Success</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs md:text-sm text-white/90 max-w-sm mx-auto font-medium"
            >
              Showcase your brand and connect with a wider, highly engaged audience on Africa's biggest love reality show.
            </motion.p>
          </div>

          {/* Stats Row (Compact) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-0 mb-6 relative z-10">
            
            <div className="flex flex-col items-center justify-center text-center md:border-r border-white/20 px-1 py-1">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white mb-1.5" strokeWidth={2} />
              <h3 className="text-[10px] md:text-xs font-bold text-white leading-tight">Massive Brand<br/>Exposure</h3>
            </div>

            <div className="flex flex-col items-center justify-center text-center md:border-r border-white/20 px-1 py-1">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-white mb-1.5" strokeWidth={2} />
              <h3 className="text-[10px] md:text-xs font-bold text-white leading-tight">Engage a<br/>Diverse Audience</h3>
            </div>

            <div className="flex flex-col items-center justify-center text-center md:border-r border-white/20 px-1 py-1">
              <Gem className="w-5 h-5 md:w-6 md:h-6 text-white mb-1.5" strokeWidth={2} />
              <h3 className="text-[10px] md:text-xs font-bold text-white leading-tight">Showcase Your<br/>Excellence</h3>
            </div>

            <div className="flex flex-col items-center justify-center text-center px-1 py-1">
              <Handshake className="w-5 h-5 md:w-6 md:h-6 text-white mb-1.5" strokeWidth={2} />
              <h3 className="text-[10px] md:text-xs font-bold text-white leading-tight">Be Part of a<br/>Winning Legacy</h3>
            </div>

          </div>

          {/* CTA Button */}
          <div className="flex justify-center relative z-10">
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group/btn px-5 md:px-6 py-2 md:py-2.5 bg-white text-[#C1143B] rounded-full font-extrabold text-xs md:text-sm shadow-md hover:shadow-lg transition-all"
              >
                <span className="flex items-center gap-1.5">
                  Become a Sponsor
                  <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover/btn:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </Link>
          </div>

        </motion.div>
      </div>
    </section>
  );
}