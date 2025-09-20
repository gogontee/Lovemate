import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import StatsSection from "../components/StatsSection";
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


export default function Home() {
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: candidatesData } = await supabase.from("candidates").select("*");
      const { data: newsData } = await supabase
        .from("news")
        .select("*")
        .order("date", { ascending: false });

      setCandidates(candidatesData || []);
      setNews(newsData || []);
    };

    fetchData();
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
      title: "Search for the",
      highlight: "Universal Love Idol",
      subtitle: "Has Begun.",
    },
    {
      image: "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero6.jpg",
      title: "Love Meets Fame",
      highlight: "One Stage, 24 Hearts",
      subtitle: "Only One Crown.",
    },
    {
      image: "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero7.jpg",
      title: "Time to Rock the Screen",
      highlight: "The Journey Begins",
      subtitle: "Right Here.",
    },
    {
      image: "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero8.jpg",
      title: "If Your Oxygen is Love?",
      highlight: "Then You Deserve A Spot",
      subtitle: "Right Here.",
    },
    {
      image: "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero9.jpg",
      title: "Hottest Matchmaking Showdown",
      highlight: "Is Coming To Your Screen",
      subtitle: "Right Here.",
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

  const topCandidates = [...candidates]
    .sort((a, b) => b.total_votes - a.total_votes)
    .slice(0, 4);

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

      {/* Hero */}
<section className="relative">
  <Slider {...sliderSettings}>
    {heroSlides.map((slide, index) => (
      <div key={index}>
        <div
          className="relative bg-cover bg-center h-[240px] sm:h-[400px]"
          style={{ backgroundImage: `url('${slide.image}')` }}
        >
          <div className="absolute inset-0 bg-rose/40"></div>
          <div className="relative z-10 max-w-7xl mx-auto h-full grid grid-cols-1 md:grid-cols-2 items-end px-3 sm:px-6 pb-4 sm:pb-0">
            <div
              className="
                text-left space-y-2 sm:space-y-6
                max-w-xs sm:max-w-md md:max-w-none
              "
            >
              <h1
                className="
                  text-lg sm:text-4xl md:text-5xl
                  font-extrabold leading-snug sm:leading-tight text-white
                  md:whitespace-nowrap
                "
              >
                <span className="block">{slide.title}</span>
                <span className="block text-rose-200">{slide.highlight}</span>
                <span className="block text-white">{slide.subtitle}</span>
              </h1>
              <p className="text-xs sm:text-lg text-white bg-primary/40 rounded px-2 py-1 sm:px-3 sm:py-2">
                24 LoveMates. 360 hours. 1 Winner. Watch love unfold under
                the spotlight in this thrilling reality show.
              </p>
              <a
                href="/register"
                className="inline-block bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 font-semibold px-3 py-1 text-xs sm:px-8 sm:py-3 sm:text-base rounded-full shadow-lg transition"
              >
                Register Now
              </a>
            </div>
          </div>
        </div>
      </div>
    ))}
  </Slider>
</section>



      <StatsSection />

      <TopCandidates />


      <VideoCarousel videos={[
        { url: "https://www.youtube.com/embed/MWzBjSfsLsE?loop=1&playlist=MWzBjSfsLsE" },
        { url: "https://www.youtube.com/embed/C-dWkLFEEw0?loop=1&playlist=C-dWkLFEEw0" },
        { url: "https://www.youtube.com/embed/JfDes65L3Zg?loop=1&playlist=JfDes65L3Zg" },
      ]} />

      <SponsorCarousel sponsors={sponsors} />
      <TopFansCarousel fans={topFans} />

      {/* Latest News */}
      <section className="bg-rose-50 py-20 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
          Latest News
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {news.slice(0, 3).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
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
        <div className="text-center mt-12">
          <a
            href="/news"
            className="inline-block bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-full font-semibold shadow-md transition-all"
          >
            View All News
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
