import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import Image from "next/image";
import { useState } from "react";
import { Heart, Shield, Users, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function LearnMore() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("manifesto");

  const tabs = [
    { id: "manifesto", label: "The Manifesto", icon: <Sparkles className="w-4 h-4" /> },
    { id: "inside", label: "Inside the Show", icon: <Heart className="w-4 h-4" /> },
    { id: "how-to", label: "How to Join", icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const insideTabs = [
    {
      title: "The Concept",
      icon: <Heart className="w-5 h-5" />,
      content: "A relationship reality show where singles explore romantic connections, face emotional challenges, navigate temptation, and discover whether their feelings are genuine. Romance is the attraction; human drama keeps the audience watching."
    },
    {
      title: "The Stakes",
      icon: <Shield className="w-5 h-5" />,
      content: "Trust versus temptation. Loyalty versus desire. Love versus strategy. Contestants must decide how much they are willing to risk for a connection — knowing that their choices may change everything and betrayal is part of the strategy."
    },
    {
      title: "The Audience",
      icon: <Users className="w-5 h-5" />,
      content: "Fans become part of the journey through contestant profiles, gifts, votes, and public recognition. Every gift can express affection, every vote can show support, and every contestant has an opportunity to become the audience's favourite."
    }
  ];

  return (
    <>
      <Head>
        <title>About the Show – Lovemate Show</title>
        <meta name="description" content="Where Hearts Collide, and Love Is Put to the Test." />
      </Head>

      <Header />

      <main className="bg-[#050505] text-gray-300 min-h-screen pb-20 md:pb-0 selection:bg-red-600 selection:text-white">
        
        {/* ===== MINIMALIST HERO ===== */}
        <section className="relative w-full h-[45vh] md:h-[55vh] flex flex-col items-center justify-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 z-0">
            <Image
              src="/hero/hero8.jpg" // Replace with your preferred dramatic background
              alt="Lovemate Show"
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
                <Sparkles className="w-3 h-3" /> 18+ Reality Experience
              </div>
              {/* Title text size reduced by half here */}
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-4">
                The <span className="text-red-600 italic">Lovemate</span> Show
              </h1>
              <p className="text-sm md:text-base text-gray-400 font-light max-w-2xl mx-auto">
                Where Hearts Collide, and Love Is Put to the Test.
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
                
                {/* 1. MANIFESTO TAB */}
                {activeTab === "manifesto" && (
                  <motion.div
                    key="manifesto"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 text-sm md:text-base leading-relaxed text-gray-400"
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-6">
                      For <span className="text-red-500">360 hours</span>, <span className="text-red-500">24 hearts</span> will enter a world...
                    </h2>
                    
                    <p>
                      ...where love is desired, trust is tested, and every connection comes at a cost. Under the unrelenting emotional spotlight, strangers become lovers, promises become challenges, and attraction becomes a dangerous game.
                    </p>
                    
                    <p>
                      Every smile may conceal a secret. Every confession may change a relationship. And every decision could bring two hearts closer together — or tear them apart forever.
                    </p>

                    <div className="py-4 my-6 border-y border-white/10">
                      <p className="text-white text-lg md:text-xl font-medium italic">
                        "Here, love is more than a feeling. It is a choice, a risk, and sometimes the greatest battle of all."
                      </p>
                    </div>

                    <p>
                      As alliances form, jealousy rises, and unexpected connections emerge, the housemates must confront the one question that changes everything: <strong className="text-white">Are you here for genuine love, or are you playing to win?</strong>
                    </p>

                    <p>
                      In a world where loyalty can be tested and betrayal can become a strategy, only the boldest hearts will dare to be vulnerable. Soulmates may be discovered, hearts may be broken, and destinies may be rewritten.
                    </p>

                    <p className="text-red-500/90 font-medium">
                      But when the cameras stop rolling, one truth remains: not everyone who captures your heart deserves to keep it.
                    </p>

                    <p className="font-semibold text-white tracking-wide text-xs uppercase mt-8">
                      24 hearts. 360 hours. Countless emotions. One unforgettable journey. Welcome to Lovemate Show.
                    </p>
                  </motion.div>
                )}

                {/* 2. INSIDE THE SHOW TAB */}
                {activeTab === "inside" && (
                  <motion.div
                    key="inside"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-6">Inside the Show</h2>
                    <div className="space-y-4">
                      {insideTabs.map((item, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/5 p-5 rounded-2xl flex gap-4 items-start hover:bg-white/10 transition-colors">
                          <div className="p-2.5 bg-red-600/20 text-red-500 rounded-lg shrink-0">
                            {item.icon}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{item.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 3. HOW TO JOIN TAB */}
                {activeTab === "how-to" && (
                  <motion.div
                    key="how-to"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-6">How to become one of the 24 Mates</h2>
                    <div className="space-y-6">
                      
                      {/* Step 1 */}
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                          <div className="w-px h-full bg-white/10 my-2" />
                        </div>
                        <div className="pb-6">
                          <h3 className="text-white font-semibold mb-1">Register & Create Profile</h3>
                          <p className="text-sm text-gray-400 leading-relaxed">
                            Ready to step into the spotlight? Click Register, complete your details, and craft your unique lovemate Profile page. Your first step toward the ultimate love hunt starts here.
                          </p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold mb-1">Get Supported</h3>
                          <p className="text-sm text-gray-400 leading-relaxed">
                            To emerge as a housemate, you must prove you are lovable. Share your lovemate profile to get at least 2 gifts from lovers. Once you start earning gifts, your profile is officially locked in for the show!
                          </p>
                        </div>
                      </div>

                    </div>

                    <div className="mt-10 p-5 bg-red-600/10 border border-red-600/20 rounded-2xl flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-semibold text-sm">Ready to find love?</h4>
                        <p className="text-xs text-gray-400 mt-1">Applications are open for the next season.</p>
                      </div>
                      <button
                        onClick={() => router.push("/register")}
                        className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-all"
                      >
                        Apply
                      </button>
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