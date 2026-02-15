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
      <section className="bg-rose-100 py-12 px-4">
        <h2 className="text-2xl font-bold text-center mb-6">
          <span className="text-gray-900">Top</span>{" "}
          <span className="text-red-600">Videos</span>
        </h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-rose-400"></div>
        </div>
      </section>
    );
  }

  // Empty state - no videos available
  if (videos.length === 0) {
    return (
      <section className="bg-rose-100 py-12 px-4">
        <h2 className="text-2xl font-bold text-center mb-6">
          <span className="text-gray-900">Top</span>{" "}
          <span className="text-red-600">Videos</span>
        </h2>
        <div className="text-center py-8">
          <div className="text-5xl mb-4">🎥</div>
          <p className="text-gray-600 text-lg">Videos coming soon!</p>
          <p className="text-rose-500 text-sm mt-2">Check back later for exciting content</p>
        </div>
      </section>
    );
  }

  // Show videos
  return (
    <section className="bg-rose-100 py-12 px-4">
      <h2 className="text-2xl font-bold text-center mb-6">
        <span className="text-gray-900">Top</span>{" "}
        <span className="text-red-600">Videos</span>
      </h2>

      <div className="overflow-x-auto scrollbar-hide pb-4">
        <div className="inline-flex space-x-6 px-2">
          {videos.map((video, index) => (
            <div
              key={index}
              className="min-w-[400px] w-[400px] bg-white rounded-xl overflow-hidden shadow-md"
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
                    className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </button>
                )}
              </div>
              
              {/* Video Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-lg mb-1 line-clamp-1">
                  {video.title || `Video ${index + 1}`}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll hint for mobile */}
      <div className="text-center mt-4 text-sm text-rose-400 md:hidden">
        <span>Swipe to see more videos →</span>
      </div>
    </section>
  );
}