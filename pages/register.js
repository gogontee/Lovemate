import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function Register() {
  const [formData, setFormData] = useState({
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
    about_you: "",
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [user, setUser] = useState(null);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonText, setButtonText] = useState("Submit");
  const [error, setError] = useState("");

  useEffect(() => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  getUser();
}, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUploads = async () => {
    const profilePath = `candidates/${Date.now()}-${profilePhoto.name}`;
    const galleryPaths = galleryPhotos.map(
      (file, index) => `gallery/${Date.now()}-${index}-${file.name}`
    );

    // Upload profile photo
    console.log("Uploading profile photo to path:", profilePath);
    const { error: profileUploadError } = await supabase.storage
      .from("asset")
      .upload(profilePath, profilePhoto);

    if (profileUploadError) {
      console.error("❌ Profile photo upload error:", profileUploadError);
      throw new Error(`Profile photo upload failed: ${profileUploadError.message}`);
    }
    console.log("✅ Profile photo uploaded successfully.");

    const {
      data: { publicUrl: profileUrl },
    } = supabase.storage.from("asset").getPublicUrl(profilePath);

    // Upload gallery photos
    const galleryUrls = [];
    for (let i = 0; i < galleryPhotos.length; i++) {
      const file = galleryPhotos[i];
      const path = galleryPaths[i];
      console.log(`Uploading gallery photo ${i + 1} to path:`, path);

      const { error: galleryUploadError } = await supabase.storage
        .from("asset")
        .upload(path, file);

      if (galleryUploadError) {
        console.error(
          `❌ Gallery photo ${i + 1} upload error:`,
          galleryUploadError
        );
        throw new Error(
          `Gallery image ${i + 1} upload failed: ${galleryUploadError.message}`
        );
      }

      const {
        data: { publicUrl: galleryUrl },
      } = supabase.storage.from("asset").getPublicUrl(path);

      galleryUrls.push(galleryUrl);
      console.log(`✅ Gallery photo ${i + 1} uploaded successfully.`);
    }

    return { profileUrl, galleryUrls };
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!user) {
    setError("⚠️ You must log into your account first before you can apply.");
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

    const { error: insertError } = await supabase.from("register").insert([
      {
        ...formData,
        photo_url: profileUrl,
        gallery_images: galleryUrls,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      setError("Failed to save your data. Please try again.");
      setButtonText("Submit");
      setIsSubmitting(false);
      return;
    }

    setShowSuccessModal(true);
    setFormData({
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
      about_you: "",
    });
    setProfilePhoto(null);
    setGalleryPhotos([]);

    setButtonText("Submitted ✔️");
  } catch (err) {
    console.error("Unexpected error:", err);
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

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
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
              { label: "Participated in Reality Show?", name: "reality_show", options: ["Yes", "No"] },
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
                name="about_you"
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

      {showSuccessModal && (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg text-rose-600 shadow-xl text-center">
      <h2 className="text-xl font-bold text-green-600 mb-4">Success!</h2>
      <p>Your registration has been received. make sure you stay tuned to our latest news. so you know when selected candidates are published. We'll be in touch soon. 💖</p>
      <button
        className="mt-4 px-4 py-2 bg-pink-600 text-white rounded"
        onClick={() => setShowSuccessModal(false)}
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
