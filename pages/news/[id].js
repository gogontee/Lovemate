// pages/news/[id].js
"use client";

import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";
import { Calendar, Eye, ChevronLeft, ChevronRight, Sparkles, Heart, Clock, Award, Youtube } from "lucide-react";

export default function NewsDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [viewIncremented, setViewIncremented] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const timerRef = useRef(null);

  // Fetch article and suggestions
  useEffect(() => {
    if (id) {
      fetchArticle(id);
    }
  }, [id]);

  // Timer to track time spent on page
  useEffect(() => {
    if (article && !viewIncremented) {
      timerRef.current = setInterval(() => {
        setTimeSpent(prev => {
          const newTime = prev + 1;
          
          // After 5 seconds, increment views if not already done
          if (newTime >= 5 && !viewIncremented) {
            incrementViews();
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [article, viewIncremented]);

  const fetchArticle = async (id) => {
    // Fetch the main article
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setArticle(data);

      // Fetch other articles for suggestion
      const { data: allNews } = await supabase
        .from("news")
        .select("*")
        .neq("id", id)
        .order("date", { ascending: false })
        .limit(3);

      if (allNews) setSuggestions(allNews);
    }

    if (error) {
      console.error("Error loading article:", error);
    }
  };

  const incrementViews = async () => {
    if (!article || viewIncremented) return;

    const { error } = await supabase
      .from("news")
      .update({ views: (article.views || 0) + 1 })
      .eq("id", id);

    if (!error) {
      setViewIncremented(true);
      // Update local article state
      setArticle(prev => ({
        ...prev,
        views: (prev.views || 0) + 1
      }));
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Recent";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!article) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-rose-50 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full"
          />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      {/* Main Article Section - Rose-50 Background - NO TOP PADDING */}
      <section className="bg-rose-50 px-4 relative overflow-hidden">
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating Hearts */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%",
                scale: 0
              }}
              animate={{ 
                y: ["0%", "-20%", "0%"],
                rotate: [0, 360],
                scale: [0, 1, 0],
                opacity: [0, 0.1, 0]
              }}
              transition={{
                duration: 15 + i * 2,
                repeat: Infinity,
                delay: i * 3
              }}
              className="absolute text-rose-300"
            >
              <Heart size={40 + i * 10} fill="currentColor" />
            </motion.div>
          ))}
          
          {/* Golden/Reddish Glow Effects */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-yellow-500/20 to-red-600/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-red-600/20 to-rose-600/20 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          {/* Article Card with Golden/Reddish/Silver Edges - NO TOP MARGIN */}
          <motion.div
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden relative"
          >
            {/* Animated Border Glow - Golden/Reddish/Silver */}
            <motion.div
              animate={{ 
                boxShadow: viewIncremented ? [
                  "0 0 20px rgba(234, 179, 8, 0.5), inset 0 0 20px rgba(234, 179, 8, 0.2)",
                  "0 0 30px rgba(220, 38, 38, 0.5), inset 0 0 30px rgba(220, 38, 38, 0.2)",
                  "0 0 20px rgba(192, 192, 192, 0.5), inset 0 0 20px rgba(192, 192, 192, 0.2)",
                  "0 0 20px rgba(234, 179, 8, 0.5), inset 0 0 20px rgba(234, 179, 8, 0.2)",
                ] : "none"
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl pointer-events-none"
            />

            {/* Featured Badge (if applicable) */}
            {article.featured && (
              <div className="absolute top-4 left-4 z-20">
                <div className="bg-gradient-to-r from-yellow-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Award className="w-3 h-3" />
                  Featured Story
                </div>
              </div>
            )}

            {/* Image Gallery Section with Outline */}
            <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden p-1">
              {/* Animated Outline Border */}
              <motion.div
                animate={viewIncremented ? {
                  borderColor: ["#EAB308", "#DC2626", "#C0C0C0", "#EAB308"],
                  boxShadow: [
                    "0 0 0 2px #EAB308 inset",
                    "0 0 0 2px #DC2626 inset",
                    "0 0 0 2px #C0C0C0 inset",
                    "0 0 0 2px #EAB308 inset"
                  ]
                } : {
                  borderColor: "#FECACA",
                  boxShadow: "0 0 0 1px #FECACA inset"
                }}
                transition={{ duration: 3, repeat: viewIncremented ? Infinity : 0 }}
                className="absolute inset-0 border-2 rounded-xl z-10 pointer-events-none"
                style={{ borderStyle: 'solid' }}
              />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full h-full rounded-lg overflow-hidden"
                >
                  <Image
                    src={article.image || article.images?.[currentImageIndex]}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg" />

              {/* YouTube Subscribe Button - Bottom Right */}
              <motion.a
                href="https://www.youtube.com/@Lovemateshow?sub_confirmation=1"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute bottom-4 right-4 z-30 flex items-center gap-1 md:gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-2 py-1 md:px-4 md:py-2 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <Youtube className="w-3 h-3 md:w-5 md:h-5" />
                <span className="text-[8px] md:text-sm font-semibold">Subscribe</span>
              </motion.a>

              {/* Image Navigation Dots (if multiple images) */}
              {article.images?.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                  {article.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-white w-4' 
                          : 'bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Article Content */}
            <div className="p-4 md:p-8">
              {/* Meta Information - Smaller on mobile */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <div className="flex items-center gap-1 bg-rose-100 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
                  <Calendar className="w-2 h-2 md:w-3 md:h-3 text-red-600" />
                  <span className="text-[8px] md:text-xs text-gray-700">{formatDate(article.date)}</span>
                </div>
                <div className="flex items-center gap-1 bg-rose-100 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
                  <Eye className="w-2 h-2 md:w-3 md:h-3 text-red-600" />
                  <span className="text-[8px] md:text-xs text-gray-700">
                    {article.views?.toLocaleString() || 0} views
                  </span>
                </div>
                {article.readTime && (
                  <div className="flex items-center gap-1 bg-rose-100 px-2 md:px-3 py-0.5 md:py-1 rounded-full">
                    <Clock className="w-2 h-2 md:w-3 md:h-3 text-red-600" />
                    <span className="text-[8px] md:text-xs text-gray-700">{article.readTime} min read</span>
                  </div>
                )}
              </div>

              {/* Title - Smaller on mobile */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 md:mb-4"
              >
                {article.title}
              </motion.h1>

              {/* Content - Much smaller on mobile */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="prose prose-xs md:prose-base max-w-none text-gray-700 leading-relaxed"
              >
                {article.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-[10px] md:text-base mb-2 md:mb-4">
                    {paragraph}
                  </p>
                ))}
              </motion.div>

              {/* Tags - Smaller on mobile */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-4 md:mt-6 flex flex-wrap gap-1 md:gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-[6px] md:text-xs bg-rose-50 text-red-600 px-1.5 md:px-3 py-0.5 md:py-1 rounded-full border border-rose-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Share Section - Smaller on mobile */}
              <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t border-rose-200">
                <p className="text-[8px] md:text-sm text-gray-500 mb-2 md:mb-3">Share this article</p>
                <div className="flex gap-1 md:gap-2">
                  {['Twitter', 'Facebook', 'WhatsApp'].map((platform) => (
                    <button
                      key={platform}
                      className="bg-rose-50 hover:bg-rose-100 text-red-600 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[6px] md:text-xs font-medium transition-colors"
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Suggested News Section */}
      <section className="bg-white py-8 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 mb-4 md:mb-8"
          >
            <Sparkles className="w-3 h-3 md:w-5 md:h-5 text-red-600" />
            <h3 className="text-sm md:text-2xl font-bold text-gray-800">
              You Might Also Like
            </h3>
          </motion.div>

          {/* Grid: 2 columns on mobile, 3 columns on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6">
            {suggestions.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Link href={`/news/${item.id}`}>
                  <div className="bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg overflow-hidden border border-rose-100 hover:shadow-xl transition-all duration-300">
                    <div className="relative w-full h-20 sm:h-24 md:h-48 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      
                      {/* View Count Badge - Smaller on mobile */}
                      <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-black/40 backdrop-blur-md rounded-full px-1 md:px-2 py-0.5">
                        <span className="text-[6px] md:text-[10px] text-white flex items-center gap-0.5 md:gap-1">
                          <Eye className="w-1.5 h-1.5 md:w-3 md:h-3" />
                          {item.views?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>

                    <div className="p-1.5 md:p-4">
                      <h4 className="font-bold text-gray-800 text-[8px] md:text-base mb-0.5 md:mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-[6px] md:text-xs text-gray-500 mb-0.5 md:mb-3 line-clamp-2 hidden sm:block">
                        {item.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[5px] md:text-xs text-rose-600 font-medium flex items-center gap-0.5 md:gap-1">
                          Read More
                          <ChevronRight className="w-1 h-1 md:w-3 md:h-3 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <span className="text-[4px] md:text-[10px] text-gray-400">
                          {formatDate(item.date).split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Gradient Bar */}
                    <div className="h-0.5 bg-gradient-to-r from-red-600 to-rose-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}