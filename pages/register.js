// pages/register.js
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import EventSchedule from "../components/EventSchedule";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "", // nickname
    full_name: "",
    email: "",
    phone: "",
    country: "",
    age: "",
    occupation: "",
    instagram_handle: "",
    tiktok_handle: "",
    gender: "",
    ever_married: "",
    reality_show: "",
    why_here: "",
    intention: "",
    would_propose: "",
    bio: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [user, setUser] = useState(null);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // For popup on non-auth
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonText, setButtonText] = useState("Submit");
  const [error, setError] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    const {
      data: { publicUrl: profileUrl },
    } = supabase.storage.from("asset").getPublicUrl(profilePath);

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

      const {
        data: { publicUrl: galleryUrl },
      } = supabase.storage.from("asset").getPublicUrl(path);

      galleryUrls.push(galleryUrl);
    }

    return { profileUrl, galleryUrls };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      // Show popup modal instead of inline error
      setShowLoginModal(true);
      return;
    }

    setIsSubmitting(true);
    setButtonText("Submitting...");

    try {
      if (!profilePhoto) {
        setError("Please upload a profile photo.");
        setIsSubmitting(false);
        setButtonText("Submit");
        return;
      }

      if (galleryPhotos.length !== 4) {
        setError("Please upload exactly 4 gallery images.");
        setIsSubmitting(false);
        setButtonText("Submit");
        return;
      }

      const { profileUrl, galleryUrls } = await handleUploads();

      const { error: insertError } = await supabase.from("candidates").insert([
  {
    user_id: user.id,  // <-- Add this line here
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
    bio: formData.bio,  // fix: use formData.bio instead of formData.about_you
    image_url: profileUrl,
    gallery: galleryUrls,
    created_at: new Date().toISOString(),
  },
]);


      if (insertError) {
        setError("Failed to save your data. Please try again.");
        setButtonText("Submit");
        setIsSubmitting(false);
        return;
      }

      setShowSuccessModal(true);
      setFormData({
        name: "",
        full_name: "",
        email: "",
        phone: "",
        country: "",
        age: "",
        occupation: "",
        instagram_handle: "",
        tiktok_handle: "",
        gender: "",
        ever_married: "",
        reality_show: "",
        why_here: "",
        intention: "",
        would_propose: "",
        bio: "",
      });
      setProfilePhoto(null);
      setGalleryPhotos([]);

      setButtonText("Submitted ✔️");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setButtonText("Submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Register – Lovemate Show</title>
      </Head>

      <Header />

      {/* Registration section */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto bg-pink-50 p-10 rounded-xl shadow-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Registration Form
          </h2>

          {/* Event schedule component */}
          <div className="mb-6">
            <EventSchedule
              startDate="2025-08-01T00:00:00"
              endDate="2025-08-15T23:59:59"
            />
          </div>

          {/* Privacy assurance write-up */}
          <div className="mb-6 bg-white rounded p-4 border border-rose-100">
            <h3 className="text-lg font-semibold text-rose-600 mb-2">Privacy & Public Info</h3>
            <p className="text-gray-700">
              Please note: <strong>only</strong> the candidate's public profile —
              their <strong>images, name, country, and about</strong> — will be shown publicly
              if selected for the show. All other information submitted in this form (contact details,
              personal history, answers to screening questions, etc.) is treated as confidential and
              will <strong>not</strong> be shared publicly by the production team. The only exception is
              if a candidate themselves chooses to disclose personal details during the live show —
              that content is then out of our control. If you have concerns about sensitive data,
              please reach out to our support team before submitting.
            </p>
          </div>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            {/* Nickname */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nickname</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border text-gray-800 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Other inputs */}
            {[
              { label: "Full Name", name: "full_name", type: "text" },
              { label: "Email", name: "email", type: "email" },
              { label: "Phone Number", name: "phone", type: "number" },
              { label: "Country", name: "country", type: "text" },
              { label: "Age", name: "age", type: "number" },
              { label: "Occupation", name: "occupation", type: "text" },
              { label: "Instagram Handle", name: "instagram_handle", type: "text" },
              { label: "TikTok Handle", name: "tiktok_handle", type: "text" },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <input
                  type={type}
                  name={name}
                  required
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border text-gray-800 focus:ring-primary focus:border-primary"
                />
              </div>
            ))}

            {/* Dropdowns */}
            {[
              { label: "Gender", name: "gender", options: ["Male", "Female", "Non-binary"] },
              { label: "Ever Married?", name: "ever_married", options: ["Yes", "No"] },
              { label: "Participated in any Reality Show?", name: "reality_show", options: ["Yes", "No"] },
              { label: "Why are you here?", name: "why_here", options: ["Love", "Fame", "Both"] },
              { label: "Would You Propose?", name: "would_propose", options: ["Yes", "No"] },
            ].map(({ label, name, options }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <select
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border text-gray-800 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select</option>
                  {options.map((option) => (
                    <option key={option} value={option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {/* Intention */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Here to find Love, Fun or Break hearts?
              </label>
              <input
                name="intention"
                type="text"
                value={formData.intention}
                onChange={handleChange}
                placeholder="e.g. Love, Fun, Break hearts..."
                className="w-full px-4 py-2 rounded-lg border text-gray-800 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* About You */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">About You</label>
              <textarea
                name="bio"
                value={formData.about_you}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                required
                minLength={100}
                maxLength={1000}
                className="w-full px-4 py-2 rounded-lg border text-gray-800 focus:ring-primary focus:border-primary"
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">Must be between 100 and 1000 characters.</p>
            </div>

            {/* Profile Photo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Upload Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setProfilePhoto(e.target.files[0])}
                className="w-full px-4 py-2 rounded-lg border bg-gray-100"
              />
            </div>

            {/* Gallery Images */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Upload 4 Gallery Images</label>
              <input
                type="file"
                accept="image/*"
                required
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  if (files.length !== 4) {
                    alert("Please upload exactly 4 images.");
                    return;
                  }
                  setGalleryPhotos(files);
                }}
                className="w-full px-4 py-2 rounded-lg border bg-gray-100"
              />
            </div>

            <div className="md:col-span-2 text-center">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center text-lg font-bold shadow-md">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-pink-600 text-white px-4 py-2 rounded w-full"
              >
                {buttonText}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg text-rose-600 shadow-xl text-center max-w-sm mx-4">
            <h2 className="text-xl font-bold text-green-600 mb-4">Success!</h2>
            <p>
              Your registration has been received. Make sure you stay tuned to our latest news so you know when selected candidates are published. We'll be in touch soon. 💖
            </p>
            <button
              className="mt-4 px-4 py-2 bg-pink-600 text-white rounded"
              onClick={() => setShowSuccessModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Login required modal */}
      {showLoginModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-white p-6 rounded-lg text-center max-w-xs mx-4 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-red-600">Notice</h3>
            <p className="mb-4">Please kindly log into your account to use this form.</p>
            <button
              onClick={() => setShowLoginModal(false)}
              className="bg-pink-600 px-4 py-2 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
