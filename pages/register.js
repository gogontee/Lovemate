// pages/register.js
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Countdown from "../components/Countdown";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";
import { Heart, CheckCircle, ExternalLink, LayoutDashboard } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "", full_name: "", email: "", phone: "", country: "", age: "", occupation: "", gender: "",
    instagram_handle: "", tiktok_handle: "", ever_married: "", reality_show: "",
    why_here: "", would_propose: "", bio: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingCandidate, setCheckingCandidate] = useState(true);
  const [hasCandidatePage, setHasCandidatePage] = useState(false);
  const [candidateData, setCandidateData] = useState(null);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showNetworkErrorModal, setShowNetworkErrorModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonText, setButtonText] = useState("Submit Application");
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [submittedCandidateId, setSubmittedCandidateId] = useState("");
  const [processingStep, setProcessingStep] = useState(1);
  const [processingMessage, setProcessingMessage] = useState("");
  
  const [registrationStatus, setRegistrationStatus] = useState('not_started');
  const [showTermsAlert, setShowTermsAlert] = useState(false);

  const profileInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const formTopRef = useRef(null); 

  const playScrollSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, ctx.currentTime); 
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2); 
      
      gain.gain.setValueAtTime(0, ctx.currentTime); 
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05); 
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); 
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  useEffect(() => {
    checkAuthAndCandidate();
    checkRegistrationStatus();
  }, []);

  const checkRegistrationStatus = async () => {
    const { data } = await supabase.from("lovemate").select("reg_open, reg_closed").single();
    if (data) {
      const now = new Date().getTime();
      const open = new Date(data.reg_open).getTime();
      const closed = new Date(data.reg_closed).getTime();
      if (now < open) setRegistrationStatus('not_started');
      else if (now >= open && now < closed) setRegistrationStatus('open');
      else setRegistrationStatus('closed');
    }
  };

  const checkAuthAndCandidate = async () => {
    setLoading(true);
    setCheckingCandidate(true);
    
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      setUser(null);
      setLoading(false);
      setCheckingCandidate(false);
      return;
    }

    setUser(authUser);

    const { data: candidateData } = await supabase
      .from("candidates")
      .select("*")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (candidateData) {
      setHasCandidatePage(true);
      setCandidateData(candidateData);
      setCheckingCandidate(false);
      setLoading(false);
      setShowCandidateModal(true);
      return;
    }

    setHasCandidatePage(false);
    setCheckingCandidate(false);
    setLoading(false);
    
    if (registrationStatus === 'open') {
      const savedData = localStorage.getItem('registrationFormData');
      if (savedData) setFormData(JSON.parse(savedData));
    }
  };

  useEffect(() => {
    if (user && !hasCandidatePage && registrationStatus === 'open') {
      localStorage.setItem('registrationFormData', JSON.stringify(formData));
    }
  }, [formData, user, hasCandidatePage, registrationStatus]);

  useEffect(() => {
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.values(formData).filter(value => value && value.toString().trim() !== '').length;
    setProgress(Math.round((filledFields / totalFields) * 100));
  }, [formData]);

  useEffect(() => {
    return () => {
      if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
      galleryPreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [profilePhotoPreview, galleryPreviews]);

  const handleChange = (e) => {
    if (registrationStatus !== 'open') return;
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfilePhotoChange = (e) => {
    if (registrationStatus !== 'open') return;
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
      setProfilePhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryPhotosChange = (e) => {
    if (registrationStatus !== 'open') return;
    const files = Array.from(e.target.files);
    if (galleryPhotos.length + files.length > 6) {
      alert(`You can only upload up to 6 images.`);
      return;
    }
    setGalleryPhotos(prev => [...prev, ...files]);
    setGalleryPreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
  };

  const removeGalleryImage = (index) => {
    if (registrationStatus !== 'open') return;
    setGalleryPhotos(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(galleryPreviews[index]);
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeProfilePhoto = () => {
    if (registrationStatus !== 'open') return;
    setProfilePhoto(null);
    if (profilePhotoPreview) {
      URL.revokeObjectURL(profilePhotoPreview);
      setProfilePhotoPreview(null);
    }
    if (profileInputRef.current) profileInputRef.current.value = '';
  };

  const nextStep = () => {
    if (registrationStatus !== 'open') return;
    if (validateStep()) {
      playScrollSound(); 
      setCurrentStep(prev => prev + 1);
      
      if (formTopRef.current) {
        const yOffset = -80; 
        const y = formTopRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  };

  const prevStep = () => {
    if (registrationStatus !== 'open') return;
    setCurrentStep(prev => prev - 1);
    if (formTopRef.current) {
      const yOffset = -80;
      const y = formTopRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const validateStep = () => {
    setError("");
    if (currentStep === 1) {
      const required = ['name', 'full_name', 'email', 'phone', 'country', 'age', 'gender'];
      for (let field of required) if (!formData[field]) return setError("Please fill in all required fields."), false;
      if (formData.age < 18) return setError("You must be 18 or older to apply."), false;
    }
    if (currentStep === 2) {
      if (!profilePhoto) return setError("Please upload a profile photo."), false;
      if (galleryPhotos.length < 4) return setError(`Please upload at least 4 gallery images (currently ${galleryPhotos.length}/4).`), false;
    }
    if (currentStep === 3) {
      if (!acceptedTerms) return setError("Please check the Terms and Conditions box before you can proceed."), false;
      if (formData.bio.length < 100) return setError("Your bio must be at least 100 characters."), false;
    }
    return true;
  };

  const handleTermsChange = (e) => {
    setAcceptedTerms(e.target.checked);
    if (e.target.checked) setShowTermsAlert(false); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (registrationStatus !== 'open') return setError("Registration is not currently open.");
    if (!user) return setShowLoginModal(true);
    if (hasCandidatePage) return setShowCandidateModal(true);
    
    if (!acceptedTerms) {
      setError("Please check the Terms and Conditions box before you can proceed.");
      setShowTermsAlert(true); 
      setTimeout(() => setShowTermsAlert(false), 3000); 
      return;
    }

    setShowProcessingModal(true);
    setProcessingStep(1);
    setProcessingMessage("Preparing your application...");
    setIsSubmitting(true);
    setButtonText("Submitting Application...");

    try {
      setProcessingStep(1);
      const profilePath = `candidates/${Date.now()}-${profilePhoto.name}`;
      const { error: profileError } = await supabase.storage.from("asset").upload(profilePath, profilePhoto);
      if (profileError) throw new Error(profileError.message);
      const { data: { publicUrl: profileUrl } } = supabase.storage.from("asset").getPublicUrl(profilePath);

      const galleryUrls = [];
      for (let i = 0; i < galleryPhotos.length; i++) {
        setProcessingMessage(`Uploading gallery image ${i + 1} of ${galleryPhotos.length}...`);
        const path = `gallery/${Date.now()}-${i}-${galleryPhotos[i].name}`;
        const { error: galleryError } = await supabase.storage.from("asset").upload(path, galleryPhotos[i]);
        if (galleryError) throw new Error(galleryError.message);
        const { data: { publicUrl } } = supabase.storage.from("asset").getPublicUrl(path);
        galleryUrls.push(publicUrl);
      }

      setProcessingStep(2);
      setProcessingMessage("Saving your information...");
      
      const { data: insertedData, error: insertError } = await supabase.from("candidates").insert([{
        user_id: user.id, ...formData, image_url: profileUrl, gallery: galleryUrls, created_at: new Date().toISOString(),
      }]).select("id");

      if (insertError) throw new Error(insertError.message);

      setProcessingStep(3);
      setProcessingMessage("Finalizing your registration...");
      await new Promise(resolve => setTimeout(resolve, 800));

      setSubmittedCandidateId(insertedData?.[0]?.id);
      localStorage.removeItem('registrationFormData');
      
      setShowProcessingModal(false);
      setShowSuccessModal(true);
      setFormData({
        name: "", full_name: "", email: "", phone: "", country: "", age: "", occupation: "", gender: "",
        instagram_handle: "", tiktok_handle: "", ever_married: "", reality_show: "",
        why_here: "", would_propose: "", bio: "",
      });
      setProfilePhoto(null); setProfilePhotoPreview(null); setGalleryPhotos([]); setGalleryPreviews([]);
      setCurrentStep(1); setButtonText("Submitted! ✅");
    } catch (err) {
      setShowProcessingModal(false);
      if (err.message?.includes("fetch") || err.message?.includes("network")) setShowNetworkErrorModal(true);
      else setError(err.message || "Something went wrong.");
      setButtonText("Submit Application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || checkingCandidate) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-[#DC143C] border-t-transparent rounded-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Apply Now – Lovemate Show (18+)</title>
      </Head>

      <Header />
      
      <main className="bg-[#0a0a0f] min-h-screen pb-20 md:pb-0 overflow-hidden">
        
        {/* Hero Section */}
        <section className="relative w-full aspect-[14/9] md:aspect-[16/7] overflow-hidden">
          <Image
            src="/hero/hero11.jpg"
            alt="LoveMate Registration"
            fill
            className="object-cover object-center"
            priority
            unoptimized
          />
          
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/95 via-[#0a0a0f]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-90" />

          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {[...Array(8)].map((_, i) => {
              const topPos = Math.random() * 100;
              const leftPos = Math.random() * 100;
              const size = Math.random() * 15 + 10;
              return (
                <motion.div
                  key={i}
                  initial={{ top: `${topPos}%`, left: `${leftPos}%`, opacity: Math.random() * 0.2 + 0.1, scale: Math.random() * 0.5 + 0.5 }}
                  animate={{ y: [0, -30, 0], x: [0, Math.random() * 20 - 10, 0], rotate: [0, Math.random() * 360, 0] }}
                  transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 5 }}
                  className="absolute text-[#DC143C]"
                >
                  <Heart size={size} fill="currentColor" />
                </motion.div>
              );
            })}
          </div>
          
          <div className="absolute inset-0 flex flex-col justify-center items-start z-10">
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-start gap-4 md:gap-6">
              <Countdown />
              
              {hasCandidatePage ? (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-left max-w-xs md:max-w-md mt-2 md:mt-4"
                >
                  <h1 className="text-xl md:text-3xl font-black text-white mb-2 leading-tight tracking-tight">
                    We noticed you already registered as a <span className="text-[#DC143C]">candidate</span>
                  </h1>
                  <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
                    <Link 
                      href={`/candidate/${candidateData?.id}`}
                      className="flex items-center justify-center gap-2 bg-[#DC143C] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#B80B35] transition-all shadow-md"
                    >
                      <ExternalLink className="w-4 h-4" /> See Your Public Page
                    </Link>
                    <Link 
                      href="/dashboard"
                      className="flex items-center justify-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-white/20 transition-all border border-white/20"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-left max-w-xs md:max-w-md mt-2 md:mt-4"
                >
                  <h1 className="text-xl md:text-3xl font-black text-white mb-1 leading-tight tracking-tight">
                    The journey <span className="text-[#DC143C]">begins here</span>
                  </h1>
                  <p className="text-[10px] md:text-sm text-gray-300 font-medium">
                    Use the form below to register.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Form Section */}
        <div className="max-w-4xl mx-auto py-12 px-4" ref={formTopRef}>
          
          {registrationStatus !== 'open' && (
            <div className="mb-6 bg-[#121216] rounded-xl shadow-lg border border-[#DC143C]/30 p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                {registrationStatus === 'not_started' ? 'Registration Not Yet Open' : 'Registration Closed'}
              </h3>
              <p className="text-gray-400 text-sm">
                {registrationStatus === 'not_started' ? 'Check the countdown above for opening dates.' : 'Thank you for your interest! Follow us for future seasons.'}
              </p>
            </div>
          )}

          {!user && registrationStatus === 'open' && (
            <div className="mb-6 bg-[#121216] rounded-xl shadow-lg border border-[#DC143C]/30 p-6 text-center">
              <div className="text-5xl mb-4">🔐</div>
              <h3 className="text-xl font-bold text-white mb-2">Login Required</h3>
              <p className="text-gray-400 mb-4">You need to be logged in to submit an application.</p>
              <div className="flex gap-3 justify-center">
                <Link href="/auth/login" className="px-6 py-2 bg-[#DC143C] text-white rounded-lg font-semibold hover:bg-[#B80B35] transition-colors">Log In</Link>
                <Link href="/auth/signup" className="px-6 py-2 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors">Sign Up</Link>
              </div>
            </div>
          )}

          {registrationStatus === 'open' && user && !hasCandidatePage && (
            <div className="bg-[#121216] rounded-xl shadow-md p-4 mb-6 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Application Progress</span>
                <span className="text-xs font-bold text-[#DC143C]">{progress}%</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-2">
                <motion.div className="bg-[#DC143C] h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
              </div>
            </div>
          )}

          {registrationStatus === 'open' && user && !hasCandidatePage && (
            <div className="flex justify-between items-center mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex-1 text-center">
                  <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-lg border-2 transition-colors ${currentStep >= step ? 'bg-[#DC143C] border-[#DC143C] text-white' : 'border-gray-600 text-gray-500'}`}>
                    {step}
                  </div>
                  <div className={`text-xs mt-2 font-bold uppercase tracking-wider ${currentStep >= step ? 'text-[#DC143C]' : 'text-gray-500'}`}>
                    {step === 1 && 'Personal'}
                    {step === 2 && 'Media'}
                    {step === 3 && 'Final'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {registrationStatus === 'open' && user && !hasCandidatePage && (
            <form onSubmit={handleSubmit} className="bg-[#121216] rounded-2xl shadow-xl p-6 md:p-8 border border-white/5">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span className="bg-[#DC143C]/20 text-[#DC143C] w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                      Personal Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Nickname *" name="name" value={formData.name} onChange={handleChange} placeholder="How should we call you?" disabled={registrationStatus !== 'open'} />
                      <InputField label="Full Name *" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="As on ID" disabled={registrationStatus !== 'open'} />
                      <InputField label="Email *" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" disabled={registrationStatus !== 'open'} />
                      <InputField label="Phone Number *" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+234 XXX XXX XXXX" disabled={registrationStatus !== 'open'} />
                      <InputField label="Country *" name="country" value={formData.country} onChange={handleChange} placeholder="Nigeria" disabled={registrationStatus !== 'open'} />
                      <InputField label="Age *" name="age" type="number" min="18" max="60" value={formData.age} onChange={handleChange} placeholder="Must be 18+" disabled={registrationStatus !== 'open'} />
                      <InputField label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange} placeholder="What do you do?" disabled={registrationStatus !== 'open'} />
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Gender *</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} required disabled={registrationStatus !== 'open'} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/50 text-white focus:ring-2 focus:ring-[#DC143C] focus:border-transparent transition-all appearance-none">
                          <option value="" className="bg-[#121216]">Select</option>
                          <option value="male" className="bg-[#121216]">Male</option>
                          <option value="female" className="bg-[#121216]">Female</option>
                          <option value="non-binary" className="bg-[#121216]">Non-binary</option>
                          <option value="prefer-not" className="bg-[#121216]">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span className="bg-[#DC143C]/20 text-[#DC143C] w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                      Media & Social
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Instagram Handle" name="instagram_handle" value={formData.instagram_handle} onChange={handleChange} placeholder="@username" disabled={registrationStatus !== 'open'} />
                      <InputField label="TikTok Handle" name="tiktok_handle" value={formData.tiktok_handle} onChange={handleChange} placeholder="@username" disabled={registrationStatus !== 'open'} />
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Ever Married? *</label>
                        <select name="ever_married" value={formData.ever_married} onChange={handleChange} required disabled={registrationStatus !== 'open'} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/50 text-white focus:ring-2 focus:ring-[#DC143C] focus:border-transparent transition-all appearance-none">
                          <option value="" className="bg-[#121216]">Select</option>
                          <option value="yes" className="bg-[#121216]">Yes</option>
                          <option value="no" className="bg-[#121216]">No</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Reality TV Experience? *</label>
                        <select name="reality_show" value={formData.reality_show} onChange={handleChange} required disabled={registrationStatus !== 'open'} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/50 text-white focus:ring-2 focus:ring-[#DC143C] focus:border-transparent transition-all appearance-none">
                          <option value="" className="bg-[#121216]">Select</option>
                          <option value="yes" className="bg-[#121216]">Yes</option>
                          <option value="no" className="bg-[#121216]">No</option>
                        </select>
                        <p className="text-[10px] text-gray-500 mt-1 italic">Have you ever participated in any reality TV show before?</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Profile Photo *</label>
                      {profilePhotoPreview ? (
                        <div className="relative w-32 h-32 mx-auto">
                          <Image src={profilePhotoPreview} alt="Profile preview" fill className="object-cover rounded-xl" />
                          <button type="button" onClick={removeProfilePhoto} className="absolute -top-2 -right-2 bg-[#DC143C] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-[#B80B35]">×</button>
                        </div>
                      ) : (
                        <div onClick={() => registrationStatus === 'open' && profileInputRef.current?.click()} className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center transition-colors hover:border-[#DC143C] cursor-pointer bg-black/20">
                          <div className="text-4xl mb-2">📸</div>
                          <p className="text-[#DC143C] font-medium">Click to upload profile photo</p>
                          <p className="text-xs text-gray-500 mt-1">High quality photo, face clearly visible</p>
                        </div>
                      )}
                      <input ref={profileInputRef} type="file" accept="image/*" onChange={handleProfilePhotoChange} className="hidden" />
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Gallery Photos (Min 4, Max 6) *</label>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {galleryPreviews.map((preview, index) => (
                          <div key={index} className="relative aspect-square">
                            <Image src={preview} alt={`Gallery ${index + 1}`} fill className="object-cover rounded-lg" />
                            <button type="button" onClick={() => removeGalleryImage(index)} className="absolute -top-1 -right-1 bg-[#DC143C] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-[#B80B35]">×</button>
                          </div>
                        ))}
                        {galleryPhotos.length < 6 && (
                          <div onClick={() => registrationStatus === 'open' && galleryInputRef.current?.click()} className="aspect-square border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center transition-colors hover:border-[#DC143C] cursor-pointer bg-black/20">
                            <span className="text-2xl text-[#DC143C]">+</span>
                            <span className="text-xs text-[#DC143C] mt-1">Add</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{galleryPhotos.length}/6 images uploaded</p>
                      <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryPhotosChange} className="hidden" />
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span className="bg-[#DC143C]/20 text-[#DC143C] w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                      Your Application
                    </h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Why are you here? *</label>
                      <select name="why_here" value={formData.why_here} onChange={handleChange} required disabled={registrationStatus !== 'open'} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/50 text-white focus:ring-2 focus:ring-[#DC143C] focus:border-transparent transition-all appearance-none">
                        <option value="" className="bg-[#121216]">Select</option>
                        <option value="love" className="bg-[#121216]">Looking for Love</option>
                        <option value="fame" className="bg-[#121216]">Fame & Exposure</option>
                        <option value="both" className="bg-[#121216]">Both Love & Fame</option>
                        <option value="experience" className="bg-[#121216]">Life Experience</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Would you propose? *</label>
                      <select name="would_propose" value={formData.would_propose} onChange={handleChange} required disabled={registrationStatus !== 'open'} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/50 text-white focus:ring-2 focus:ring-[#DC143C] focus:border-transparent transition-all appearance-none">
                        <option value="" className="bg-[#121216]">Select</option>
                        <option value="yes" className="bg-[#121216]">Yes, if I found the right person</option>
                        <option value="no" className="bg-[#121216]">No, I need more time</option>
                        <option value="maybe" className="bg-[#121216]">Maybe, depends on connection</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Would you like to tell us a little about you? (100-1000 characters) *</label>
                      <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Don't be shy! Tell us about yourself, your personality, what makes you unique..." required minLength={100} maxLength={1000} rows={5} className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/50 text-white focus:ring-2 focus:ring-[#DC143C] focus:border-transparent transition-all" />
                      <p className="text-xs text-gray-500 mt-1 flex justify-between">
                        <span>Minimum 100 characters</span>
                        <span className={formData.bio.length < 100 ? 'text-red-400' : 'text-green-400'}>{formData.bio.length}/1000</span>
                      </p>
                    </div>

                    <div className={`mt-6 p-4 rounded-xl border transition-all duration-300 ${
                      showTermsAlert 
                        ? 'bg-red-500/20 border-red-500 ring-2 ring-red-500 animate-pulse' 
                        : 'bg-[#DC143C]/10 border-[#DC143C]/20'
                    }`}>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={acceptedTerms} 
                          onChange={handleTermsChange} 
                          className="mt-1 w-4 h-4 accent-[#DC143C] rounded cursor-pointer" 
                        />
                        <span className={`text-sm ${showTermsAlert ? 'text-red-200 font-semibold' : 'text-gray-300'}`}>
                          I confirm that I am 18 years or older and have read and agree to the <Link href="/termsofparticipation" className="text-[#DC143C] font-bold hover:underline">Terms of Participation</Link>.
                        </span>
                      </label>
                      {showTermsAlert && (
                        <p className="text-xs text-red-400 font-bold mt-2 ml-7 animate-pulse">
                          Please check this box to proceed!
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">{error}</div>}

              <div className="flex justify-between mt-8 gap-2">
                {currentStep > 1 && (
                  <button type="button" onClick={prevStep} className="px-6 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors font-medium">← Back</button>
                )}
                <div className="flex-1"></div>
                {currentStep < 3 ? (
                  <button type="button" onClick={nextStep} className="px-8 py-3 bg-[#DC143C] text-white rounded-xl hover:bg-[#B80B35] transition-colors font-bold shadow-[0_0_15px_rgba(220,20,60,0.4)]">Next →</button>
                ) : (
                  <button type="submit" disabled={isSubmitting} className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all ${isSubmitting ? 'bg-gray-600 cursor-not-allowed text-gray-300' : 'bg-[#DC143C] hover:bg-[#B80B35] text-white shadow-[0_0_15px_rgba(220,20,60,0.4)]'}`}>
                    {isSubmitting ? 'Submitting...' : buttonText}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </main>

      {/* --- MODALS --- */}
      {/* Processing Modal */}
      <AnimatePresence>
        {showProcessingModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#121216] border border-[#DC143C]/30 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-[#DC143C] border-t-transparent rounded-full mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Processing</h2>
              <p className="text-gray-400 text-sm mb-4">{processingMessage}</p>
              
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
                <p className="text-xs text-red-400 font-semibold">
                  ⚠️ Please do not close or refresh this page until you see the success message.
                </p>
              </div>

              <div className="bg-black/40 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className={processingStep >= 1 ? 'text-[#DC143C] font-bold' : 'text-gray-500'}>📸 Uploading</span>
                  <span className={processingStep >= 2 ? 'text-[#DC143C] font-bold' : 'text-gray-500'}>💾 Saving</span>
                  <span className={processingStep >= 3 ? 'text-[#DC143C] font-bold' : 'text-gray-500'}>✅ Finalizing</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                  <motion.div className="bg-[#DC143C] h-1.5 rounded-full" initial={{ width: "0%" }} animate={{ width: `${processingStep * 33.33}%` }} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal - UPDATED WITH DOUBLE CTA */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#121216] border border-[#DC143C]/30 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="text-6xl mb-4">🎉</motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Application Received!</h2>
              <p className="text-gray-400 text-sm mb-6">
                Congratulations! Your Lovemate public page has been created successfully.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => router.push(`/candidate/${submittedCandidateId}`)}
                  className="w-full px-6 py-3 bg-[#DC143C] text-white rounded-xl font-bold hover:bg-[#B80B35] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,20,60,0.4)]"
                >
                  <ExternalLink className="w-5 h-5" /> See Your Page
                </button>
                
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full px-6 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2 border border-white/20"
                >
                  <LayoutDashboard className="w-5 h-5" /> Go to Dashboard
                </button>

                <button 
                  onClick={() => setShowSuccessModal(false)} 
                  className="w-full px-6 py-2 bg-transparent text-gray-400 rounded-xl font-semibold hover:text-white transition-all text-sm mt-2"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#121216] border border-[#DC143C]/30 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
              <div className="text-5xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
              <p className="text-gray-400 text-sm mb-6">Please log in to continue your application.</p>
              <Link href="/auth/login" className="block w-full px-6 py-3 bg-[#DC143C] text-white rounded-xl font-bold hover:bg-[#B80B35] transition-all mb-3">Log In</Link>
              <button onClick={() => setShowLoginModal(false)} className="w-full px-6 py-3 bg-white/5 text-gray-300 rounded-xl font-bold hover:bg-white/10 transition-all">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Candidate Exists Modal */}
      <AnimatePresence>
        {showCandidateModal && candidateData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#121216] border border-[#DC143C]/30 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
              <div className="text-5xl mb-4">🎭</div>
              <h2 className="text-2xl font-bold text-white mb-2">You're Already a Candidate!</h2>
              <p className="text-gray-400 text-sm mb-6">You currently own a candidacy page. Check your dashboard to see your page.</p>
              {candidateData && (
                <div className="bg-black/40 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-400 mb-1">Your Candidate Page:</p>
                  <p className="text-lg font-bold text-[#DC143C]">{candidateData.name || "Unnamed"}</p>
                </div>
              )}
              <button onClick={() => router.push('/dashboard')} className="w-full px-6 py-3 bg-[#DC143C] text-white rounded-xl font-bold hover:bg-[#B80B35] transition-all mb-3">Go to Dashboard</button>
              <button onClick={() => setShowCandidateModal(false)} className="w-full px-6 py-3 bg-white/5 text-gray-300 rounded-xl font-bold hover:bg-white/10 transition-all">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Network Error Modal */}
      <AnimatePresence>
        {showNetworkErrorModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#121216] border border-[#DC143C]/30 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
              <div className="text-5xl mb-4">🌐</div>
              <h2 className="text-2xl font-bold text-white mb-2">Network Issue Detected</h2>
              <p className="text-gray-400 text-sm mb-6">We're having trouble connecting. Please check your internet and try again.</p>
              <button onClick={() => { setShowNetworkErrorModal(false); handleSubmit(new Event('submit')); }} className="w-full px-6 py-3 bg-[#DC143C] text-white rounded-xl font-bold hover:bg-[#B80B35] transition-all mb-3">Try Again</button>
              <button onClick={() => setShowNetworkErrorModal(false)} className="w-full px-6 py-3 bg-white/5 text-gray-300 rounded-xl font-bold hover:bg-white/10 transition-all">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pb-20 md:pb-0">
        <Footer />
      </div>
    </>
  );
}

function InputField({ label, name, type = "text", value, onChange, placeholder, disabled, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <input
        type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/50 text-white placeholder-gray-600 focus:ring-2 focus:ring-[#DC143C] focus:border-transparent transition-all disabled:bg-gray-800 disabled:cursor-not-allowed"
        {...props}
      />
    </div>
  );
}