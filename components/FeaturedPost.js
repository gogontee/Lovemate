// components/FeaturedPost.js
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Maximize2, Image as ImageIcon, Play } from "lucide-react";
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
  const [mobileView, setMobileView] = useState("images"); // "images" or "video"
  
  const timeoutRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [scrollInterval, setScrollInterval] = useState(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const interactionTimeoutRef = useRef(null);
  
  // Video controls state
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const volumeTimeoutRef = useRef(null);
  const videoProgressIntervalRef = useRef(null);

  // Fetch carousel images and videos from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
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

  const defaultImages = [
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop",
  ];

  const displayImages = carouselImages.length > 0 ? carouselImages : defaultImages;

  const defaultVideo = "https://www.youtube.com/embed/MWzBjSfsLsE?autoplay=1&mute=1&loop=1&playlist=MWzBjSfsLsE";
  
  const getCurrentVideoUrl = () => {
    if (videos.length === 0) return defaultVideo;
    
    const videoUrl = videos[currentVideoIndex];
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = videoUrl.split('/').pop()?.split('?')[0] || '';
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=0&playlist=${videoId}`;
    } else {
      return videoUrl;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setShowVolumeControl(true);
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    volumeTimeoutRef.current = setTimeout(() => setShowVolumeControl(false), 2000);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (iframeRef.current && videos[currentVideoIndex]?.includes('youtube')) {
      const videoId = videos[currentVideoIndex].split('/').pop()?.split('?')[0] || '';
      iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${!isMuted ? 1 : 0}&loop=0&playlist=${videoId}`;
    }
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setShowVolumeControl(true);
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    volumeTimeoutRef.current = setTimeout(() => setShowVolumeControl(false), 2000);
  };

  useEffect(() => {
    if (videos.length <= 1 || !videoRef.current) return;
    const video = videoRef.current;

    const handleVideoEnded = () => setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    const handleLoadedMetadata = () => setVideoDuration(video.duration);
    const handleTimeUpdate = () => setCurrentVideoTime(video.currentTime);

    video.addEventListener('ended', handleVideoEnded);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('ended', handleVideoEnded);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videos.length, currentVideoIndex]);

  useEffect(() => {
    if (videos.length <= 1 || !videos[currentVideoIndex]?.includes('youtube')) return;
    if (videoProgressIntervalRef.current) clearInterval(videoProgressIntervalRef.current);
    
    const timeout = setTimeout(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
    }, 120000);

    return () => clearTimeout(timeout);
  }, [currentVideoIndex, videos]);

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
    if (!isMobile || mobileView !== "images") return;
    resetTimeout();
    return () => clearTimeout(timeoutRef.current);
  }, [activeIndex, isMobile, mobileView]);

  useEffect(() => {
    if (isMobile || !scrollContainerRef.current || displayImages.length === 0) return;

    const startAutoScroll = () => {
      if (scrollInterval) clearInterval(scrollInterval);
      
      const interval = setInterval(() => {
        if (scrollContainerRef.current && !isUserInteracting) {
          const container = scrollContainerRef.current;
          const imageWidth = 280 + 16;
          
          container.scrollBy({ left: imageWidth, behavior: 'smooth' });

          setTimeout(() => {
            if (container.scrollLeft >= (displayImages.length * imageWidth)) {
              container.scrollTo({ left: 0, behavior: 'instant' });
            }
          }, 500);
        }
      }, 2000);

      setScrollInterval(interval);
    };

    startAutoScroll();

    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [isMobile, displayImages.length, isUserInteracting]);

  const handleUserInteraction = () => {
    setIsUserInteracting(true);
    if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
    interactionTimeoutRef.current = setTimeout(() => setIsUserInteracting(false), 8000);
  };

  useEffect(() => {
    return () => {
      if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
      if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
      if (videoProgressIntervalRef.current) clearInterval(videoProgressIntervalRef.current);
    };
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-[#0a0a0f] py-8 overflow-hidden relative">
        <div className="flex h-[300px] max-w-7xl mx-auto px-4 gap-4 relative z-10">
          <div className="w-1/2 h-full bg-[#181820] animate-pulse rounded-2xl border border-[#DC143C]/20"></div>
          <div className="w-1/2 h-full bg-[#181820] animate-pulse rounded-2xl border border-[#DC143C]/20"></div>
        </div>
      </section>
    );
  }

  // DESKTOP: Split screen layout
  if (!isMobile) {
    const infiniteImages = [...displayImages, ...displayImages, ...displayImages];
    const currentVideo = getCurrentVideoUrl();
    const isMp4Video = currentVideo.includes('.mp4') || currentVideo.includes('.mov') || currentVideo.includes('.webm');
    const progressPercentage = videoDuration > 0 ? (currentVideoTime / videoDuration) * 100 : 0;

    return (
      <section className="w-full bg-[#0a0a0f] py-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#DC143C]/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#DC143C]/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/3 z-0"></div>
        
        <div className="flex h-[300px] max-w-7xl mx-auto px-4 gap-4 relative z-10">
          {/* Left Side - Image Scroll */}
          <div className="w-1/2 h-full relative">
            <div 
              ref={scrollContainerRef}
              className="relative h-full overflow-x-auto scrollbar-hide flex gap-4 pb-2 infinite-scroll"
              onMouseEnter={() => {
                setIsUserInteracting(true);
                if (interactionTimeoutRef.current) clearTimeout(interactionTimeoutRef.current);
              }}
              onMouseLeave={() => {
                interactionTimeoutRef.current = setTimeout(() => setIsUserInteracting(false), 3000);
              }}
              onScroll={handleUserInteraction}
              onTouchStart={handleUserInteraction}
              onMouseDown={handleUserInteraction}
              onWheel={handleUserInteraction}
            >
              {infiniteImages.map((src, idx) => (
                <div
                  key={`${src}-${idx}`}
                  className="relative h-full w-[280px] flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-[#DC143C]/20 group"
                >
                  <Image
                    src={src}
                    alt={`Featured ${(idx % displayImages.length) + 1}`}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority={idx < displayImages.length * 2}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-xs font-medium text-rose-400">
                      0{(idx % displayImages.length) + 1} / 0{displayImages.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Video Player */}
          <div className="w-1/2 h-full bg-black/40 rounded-2xl overflow-hidden relative group border border-[#DC143C]/20 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-l from-rose-500/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative w-full h-full">
              {isMp4Video ? (
                <video
                  ref={videoRef}
                  src={currentVideo}
                  autoPlay
                  muted={isMuted}
                  loop={false}
                  playsInline
                  volume={volume}
                  className="w-full h-full object-cover"
                />
              ) : (
                <iframe
                  ref={iframeRef}
                  src={currentVideo}
                  title="Lovemate Show Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full object-cover"
                />
              )}
              
              {isMp4Video && videoDuration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div 
                    className="h-full bg-[#DC143C] transition-all duration-100"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              )}
              
              <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
                {showVolumeControl && !isMp4Video && (
                  <div className="bg-black/80 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-2 border border-[#DC143C]/30">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    />
                  </div>
                )}
                
                <button
                  onClick={toggleMute}
                  className="bg-black/80 backdrop-blur-md rounded-full p-1.5 hover:bg-[#DC143C] transition-colors border border-[#DC143C]/30 hover:border-[#DC143C]"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                </button>

                <button
                  onClick={() => {
                    if (videoRef.current) {
                      if (videoRef.current.requestFullscreen) videoRef.current.requestFullscreen();
                    } else if (iframeRef.current) {
                      if (iframeRef.current.requestFullscreen) iframeRef.current.requestFullscreen();
                    }
                  }}
                  className="bg-black/80 backdrop-blur-md rounded-full p-1.5 hover:bg-[#DC143C] transition-colors border border-[#DC143C]/30 hover:border-[#DC143C]"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .infinite-scroll {
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            transition: scroll-left 0.5s ease-in-out;
          }
          .infinite-scroll::-webkit-scrollbar { display: none; }
          input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
          }
          input[type=range]::-moz-range-thumb {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
          }
        `}</style>
      </section>
    );
  }

  // MOBILE: Toggle between Image Carousel and Video Player
  return (
    <section className="w-full bg-[#0a0a0f] py-6 overflow-hidden relative">
      {/* Reddish Glow Background Effects for Mobile */}
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#DC143C]/15 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0"></div>
      <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-[#DC143C]/10 rounded-full blur-[80px] pointer-events-none translate-x-1/3 -translate-y-1/2 z-0"></div>

      <div className="relative z-10 flex flex-col items-center">
        
        {/* Toggle Switch */}
        <div className="flex items-center bg-[#121216] p-1 rounded-full mb-6 border border-[#DC143C]/30 shadow-lg">
          <button
            onClick={() => setMobileView("images")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              mobileView === "images" 
                ? "bg-[#DC143C] text-white shadow-md" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Images
          </button>
          <button
            onClick={() => setMobileView("video")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              mobileView === "video" 
                ? "bg-[#DC143C] text-white shadow-md" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Play className="w-3.5 h-3.5" fill="currentColor" /> Video
          </button>
        </div>

        {mobileView === "images" ? (
          /* Expanded Image Carousel */
          <div className="w-full">
            <div className="relative h-[500px] flex items-center justify-center">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                {[-1, 0, 1].map((offset) => {
                  const index = (activeIndex + offset + displayImages.length) % displayImages.length;
                  const isActive = offset === 0;

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
                      initial={{ x: direction > 0 ? "100%" : "-100%", opacity: 0, scale: 0.8 }}
                      animate={{ 
                        x: xPosition, 
                        opacity: opacity,
                        scale: scale,
                        transition: { type: "spring", stiffness: 280, damping: 25, mass: 0.8 }
                      }}
                      exit={{ x: direction < 0 ? "100%" : "-100%", opacity: 0, scale: 0.7 }}
                      transition={{ type: "spring", stiffness: 280, damping: 25, mass: 0.8 }}
                      drag={isMobile ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(event, info) => {
                        if (Math.abs(info.offset.x) > 50) {
                          if (info.offset.x > 0) handlePrev();
                          else handleNext();
                        }
                      }}
                      /* Expanded card width and aspect ratio */
                      className="absolute w-[290px] cursor-grab active:cursor-grabbing"
                      style={{ zIndex, touchAction: "pan-y" }}
                      onClick={() => !isActive && handleGoTo(index)}
                    >
                      <div className={`
                        relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-[#DC143C]/20
                        ${isActive ? 'ring-2 ring-[#DC143C] ring-offset-2 ring-offset-[#0a0a0f] border-transparent' : ''}
                      `}>
                        <Image
                          src={displayImages[index]}
                          alt={`Featured ${index + 1}`}
                          fill
                          unoptimized
                          className="object-cover pointer-events-none"
                          priority={isActive}
                          draggable={false}
                        />
                        
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
                    idx === activeIndex ? 'w-5 bg-[#DC143C]' : 'w-1 bg-white/20'
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Mobile Video Player - Full width, no horizontal padding */
          <div className="w-full max-w-[500px]">
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[#DC143C]/30 shadow-2xl">
              {getCurrentVideoUrl().includes('youtube') ? (
                <iframe
                  ref={iframeRef}
                  src={getCurrentVideoUrl()}
                  title="Lovemate Show Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  ref={videoRef}
                  src={getCurrentVideoUrl()}
                  autoPlay
                  muted={isMuted}
                  loop={false}
                  playsInline
                  volume={volume}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Video Controls for Mobile */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2 z-10">
                <button
                  onClick={toggleMute}
                  className="bg-black/80 backdrop-blur-md rounded-full p-1.5 hover:bg-[#DC143C] transition-colors border border-[#DC143C]/30"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                </button>
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      if (videoRef.current.requestFullscreen) videoRef.current.requestFullscreen();
                    } else if (iframeRef.current) {
                      if (iframeRef.current.requestFullscreen) iframeRef.current.requestFullscreen();
                    }
                  }}
                  className="bg-black/80 backdrop-blur-md rounded-full p-1.5 hover:bg-[#DC143C] transition-colors border border-[#DC143C]/30"
                >
                  <Maximize2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}