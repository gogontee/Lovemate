import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabaseClient";
import EventSchedule from "../components/EventSchedule";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Register() {
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info (Step 1)
    name: "",
    full_name: "",
    email: "",
    phone: "",
    country: "",
    age: "",
    occupation: "",
    gender: "",
    
    // Social & Background (Step 2)
    instagram_handle: "",
    tiktok_handle: "",
    ever_married: "",
    reality_show: "",
    
    // Application Questions (Step 3)
    why_here: "",
    intention: "",
    would_propose: "",
    bio: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [user, setUser] = useState(null);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonText, setButtonText] = useState("Submit Application");
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Hero section state
  const [desktopHero, setDesktopHero] = useState([]);
  const [mobileHero, setMobileHero] = useState([]);
  const [currentDesktopIndex, setCurrentDesktopIndex] = useState(0);
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);
  const desktopIntervalRef = useRef(null);
  const mobileIntervalRef = useRef(null);

  // File input refs
  const profileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('registrationFormData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Fetch hero content
  useEffect(() => {
    fetchHeroContent();
    return () => {
      if (desktopIntervalRef.current) clearInterval(desktopIntervalRef.current);
      if (mobileIntervalRef.current) clearInterval(mobileIntervalRef.current);
    };
  }, []);

  // Auto-slide for desktop hero
  useEffect(() => {
    if (desktopHero.length > 1) {
      desktopIntervalRef.current = setInterval(() => {
        setCurrentDesktopIndex((prev) => (prev + 1) % desktopHero.length);
      }, 5000);
    }
    return () => {
      if (desktopIntervalRef.current) clearInterval(desktopIntervalRef.current);
    };
  }, [desktopHero]);

  // Auto-slide for mobile hero
  useEffect(() => {
    if (mobileHero.length > 1) {
      mobileIntervalRef.current = setInterval(() => {
        setCurrentMobileIndex((prev) => (prev + 1) % mobileHero.length);
      }, 5000);
    }
    return () => {
      if (mobileIntervalRef.current) clearInterval(mobileIntervalRef.current);
    };
  }, [mobileHero]);

  const fetchHeroContent = async () => {
    try {
      const { data, error } = await supabase
        .from('lovemate')
        .select('form_hero, mobile_form_hero')
        .single();

      if (error) throw error;

      console.log('Hero data:', data); // Debug log

      // Parse desktop hero - ratio 1000:200
      if (data?.form_hero) {
        const desktopHeroes = Array.isArray(data.form_hero) ? data.form_hero : [data.form_hero];
        setDesktopHero(desktopHeroes);
      }

      // Parse mobile hero - ratio 1000:400
      if (data?.mobile_form_hero) {
        const mobileHeroes = Array.isArray(data.mobile_form_hero) ? data.mobile_form_hero : [data.mobile_form_hero];
        setMobileHero(mobileHeroes);
      }
    } catch (error) {
      console.error('Error fetching hero content:', error);
    }
  };

  // Save to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem('registrationFormData', JSON.stringify(formData));
  }, [formData]);

  // Calculate progress percentage
  useEffect(() => {
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.values(formData).filter(value => value && value.toString().trim() !== '').length;
    const calculatedProgress = Math.round((filledFields / totalFields) * 100);
    setProgress(calculatedProgress);
  }, [formData]);

  // Get user on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
      galleryPreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [profilePhotoPreview, galleryPreviews]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      // Create preview
      if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
      setProfilePhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryPhotosChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = galleryPhotos.length + files.length;
    
    if (totalImages > 6) {
      alert(`You can only upload up to 6 images. You currently have ${galleryPhotos.length} and are trying to add ${files.length} more.`);
      return;
    }

    // Create previews for new files
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setGalleryPhotos(prev => [...prev, ...files]);
    setGalleryPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeGalleryImage = (index) => {
    setGalleryPhotos(prev => prev.filter((_, i) => i !== index));
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(galleryPreviews[index]);
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeProfilePhoto = () => {
    setProfilePhoto(null);
    if (profilePhotoPreview) {
      URL.revokeObjectURL(profilePhotoPreview);
      setProfilePhotoPreview(null);
    }
    if (profileInputRef.current) {
      profileInputRef.current.value = '';
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateStep = () => {
    setError("");
    
    if (currentStep === 1) {
      const required = ['name', 'full_name', 'email', 'phone', 'country', 'age', 'gender'];
      for (let field of required) {
        if (!formData[field]) {
          setError("Please fill in all required fields in this section");
          return false;
        }
      }
      if (formData.age < 18) {
        setError("You must be 18 or older to apply");
        return false;
      }
    }
    
    if (currentStep === 2) {
      if (!profilePhoto) {
        setError("Please upload a profile photo");
        return false;
      }
      if (galleryPhotos.length < 4) {
        setError(`Please upload at least 4 gallery images (currently ${galleryPhotos.length}/4)`);
        return false;
      }
    }
    
    if (currentStep === 3) {
      if (!acceptedTerms) {
        setError("You must accept the Terms of Participation to continue");
        return false;
      }
      if (formData.bio.length < 100) {
        setError("Your bio must be at least 100 characters");
        return false;
      }
    }
    
    return true;
  };

  const handleUploads = async () => {
    const profilePath = `candidates/${Date.now()}-${profilePhoto.name}`;
    const galleryPaths = galleryPhotos.map(
      (file, index) => `gallery/${Date.now()}-${index}-${file.name}`
    );

    // Upload profile photo
    const { error: profileUploadError } = await supabase.storage
      .from("asset")
      .upload(profilePath, profilePhoto);

    if (profileUploadError) {
      throw new Error(`Profile photo upload failed: ${profileUploadError.message}`);
    }

    const { data: { publicUrl: profileUrl } } = supabase.storage
      .from("asset")
      .getPublicUrl(profilePath);

    // Upload gallery photos
    const galleryUrls = [];
    for (let i = 0; i < galleryPhotos.length; i++) {
      const file = galleryPhotos[i];
      const path = galleryPaths[i];

      const { error: galleryUploadError } = await supabase.storage
        .from("asset")
        .upload(path, file);

      if (galleryUploadError) {
        throw new Error(`Gallery image ${i + 1} upload failed: ${galleryUploadError.message}`);
      }

      const { data: { publicUrl: galleryUrl } } = supabase.storage
        .from("asset")
        .getPublicUrl(path);

      galleryUrls.push(galleryUrl);
    }

    return { profileUrl, galleryUrls };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!acceptedTerms) {
      setError("You must accept the Terms of Participation");
      return;
    }

    setIsSubmitting(true);
    setButtonText("Submitting Application...");

    try {
      const { profileUrl, galleryUrls } = await handleUploads();

      const { error: insertError } = await supabase.from("candidates").insert([
        {
          user_id: user.id,
          name: formData.name,
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          age: formData.age,
          occupation: formData.occupation,
          instagram_handle: formData.instagram_handle,
          tiktok_handle: formData.tiktok_handle,
          gender: formData.gender,
          ever_married: formData.ever_married,
          reality_show: formData.reality_show,
          why_here: formData.why_here,
          intention: formData.intention,
          would_propose: formData.would_propose,
          bio: formData.bio,
          image_url: profileUrl,
          gallery: galleryUrls,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        console.error("Insert error:", insertError);
        setError("Failed to save your data. Please try again.");
        setButtonText("Submit Application");
        setIsSubmitting(false);
        return;
      }

      // Clear localStorage after successful submission
      localStorage.removeItem('registrationFormData');
      
      setShowSuccessModal(true);
      setFormData({
        name: "", full_name: "", email: "", phone: "", country: "", age: "",
        occupation: "", instagram_handle: "", tiktok_handle: "", gender: "",
        ever_married: "", reality_show: "", why_here: "", intention: "",
        would_propose: "", bio: "",
      });
      setProfilePhoto(null);
      setProfilePhotoPreview(null);
      setGalleryPhotos([]);
      setGalleryPreviews([]);
      setCurrentStep(1);
      setButtonText("Submitted! ✅");
    } catch (err) {
      console.error("Submission error:", err);
      setError("Something went wrong. Please try again.");
      setButtonText("Submit Application");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current hero content
  const currentDesktopHero = desktopHero[currentDesktopIndex] || {
    image: null,
    title: "What is waiting for you in the house?",
    subtitle: "Join the experience"
  };

  const currentMobileHero = mobileHero[currentMobileIndex] || {
    image: null,
    title: "What is waiting for you in the house?",
    subtitle: "Join the experience"
  };

  return (
    <>
      <Head>
        <title>Apply Now – Lovemate Show (18+)</title>
        <meta name="description" content="Apply to be a contestant on Lovemate Show - Nigeria's premier adult reality TV series. Must be 18+." />
      </Head>

      <Header />
      
      <main className="bg-gradient-to-br from-pink-50 via-white to-rose-50 min-h-screen pb-20 md:pb-0">
        {/* Desktop Hero Section - Hidden on mobile, ratio 1000:200 */}
        <div className="hidden md:block w-full h-[200px] relative overflow-hidden bg-rose-100">
          {currentDesktopHero.image ? (
            <div className="relative w-full h-full">
              <Image
                src={currentDesktopHero.image}
                alt={currentDesktopHero.title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white">
                <h2 className="text-3xl font-bold mb-2">{currentDesktopHero.title}</h2>
                <p className="text-xl">{currentDesktopHero.subtitle}</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-rose-400 to-pink-500 text-white">
              <h2 className="text-3xl font-bold mb-2 px-4 text-center">{currentDesktopHero.title}</h2>
              <p className="text-xl">{currentDesktopHero.subtitle}</p>
            </div>
          )}
          
          {/* Slide indicators */}
          {desktopHero.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {desktopHero.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentDesktopIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentDesktopIndex ? 'bg-white w-4' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mobile Hero Section - Hidden on desktop, ratio 1000:400 */}
        <div className="md:hidden w-full relative bg-rose-100" style={{ aspectRatio: '1000/400' }}>
          {currentMobileHero.image ? (
            <div className="relative w-full h-full">
              <Image
                src={currentMobileHero.image}
                alt={currentMobileHero.title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white px-4">
                <h2 className="text-2xl font-bold mb-2 text-center">{currentMobileHero.title}</h2>
                <p className="text-lg text-center">{currentMobileHero.subtitle}</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-rose-400 to-pink-500 text-white px-4">
              <h2 className="text-2xl font-bold mb-2 text-center">{currentMobileHero.title}</h2>
              <p className="text-lg text-center">{currentMobileHero.subtitle}</p>
            </div>
          )}
          
          {/* Slide indicators for mobile */}
          {mobileHero.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {mobileHero.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMobileIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentMobileIndex ? 'bg-white w-4' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Gap between hero and schedule stats - only on mobile */}
        <div className="md:hidden h-4"></div>

        <div className="max-w-4xl mx-auto py-8 md:py-12 px-4">
          {/* Event Schedule */}
          <div className="mb-4 md:mb-6">
            <EventSchedule
              startDate="2025-08-01T00:00:00"
              endDate="2025-08-15T23:59:59"
            />
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg md:rounded-xl shadow-md p-4 md:p-6 mb-4 md:mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs md:text-sm font-semibold text-gray-700">Application Progress</span>
              <span className="text-xs md:text-sm font-bold text-pink-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
              <motion.div 
                className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 md:h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Step Indicators - Mobile optimized */}
          <div className="flex justify-between items-center mb-6 md:mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex-1 text-center">
                <div className={`relative`}>
                  <div className={`w-8 h-8 md:w-10 md:h-10 mx-auto rounded-full flex items-center justify-center font-bold text-sm md:text-lg
                    ${currentStep >= step 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-gray-300 text-gray-600'}`}>
                    {step}
                  </div>
                  <div className="text-[10px] md:text-sm mt-1 md:mt-2 font-medium text-gray-700">
                    {step === 1 && 'Personal'}
                    {step === 2 && 'Media'}
                    {step === 3 && 'Application'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy Assurance - Mobile optimized */}
          <div className="mb-4 md:mb-6 bg-white/80 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-6 border border-pink-100 shadow-sm">
            <div className="flex items-start gap-2 md:gap-4">
              <div className="text-2xl md:text-3xl">🔒</div>
              <div>
                <h3 className="text-base md:text-lg font-semibold text-pink-600 mb-1 md:mb-2">Your Privacy Matters</h3>
                <p className="text-gray-700 text-xs md:text-sm">
                  Only your <span className="font-semibold">name, country, photos, and bio</span> will be shown publicly if selected. 
                  All other information is strictly confidential.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-3 md:space-y-4"
                >
                  <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                    <span className="bg-pink-100 text-pink-600 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-sm md:text-base">1</span>
                    Personal Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <InputField
                      label="Nickname *"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="How should we call you?"
                      mobile={true}
                    />
                    
                    <InputField
                      label="Full Name *"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="As on ID"
                      mobile={true}
                    />

                    <InputField
                      label="Email *"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      mobile={true}
                    />

                    <InputField
                      label="Phone Number *"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+234 XXX XXX XXXX"
                      mobile={true}
                    />

                    <InputField
                      label="Country *"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Nigeria"
                      mobile={true}
                    />

                    <InputField
                      label="Age *"
                      name="age"
                      type="number"
                      min="18"
                      max="60"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="Must be 18+"
                      mobile={true}
                    />

                    <InputField
                      label="Occupation"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      placeholder="What do you do?"
                      mobile={true}
                    />

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Gender *</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-lg md:rounded-xl border border-gray-300 text-gray-800 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all bg-white"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="prefer-not">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Media Upload & Social */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4 md:space-y-6"
                >
                  <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                    <span className="bg-pink-100 text-pink-600 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-sm md:text-base">2</span>
                    Media & Social
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <InputField
                      label="Instagram Handle"
                      name="instagram_handle"
                      value={formData.instagram_handle}
                      onChange={handleChange}
                      placeholder="@username"
                      mobile={true}
                    />

                    <InputField
                      label="TikTok Handle"
                      name="tiktok_handle"
                      value={formData.tiktok_handle}
                      onChange={handleChange}
                      placeholder="@username"
                      mobile={true}
                    />

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Ever Married? *</label>
                      <select
                        name="ever_married"
                        value={formData.ever_married}
                        onChange={handleChange}
                        required
                        className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-lg md:rounded-xl border border-gray-300 text-gray-800 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Reality TV Experience? *</label>
                      <select
                        name="reality_show"
                        value={formData.reality_show}
                        onChange={handleChange}
                        required
                        className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-lg md:rounded-xl border border-gray-300 text-gray-800 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>

                  {/* Profile Photo Upload with Preview */}
                  <div className="space-y-2 pt-2 md:pt-4">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Profile Photo *</label>
                    
                    {profilePhotoPreview ? (
                      <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto">
                        <Image
                          src={profilePhotoPreview}
                          alt="Profile preview"
                          fill
                          className="object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={removeProfilePhoto}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => profileInputRef.current?.click()}
                        className="border-2 border-dashed border-pink-200 rounded-xl p-4 md:p-6 text-center hover:border-pink-500 transition-colors cursor-pointer"
                      >
                        <div className="text-3xl md:text-4xl mb-2">📸</div>
                        <p className="text-pink-600 font-medium text-sm md:text-base">Click to upload profile photo</p>
                        <p className="text-xs text-gray-500 mt-1">High quality photo, face clearly visible</p>
                      </div>
                    )}
                    
                    <input
                      ref={profileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                      className="hidden"
                    />
                  </div>

                  {/* Gallery Photos with Previews */}
                  <div className="space-y-2 pt-2 md:pt-4">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      Gallery Photos (Minimum 4, Maximum 6) *
                    </label>
                    
                    {/* Gallery Previews Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square">
                          <Image
                            src={preview}
                            alt={`Gallery ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      
                      {/* Add More Button */}
                      {galleryPhotos.length < 6 && (
                        <div 
                          onClick={() => galleryInputRef.current?.click()}
                          className="aspect-square border-2 border-dashed border-pink-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 transition-colors bg-pink-50"
                        >
                          <span className="text-2xl text-pink-400">+</span>
                          <span className="text-xs text-pink-500 mt-1">Add</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      {galleryPhotos.length}/6 images uploaded
                    </p>
                    
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryPhotosChange}
                      className="hidden"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Application Questions */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-3 md:space-y-4"
                >
                  <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                    <span className="bg-pink-100 text-pink-600 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-sm md:text-base">3</span>
                    Your Application
                  </h2>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Why are you here? *</label>
                    <select
                      name="why_here"
                      value={formData.why_here}
                      onChange={handleChange}
                      required
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-lg md:rounded-xl border border-gray-300 text-gray-800 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select</option>
                      <option value="love">Looking for Love</option>
                      <option value="fame">Fame & Exposure</option>
                      <option value="both">Both Love & Fame</option>
                      <option value="experience">Life Experience</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      Here to find Love, Fun or Break hearts? *
                    </label>
                    <input
                      name="intention"
                      type="text"
                      value={formData.intention}
                      onChange={handleChange}
                      placeholder="e.g. I'm here for genuine connection"
                      required
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-lg md:rounded-xl border border-gray-300 text-gray-800 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Would you propose? *</label>
                    <select
                      name="would_propose"
                      value={formData.would_propose}
                      onChange={handleChange}
                      required
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-lg md:rounded-xl border border-gray-300 text-gray-800 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes, if I found the right person</option>
                      <option value="no">No, I need more time</option>
                      <option value="maybe">Maybe, depends on connection</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      About You (100-1000 characters) *
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself, your personality, what makes you unique..."
                      required
                      minLength={100}
                      maxLength={1000}
                      rows={5}
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-lg md:rounded-xl border border-gray-300 text-gray-800 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1 flex justify-between">
                      <span>Minimum 100 characters</span>
                      <span>{formData.bio.length}/1000</span>
                    </p>
                  </div>

                  {/* Terms Acceptance */}
                  <div className="mt-4 md:mt-6 p-3 md:p-4 bg-pink-50 rounded-lg md:rounded-xl">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                      />
                      <span className="text-xs md:text-sm text-gray-700">
                        I confirm that I am 18 years or older and have read and agree to the{' '}
                        <Link href="/termsofparticipation" className="text-pink-600 font-semibold hover:underline">
                          Terms of Participation
                        </Link>
                        .
                      </span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <div className="mt-3 md:mt-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg md:rounded-xl text-red-600 text-xs md:text-sm text-center">
                {error}
              </div>
            )}

            {/* Navigation Buttons - Mobile optimized */}
            <div className="flex justify-between mt-4 md:mt-8 gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 md:px-6 py-2 md:py-3 bg-gray-100 text-gray-700 rounded-lg md:rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm md:text-base"
                >
                  ← Back
                </button>
              )}
              
              <div className="flex-1"></div>
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 md:px-8 py-2 md:py-3 bg-pink-600 text-white rounded-lg md:rounded-xl hover:bg-pink-700 transition-colors font-medium text-sm md:text-base shadow-md hover:shadow-lg"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !acceptedTerms}
                  className={`px-6 md:px-8 py-2 md:py-3 rounded-lg md:rounded-xl font-medium text-sm md:text-base shadow-md transition-all
                    ${isSubmitting || !acceptedTerms
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white hover:shadow-lg'}`}
                >
                  {isSubmitting ? 'Submitting...' : buttonText}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      {/* Success Modal - Mobile optimized */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="text-4xl md:text-6xl mb-3 md:mb-4">🎉</div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Application Received!</h2>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                  Thank you for applying. We'll contact you if selected.
                </p>
                <div className="bg-pink-50 rounded-lg md:rounded-xl p-3 md:p-4 mb-4 md:mb-6">
                  <p className="text-xs md:text-sm text-pink-800">
                    📱 Follow us on social media for updates
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg md:rounded-xl font-semibold text-sm md:text-base hover:from-pink-700 hover:to-rose-700 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal - Mobile optimized */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="text-4xl md:text-5xl mb-3 md:mb-4">🔐</div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Login Required</h2>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                  Please log in to submit your application.
                </p>
                <div className="space-y-2 md:space-y-3">
                  <Link
                    href="/login"
                    className="block w-full px-4 md:px-6 py-2 md:py-3 bg-pink-600 text-white rounded-lg md:rounded-xl font-semibold text-sm md:text-base hover:bg-pink-700 transition-all"
                  >
                    Log In
                  </Link>
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="w-full px-4 md:px-6 py-2 md:py-3 bg-gray-100 text-gray-700 rounded-lg md:rounded-xl font-semibold text-sm md:text-base hover:bg-gray-200 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer - Hidden on mobile */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}

// Reusable Input Component - Mobile optimized
function InputField({ label, name, type = "text", value, onChange, placeholder, mobile, ...props }) {
  return (
    <div>
      <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base rounded-lg md:rounded-xl border border-gray-300 text-gray-800 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
        {...props}
      />
    </div>
  );
}