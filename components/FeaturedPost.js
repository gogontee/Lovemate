// components/FeaturedPost.js
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";

export default function FeaturedPost() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [direction, setDirection] = useState(0);
  const [carouselImages, setCarouselImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [scrollInterval, setScrollInterval] = useState(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const interactionTimeoutRef = useRef(null);

  // Fetch carousel images and videos from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch carousel images
        const { data: carouselData, error: carouselError } = await supabase
          .from("lovemate")
          .select("carousel")
          .single();

        if (carouselError) {
          console.error("Error fetching carousel images:", carouselError);
        } else if (carouselData?.carousel && Array.isArray(carouselData.carousel)) {
          const images = carouselData.carousel.map(item => item.url);
          setCarouselImages(images);
        }

        // Fetch videos from lovemate.tv
        const { data: tvData, error: tvError } = await supabase
          .from("lovemate")
          .select("tv")
          .single();

        if (tvError) {
          console.error("Error fetching videos:", tvError);
        } else if (tvData?.tv && Array.isArray(tvData.tv)) {
          const videoUrls = tvData.tv.map(item => item.url);
          setVideos(videoUrls);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Professional stock images as fallback while loading or if no images
  const defaultImages = [
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop",
  ];

  const displayImages = carouselImages.length > 0 ? carouselImages : defaultImages;

  // Default video if none provided
  const defaultVideo = "https://www.youtube.com/embed/MWzBjSfsLsE?autoplay=1&mute=1&loop=1&playlist=MWzBjSfsLsE";
  
  // Get current video URL
  const getCurrentVideoUrl = () => {
    if (videos.length === 0) return defaultVideo;
    
    const videoUrl = videos[currentVideoIndex];
    // Check if it's a YouTube URL or direct video file
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      // Extract YouTube ID and create embed URL with autoplay
      const videoId = videoUrl.split('/').pop()?.split('?')[0] || '';
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`;
    } else {
      // For direct video files, we'll use a video player with a different approach
      // Since iframe doesn't work well with direct MP4s, we'll return the URL and handle separately
      return videoUrl;
    }
  };

  // Rotate videos periodically (every 30 seconds)
  useEffect(() => {
    if (videos.length <= 1) return;

    const videoInterval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    }, 30000);

    return () => clearInterval(videoInterval);
  }, [videos.length]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNext = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % displayImages.length);
    resetTimeout();
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    resetTimeout();
  };

  const handleGoTo = (index) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    resetTimeout();
  };

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(handleNext, 5000);
  };

  useEffect(() => {
    if (!isMobile) return; // Only for mobile auto-advance
    resetTimeout();
    return () => clearTimeout(timeoutRef.current);
  }, [activeIndex, isMobile]);

  // DESKTOP: Auto-scrolling with increased speed (half the time)
  useEffect(() => {
    if (isMobile || !scrollContainerRef.current || displayImages.length === 0) return;

    const startAutoScroll = () => {
      if (scrollInterval) clearInterval(scrollInterval);
      
      const interval = setInterval(() => {
        if (scrollContainerRef.current && !isUserInteracting) {
          const container = scrollContainerRef.current;
          const imageWidth = 280 + 16; // Image width (280px) + gap (16px)
          
          // Smooth scroll to next position
          container.scrollBy({
            left: imageWidth,
            behavior: 'smooth'
          });

          // Check if we need to reset for infinite loop
          setTimeout(() => {
            if (container.scrollLeft >= (displayImages.length * imageWidth)) {
              // Instantly reset to start without visual jump
              container.scrollTo({ left: 0, behavior: 'instant' });
            }
          }, 500);
        }
      }, 2000); // Scroll every 2 seconds

      setScrollInterval(interval);
    };

    startAutoScroll();

    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [isMobile, displayImages.length, isUserInteracting]);

  // Handle user interaction
  const handleUserInteraction = () => {
    setIsUserInteracting(true);
    
    // Clear any existing timeout
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }

    // Resume auto-scroll after 8 seconds of inactivity
    interactionTimeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 8000);
  };

  // Cleanup interaction timeout
  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-rose-50 py-8 overflow-hidden">
        <div className="flex h-[300px] max-w-7xl mx-auto px-4 gap-4">
          <div className="w-1/2 h-full bg-rose-100 animate-pulse rounded-2xl"></div>
          <div className="w-1/2 h-full bg-rose-100 animate-pulse rounded-2xl"></div>
        </div>
      </section>
    );
  }

  // DESKTOP: Split screen layout with smooth infinite scroll
  if (!isMobile) {
    // Create a duplicated array for infinite loop effect
    const infiniteImages = [...displayImages, ...displayImages, ...displayImages];
    const currentVideo = getCurrentVideoUrl();
    const isMp4Video = currentVideo.includes('.mp4') || currentVideo.includes('.mov') || currentVideo.includes('.webm');

    return (
      <section className="w-full bg-rose-50 py-8 overflow-hidden">
        <div className="flex h-[300px] max-w-7xl mx-auto px-4 gap-4">
          {/* Left Side - Image Scroll (50%) */}
          <div className="w-1/2 h-full relative">
            {/* Images Container - Horizontal Scroll with infinite loop */}
            <div 
              ref={scrollContainerRef}
              className="relative h-full overflow-x-auto scrollbar-hide flex gap-4 pb-2 infinite-scroll"
              onMouseEnter={() => {
                setIsUserInteracting(true);
                if (interactionTimeoutRef.current) {
                  clearTimeout(interactionTimeoutRef.current);
                }
              }}
              onMouseLeave={() => {
                interactionTimeoutRef.current = setTimeout(() => {
                  setIsUserInteracting(false);
                }, 3000);
              }}
              onScroll={handleUserInteraction}
              onTouchStart={handleUserInteraction}
              onMouseDown={handleUserInteraction}
              onWheel={handleUserInteraction}
            >
              {infiniteImages.map((src, idx) => (
                <div
                  key={`${src}-${idx}`}
                  className="relative h-full w-[280px] flex-shrink-0 rounded-2xl overflow-hidden shadow-lg"
                >
                  <Image
                    src={src}
                    alt={`Featured ${(idx % displayImages.length) + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    priority={idx < displayImages.length * 2}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Image Label on Hover */}
                  <div className="absolute bottom-4 left-4 text-white opacity-0 hover:opacity-100 transition-opacity duration-500">
                    <span className="text-xs font-medium text-rose-300">
                      0{(idx % displayImages.length) + 1} / 0{displayImages.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Video Player (50%) */}
          <div className="w-1/2 h-full bg-black/5 rounded-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-l from-rose-500/10 via-transparent to-transparent" />
            
            {/* Video Container */}
            <div className="relative w-full h-full">
              {isMp4Video ? (
                <video
                  src={currentVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <iframe
                  src={currentVideo}
                  title="Lovemate Show Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Overlay Play Button (appears on hover) */}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-16 h-16 bg-rose-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300 shadow-xl">
                  <Play className="w-6 h-6 text-white ml-1" />
                </div>
              </div>

              {/* Video indicator (shows when multiple videos) */}
              {videos.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full">
                  {currentVideoIndex + 1} / {videos.length}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add CSS for smooth infinite scroll */}
        <style jsx>{`
          .infinite-scroll {
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            transition: scroll-left 0.5s ease-in-out;
          }
          
          .infinite-scroll::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </section>
    );
  }

  // MOBILE: Smooth rotating carousel with swipe (Text removed from images)
  return (
    <section className="w-full bg-rose-50 py-8 overflow-hidden">
      <div className="relative">
        {/* Carousel Container */}
        <div className="relative h-[400px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            {[-1, 0, 1].map((offset) => {
              const index = (activeIndex + offset + displayImages.length) % displayImages.length;
              const isActive = offset === 0;

              // Calculate positioning for peek effect
              let xPosition = "0%";
              let scale = 0.8;
              let opacity = 0.4;
              let zIndex = 10;

              if (offset === -1) {
                xPosition = "-35%";
                scale = 0.7;
                opacity = 0.25;
                zIndex = 5;
              } else if (offset === 0) {
                xPosition = "0%";
                scale = 1;
                opacity = 1;
                zIndex = 20;
              } else if (offset === 1) {
                xPosition = "35%";
                scale = 0.7;
                opacity = 0.25;
                zIndex = 5;
              }

              return (
                <motion.div
                  key={index}
                  custom={direction}
                  initial={{ 
                    x: direction > 0 ? "100%" : "-100%", 
                    opacity: 0,
                    scale: 0.8
                  }}
                  animate={{ 
                    x: xPosition, 
                    opacity: opacity,
                    scale: scale,
                    transition: {
                      type: "spring",
                      stiffness: 280,
                      damping: 25,
                      mass: 0.8
                    }
                  }}
                  exit={{ 
                    x: direction < 0 ? "100%" : "-100%", 
                    opacity: 0,
                    scale: 0.7
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 25,
                    mass: 0.8
                  }}
                  drag={isMobile ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(event, info) => {
                    if (Math.abs(info.offset.x) > 50) {
                      if (info.offset.x > 0) {
                        handlePrev();
                      } else {
                        handleNext();
                      }
                    }
                  }}
                  className="absolute w-[240px] cursor-grab active:cursor-grabbing"
                  style={{ zIndex, touchAction: "pan-y" }}
                  onClick={() => !isActive && handleGoTo(index)}
                >
                  <div className={`
                    relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl
                    ${isActive ? 'ring-2 ring-rose-500 ring-offset-2 ring-offset-rose-50' : ''}
                  `}>
                    <Image
                      src={displayImages[index]}
                      alt={`Featured ${index + 1}`}
                      fill
                      className="object-cover pointer-events-none"
                      priority={isActive}
                      draggable={false}
                    />
                    
                    {/* Dark overlay for inactive images */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Minimal Dots Indicator */}
        <div className="flex justify-center gap-1.5 mt-4">
          {displayImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleGoTo(idx)}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'w-5 bg-rose-500' : 'w-1 bg-rose-300/50'
              }`}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}