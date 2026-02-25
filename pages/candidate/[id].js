import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import VoteSection from "../../components/candidate/VoteSection";
import GiftSection from "../../components/candidate/GiftSection";
import Gallery from "../../components/candidate/Gallery";
import { motion, AnimatePresence } from "framer-motion";

function formatNaira(n) {
  if (n == null) return "₦0";
  const formatted = Number(n).toLocaleString("en-NG");
  return `₦${formatted}`;
}

// Digital Stats Component - Integrated into Hero
function DigitalStats({ candidate, formatNaira, onVoteClick, onGiftClick }) {
  const [animatedVotes, setAnimatedVotes] = useState(0);
  const [animatedGifts, setAnimatedGifts] = useState(0);
  const [animatedWorth, setAnimatedWorth] = useState(0);

  // Animate numbers when they change
  useEffect(() => {
    if (candidate?.votes !== undefined) {
      setAnimatedVotes(candidate.votes);
    }
  }, [candidate?.votes]);

  useEffect(() => {
    if (candidate?.gifts !== undefined) {
      setAnimatedGifts(candidate.gifts);
    }
  }, [candidate?.gifts]);

  useEffect(() => {
    if (candidate?.gift_worth !== undefined) {
      setAnimatedWorth(candidate.gift_worth);
    }
  }, [candidate?.gift_worth]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="absolute bottom-4 right-4 md:bottom-8 md:right-8 z-20"
    >
      {/* Desktop: Bottom Right */}
      <div className="hidden md:flex gap-4 bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-rose-500/30 shadow-2xl">
        {/* Votes - Clickable */}
        <button 
          onClick={onVoteClick}
          className="text-right hover:scale-105 transition-transform cursor-pointer group"
        >
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-rose-100 group-hover:from-rose-200 group-hover:to-rose-50">
            {Math.round(animatedVotes).toLocaleString()}
          </div>
          <div className="text-xs text-rose-300/80 uppercase tracking-wider flex items-center gap-1 group-hover:text-rose-200">
            <span className="text-rose-400 group-hover:text-rose-300">🗳️</span> Votes
          </div>
        </button>
        
        <div className="w-px bg-rose-500/30" />
        
        {/* Gifts - Clickable */}
        <button 
          onClick={onGiftClick}
          className="text-right hover:scale-105 transition-transform cursor-pointer group"
        >
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-rose-100 group-hover:from-rose-200 group-hover:to-rose-50">
            {Math.round(animatedGifts).toLocaleString()}
          </div>
          <div className="text-xs text-rose-300/80 uppercase tracking-wider flex items-center gap-1 group-hover:text-rose-200">
            <span className="text-rose-400 group-hover:text-rose-300">🎁</span> Gifts
          </div>
        </button>
        
        <div className="w-px bg-rose-500/30" />
        
        {/* Gift Worth - Not Clickable */}
        <div className="text-right">
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-rose-100">
            {formatNaira(Math.round(animatedWorth))}
          </div>
          <div className="text-xs text-rose-300/80 uppercase tracking-wider flex items-center gap-1">
            <span className="text-rose-400">💰</span> Worth
          </div>
        </div>
      </div>

      {/* Mobile: Bottom Right */}
      <div className="md:hidden flex flex-col gap-2 bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-md rounded-2xl p-3 max-w-[180px] border border-rose-500/30">
        {/* Votes - Clickable */}
        <button 
          onClick={onVoteClick}
          className="flex items-center justify-between hover:scale-105 transition-transform cursor-pointer group w-full"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-rose-400 text-xs group-hover:text-rose-300">🗳️</span>
            <span className="text-[8px] text-rose-300/80 uppercase group-hover:text-rose-200">Votes</span>
          </div>
          <div className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-rose-100 group-hover:from-rose-200 group-hover:to-rose-50">
            {Math.round(animatedVotes).toLocaleString()}
          </div>
        </button>
        
        {/* Gifts - Clickable */}
        <button 
          onClick={onGiftClick}
          className="flex items-center justify-between hover:scale-105 transition-transform cursor-pointer group w-full"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-rose-400 text-xs group-hover:text-rose-300">🎁</span>
            <span className="text-[8px] text-rose-300/80 uppercase group-hover:text-rose-200">Gifts</span>
          </div>
          <div className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-rose-100 group-hover:from-rose-200 group-hover:to-rose-50">
            {Math.round(animatedGifts).toLocaleString()}
          </div>
        </button>
        
        {/* Gift Worth - Not Clickable */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-rose-400 text-xs">💰</span>
            <span className="text-[8px] text-rose-300/80 uppercase">Worth</span>
          </div>
          <div className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-rose-100">
            {formatNaira(Math.round(animatedWorth))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CandidateProfile() {
  const router = useRouter();
  const { id } = router.query;
  const voteRef = useRef(null);
  const giftRef = useRef(null);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState("gallery");
  const [uploading, setUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const refreshIntervalRef = useRef(null);

  // Default banner fallback
  const defaultBanner = "https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/lovemateshow/logo/banner.png";

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Helper function to format gallery images
  const formatGalleryImages = (galleryData) => {
    if (!Array.isArray(galleryData)) return [];
    return galleryData.map(item => {
      if (typeof item === 'string') {
        try {
          return JSON.parse(item);
        } catch {
          return { url: item, caption: '' };
        }
      }
      return item;
    });
  };

  // Function to refresh candidate data silently
  const refreshCandidateData = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        // Only update if data has changed to prevent unnecessary re-renders
        if (JSON.stringify(candidate) !== JSON.stringify(data)) {
          console.log("Silent refresh - data updated");
          setCandidate(data);
          setGalleryImages(formatGalleryImages(data.gallery));
        }
      }
    } catch (error) {
      console.error("Silent refresh error:", error);
    }
  };

  // Set up silent refresh interval
  useEffect(() => {
    if (!id) return;

    // Clear any existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set up new interval to refresh every 3 seconds
    refreshIntervalRef.current = setInterval(() => {
      refreshCandidateData();
    }, 3000);

    // Clean up interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [id]); // Re-run if id changes

  // Fetch candidate + subscribe to real-time updates
  useEffect(() => {
    if (!id) return;

    const fetchCandidate = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching candidate:", error);
        setCandidate(null);
      } else {
        setCandidate(data);
        setGalleryImages(formatGalleryImages(data.gallery));
      }
      setLoading(false);
    };

    fetchCandidate();

    // Real-time subscription for candidate updates - FIXED to update galleryImages immediately
    const channel = supabase
      .channel(`candidate-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "candidates",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          console.log("Real-time update received:", payload.new);
          setCandidate(payload.new);
          // CRITICAL: Update galleryImages state directly to trigger re-render
          setGalleryImages(formatGalleryImages(payload.new.gallery));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Check if current user is the owner
  useEffect(() => {
    if (candidate && currentUser) {
      setIsOwner(candidate.user_id === currentUser.id);
    } else {
      setIsOwner(false);
    }
  }, [candidate, currentUser]);

  // Scroll to vote or gift based on hash
  useEffect(() => {
    if (!router.isReady || !candidate) return;
    
    const hash = router.asPath.split("#")[1];
    
    if (hash === "vote") {
      setActiveTab("vote");
      const timer = setTimeout(() => {
        if (voteRef.current) {
          voteRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 800);
      return () => clearTimeout(timer);
    }
    
    if (hash === "gift") {
      setActiveTab("gift");
      const timer = setTimeout(() => {
        if (giftRef.current) {
          giftRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [router.asPath, router.isReady, candidate]);

  // Scroll handlers for clickable stats
  const scrollToVote = () => {
    setActiveTab("vote");
    if (voteRef.current) {
      voteRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToGift = () => {
    setActiveTab("gift");
    if (giftRef.current) {
      giftRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "vote" && voteRef.current) {
      voteRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (tab === "gift" && giftRef.current) {
      giftRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (tab === "gallery" || tab === "about") {
      const contentSection = document.querySelector('.content-section');
      if (contentSection) {
        contentSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Handle profile photo upload
  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !candidate || !isOwner) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${candidate.id}-profile-${Date.now()}.${fileExt}`;
      const filePath = `candidate-profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('candidate-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('candidate-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('candidates')
        .update({ image_url: publicUrl })
        .eq('id', candidate.id);

      if (updateError) throw updateError;

      alert('Profile photo updated successfully!');
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      alert('Error uploading photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle banner upload
  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !candidate || !isOwner) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${candidate.id}-banner-${Date.now()}.${fileExt}`;
      const filePath = `candidate-banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('candidate-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('candidate-images')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('candidates')
        .update({ banner: publicUrl })
        .eq('id', candidate.id);

      if (updateError) throw updateError;

      alert('Banner updated successfully!');
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Error uploading banner. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle gallery image upload with captions
  const handleGalleryUpload = async (uploadData) => {
    if (!uploadData.length || !candidate || !isOwner) return;

    setUploading(true);
    try {
      const uploadedImages = [];
      
      for (const item of uploadData) {
        const { file, caption } = item;
        
        const fileExt = file.name.split('.').pop();
        const fileName = `${candidate.id}-gallery-${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `candidate-gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('candidate-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('candidate-images')
          .getPublicUrl(filePath);

        uploadedImages.push({ 
          url: publicUrl, 
          caption: caption || '' 
        });
      }

      // Get current gallery and append new images
      const currentGallery = galleryImages || [];
      const updatedGallery = [...currentGallery, ...uploadedImages];
      
      const { error: updateError } = await supabase
        .from('candidates')
        .update({ gallery: updatedGallery })
        .eq('id', candidate.id);

      if (updateError) throw updateError;

      // No need to manually update galleryImages here - real-time subscription will handle it
      alert(`${uploadedImages.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      alert('Error uploading images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle gallery image delete
  const handleDeleteImage = async (index) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const updatedGallery = galleryImages.filter((_, i) => i !== index);
      
      const { error: updateError } = await supabase
        .from('candidates')
        .update({ gallery: updatedGallery })
        .eq('id', candidate.id);

      if (updateError) throw updateError;

      // No need to manually update galleryImages here - real-time subscription will handle it
      alert('Image deleted successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image. Please try again.');
    }
  };

  // Handle add/edit caption
  const handleAddCaption = async (index, caption) => {
    try {
      const updatedGallery = [...galleryImages];
      updatedGallery[index] = { ...updatedGallery[index], caption };
      
      const { error: updateError } = await supabase
        .from('candidates')
        .update({ gallery: updatedGallery })
        .eq('id', candidate.id);

      if (updateError) throw updateError;

      // Update local state immediately for better UX, but real-time will also update
      setGalleryImages(updatedGallery);
    } catch (error) {
      console.error('Error saving caption:', error);
      alert('Error saving caption. Please try again.');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
        <div className="hidden md:block">
          <Footer />
        </div>
      </>
    );
  }

  if (!candidate) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Candidate Not Found</h2>
            <p className="text-gray-600 mb-4">The candidate you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
        <div className="hidden md:block">
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{candidate.name} – Lovemate Show</title>
        <meta name="description" content={`Support ${candidate.name} on Lovemate Show with votes and gifts`} />
      </Head>

      <Header />
      
      <main className="bg-gradient-to-br from-pink-50 via-white to-rose-50 min-h-screen pb-20 md:pb-0">
        {/* Hero Section with Integrated Stats and Profile Photo */}
        <section className="relative h-[250px] md:h-[300px] bg-black">
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={candidate.banner || defaultBanner}
              alt={`${candidate.name} banner`}
              fill
              className="object-cover opacity-60"
              priority
              sizes="100vw"
              unoptimized={true}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
          
          {/* Banner Upload Button - Only visible to owner */}
          {isOwner && (
            <div className="absolute top-4 right-4 z-30">
              <label className="cursor-pointer bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border border-white/30 transition-all">
                {uploading ? 'Uploading...' : 'Change Banner'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          )}
          
          {/* Digital Stats Overlay - Now clickable */}
          <DigitalStats 
            candidate={candidate} 
            formatNaira={formatNaira} 
            onVoteClick={scrollToVote}
            onGiftClick={scrollToGift}
          />
          
          {/* Profile Photo and Info - Bottom Left */}
          <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 z-10 flex items-end gap-4 md:gap-6">
            {/* Profile Photo - Double Size with Glowing Effect */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative group"
            >
              {/* Glowing Ring */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 10px 2px rgba(255, 241, 242, 0.5)",
                    "0 0 30px 12px rgba(225, 29, 72, 0.6)",
                    "0 0 10px 2px rgba(255, 241, 242, 0.5)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full"
              />
              
              {/* Profile Image - Double Size */}
              <div className="relative w-24 h-24 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/90 shadow-2xl">
                <Image
                  src={candidate.image_url}
                  alt={`${candidate.name} profile`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 96px, 160px"
                  unoptimized={true}
                />
              </div>

              {/* Profile Photo Upload Button - Only visible to owner on hover */}
              {isOwner && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                  <span className="text-white text-xs font-semibold">
                    {uploading ? '...' : 'Change'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </motion.div>
            
            {/* Name and Location - Beside Profile Photo */}
            <div className="text-white pb-2 md:pb-4">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-2xl md:text-4xl font-extrabold mb-1"
              >
                {candidate.name}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-sm md:text-lg flex items-center gap-1.5"
              >
                <span>📍</span> {candidate.country}
              </motion.p>
            </div>
          </div>
        </section>

        {/* Toggle Navigation - Rose-200 Background - AGGRESSIVE FIX */}
        <div className="sticky top-0 z-20 bg-rose-200 shadow-md">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-center h-14 md:h-16 gap-2 md:gap-4">
              {["gallery", "vote", "gift", "about"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-4 rounded-lg text-sm md:text-base font-semibold capitalize transition-all inline-flex items-center justify-center h-8 md:h-10 ${
                    activeTab === tab
                      ? "bg-rose-600 text-white shadow-lg"
                      : "bg-white/80 text-gray-700 hover:bg-rose-300 hover:shadow"
                  }`}
                  style={{ lineHeight: '1' }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Sections based on Active Tab */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="content-section"
          >
            {/* Gallery Section - Using the Gallery component */}
            {activeTab === "gallery" && (
              <Gallery
                images={galleryImages}
                isOwner={isOwner}
                onUpload={handleGalleryUpload}
                onDelete={handleDeleteImage}
                onAddCaption={handleAddCaption}
              />
            )}

            {/* Vote Section */}
            {activeTab === "vote" && (
              <div ref={voteRef} id="vote" className="py-6 md:py-8 px-4">
                <VoteSection candidate={candidate} />
              </div>
            )}

            {/* Gift Section */}
            {activeTab === "gift" && (
              <div ref={giftRef} id="gift" className="py-6 md:py-8 px-4">
                <GiftSection candidate={candidate} />
              </div>
            )}

            {/* About Section */}
            {activeTab === "about" && (
              <section className="py-6 md:py-8 px-4 max-w-4xl mx-auto">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-xl"
                >
                  <h2 className="text-lg md:text-2xl font-bold mb-3 text-center">
                    <span className="text-gray-800">About</span>{" "}
                    <span className="text-red-600">{candidate.name}</span>
                  </h2>
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed text-center">
                    {candidate.bio}
                  </p>
                </motion.div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer - Hidden on mobile */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}