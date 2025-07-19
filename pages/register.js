import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState } from "react";
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
    photo_url: "",
  });
  const [photoFile, setPhotoFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return "";

    const fileExt = photoFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `register/${fileName}`;

    let { error: uploadError } = await supabase.storage.from("asset").upload(filePath, photoFile);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return "";
    }

    const { data: urlData } = supabase.storage.from("asset").getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const photoUrl = await handlePhotoUpload();

    const { data, error } = await supabase.from("register").insert([
      {
        ...formData,
        photo_url: photoUrl,
      },
    ]);

    if (error) {
      console.error("Registration error:", error);
      alert("Something went wrong. Please try again.");
    } else {
      alert("Registration successful!");
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
        photo_url: "",
      });
    }
  };

  return (
    <>
      <Head>
        <title>Register – Lovemate Show</title>
      </Head>

      <Header />

      <section className="bg-[url('https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero6.jpg')] bg-cover bg-center bg-no-repeat py-20 px-4 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center">
          <div className="md:pr-8">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 drop-shadow-xl">
              Become the Next Universal Love Idol
            </h1>
            <p className="text-lg sm:text-xl mb-6 drop-shadow-xl">
              Take the spotlight. Fall in love. Rise to fame. Your journey starts here.
            </p>
            <a
              href="#form"
              className="inline-block bg-white text-primary font-semibold px-6 py-3 rounded-full shadow-md hover:bg-rose-100 transition"
            >
              Start Registration
            </a>
          </div>
        </div>
      </section>

      <section id="form" className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto bg-softpink p-10 rounded-xl shadow-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Registration Form
          </h2>

          <p className="text-sm text-gray-600 text-center mb-8 italic">
            🔒 All information provided is strictly confidential and will only be used for the purpose of the Lovemate Show selection.
          </p>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            {[
              { label: "Full Name", name: "full_name", type: "text" },
              { label: "Email", name: "email", type: "email" },
              { label: "Phone Number", name: "phone", type: "tel" },
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
                  className="w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary"
                />
              </div>
            ))}

            {[
              { label: "Gender", name: "gender" },
              { label: "Ever Married?", name: "ever_married" },
              { label: "Participated in any Reality Show?", name: "reality_show" },
              { label: "Why are you here?", name: "why_here" },
              { label: "Would you propose if you find your soulmate?", name: "would_propose" },
            ].map(({ label, name }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <select
                  name={name}
                  required
                  value={formData[name]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary"
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  {name === "gender" && <>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="nonbinary">Non-binary</option>
                  </>}
                  {name === "why_here" && <>
                    <option value="love">Love</option>
                    <option value="fame">Fame</option>
                    <option value="both">Both</option>
                  </>}
                </select>
              </div>
            ))}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Here to find Love, Have fun or Break hearts?</label>
              <input
                name="intention"
                type="text"
                value={formData.intention}
                onChange={handleChange}
                placeholder="e.g. Love, Fun, Break hearts..."
                className="w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">About You</label>
              <textarea
                name="about_you"
                value={formData.about_you}
                onChange={handleChange}
                placeholder="Tell us about you in less than 150 words..."
                minLength={100}
                maxLength={1000}
                required
                className="w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary"
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">Must be between 20 and 150 words.</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Upload Your Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files[0])}
                className="w-full px-4 py-2 rounded-lg border bg-white focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="md:col-span-2 text-center">
              <button
                type="submit"
                className="bg-primary hover:bg-primaryDark text-white font-semibold px-8 py-3 rounded-full shadow-md transition"
              >
                Submit Registration
              </button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}
