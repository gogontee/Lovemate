// pages/about.js
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Heart, Clock, Home, Award, Sparkles, Users, Target, Eye, Zap, Gift, Star, Globe } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function About() {
  return (
    <>
      <Head>
        <title>About – Lovemate Show</title>
        <meta
          name="description"
          content="Discover everything about Lovemate – the mission, vision, and how you can be part of the ultimate love showdown."
        />
      </Head>

      <Header />

      {/* Hero Section - 10:5 mobile, 1000x300 desktop */}
      <section
        className="relative w-full aspect-[10/5] md:w-full md:h-[300px] text-white"
        style={{ backgroundImage: "url('https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero6.jpg')" }}
      >
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

        <div className="relative z-10 max-w-7xl mx-auto h-full flex items-center px-4 md:px-6">
          <div className="w-full md:w-1/2">
            <h1 className="text-xl md:text-4xl font-extrabold mb-3 md:mb-6 leading-tight text-white drop-shadow w-3/4 md:w-full">
              About Lovemate Show
            </h1>
            <div className="grid grid-cols-2 gap-1 md:gap-4">
              <div className="bg-white/20 backdrop-blur text-white p-1.5 md:p-4 rounded-lg shadow-md">
                <Heart className="mx-auto mb-0.5 md:mb-2" size={12} />
                <p className="text-xs md:text-lg font-bold text-center">24 Mates</p>
              </div>
              <div className="bg-white/20 backdrop-blur text-white p-1.5 md:p-4 rounded-lg shadow-md">
                <Clock className="mx-auto mb-0.5 md:mb-2" size={12} />
                <p className="text-xs md:text-lg font-bold text-center">360 Hrs</p>
                <p className="text-[8px] md:text-sm text-center">of Intrigues</p>
              </div>
              <div className="bg-white/20 backdrop-blur text-white p-1.5 md:p-4 rounded-lg shadow-md">
                <Home className="mx-auto mb-0.5 md:mb-2" size={12} />
                <p className="text-xs md:text-lg font-bold text-center">1 Mansion</p>
              </div>
              <div className="bg-white/20 backdrop-blur text-white p-1.5 md:p-4 rounded-lg shadow-md">
                <Award className="mx-auto mb-0.5 md:mb-2" size={12} />
                <p className="text-xs md:text-lg font-bold text-center">1 Winner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar - Quick Facts - All in one line on mobile */}
      <section className="bg-gradient-to-r from-rose-600 to-red-700 py-2 md:py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-nowrap justify-between items-center gap-1 md:gap-4 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1 md:gap-2 text-white flex-shrink-0">
              <Users className="w-3 h-3 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-sm font-medium whitespace-nowrap">24 Strangers</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2 text-white flex-shrink-0">
              <Home className="w-3 h-3 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-sm font-medium whitespace-nowrap">1 Mansion</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2 text-white flex-shrink-0">
              <Target className="w-3 h-3 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-sm font-medium whitespace-nowrap">Diverse Mission</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2 text-white flex-shrink-0">
              <Clock className="w-3 h-3 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-sm font-medium whitespace-nowrap">360 Hours</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2 text-white flex-shrink-0">
              <Gift className="w-3 h-3 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-sm font-medium whitespace-nowrap">$10K Prizes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section with bottom padding for mobile */}
      <section className="bg-gradient-to-b from-white via-rose-50 to-white py-12 md:py-20 px-4 pb-20 md:pb-20">
        <div className="max-w-7xl mx-auto">
          {/* About Lovemate - Featured - Reduced text size on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-rose-100 px-3 md:px-4 py-1 md:py-2 rounded-full mb-3 md:mb-4">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
              <span className="text-[10px] md:text-sm font-semibold text-red-600">The Experience</span>
            </div>
            <h2 className="text-xl md:text-5xl font-bold mb-3 md:mb-6">
              <span className="text-gray-900">More Than Just a</span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">Reality Show</span>
            </h2>
            <p className="text-xs md:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed md:leading-relaxed px-2 md:px-0">
              Lovemate is not just a show—it's an emotional battleground where passion, fame, and true connection collide. 
              For 15 unforgettable days, 24 hearts chase love under the unrelenting spotlight. Each moment is raw, 
              each decision crucial. This is where soulmates are unveiled and destinies are rewritten—welcome to Lovemate.
            </p>
          </motion.div>

          {/* Mission, Vision, Objective Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-12 md:mb-16">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all border border-rose-100 hover:border-rose-300"
            >
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-rose-100 to-rose-200 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-5 h-5 md:w-7 md:h-7 text-red-600" />
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">Our Mission</h3>
              <p className="text-xs md:text-base text-gray-600 leading-relaxed">
                To redefine reality entertainment by creating a platform where singles find true love while showcasing their values and charisma.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all border border-rose-100 hover:border-rose-300"
            >
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-rose-100 to-rose-200 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                <Eye className="w-5 h-5 md:w-7 md:h-7 text-red-600" />
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">Our Vision</h3>
              <p className="text-xs md:text-base text-gray-600 leading-relaxed">
                To become Africa's biggest love and lifestyle reality show, setting the standard for cultural sophistication and romantic discovery.
              </p>
            </motion.div>

            {/* Objective */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all border border-rose-100 hover:border-rose-300"
            >
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-rose-100 to-rose-200 rounded-lg md:rounded-xl flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                <Star className="w-5 h-5 md:w-7 md:h-7 text-red-600" />
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">Our Objective</h3>
              <p className="text-xs md:text-base text-gray-600 leading-relaxed">
                To discover the Universal Love Idol through thrilling challenges and heartwarming stories of connection.
              </p>
            </motion.div>
          </div>

          {/* Why Love Lovemate - Feature Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-rose-50 via-white to-rose-50 rounded-2xl md:rounded-3xl p-4 md:p-12 mb-12 md:mb-16 border border-rose-200"
          >
            <div className="text-center mb-6 md:mb-10">
              <h2 className="text-xl md:text-4xl font-bold mb-2 md:mb-4">
                <span className="text-gray-900">Why</span>{" "}
                <span className="text-red-600">Love Lovemate?</span>
              </h2>
              <div className="w-12 md:w-20 h-1 bg-gradient-to-r from-rose-400 to-red-600 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6">
              {[
                { icon: "🏰", title: "Luxury Living", desc: "Experience life in a magnificent villa" },
                { icon: "🎮", title: "Interactive Drama", desc: "Real-time voting and decisions" },
                { icon: "❤️", title: "Real Connections", desc: "Genuine relationships formed" },
                { icon: "🎯", title: "Thrilling Challenges", desc: "Heart-pounding tasks" },
                { icon: "🌟", title: "Star Moments", desc: "Unforgettable scenes" },
                { icon: "💎", title: "Life-Changing Prize", desc: "$10K grand prize" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg md:rounded-xl p-2 md:p-6 shadow-md hover:shadow-lg transition-all border border-rose-100 hover:border-rose-300"
                >
                  <div className="text-xl md:text-3xl mb-1 md:mb-3">{feature.icon}</div>
                  <h3 className="text-xs md:text-lg font-bold text-gray-900 mb-0.5 md:mb-2">{feature.title}</h3>
                  <p className="text-[8px] md:text-sm text-gray-600">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
            {/* Be a Participant */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 p-4 md:p-8 text-white shadow-xl"
            >
              <div className="absolute top-0 right-0 w-20 md:w-32 h-20 md:h-32 bg-white/10 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              <Heart className="w-6 h-6 md:w-12 md:h-12 mb-2 md:mb-4 text-white/90" />
              <h3 className="text-base md:text-2xl font-bold mb-1 md:mb-3">Be a Participant</h3>
              <p className="text-xs md:text-base text-white/90 mb-3 md:mb-6">
                Think you have what it takes to find love on the big stage? Join the show and let your journey begin.
              </p>
              <Link href="/register">
                <button className="bg-white text-red-600 px-4 md:px-6 py-1.5 md:py-3 rounded-full text-xs md:text-base font-semibold hover:bg-rose-50 transition-all w-full md:w-auto hover:scale-105 transform">
                  Register Now
                </button>
              </Link>
            </motion.div>

            {/* Find True Love */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 p-4 md:p-8 text-white shadow-xl"
            >
              <div className="absolute top-0 right-0 w-20 md:w-32 h-20 md:h-32 bg-white/10 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              <Users className="w-6 h-6 md:w-12 md:h-12 mb-2 md:mb-4 text-white/90" />
              <h3 className="text-base md:text-2xl font-bold mb-1 md:mb-3">Find True Love Near You</h3>
              <p className="text-xs md:text-base text-white/90 mb-3 md:mb-6">
                Whether you're miles away or just around the corner, love is waiting.
              </p>
              <button
                onClick={() => alert("💘 Coming Soon: Find Love Near You!")}
                className="bg-white text-rose-600 px-4 md:px-6 py-1.5 md:py-3 rounded-full text-xs md:text-base font-semibold hover:bg-rose-50 transition-all w-full md:w-auto hover:scale-105 transform"
              >
                Find Love
              </button>
            </motion.div>

            {/* Become a Sponsor */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 p-4 md:p-8 text-white shadow-xl"
            >
              <div className="absolute top-0 right-0 w-20 md:w-32 h-20 md:h-32 bg-white/10 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              <Award className="w-6 h-6 md:w-12 md:h-12 mb-2 md:mb-4 text-white/90" />
              <h3 className="text-base md:text-2xl font-bold mb-1 md:mb-3">Become a Sponsor</h3>
              <p className="text-xs md:text-base text-white/90 mb-3 md:mb-6">
                Partner with Lovemate and enjoy massive brand exposure across Africa.
              </p>
              <Link href="/contact">
                <button className="bg-white text-red-700 px-4 md:px-6 py-1.5 md:py-3 rounded-full text-xs md:text-base font-semibold hover:bg-rose-50 transition-all w-full md:w-auto hover:scale-105 transform">
                  Sponsor Us
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Bottom Quote */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mt-10 md:mt-16"
          >
            <p className="text-xs md:text-xl text-gray-600 italic">
              "Where love meets destiny, and every heartbeat tells a story."
            </p>
            <div className="flex justify-center gap-1 mt-2 md:mt-4">
              {[1,2,3].map((i) => (
                <Heart key={i} className="w-2 h-2 md:w-4 md:h-4 text-rose-300 fill-rose-300" />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Hidden on mobile, visible on desktop */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}