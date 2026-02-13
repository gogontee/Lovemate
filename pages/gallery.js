"use client";

import { useState, useEffect, useRef } from "react";
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

// Stream videos that will play sequentially on loop
const streamVideos = [
  { 
    title: "coming soon!", 
    url: "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/video/ads/lovemate.mp4",
  },
  { 
    title: "Coming Soon!!", 
    url: "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/video/ads/shoutoutfinal.mp4",
  },
];

export default function Gallery() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("photos");
  const [photos, setPhotos] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Stream player state
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef(null);
  const hasAutoPlayed = useRef(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Handle video end - play next video and loop back to start
  const handleVideoEnd = () => {
    setCurrentVideoIndex((prevIndex) => {
      // If it's the last video, go back to first (index 0)
      // Otherwise, go to next video
      return prevIndex === streamVideos.length - 1 ? 0 : prevIndex + 1;
    });
  };

  // Reset video index when tab changes to stream
  useEffect(() => {
    if (activeTab === "stream") {
      setCurrentVideoIndex(0);
      hasAutoPlayed.current = false; // Reset autoplay flag when returning to stream tab
    }
  }, [activeTab]);

  // AUTO-PLAY: Immediately play video when stream tab is active AND video is loaded
  useEffect(() => {
    if (activeTab === "stream" && videoRef.current) {
      const playVideo = async () => {
        try {
          // Check if video is ready to play
          if (videoRef.current.readyState >= 2) { // HAVE_CURRENT_DATA or higher
            await videoRef.current.play();
            hasAutoPlayed.current = true;
          } else {
            // Wait for video to be ready
            videoRef.current.addEventListener('canplay', async () => {
              try {
                await videoRef.current.play();
                hasAutoPlayed.current = true;
              } catch (error) {
                console.log("Autoplay prevented:", error);
              }
            }, { once: true });
          }
        } catch (error) {
          console.log("Autoplay failed:", error);
        }
      };

      playVideo();
    }
  }, [activeTab, currentVideoIndex]); // Re-run when tab changes or video index changes

  // Also try to play when the video element is first created
  useEffect(() => {
    if (activeTab === "stream" && videoRef.current && !hasAutoPlayed.current) {
      const video = videoRef.current;
      
      const attemptPlay = async () => {
        try {
          await video.play();
          hasAutoPlayed.current = true;
        } catch (error) {
          console.log("Initial autoplay prevented:", error);
        }
      };

      attemptPlay();
    }
  }, [activeTab, videoRef.current]);

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
          <div className="w-full bg-gradient-to-b from-gray-50 to-white rounded-xl p-4 md:p-6 shadow-lg border border-rose-100">
            {/* Single TV Screen - Continuous Loop with Autoplay */}
            <div className="w-full aspect-video rounded-lg overflow-hidden shadow-xl bg-black mx-auto">
              <video
                key={currentVideoIndex}
                ref={videoRef}
                src={streamVideos[currentVideoIndex].url}
                className="w-full h-full object-contain"
                controls
                autoPlay
                playsInline
                muted={false}
                preload="auto"
                onEnded={handleVideoEnd}
                onLoadedData={(e) => {
                  // Try to play immediately when data is loaded
                  if (activeTab === "stream" && !hasAutoPlayed.current) {
                    e.target.play().catch(err => console.log("Autoplay on loaded data failed:", err));
                  }
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            
            {/* Now Playing - Minimal, no buttons */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 uppercase tracking-wider">NOW PLAYING</p>
              <p className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600">
                {streamVideos[currentVideoIndex].title}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {currentVideoIndex + 1} / {streamVideos.length} • 🔁 Continuous Loop
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Header />

      <section className="bg-white py-16 px-4 md:py-16 md:px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Gallery</h1>
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex md:flex-col gap-2 md:w-48 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
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
                  className={`py-2 px-4 rounded-md text-left text-sm font-semibold whitespace-nowrap md:whitespace-normal ${
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

          {/* Sponsor Carousel - Hidden on mobile, visible on desktop */}
          {!isMobile && (
            <SponsorCarousel sponsors={["/sponsors/logo1.png", "/sponsors/logo2.png", "/sponsors/logo3.png"]} />
          )}
        </div>
      </section>

      {/* Footer - Hidden on mobile, visible on desktop */}
      {!isMobile && <Footer />}
    </>
  );
}