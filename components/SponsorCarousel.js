// components/SponsorCarousel.js
import Link from "next/link";
import { motion } from "framer-motion";

export default function SponsorCarousel() {
  return (
    <section className="bg-gradient-to-r from-red-700 to-pink-600 py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Partner With Us
          </h2>
          
          <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
            For sponsorship, partnership and other enquiries
          </p>
          
          {/* CTA Button */}
          <Link href="/contact">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group px-8 py-4 bg-white text-red-700 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              <span className="flex items-center gap-2">
                Contact Us
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}