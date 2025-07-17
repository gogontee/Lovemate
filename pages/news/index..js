"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SponsorCarousel from "../../components/SponsorCarousel";
import NewsCard from "../../components/NewsCard";
import VideoCarousel from "../../components/VideoCarousel";

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

export default function NewsPage() {
  const [newsItems, setNewsItems] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching news:", error.message);
      } else {
        setNewsItems(data);
      }
    };

    fetchNews();
  }, []);

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section
        className="relative h-[300px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero5.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-white/80 to-pink-50" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="max-w-xl">
            <h1 className="text-4xl font-extrabold text-rose-600 leading-tight mb-2">
              Stay Updated with the Latest From Lovemate
            </h1>
            <p className="text-gray-700 text-lg">
              All the drama, passion, and moments you don’t want to miss.
            </p>
          </div>
          <div className="hidden md:block w-64 h-64 relative">
            <img
              src="/news/herorr.png"
              alt="News Hero"
              className="object-contain w-full h-full"
            />
          </div>
        </div>

        <div className="overflow-hidden bg-black text-white py-2">
          <div className="whitespace-nowrap animate-marquee text-sm font-medium">
            🗞️ Alex just crossed 3,000 votes! | Mira trending in Kenya 🇰🇪 | Voting ends soon – Cast your vote now! | Stream today’s drama Alex just crossed 3,000 votes! | Mira trending in Kenya 🇰🇪 | Voting ends soon – Cast your vote now! | Stream today’s drama🎥
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="bg-rose-50 py-20 px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
          Latest News
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {newsItems.map((item) => (
  <NewsCard
    key={item.id}
    image={item.image_url}  // ✅ use image_url from Supabase
    title={item.title}
    summary={item.summary}
    views={item.views}
    link={`/news/${item.id}`}
  />
))}

        </div>
      </section>

      {/* Video Carousel */}
      <VideoCarousel videos={videos} />

      {/* Sponsors */}
      <section className="bg-gray-50 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <SponsorCarousel
            sponsors={[
              "/sponsors/logo1.png",
              "/sponsors/logo2.png",
              "/sponsors/logo3.png",
            ]}
          />
        </div>
      </section>

      <Footer />
    </>
  );
}
