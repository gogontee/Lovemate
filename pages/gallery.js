"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SponsorCarousel from "../components/SponsorCarousel";
import Image from "next/image";

const photos = [
  "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/maingallery/photo1.jpg",
  "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/maingallery/photo2.jpg",
  "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public.asset/maingallery/photo3.jpg",
  "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/maingallery/photo4.jpg",
  "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/maingallery/photo5.jpg",
  "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/maingallery/photo6.jpg",
];

const videos = [
 {
    url: "https://www.youtube.com/embed/MWzBjSfsLsE?loop=1&playlist=MWzBjSfsLsE",
  },
  {
    url: "https://www.youtube.com/embed/C-dWkLFEEw0?loop=1&playlist=C-dWkLFEEw0",
  },
  {
    url: "https://www.youtube.com/embed/JfDes65L3Zg?loop=1&playlist=JfDes65L3Zg",
  },,
];

const shorts = [
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

const streams = [
  { title: "Live Now", url: "https://www.youtube.com/embed/C-dWkLFEEw0?loop=1&playlist=C-dWkLFEEw0", },
];

export default function Gallery() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("photos");

  useEffect(() => {
    if (router.isReady) {
      const defaultTab = router.query.tab || "photos";
      setActiveTab(defaultTab);
    }
  }, [router.isReady, router.query.tab]);

  const renderContent = () => {
    switch (activeTab) {
      case "photos":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl shadow">
                <Image src={src} alt={`Photo ${i + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        );
      case "videos":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {videos.map((v, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow">
                <iframe
                  src={v.url}
                  title={v.episode}
                  className="w-full h-56 sm:h-64 md:h-72"
                  allowFullScreen
                ></iframe>
                <div className="p-4 text-sm text-gray-700 font-medium">{v.episode}</div>
              </div>
            ))}
          </div>
        );
      case "shorts":
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {shorts.map((short, i) => (
        <div key={i} className="rounded-xl overflow-hidden shadow">
          <iframe
            src={short.url}
            title={short.title}
            className="w-full aspect-[9/16] object-cover"
            allowFullScreen
          ></iframe>
        </div>
      ))}
    </div>
  );

      case "stream":
        return (
          <section id="livestream" className="w-full bg-gray-50 rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-8 items-center shadow-lg">
            {/* Video */}
            <div className="w-full md:w-2/3 aspect-video rounded-lg overflow-hidden shadow">
              <iframe
                src={streams[0].url}
                title={streams[0].title}
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            </div>

            {/* Description */}
            <div className="w-full md:w-1/3 space-y-4">
              <h2 className="text-3xl font-extrabold text-rose-600">📺 Live Now</h2>
              <p className="text-gray-700 text-sm md:text-base">
                Dive into the excitement of <strong>Lovemate Show</strong> as it happens. Watch real-time emotions, plot twists, and contestant highlights unfold before your eyes.
              </p>
              <p className="text-gray-500 text-sm">
                Thousands are tuned in already. Hit play, stay hooked!
              </p>
              <a
               href="/vote"
    className="inline-block px-6 py-2 bg-rose-100 text-rose-600 text-sm font-semibold rounded hover:bg-rose-600 hover:text-white transition"
  >
    👑 See Candidates
              </a>
            </div>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Header />

      <section className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Gallery</h1>
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Sidebar Tabs */}
            <div className="flex md:flex-col gap-2 md:w-48">
              {[
                { key: "photos", label: "📷 Photos" },
                { key: "videos", label: "🎬 Videos" },
                { key: "shorts", label: "⚡ Shorts" },
                { key: "stream", label: "📺 Live Stream" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    router.push(`/gallery?tab=${tab.key}`, undefined, { shallow: true });
                  }}
                  className={`py-2 px-4 rounded-md text-left text-sm font-semibold ${
                    activeTab === tab.key
                      ? "bg-rose-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Main Content */}
            <div className="flex-1">{renderContent()}</div>
          </div>

          <SponsorCarousel sponsors={["/sponsors/logo1.png", "/sponsors/logo2.png", "/sponsors/logo3.png"]} />
        </div>
      </section>

      <Footer />
    </>
  );
}
