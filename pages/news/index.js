"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SponsorCarousel from "../../components/SponsorCarousel";
import NewsCard from "../../components/NewsCard";
import VideoCarousel from "../../components/VideoCarousel";
import { motion } from "framer-motion";
import { ChevronRight, Sparkles, TrendingUp, Heart } from "lucide-react";

const PAGE_SIZE = 6;

const videos = [
  { url: "https://www.youtube.com/embed/MWzBjSfsLsE?loop=1&playlist=MWzBjSfsLsE" },
  { url: "https://www.youtube.com/embed/C-dWkLFEEw0?loop=1&playlist=C-dWkLFEEw0" },
  { url: "https://www.youtube.com/embed/JfDes65L3Zg?loop=1&playlist=JfDes65L3Zg" },
];

export default function NewsPage() {
  const [newsItems, setNewsItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [heroData, setHeroData] = useState(null);
  const [scrollItems, setScrollItems] = useState([]);

  // Fetch hero images
  useEffect(() => {
    const fetchHeroData = async () => {
      const { data, error } = await supabase
        .from("lovemate")
        .select("news_hero, mobile_news_hero")
        .single();

      if (!error && data) {
        setHeroData(data);
      }
    };
    fetchHeroData();
  }, []);

  // Fetch scroll content
  useEffect(() => {
    const fetchScrollContent = async () => {
      const { data, error } = await supabase
        .from("lovemate")
        .select("scroll")
        .single();

      if (!error && data?.scroll && data.scroll.length > 0) {
        setScrollItems(data.scroll);
      }
    };
    fetchScrollContent();
  }, []);

  const fetchNews = async (pageNum = 1) => {
    setLoading(true);
    const from = (pageNum - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("date", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching news:", error.message);
    } else {
      if (data.length < PAGE_SIZE) setHasMore(false);
      setNewsItems((prev) => [...prev, ...data]);
      setPage(pageNum);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Get the appropriate hero image based on screen size
  const heroImage = typeof window !== 'undefined' && window.innerWidth < 768 
    ? heroData?.mobile_news_hero?.image 
    : heroData?.news_hero?.image;

  const heroTitle = heroData?.news_hero?.title || "Stay Updated with the Latest From Lovemate";
  const heroSubtitle = heroData?.news_hero?.subtitle || "All the drama, passion, and moments you don't want to miss";

  return (
    <>
      <Header />

      {/* Hero Section - Dynamic with specific ratios */}
      <section className="relative overflow-hidden">
        {/* Background Image with Overlay - 10:3 on desktop, 10:4 on mobile */}
        <div className="relative w-full aspect-[10/4] md:aspect-[10/3]">
          {heroImage && (
            <img
              src={heroImage}
              alt="News Hero"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>

        {/* Floating Elements for Design */}
        <div className="absolute top-20 right-10 opacity-10 hidden md:block">
          <Heart className="w-40 h-40 text-rose-300" />
        </div>
        <div className="absolute bottom-10 left-10 opacity-10 hidden md:block">
          <Sparkles className="w-32 h-32 text-rose-300" />
        </div>

        {/* Content - Positioned absolutely over the hero */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl md:max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 bg-rose-500/20 backdrop-blur-sm px-3 md:px-4 py-1 md:py-2 rounded-full mb-3 md:mb-6">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-rose-400" />
              <span className="text-xs md:text-sm text-rose-200 font-medium">Trending News</span>
            </div>
            
            <h1 className="text-lg md:text-5xl font-bold text-white mb-2 md:mb-4 leading-tight md:leading-tight w-3/4 md:w-full">
              {heroTitle}
            </h1>
            
            <p className="text-xs md:text-lg text-gray-300 mb-3 md:mb-6 max-w-xs md:max-w-lg">
              {heroSubtitle}
            </p>

            {/* Stats Pills - Hidden on mobile */}
            <div className="hidden md:flex flex-wrap gap-3">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-white text-sm">{newsItems.length}+ Articles</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-white text-sm">Updated Daily</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scrolling News Ticker - Only if scrollItems exist */}
      {scrollItems.length > 0 && (
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3 overflow-hidden">
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-rose-600 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-pink-600 to-transparent z-10"></div>
            <motion.div
              animate={{ x: [0, -1000] }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="whitespace-nowrap"
            >
              {scrollItems.map((item, index) => (
                <span key={index} className="inline-flex items-center mx-4">
                  <span className="w-1.5 h-1.5 bg-white rounded-full mr-2"></span>
                  {item}
                </span>
              ))}
              {/* Duplicate for seamless loop */}
              {scrollItems.map((item, index) => (
                <span key={`dup-${index}`} className="inline-flex items-center mx-4">
                  <span className="w-1.5 h-1.5 bg-white rounded-full mr-2"></span>
                  {item}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      )}

      {/* News Section */}
      <section className="bg-gradient-to-b from-gray-50 to-rose-50 py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3">
              <span className="text-gray-900">Latest</span>{" "}
              <span className="text-red-600">News</span>
            </h2>
            <div className="w-16 md:w-20 h-1 bg-gradient-to-r from-rose-400 to-rose-600 mx-auto rounded-full"></div>
          </motion.div>

          {/* News Grid - 2 columns on mobile, 3 on desktop */}
          {newsItems.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
                {newsItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
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

              {/* Load More Button */}
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-center mt-8 md:mt-12"
                >
                  <button
                    onClick={() => fetchNews(page + 1)}
                    disabled={loading}
                    className="group relative inline-flex items-center gap-2 bg-white text-rose-600 px-6 md:px-8 py-2 md:py-3 rounded-full font-semibold text-sm md:text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 border border-rose-200 hover:border-rose-300"
                  >
                    <span>{loading ? "Loading..." : "Load More Articles"}</span>
                    {!loading && <ChevronRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </motion.div>
              )}
            </>
          ) : (
            // Loading Skeleton - 2 columns on mobile, 3 on desktop
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-md animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <div className="p-3 md:p-5">
                    <div className="h-4 md:h-6 bg-gray-200 rounded mb-2 md:mb-3"></div>
                    <div className="h-3 md:h-4 bg-gray-200 rounded mb-1 md:mb-2"></div>
                    <div className="h-3 md:h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Video Carousel Section */}
      <section className="bg-white py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-10"
          >
            <span className="text-gray-900">Watch</span>{" "}
            <span className="text-red-600">Highlights</span>
          </motion.h2>
          <VideoCarousel videos={videos} />
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="bg-rose-50 py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-10"
          >
            <span className="text-gray-900">Our</span>{" "}
            <span className="text-red-600">Sponsors</span>
          </motion.h2>
          <SponsorCarousel sponsors={["/sponsors/logo1.png", "/sponsors/logo2.png", "/sponsors/logo3.png"]} />
        </div>
      </section>

      {/* Footer - Hidden on mobile */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Bottom Padding for Mobile - extra space for bottom navigation */}
      <div className="h-20 md:h-0"></div>
    </>
  );
}