import { motion } from "framer-motion";

export default function StatsSection({ candidate, formatNaira }) {
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
  };

  return (
    <section className="py-6 md:py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-2 md:gap-4"
        >
          {/* Votes Card */}
          <motion.div 
            variants={itemVariants}
            className="relative bg-gradient-to-br from-rose-50 to-white rounded-xl md:rounded-2xl p-3 md:p-5 text-center shadow-md hover:shadow-lg transition-all duration-300 border border-rose-100 group"
          >
            <div className="absolute -top-1 -right-1 w-8 h-8 md:w-10 md:h-10 bg-rose-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
            <div className="relative">
              <div className="text-xl md:text-2xl mb-1 md:mb-2 transform group-hover:scale-110 transition-transform duration-300">
                🗳️
              </div>
              <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent">
                {candidate?.votes?.toLocaleString() ?? 0}
              </p>
              <p className="text-[10px] md:text-xs font-medium text-rose-400 uppercase tracking-wider mt-0.5 md:mt-1">
                Votes
              </p>
              <div className="w-8 h-0.5 bg-rose-200 mx-auto mt-1 md:mt-2 rounded-full group-hover:w-12 transition-all duration-300" />
            </div>
          </motion.div>

          {/* Gifts Card */}
          <motion.div 
            variants={itemVariants}
            className="relative bg-gradient-to-br from-rose-100 to-white rounded-xl md:rounded-2xl p-3 md:p-5 text-center shadow-md hover:shadow-lg transition-all duration-300 border border-rose-200 group"
          >
            <div className="absolute -top-1 -right-1 w-8 h-8 md:w-10 md:h-10 bg-rose-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
            <div className="relative">
              <div className="text-xl md:text-2xl mb-1 md:mb-2 transform group-hover:scale-110 transition-transform duration-300">
                🎁
              </div>
              <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-rose-500 to-rose-400 bg-clip-text text-transparent">
                {candidate?.gifts?.toLocaleString() ?? 0}
              </p>
              <p className="text-[10px] md:text-xs font-medium text-rose-500 uppercase tracking-wider mt-0.5 md:mt-1">
                Gifts
              </p>
              <div className="w-8 h-0.5 bg-rose-300 mx-auto mt-1 md:mt-2 rounded-full group-hover:w-12 transition-all duration-300" />
            </div>
          </motion.div>

          {/* Gift Worth Card */}
          <motion.div 
            variants={itemVariants}
            className="relative bg-gradient-to-br from-rose-200 to-white rounded-xl md:rounded-2xl p-3 md:p-5 text-center shadow-md hover:shadow-lg transition-all duration-300 border border-rose-300 group"
          >
            <div className="absolute -top-1 -right-1 w-8 h-8 md:w-10 md:h-10 bg-rose-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
            <div className="relative">
              <div className="text-xl md:text-2xl mb-1 md:mb-2 transform group-hover:scale-110 transition-transform duration-300">
                💰
              </div>
              <p className="text-base md:text-xl font-bold bg-gradient-to-r from-rose-700 to-rose-600 bg-clip-text text-transparent">
                {formatNaira(candidate?.gift_worth)}
              </p>
              <p className="text-[10px] md:text-xs font-medium text-rose-600 uppercase tracking-wider mt-0.5 md:mt-1">
                Gift Worth
              </p>
              <div className="w-8 h-0.5 bg-rose-400 mx-auto mt-1 md:mt-2 rounded-full group-hover:w-12 transition-all duration-300" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}