import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import StatsSection from "../components/StatsSection";
import VideoCarousel from "../components/VideoCarousel";
import SponsorCarousel from "../components/SponsorCarousel";
import TopFansCarousel from "../components/TopFansCarousel";
import CandidateCard from "../components/CandidateCard";
import NewsCard from "../components/NewsCard";
import candidates from "../data/candidates";
import news from "../data/news";
import { motion } from "framer-motion";
import Slider from "react-slick";
import { supabase } from "@/utils/supabaseClient";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const heroSlides = [
  {
    image: "/hero/hero10.jpg",
    title: "Search for the",
    highlight: "Universal Love Idol",
    subtitle: "Has Begun.",
  },
  {
    image: "/hero/hero6.jpg",
    title: "Love Meets Fame",
    highlight: "One Stage, 24 Hearts",
    subtitle: "Only One Crown.",
  },
  {
    image: "/hero/hero7.jpg",
    title: "Will You Watch or Win?",
    highlight: "Your Journey Begins",
    subtitle: "Right Here.",
  },
  {
    image: "/hero/hero8.jpg",
    title: "Do You Breath Love?",
    highlight: "Your Journey Begins",
    subtitle: "Right Here.",
  },
  {
    image: "/hero/hero9.jpg",
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

export default function Home() {
  const router = useRouter();

  // State to hold candidates if you want to dynamically fetch later
  // For now using static import from ../data/candidates
  const [candidateList, setCandidateList] = useState(candidates);

  // Handle vote or gift - user must be logged in
  const handleVoteOrGift = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to vote or send gifts.");
      router.push("/auth/login");
      return false;
    }
    return true;
  };

  // Handle voting logic with wallet deduction & RPC increment_vote call
  const handleVote = async (candidateId, voteCost = 100) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
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

    await supabase.from("wallets").insert([
      {
        user_id: user.id,
        amount: -voteCost,
        type: "vote",
        status: "completed",
      },
    ]);

    await supabase.rpc("increment_vote", {
      candidate_id_param: candidateId,
      vote_count: 1,
    });

    alert("Vote submitted!");
  };

  // Example videos for VideoCarousel
  const videos = [
    {
      url: "https://www.youtube.com/embed/MWzBjSfsLsE?loop=1&playlist=MWzBjSfsLsE",
    },
    {
      url: "https://www.youtube.com/embed/C-dWkLFEEw0?loop=1&playlist=C-dWkLFEEw0",
    },
    {
      url: "https://www.youtube.com/embed/JfDes65L3Zg?loop=1&playlist=JfDes65L3Zg",
    },
  ];

  // Sponsors logos
  const sponsors = [
    "/sponsors/logo1.png",
    "/sponsors/logo2.png",
    "/sponsors/logo3.png",
  ];

  // Top Fans data
  const topFans = [
    { name: "Amara", votes: 1200 },
    { name: "Jake", votes: 1050 },
    { name: "Lola", votes: 980 },
  ];

  // Select top 4 candidates by votes from candidateList
  const topCandidates = [...candidateList]
    .sort((a, b) => b.votes - a.votes)
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

      {/* Hero Banner */}
      <section className="relative">
        <Slider {...sliderSettings}>
          {heroSlides.map((slide, index) => (
            <div key={index}>
              <div
                className="relative bg-cover bg-center bg-no-repeat h-[400px]"
                style={{ backgroundImage: `url('${slide.image}')` }}
              >
                <div className="absolute inset-0 bg-rose/40"></div>
                <div className="relative z-10 max-w-7xl mx-auto h-full grid grid-cols-1 md:grid-cols-2 items-center px-6">
                  <div className="text-left space-y-6">
                    <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-white">
                      <span className="block">{slide.title}</span>
                      <span className="text-rose-200">{slide.highlight}</span>{" "}
                      <span className="text-white">{slide.subtitle}</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-white max-w-md bg-primary/40 rounded px-3 py-2">
                      24 LoveMates. 360 hours. 1 Winner. Watch love unfold under
                      the spotlight in this thrilling reality show.
                    </p>
                    <a
                      href="/register"
                      className="inline-block bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 font-semibold px-8 py-3 rounded-full shadow-lg transition"
                    >
                      Register Now
                    </a>
                  </div>
                  <div></div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      <StatsSection />

      {/* CTA Section */}
      <section className="bg-rose-50 py-20 px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
          Get Love, Get Fame, Get The Money Bag.
        </h2>
        <p className="text-gray-800 max-w-xl mx-auto mb-8">
          Do you have what it takes to be the next Universal Love Idol? Register
          now and begin your journey to stardom and romance!
        </p>
        <a
          href="/register"
          className="inline-block bg-primary hover:bg-primaryDark text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all"
        >
          Register Now
        </a>
      </section>

      <VideoCarousel videos={videos} />

      <SponsorCarousel sponsors={sponsors} />

      <section className="bg-rose-100 py-20 px-4">
        <h2 className="text-2xl font-bold text-center text-rose-600 mb-6">
          Top Candidates
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {topCandidates.map((c) => (
            <CandidateCard key={c.id} {...c} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/vote"
            className="inline-block bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-3 rounded-full shadow transition"
          >
            Discover More
          </a>
        </div>
      </section>

      <TopFansCarousel fans={topFans} />

      {/* News Section with Animation */}
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
