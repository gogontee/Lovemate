import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import VideoCarousel from "../components/VideoCarousel";
import SponsorCarousel from "../components/SponsorCarousel";
import TopFansCarousel from "../components/TopFansCarousel";
import NewsCard from "@/components/NewsCard";
import { motion } from "framer-motion";
import Slider from "react-slick";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import TopCandidates from "@/components/TopCandidates";
import FeaturedPost from "@/components/FeaturedPost";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [news, setNews] = useState([]);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [hasVotableCandidates, setHasVotableCandidates] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: candidatesData } = await supabase.from("candidates").select("*");
      const { data: newsData } = await supabase
        .from("news")
        .select("*")
        .order("date", { ascending: false });

      setCandidates(candidatesData || []);
      setNews(newsData || []);
      
      // Check if there are any candidates with role "Yes" and votes > 0
      const hasVotable = candidatesData?.some(
        candidate => candidate.role === "Yes" && candidate.votes > 0
      );
      setHasVotableCandidates(hasVotable);
    };

    fetchData();
  }, []);

  // Registration countdown timer
  useEffect(() => {
    const targetDate = new Date("2025-08-01T00:00:00").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVote = async (candidateId, voteCost = 100) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to vote or send gifts.");
      router.push("/auth/login");
      return;
    }

    const { data: summary } = await supabase
      .from("wallet_summary")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (!summary || summary.balance < voteCost) {
      alert("Insufficient balance.");
      return;
    }

    await supabase.from("wallets").insert([{
      user_id: user.id,
      amount: -voteCost,
      type: "vote",
      status: "completed",
    }]);

    await supabase.rpc("increment_vote", {
      candidate_id_param: candidateId,
      vote_count: 1,
    });

    alert("Vote submitted!");
  };

  const heroSlides = [
    {
      image: "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero10.jpg",
      title: "Love or Betrayal?",
      highlight: "Your Game, Your Fate",
    },
    {
      image: "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero6.jpg",
      title: "Love under spotlight",
      highlight: "The Ultimate Test",
    },
    {
      image: "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero7.jpg",
      title: "Time to paint the Screen",
      highlight: "Registration Has Beguns",
    },
    {
      image: "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero8.jpg",
      title: "If Your Oxygen is Love?",
      highlight: "Then take a spot",
    },
    {
      image: "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero9.jpg",
      title: "it is hot and spicy",
      highlight: "On Lovemate Show",
      subtitle: "coming to your screen.",
    },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    pauseOnHover: true,
    arrows: false,
  };

  const sponsors = [
    "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/sponsors/logo1.png",
    "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/sponsors/logo2.png",
    "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/sponsors/logo3.png",
  ];

  const topFans = [
    { name: "Amara", votes: 1200 },
    { name: "Jake", votes: 1050 },
    { name: "Lola", votes: 980 },
  ];

  const featuredImages = [
    "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero6.jpg",
    "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero7.jpg",
    "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero8.jpg",
    "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero9.jpg",
    "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero10.jpg",
  ];

  return (
    <>
      <Head>
        <title>Lovemate Show – Search For The Universal Love Idol</title>
        <meta
          name="description"
          content="Lovemate is the matchmaking reality show where love, fame, and drama collide."
        />
      </Head>

      <Header />

      <main className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen pb-20 md:pb-0">
        {/* Hero Section with Timer */}
        <section className="relative">
          <Slider {...sliderSettings}>
            {heroSlides.map((slide, index) => (
              <div key={index}>
                <div className="relative h-[240px] sm:h-[400px] overflow-hidden">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    unoptimized={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                  
                  {/* Hero Content */}
                  <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="h-full flex flex-col justify-center items-start max-w-2xl">
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl sm:text-4xl md:text-5xl font-bold text-white mb-2"
                      >
                        <span className="block">{slide.title}</span>
                        <span className="block text-red-600">{slide.highlight}</span>
                        <span className="block">{slide.subtitle}</span>
                      </motion.h1>
                      
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs sm:text-base text-gray-300 mb-4 max-w-lg bg-black/20 backdrop-blur-sm p-2 sm:p-3 rounded-lg w-1/2 sm:w-full"
                      >
                        24 LoveMates. 360 hours. 1 Winner. Watch love unfold under
                        the spotlight in this thrilling reality show.
                      </motion.p>
                      
                      <motion.a
                        href="/register"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative group"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300" />
                        <span className="relative inline-block bg-gray-900 text-white px-4 sm:px-8 py-2 sm:py-3 rounded-full text-xs sm:text-base font-semibold">
                          Register Now
                        </span>
                      </motion.a>
                    </div>
                  </div>

                  {/* Timer - Bottom Right */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 z-20"
                  >
                    <div className="bg-black/40 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-rose-500/30">
                      <div className="text-[8px] sm:text-xs text-rose-300/80 uppercase tracking-wider mb-1 sm:mb-2 text-center">
                        Registration Closes In
                      </div>
                      <div className="flex gap-1 sm:gap-3">
                        <div className="text-center">
                          <div className="text-xs sm:text-xl font-bold text-red-600">{timeLeft.days}</div>
                          <div className="text-[6px] sm:text-[10px] text-gray-400 uppercase">Days</div>
                        </div>
                        <div className="text-rose-500/50 text-xs sm:text-base">:</div>
                        <div className="text-center">
                          <div className="text-xs sm:text-xl font-bold text-red-600">{timeLeft.hours}</div>
                          <div className="text-[6px] sm:text-[10px] text-gray-400 uppercase">Hrs</div>
                        </div>
                        <div className="text-rose-500/50 text-xs sm:text-base">:</div>
                        <div className="text-center">
                          <div className="text-xs sm:text-xl font-bold text-red-600">{timeLeft.minutes}</div>
                          <div className="text-[6px] sm:text-[10px] text-gray-400 uppercase">Min</div>
                        </div>
                        <div className="text-rose-500/50 text-xs sm:text-base">:</div>
                        <div className="text-center">
                          <div className="text-xs sm:text-xl font-bold text-red-600">{timeLeft.seconds}</div>
                          <div className="text-[6px] sm:text-[10px] text-gray-400 uppercase">Sec</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            ))}
          </Slider>
        </section>

        {/* Stats Section - 24 Strangers, 1 Mansion, Diverse Mission, $10K Prizes */}
        <section className="py-6 sm:py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-4 gap-1 sm:gap-3 bg-black/30 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-rose-500/20"
            >
              {/* 24 Strangers */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                  <span className="text-rose-300 text-xs sm:text-base">👥</span>
                  <span className="text-xs sm:text-base font-bold text-red-600">24</span>
                </div>
                <div className="text-[8px] sm:text-xs text-rose-100/70 uppercase tracking-wider">Strangers</div>
              </div>

              {/* 1 Mansion */}
              <div className="text-center border-l border-rose-500/20">
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                  <span className="text-rose-300 text-xs sm:text-base">🏰</span>
                  <span className="text-xs sm:text-base font-bold text-red-600">1</span>
                </div>
                <div className="text-[8px] sm:text-xs text-rose-100/70 uppercase tracking-wider">Mansion</div>
              </div>

              {/* Diverse Mission */}
              <div className="text-center border-l border-rose-500/20">
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                  <span className="text-rose-300 text-xs sm:text-base">🎯</span>
                  <span className="text-[8px] sm:text-xs font-bold text-red-600">Diverse</span>
                </div>
                <div className="text-[8px] sm:text-xs text-rose-100/70 uppercase tracking-wider">Mission</div>
              </div>

              {/* $10K Prizes */}
              <div className="text-center border-l border-rose-500/20">
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                  <span className="text-rose-300 text-xs sm:text-base">🏆</span>
                  <span className="text-xs sm:text-base font-bold text-red-600">$10K</span>
                </div>
                <div className="text-[8px] sm:text-xs text-rose-100/70 uppercase tracking-wider">Prizes</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Post Carousel - Before Top Candidates */}
        <FeaturedPost images={featuredImages} />

        {/* Top Candidates - Only render if there are votable candidates */}
        {hasVotableCandidates && <TopCandidates />}

        {/* Video Carousel */}
        <VideoCarousel videos={[
          { url: "https://www.youtube.com/embed/MWzBjSfsLsE?loop=1&playlist=MWzBjSfsLsE" },
          { url: "https://www.youtube.com/embed/C-dWkLFEEw0?loop=1&playlist=C-dWkLFEEw0" },
          { url: "https://www.youtube.com/embed/JfDes65L3Zg?loop=1&playlist=JfDes65L3Zg" },
        ]} />

        {/* Sponsors - Direct CTA without dark background */}
        <SponsorCarousel />

        {/* Top Fans - Responsive for mobile */}
        <TopFansCarousel fans={topFans} />

        {/* Latest News */}
        <section className="py-12 sm:py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10"
            >
              <span className="text-rose-50">Latest</span>{" "}
              <span className="text-red-700">News</span>
            </motion.h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
              {news.slice(0, 3).map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.15 }}
                >
                  <NewsCard
                    image={item.image}
                    title={item.title}
                    summary={item.summary}
                    views={item.views}
                    link={`/news/${item.id}`}
                  />
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-8 sm:mt-12"
            >
              <a
                href="/news"
                className="relative group inline-block"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300" />
                <span className="relative inline-block bg-gray-900 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-base font-semibold">
                  View All News
                </span>
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer - Hidden on mobile, visible on desktop */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}