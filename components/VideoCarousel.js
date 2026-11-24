// components/VideoCarousel.js
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function VideoCarousel({ limit = 3 }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState(null);
  const videoRefs = useRef([]);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("lovemate")
        .select("video_gallery")
        .single();

      if (error) {
        console.error("Error fetching videos:", error);
        setLoading(false);
        return;
      }

      // Get the video_gallery array and limit to specified number
      const videoList = data?.video_gallery || [];
      const limitedVideos = videoList.slice(0, limit);
      
      setVideos(limitedVideos);
      setLoading(false);
    };

    fetchVideos();
  }, [limit]);

  // Function to play video
  const playVideo = async (index) => {
    // Pause any currently playing video
    if (playingIndex !== null && playingIndex !== index && videoRefs.current[playingIndex]) {
      videoRefs.current[playingIndex].pause();
    }

    const videoEl = videoRefs.current[index];
    if (videoEl) {
      try {
        await videoEl.play();
        setPlayingIndex(index);
      } catch (error) {
        console.log("Playback failed:", error);
      }
    }
  };

  // Function to pause video
  const pauseVideo = (index) => {
    const videoEl = videoRefs.current[index];
    if (videoEl) {
      videoEl.pause();
      setPlayingIndex(null);
    }
  };

  // Handle video end
  const handleVideoEnd = (index) => {
    if (playingIndex === index) {
      setPlayingIndex(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="bg-[#0a0a0f] py-12 px-4 relative overflow-hidden">
        {/* Reddish Glow Background Effects */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#DC143C]/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0"></div>

        <h2 className="text-2xl font-bold text-center mb-6 relative z-10">
          <span className="text-white">Top</span>{" "}
          <span className="text-[#DC143C]">Videos</span>
        </h2>
        <div className="flex justify-center items-center py-8 relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#DC143C]"></div>
        </div>
      </section>
    );
  }

  // Empty state - no videos available
  if (videos.length === 0) {
    return (
      <section className="bg-[#0a0a0f] py-12 px-4 relative overflow-hidden">
        {/* Reddish Glow Background Effects */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#DC143C]/10 rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2 z-0"></div>

        <h2 className="text-2xl font-bold text-center mb-6 relative z-10">
          <span className="text-white">Top</span>{" "}
          <span className="text-[#DC143C]">Videos</span>
        </h2>
        <div className="text-center py-8 relative z-10">
          <div className="text-5xl mb-4">🎥</div>
          <p className="text-gray-300 text-lg">Videos coming soon!</p>
          <p className="text-[#DC143C] text-sm mt-2">Check back later for exciting content</p>
        </div>
      </section>
    );
  }

  // Show videos
  return (
    <section className="bg-[#0a0a0f] py-12 px-4 relative overflow-hidden">
      {/* Reddish Glow Background Effects */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#DC143C]/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0"></div>
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-rose-600/10 rounded-full blur-[80px] pointer-events-none translate-x-1/3 translate-y-1/3 z-0"></div>

      <h2 className="text-2xl font-bold text-center mb-6 relative z-10">
        <span className="text-white">Top</span>{" "}
        <span className="text-[#DC143C]">Videos</span>
      </h2>

      <div className="overflow-x-auto scrollbar-hide pb-4 relative z-10">
        <div className="inline-flex space-x-6 px-2">
          {videos.map((video, index) => (
            <div
              key={index}
              className="min-w-[400px] w-[400px] bg-[#121216] rounded-xl overflow-hidden shadow-2xl border border-[#DC143C]/30"
            >
              {/* Video Container */}
              <div className="relative h-[220px] bg-black">
                {/* Video element */}
                <video
                  ref={el => videoRefs.current[index] = el}
                  src={video.url}
                  poster={video.thumbnail}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() => {
                    const videoEl = videoRefs.current[index];
                    if (videoEl.paused) {
                      playVideo(index);
                    } else {
                      pauseVideo(index);
                    }
                  }}
                  onPlay={() => setPlayingIndex(index)}
                  onPause={() => {
                    if (playingIndex === index) {
                      setPlayingIndex(null);
                    }
                  }}
                  onEnded={() => handleVideoEnd(index)}
                  controls={playingIndex === index}
                  playsInline
                />
                
                {/* Custom play button overlay - only show when video is paused */}
                {playingIndex !== index && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playVideo(index);
                    }}
                    className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-[#DC143C] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(220,20,60,0.5)]">
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </button>
                )}
              </div>
              
              {/* Video Info */}
              <div className="p-4">
                <h3 className="font-semibold text-white text-lg mb-1 line-clamp-1">
                  {video.title || `Video ${index + 1}`}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint for mobile */}
      <div className="text-center mt-4 text-sm text-gray-400 md:hidden relative z-10">
        <span>Swipe to see more videos →</span>
      </div>
    </section>
  );
}