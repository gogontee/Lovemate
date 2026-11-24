// components/Description.js
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart, UserPlus, Gift } from "lucide-react";

export default function Description() {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const cards = [
    {
      id: 1,
      icon: <Heart className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" />,
      title: "The Arena of Hearts",
      text: "LoveMate is an emotional battleground where passion collides under the spotlight. Think you have what it takes? Join the show and let your magical journey begin. Remember, in this game, betrayal isn't just a risk—it's a strategy.",
    },
    {
      id: 2,
      icon: <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-white" />,
      title: "Enter the Villa",
      text: "Ready to step into the spotlight? Click Sign Up, complete your details, and craft your unique Mate Profile. Your first step toward stardom and love starts here.",
    },
    {
      id: 3,
      icon: <Gift className="w-5 h-5 md:w-6 md:h-6 text-white" />,
      title: "Secure Your Spot",
      text: "To emerge as a housemate, you must prove you are lovable. Share your profile to get at least 2 people to send you a gift. Once you start earning gifts, your profile is officially locked in for the show!",
    },
  ];

  // Handle mobile scroll snap to detect which card is centered
  const handleScroll = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const scrollPosition = container.scrollLeft;
      const itemWidth = container.offsetWidth * 0.85 + 16; // 85vw + gap
      const newIndex = Math.round(scrollPosition / itemWidth);
      setActiveIndex(newIndex);
    }
  };

  const isCardActive = (index) => activeIndex === index;

  return (
    <section className="bg-[#0a0a0f] relative overflow-hidden pt-8 pb-4 md:pt-12 md:pb-6">
      {/* Global Glow Effects for the Section */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#DC143C]/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#DC143C]/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 z-0"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-4xl font-bold text-white"
          >
            The journey <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DC143C] to-rose-400">starts here</span>
          </motion.h2>
        </div>

        {/* Grid Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="
            flex md:grid md:grid-cols-3 gap-4 md:gap-6 
            overflow-x-auto md:overflow-visible scrollbar-hide snap-x snap-mandatory
            pb-8 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0
          "
        >
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={`
                group relative shrink-0 snap-center w-[85vw] sm:w-[320px] md:w-auto
                transition-all duration-500 ease-out
                ${isCardActive(index) ? 'scale-100 opacity-100' : 'scale-[0.92] opacity-60 md:opacity-100 md:scale-100'}
                md:hover:scale-[1.03] md:hover:-translate-y-2
              `}
            >
              {/* Glow behind the card on hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-[#DC143C]/50 via-[#DC143C]/10 to-transparent rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
              
              {/* Card Container - Crimson Red Gradient Background */}
              <div className="relative h-full bg-gradient-to-br from-[#E11845] to-[#990B2A] border border-[#DC143C]/40 group-hover:border-[#DC143C] rounded-2xl p-5 md:p-6 flex flex-col transition-all duration-500 overflow-hidden shadow-xl">
                
                {/* The Top-Right Translucent Bubble Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 bg-black/15 rounded-full -translate-y-1/2 translate-x-1/4 group-hover:scale-125 transition-transform duration-700 pointer-events-none"></div>
                {/* Bottom-Left subtle glow bubble */}
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>

                {/* Icon Container */}
                <div className="relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center mb-4 shadow-inner group-hover:bg-black/30 transition-all duration-500">
                  {card.icon}
                </div>

                {/* Text Content - Compact & Smart */}
                <div className="relative z-10 flex-1 flex flex-col">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs md:text-sm text-white/90 leading-relaxed">
                    {card.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Swipe Indicator (Dots) */}
        <div className="flex md:hidden justify-center gap-2 mt-2">
          {cards.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === idx ? "w-6 bg-[#DC143C]" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}