import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import VideoCarousel from "../components/VideoCarousel";
import SponsorCarousel from "../components/SponsorCarousel";
// import TopFansCarousel from "../components/TopFansCarousel"; // Commented out
import NewsCard from "@/components/NewsCard";
import { motion } from "framer-motion";
import Slider from "react-slick";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import TopCandidates from "@/components/TopCandidates";
import FeaturedPost from "@/components/FeaturedPost";
import Description from "@/components/Description"; // <-- Imported Description
import Image from "next/image";
import { Heart, Tv, Users, Trophy } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [news, setNews] = useState([]);
  // const [topFans, setTopFans] = useState([]); // Commented out
  // const [loadingFans, setLoadingFans] = useState(true); // Commented out
  
  const [isMounted, setIsMounted] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [registrationStatus, setRegistrationStatus] = useState('not_started');
  const [hasVisibleVotableCandidates, setHasVisibleVotableCandidates] = useState(false);

  /* 
  // Commented out entire fetchTopFans function
  const fetchTopFans = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profile')
        .select('id, full_name, photo_url, points')
        .order('points', { ascending: false })
        .limit(4);

      if (error) {
        console.error("Error fetching top fans:", error);
        setTopFans([]);
        setLoadingFans(false);
        return;
      }

      if (!profiles || profiles.length === 0) {
        setTopFans([]);
        setLoadingFans(false);
        return;
      }

      const fansWithVotes = await Promise.all(
        profiles.map(async (fan) => {
          const { data: voteData, error: voteError } = await supabase
            .from('vote_transactions')
            .select('votes')
            .eq('user_id', fan.id);

          if (voteError) {
            console.error("Error fetching votes for fan:", voteError);
            return { ...fan, totalVotes: 0 };
          }

          const totalVotes = voteData?.reduce((sum, item) => sum + (item.votes || 0), 0) || 0;
          
          return { 
            ...fan, 
            totalVotes,
            points: fan.points || 0
          };
        })
      );

      const qualifiedFans = fansWithVotes.filter(fan => fan.points >= 1);
      setTopFans(qualifiedFans);
      setLoadingFans(false);
    } catch (err) {
      console.error("Error in fetchTopFans:", err);
      setTopFans([]);
      setLoadingFans(false);
    }
  };
  */

  useEffect(() => {
    setIsMounted(true);

    const fetchData = async () => {
      const { data: candidatesData } = await supabase.from("candidates").select("*");
      const { data: newsData } = await supabase
        .from("news")
        .select("*")
        .order("date", { ascending: false });

      setCandidates(candidatesData || []);
      setNews(newsData || []);
      
      const hasVisible = candidatesData?.some(
        candidate => candidate.role === "Yes" && candidate.visibility === true && candidate.votes > 0
      );
      setHasVisibleVotableCandidates(hasVisible);

      // await fetchTopFans(); // Commented out
    };

    fetchData();

    /* 
    // Commented out realtime subscription for top fans
    const channel = supabase
      .channel('top-fans-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profile',
          filter: 'points=gt.0'
        },
        () => {
          fetchTopFans();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    */
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const registrationOpenDate = new Date("2026-08-20T00:00:00").getTime();
    const registrationCloseDate = new Date("2026-10-20T23:59:59").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      
      if (now < registrationOpenDate) {
        setRegistrationStatus('not_started');
        const distance = registrationOpenDate - now;
        if (distance < 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        } else {
          setTimeLeft({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
          });
        }
      } 
      else if (now >= registrationOpenDate && now < registrationCloseDate) {
        setRegistrationStatus('open');
        const distance = registrationCloseDate - now;
        if (distance < 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        } else {
          setTimeLeft({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
          });
        }
      }
      else {
        setRegistrationStatus('closed');
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isMounted]);

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
      image: "/hero/hero5.jpg", 
      title: "Love or Betrayal", 
      highlight: "Your Game, Your Fate." 
    },
    { 
      image: "/hero/hero10.jpg", 
      title: "Take a Spot", 
      highlight: "Experience the butterfly effect" 
    },
    { 
      image: "/hero/hero7.jpg", 
      title: "Lets Go Hunting", 
      highlight: "Who is in the garden?" 
    },
    { 
      image: "/hero/hero8.jpg", 
      title: "Love in spotlight", 
      highlight: "The Ultimate Test" 
    }, 
    { 
      image: "/hero/hero9.jpg", 
      title: "Guard Your Heart", 
      highlight: "Betrayal is part of the Game" 
    },
    { 
      image: "/hero/hero6.jpg", 
      title: "LoveMate Show!", 
      highlight: "coming soon" 
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

  const featuredImages = [
    "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero6.jpg",
    "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero7.jpg",
    "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero8.jpg",
    "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero9.jpg",
    "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero10.jpg",
  ];

  const getTimerLabel = () => {
    if (registrationStatus === 'not_started') return "Registration Starts In";
    if (registrationStatus === 'open') return "Registration Closes In";
    return "Registration Closed";
  };

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

      <main className="bg-[#0a0a0f] min-h-screen pb-20 md:pb-0 overflow-hidden">
        {/* Hero Section */}
        <section className="relative w-full mb-10 sm:mb-12">
          <Slider {...sliderSettings}>
            {heroSlides.map((slide, index) => (
              <div key={index}>
                {/* Aspect ratio: 14:9 on mobile, fixed heights on desktop */}
                <div className="relative w-full aspect-[14/9] sm:aspect-auto sm:h-[55vh] sm:min-h-[400px] sm:max-h-[600px] overflow-hidden">
                  
                  {/* Background Image */}
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    className="object-cover object-center"
                    priority={index === 0}
                    unoptimized={true}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-90" />
                  
                  {/* Hero Content Container - Pushed down tight to the stats */}
                  <div className="absolute inset-0 flex flex-col justify-end items-start pb-[60px] sm:pb-[80px]">
                    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
                      <div className="flex flex-col items-start w-full">
                        
                        {/* Dynamic Titles */}
                        <motion.div
                          key={index} 
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1, duration: 0.6 }}
                          className="max-w-xl text-left"
                        >
                          <h1 className="text-2xl sm:text-5xl md:text-6xl font-bold text-white mb-1 sm:mb-2 leading-tight">
                            {slide.title}
                          </h1>
                          <p className="text-sm sm:text-xl md:text-2xl text-red-600 font-semibold italic mb-3 sm:mb-5">
                            {slide.highlight}
                          </p>
                        </motion.div>
                        
                        {/* Call to Action Buttons */}
                        <motion.div
                          key={`btn-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.6 }}
                          className="flex flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto"
                        >
                          <button
                            onClick={() => router.push("/register")}
                            className="flex-1 sm:flex-none flex items-center justify-center bg-red-600 text-white px-4 py-1.5 sm:px-6 sm:py-2.5 rounded-full font-bold text-[11px] sm:text-sm hover:bg-green-600 transition-all shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-0.5"
                          >
                            REGISTER HERE
                          </button>
                          <button
                            onClick={() => router.push("/about")}
                            className="flex-1 sm:flex-none flex items-center justify-center bg-transparent border border-white/40 text-white px-4 py-1.5 sm:px-6 sm:py-2.5 rounded-full font-semibold text-[11px] sm:text-sm hover:bg-white/10 hover:border-white transition-all backdrop-blur-sm"
                          >
                            Learn More
                          </button>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>

          {/* Floating Stats Bar - Intersecting the bottom edge */}
          <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-1/2">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-[#0f0f13]/95 backdrop-blur-xl border border-rose-500/30 rounded-xl sm:rounded-2xl px-2 pt-2 sm:px-4 sm:pt-4 pb-0 shadow-2xl"
              >
                <div className="flex items-center justify-between sm:justify-around overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full gap-4 sm:gap-8 px-1 pb-0">
                  <div className="flex flex-col items-center justify-center text-center space-y-0.5 sm:space-y-1 min-w-[80px] snap-center shrink-0 pb-1 sm:pb-0">
                    <Heart className="text-[#DC143C] w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                    <div className="text-[10px] sm:text-xs font-semibold text-white whitespace-nowrap">Real People</div>
                    <div className="text-[8px] sm:text-[10px] text-gray-400 whitespace-nowrap">Real Emotions</div>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center space-y-0.5 sm:space-y-1 min-w-[80px] snap-center shrink-0 border-l border-white/10 pl-3 sm:pl-0 sm:border-0 pb-1 sm:pb-0">
                    <Tv className="text-[#DC143C] w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                    <div className="text-[10px] sm:text-xs font-semibold text-white whitespace-nowrap">Unfiltered Drama</div>
                    <div className="text-[8px] sm:text-[10px] text-gray-400 whitespace-nowrap">24/7</div>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center space-y-0.5 sm:space-y-1 min-w-[80px] snap-center shrink-0 border-l border-white/10 pl-3 sm:pl-0 sm:border-0 pb-1 sm:pb-0">
                    <Users className="text-[#DC143C] w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                    <div className="text-[10px] sm:text-xs font-semibold text-white whitespace-nowrap">Love, Alliance</div>
                    <div className="text-[8px] sm:text-[10px] text-gray-400 whitespace-nowrap">and Betrayal</div>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center space-y-0.5 sm:space-y-1 min-w-[80px] snap-center shrink-0 border-l border-white/10 pl-3 sm:pl-0 sm:border-0 pb-1 sm:pb-0">
                    <Trophy className="text-[#DC143C] w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                    <div className="text-[10px] sm:text-xs font-semibold text-white whitespace-nowrap">One Winner</div>
                    <div className="text-[8px] sm:text-[10px] text-gray-400 whitespace-nowrap">A Lifetime Story</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

        </section>

        <FeaturedPost images={featuredImages} />

        {/* Description Component - Placed Immediately After FeaturedPost */}
        <Description />

        {hasVisibleVotableCandidates && (
          <>
            <TopCandidates />
            <div className="block sm:hidden h-16"></div>
          </>
        )}

        <VideoCarousel videos={[
          { url: "https://www.youtube.com/embed/MWzBjSfsLsE?loop=1&playlist=MWzBjSfsLsE" },
          { url: "https://www.youtube.com/embed/C-dWkLFEEw0?loop=1&playlist=C-dWkLFEEw0" },
          { url: "https://www.youtube.com/embed/JfDes65L3Zg?loop=1&playlist=JfDes65L3Zg" },
        ]} />

        <SponsorCarousel />

        {/* <TopFansCarousel fans={topFans} /> */}

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
            
            <div className="block sm:hidden h-16"></div>
          </div>
        </section>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}