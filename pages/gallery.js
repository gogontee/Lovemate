"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SponsorCarousel from "../components/SponsorCarousel";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";
import { useSwipeable } from "react-swipeable";

const videos = [
  { url: "https://www.youtube.com/embed/MWzBjSfsLsE?loop=1&playlist=MWzBjSfsLsE" },
  { url: "https://www.youtube.com/embed/C-dWkLFEEw0?loop=1&playlist=C-dWkLFEEw0" },
  { url: "https://www.youtube.com/embed/JfDes65L3Zg?loop=1&playlist=JfDes65L3Zg" },
];

const shorts = [
  { url: "https://www.youtube.com/embed/MWzBjSfsLsE?loop=1&playlist=MWzBjSfsLsE" },
  { url: "https://www.youtube.com/embed/C-dWkLFEEw0?loop=1&playlist=C-dWkLFEEw0" },
  { url: "https://www.youtube.com/embed/JfDes65L3Zg?loop=1&playlist=JfDes65L3Zg" },
];

const streams = [
  { title: "Live Now", url: "https://www.youtube.com/embed/C-dWkLFEEw0?loop=1&playlist=C-dWkLFEEw0" },
];

export default function Gallery() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("photos");
  const [photos, setPhotos] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    if (router.isReady) {
      const defaultTab = router.query.tab || "photos";
      setActiveTab(defaultTab);
    }
  }, [router.isReady, router.query.tab]);

  // Fetch + sort photos
  useEffect(() => {
    const fetchPhotos = async () => {
      const { data: files, error } = await supabase.storage
        .from("asset")
        .list("maingallery", { limit: 100 });

      if (error) {
        console.error("Error fetching images:", error);
        return;
      }
      if (!files || files.length === 0) {
        console.warn("No files found in maingallery");
        return;
      }

      const sortedFiles = files
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(file => ({
          url: supabase.storage
            .from("asset")
            .getPublicUrl(`maingallery/${file.name}`).data.publicUrl,
          caption: file.name.replace(/\.[^/.]+$/, "")
        }));

      setPhotos(sortedFiles);
    };

    fetchPhotos();
  }, []);

  // Swipe handlers for popup
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setSelectedIndex(prev => (prev + 1) % photos.length),
    onSwipedRight: () => setSelectedIndex(prev => (prev - 1 + photos.length) % photos.length),
    trackMouse: true
  });

  const renderPhotoPopup = () => {
    if (selectedIndex === null) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        onClick={() => setSelectedIndex(null)}
      >
        <div {...swipeHandlers} className="relative max-w-3xl w-full">
          <img
            src={photos[selectedIndex].url}
            alt={photos[selectedIndex].caption}
            className="w-full max-h-[90vh] object-contain mx-auto"
          />
          <div className="absolute top-4 left-4 text-white text-lg bg-black bg-opacity-50 px-2 rounded">
            {photos[selectedIndex].caption}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "photos":
        return (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {photos.map((photo, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-xl shadow cursor-pointer"
                  onClick={() => setSelectedIndex(i)}
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 w-full bg-black bg-opacity-40 text-white text-center text-xs py-1">
                    {photo.caption}
                  </div>
                </div>
              ))}
            </div>
            {renderPhotoPopup()}
          </>
        );

      case "videos":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {videos.map((v, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow">
                <iframe
                  src={v.url}
                  title={`Video ${i + 1}`}
                  className="w-full h-56 sm:h-64 md:h-72"
                  allowFullScreen
                ></iframe>
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
                  title={`Short ${i + 1}`}
                  className="w-full aspect-[9/16] object-cover"
                  allowFullScreen
                ></iframe>
              </div>
            ))}
          </div>
        );

      case "stream":
        return (
          <section className="w-full bg-gray-50 rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-8 items-center shadow-lg">
            <div className="w-full md:w-2/3 aspect-video rounded-lg overflow-hidden shadow">
              <iframe
                src={streams[0].url}
                title={streams[0].title}
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            </div>

            <div className="w-full md:w-1/3 space-y-4">
              <h2 className="text-3xl font-extrabold text-rose-600">📺 Live Now</h2>
              <p className="text-gray-700 text-sm md:text-base">
                Dive into the excitement of <strong>Lovemate Show</strong> as it happens. 
                Watch real-time emotions, plot twists, and contestant highlights unfold.
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

            <div className="flex-1">{renderContent()}</div>
          </div>

          <SponsorCarousel sponsors={["/sponsors/logo1.png", "/sponsors/logo2.png", "/sponsors/logo3.png"]} />
        </div>
      </section>

      <Footer />
    </>
  );
}
