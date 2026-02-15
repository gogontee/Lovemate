"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SponsorCarousel from "../components/SponsorCarousel";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";
import { useSwipeable } from "react-swipeable";

export default function Gallery() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("photos");
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [streamVideos, setStreamVideos] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState({
    photos: true,
    videos: true,
    shorts: true,
    stream: true
  });
  
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

  // Fetch all gallery data from lovemate table
  useEffect(() => {
    const fetchGalleryData = async () => {
      const { data, error } = await supabase
        .from("lovemate")
        .select("image_gallery, video_gallery, shorts, tv")
        .single();

      if (error) {
        console.error("Error fetching gallery data:", error);
        return;
      }

      if (data) {
        // Set photos from image_gallery
        if (data.image_gallery && Array.isArray(data.image_gallery)) {
          setPhotos(data.image_gallery);
        }
        setLoading(prev => ({ ...prev, photos: false }));

        // Set videos from video_gallery
        if (data.video_gallery && Array.isArray(data.video_gallery)) {
          setVideos(data.video_gallery);
        }
        setLoading(prev => ({ ...prev, videos: false }));

        // Set shorts from shorts
        if (data.shorts && Array.isArray(data.shorts)) {
          setShorts(data.shorts);
        }
        setLoading(prev => ({ ...prev, shorts: false }));

        // Set stream videos from tv
        if (data.tv && Array.isArray(data.tv)) {
          setStreamVideos(data.tv);
        }
        setLoading(prev => ({ ...prev, stream: false }));
      }
    };

    fetchGalleryData();
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
    if (activeTab === "stream" && videoRef.current && streamVideos.length > 0) {
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
  }, [activeTab, currentVideoIndex, streamVideos.length]); // Re-run when tab changes or video index changes

  // Also try to play when the video element is first created
  useEffect(() => {
    if (activeTab === "stream" && videoRef.current && !hasAutoPlayed.current && streamVideos.length > 0) {
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
  }, [activeTab, videoRef.current, streamVideos.length]);

  // Swipe handlers for popup
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setSelectedIndex(prev => (prev + 1) % photos.length),
    onSwipedRight: () => setSelectedIndex(prev => (prev - 1 + photos.length) % photos.length),
    trackMouse: true
  });

  const renderPhotoPopup = () => {
    if (selectedIndex === null || !photos[selectedIndex]) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        onClick={() => setSelectedIndex(null)}
      >
        <div {...swipeHandlers} className="relative max-w-3xl w-full">
          <img
            src={photos[selectedIndex].url}
            alt={photos[selectedIndex].caption || "Gallery image"}
            className="w-full max-h-[90vh] object-contain mx-auto"
          />
          {photos[selectedIndex].caption && (
            <div className="absolute top-4 left-4 text-white text-lg bg-black bg-opacity-50 px-2 rounded">
              {photos[selectedIndex].caption}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "photos":
        if (loading.photos) {
          return (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
            </div>
          );
        }

        if (photos.length === 0) {
          return (
            <div className="text-center py-12">
              <p className="text-gray-500">No photos available yet.</p>
            </div>
          );
        }

        return (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {photos.map((photo, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-xl shadow cursor-pointer group"
                  onClick={() => setSelectedIndex(i)}
                >
                  <Image
                    src={photo.url}
                    alt={photo.caption || `Gallery image ${i + 1}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                  />
                  {photo.caption && (
                    <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-center text-xs py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {photo.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {renderPhotoPopup()}
          </>
        );

      case "videos":
        if (loading.videos) {
          return (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
            </div>
          );
        }

        if (videos.length === 0) {
          return (
            <div className="text-center py-12">
              <p className="text-gray-500">No videos available yet.</p>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {videos.map((video, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg group">
                <div className="relative aspect-video">
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail}
                      alt={video.title || `Video ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No thumbnail</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-rose-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </a>
                  </div>
                </div>
                {video.title && (
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-800 truncate">{video.title}</h3>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case "shorts":
        if (loading.shorts) {
          return (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
            </div>
          );
        }

        if (shorts.length === 0) {
          return (
            <div className="text-center py-12">
              <p className="text-gray-500">No shorts available yet.</p>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {shorts.map((short, i) => (
              <div key={i} className="rounded-xl overflow-hidden shadow-lg group relative">
                <div className="relative aspect-[9/16]">
                  <video
                    src={short.url}
                    className="w-full h-full object-cover"
                    poster={short.thumbnail}
                    muted
                    loop
                    playsInline
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <a
                      href={short.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-rose-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </a>
                  </div>
                </div>
                {short.caption && (
                  <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-center text-xs py-2">
                    {short.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case "stream":
        if (loading.stream) {
          return (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
            </div>
          );
        }

        if (streamVideos.length === 0) {
          return (
            <div className="text-center py-12">
              <p className="text-gray-500">No live stream content available.</p>
            </div>
          );
        }

        return (
          <div className="w-full bg-gradient-to-b from-gray-50 to-white rounded-xl p-4 md:p-6 shadow-lg border border-rose-100">
            {/* TV Screen with Logo Overlay - Desktop 20% smaller */}
            <div className="relative w-full md:w-4/5 mx-auto aspect-video rounded-lg overflow-hidden shadow-xl bg-black">
              {/* TV Logo Overlay - Top Right - No background, just logo */}
              <div className="absolute top-2 right-2 z-10">
                <img 
                  src="https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/lovemateshow/logo/lovemateicon.png"
                  alt="LOVEMATE TV"
                  className="w-8 h-8 md:w-10 md:h-10 object-contain"
                />
              </div>
              
              {/* Video Player */}
              <video
                key={currentVideoIndex}
                ref={videoRef}
                src={streamVideos[currentVideoIndex]?.url}
                className="w-full h-full object-contain"
                controls={false} // No controls - users can't stop
                autoPlay
                playsInline
                muted={false} // Users can control volume via browser/system
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
            
            {/* Live Indicator Only - No now playing or counter */}
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">LIVE</span>
              </div>
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