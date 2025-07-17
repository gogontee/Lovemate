// pages/news/[id].js
"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";

export default function NewsDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (id) {
      fetchArticle(id);
    }
  }, [id]);

  const fetchArticle = async (id) => {
    // Fetch the main article
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setArticle(data);

      // Increment views count
      await supabase
        .from("news")
        .update({ views: data.views + 1 })
        .eq("id", id);

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

  if (!article) return <div className="text-center py-20">Loading...</div>;

  return (
    <>
      <Header />

      {/* Main Article with fade-in animation */}
      <motion.section
        className="py-16 px-4 bg-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-3xl mx-auto">
          <Image
            src={article.image}
            alt={article.title}
            width={800}
            height={400}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            {article.title}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {article.date} • 👁️ {article.views.toLocaleString()} views
          </p>
          <div className="text-gray-700 leading-relaxed text-base whitespace-pre-line mb-10">
            {article.content}
          </div>

          <Link href="/news">
            <motion.span
              className="inline-block bg-rose-600 text-white px-5 py-2 rounded hover:bg-rose-700 transition text-sm"
              whileHover={{ scale: 1.05 }}
            >
              ← Back to News
            </motion.span>
          </Link>
        </div>
      </motion.section>

      {/* Suggested News */}
      <motion.section
        className="bg-rose-50 py-12 px-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            You Might Also Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {suggestions.map((item) => (
              <motion.div
                key={item.id}
                className="bg-white rounded-xl shadow hover:shadow-md overflow-hidden"
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
                whileHover={{ scale: 1.03 }}
              >
                <Link href={`/news/${item.id}`}>
                  <div className="relative w-full h-40">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-800 text-base mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.summary}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <Footer />
    </>
  );
}
