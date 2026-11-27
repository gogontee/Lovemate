import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import {
  Heart,
  Clock,
  Home,
  Award,
  Sparkles,
  Users,
  Target,
  Eye,
  Star,
  Gift,
  FileText,
  Shield,
  ArrowRight
} from "lucide-react";

export default function About() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "The Experience", icon: <Sparkles className="w-4 h-4" /> },
    { id: "mission", label: "Mission & Vision", icon: <Target className="w-4 h-4" /> },
    { id: "why", label: "Why Lovemate", icon: <Star className="w-4 h-4" /> },
  ];

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

      <main className="bg-[#050505] text-gray-300 min-h-screen pb-20 md:pb-0 selection:bg-red-600 selection:text-white">
        
        {/* ===== MINIMALIST HERO ===== */}
        <section className="relative w-full h-[45vh] md:h-[55vh] flex flex-col items-center justify-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero/hero6.jpg"
              alt="About Lovemate Show"
              fill
              className="object-cover opacity-30"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#050505]" />
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/10 border border-red-600/20 text-red-500 font-medium text-xs tracking-wider uppercase mb-4">
                <Heart className="w-3 h-3" /> The Ultimate Reality Experience
              </div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-4">
                About <span className="text-red-600 italic">Lovemate</span> Show
              </h1>
              <p className="text-sm md:text-base text-gray-400 font-light max-w-2xl mx-auto">
                More Than Just a Reality Show. An emotional battleground where passion, fame, and true connection collide.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ===== FLOATING TABBED INTERFACE ===== */}
        <section className="relative z-20 max-w-5xl mx-auto px-4 -mt-8 md:-mt-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]"
          >
            
            {/* Sidebar / Top Navigation */}
            <div className="w-full md:w-64 bg-[#0a0a0a]/50 border-b md:border-b-0 md:border-r border-white/5 p-4 md:p-6 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible scrollbar-hide shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap md:whitespace-normal text-left shrink-0 ${
                    activeTab === tab.id
                      ? "bg-red-600/10 text-red-500"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeMainTab"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-l-xl"
                    />
                  )}
                  {tab.icon}
                  {tab.label}
                </button>
              ))}

              <div className="hidden md:block mt-auto pt-8">
                <button
                  onClick={() => router.push("/register")}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] flex items-center justify-center gap-2"
                >
                  Register Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 md:p-10 relative">
              <AnimatePresence mode="wait">
                
                {/* 1. THE EXPERIENCE (OVERVIEW) TAB */}
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 text-sm md:text-base leading-relaxed text-gray-400"
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
                      For 15 unforgettable days, <span className="text-red-500">24 hearts</span> chase love under the spotlight.
                    </h2>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                      <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                        <Heart className="w-5 h-5 text-red-500 mb-2" />
                        <span className="text-white font-bold text-sm">24 Mates</span>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                        <Clock className="w-5 h-5 text-red-500 mb-2" />
                        <span className="text-white font-bold text-sm">360 Hrs</span>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                        <Home className="w-5 h-5 text-red-500 mb-2" />
                        <span className="text-white font-bold text-sm">1 Mansion</span>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                        <Award className="w-5 h-5 text-red-500 mb-2" />
                        <span className="text-white font-bold text-sm">$10K Prize</span>
                      </div>
                    </div>
                    
                    <p>
                      Lovemate is not just a show—it's an emotional battleground where passion, fame, and true connection collide. Each moment is raw, each decision crucial. This is where soulmates are unveiled and destinies are rewritten.
                    </p>
                    
                    <p>
                      Under the unrelenting emotional spotlight, strangers become lovers, promises become challenges, and attraction becomes a dangerous game. Every smile may conceal a secret. Every confession may change a relationship.
                    </p>

                    <div className="py-4 my-6 border-y border-white/10">
                      <p className="text-white text-lg md:text-xl font-medium italic">
                        "Where love meets destiny, and every heartbeat tells a story."
                      </p>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link href="/register">
                        <button className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                          Be a Participant
                        </button>
                      </Link>
                      <button
                        onClick={() => alert("💘 Coming Soon: Find Love Near You!")}
                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-lg transition-all"
                      >
                        Find Love Near You
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 2. MISSION & VISION TAB */}
                {activeTab === "mission" && (
                  <motion.div
                    key="mission"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Mission & Vision</h2>
                    <div className="space-y-4">
                      {/* Mission */}
                      <div className="bg-white/5 border border-white/5 p-5 rounded-2xl flex gap-4 items-start hover:bg-white/10 transition-colors">
                        <div className="p-2.5 bg-red-600/20 text-red-500 rounded-lg shrink-0">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold mb-1">Our Mission</h3>
                          <p className="text-sm text-gray-400 leading-relaxed">
                            To redefine reality entertainment by creating a platform where singles find true love while showcasing their values and charisma.
                          </p>
                        </div>
                      </div>

                      {/* Vision */}
                      <div className="bg-white/5 border border-white/5 p-5 rounded-2xl flex gap-4 items-start hover:bg-white/10 transition-colors">
                        <div className="p-2.5 bg-red-600/20 text-red-500 rounded-lg shrink-0">
                          <Eye className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold mb-1">Our Vision</h3>
                          <p className="text-sm text-gray-400 leading-relaxed">
                            To become Africa's biggest love and lifestyle reality show, setting the standard for cultural sophistication and romantic discovery.
                          </p>
                        </div>
                      </div>

                      {/* Objective */}
                      <div className="bg-white/5 border border-white/5 p-5 rounded-2xl flex gap-4 items-start hover:bg-white/10 transition-colors">
                        <div className="p-2.5 bg-red-600/20 text-red-500 rounded-lg shrink-0">
                          <Star className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold mb-1">Our Objective</h3>
                          <p className="text-sm text-gray-400 leading-relaxed">
                            To discover the Universal Love Idol through thrilling challenges and heartwarming stories of connection.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. WHY LOVEMATE TAB */}
                {activeTab === "why" && (
                  <motion.div
                    key="why"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Why Love Lovemate?</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { icon: "🏰", title: "Luxury Living", desc: "Experience life in a magnificent villa" },
                        { icon: "🎮", title: "Interactive Drama", desc: "Real-time voting and decisions" },
                        { icon: "❤️", title: "Real Connections", desc: "Genuine relationships formed" },
                        { icon: "🎯", title: "Thrilling Challenges", desc: "Heart-pounding tasks" },
                        { icon: "🌟", title: "Star Moments", desc: "Unforgettable scenes" },
                        { icon: "💎", title: "Life-Changing Prize", desc: "$10K grand prize" }
                      ].map((feature, index) => (
                        <div key={index} className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-start gap-3 hover:bg-white/10 transition-colors">
                          <div className="text-2xl">{feature.icon}</div>
                          <div>
                            <h3 className="text-white font-semibold text-sm mb-0.5">{feature.title}</h3>
                            <p className="text-xs text-gray-400">{feature.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Terms & Privacy Links */}
                    <div className="mt-10 pt-6 border-t border-white/10">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/terms" className="flex-1">
                          <button className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all">
                            <FileText className="w-4 h-4" /> Terms of Participation
                          </button>
                        </Link>
                        <Link href="/policy" className="flex-1">
                          <button className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/20 px-4 py-3 rounded-xl text-sm font-semibold transition-all">
                            <Shield className="w-4 h-4" /> Privacy Policy
                          </button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </motion.div>
        </section>

      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}