// pages/register.js
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export default function Register() {
  return (
    <>
      <Head>
        <title>Register – Lovemate Show</title>
      </Head>

      <Header />

      {/* Hero Section */}
<section className="bg-[url('https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/hero/hero6.jpg')] bg-cover bg-center bg-no-repeat py-20 px-4 text-white">
  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center">
    {/* Left Side: Text Content */}
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

    {/* Right Side: Empty for background visibility */}
    <div className="hidden md:block" />
  </div>
      </section>

      {/* Registration Form Section */}
      <section id="form" className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto bg-softpink p-10 rounded-xl shadow-md">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Registration Form
          </h2>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" required className="w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" required className="w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="tel" required className="w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input type="text" required className="w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input type="number" required className="w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Occupation</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Instagram Handle</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">TikTok Handle</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select required className="w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="nonbinary">Non-binary</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ever Married?</label>
              <select required className="w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary">
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Participated in any Reality Show?</label>
              <select required className="w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary">
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Why are you here?</label>
              <select required className="w-full px-4 py-2 rounded-lg border focus:ring-primary focus:border-primary">
                <option value="">Select</option>
                <option value="love">Love</option>
                <option value="fame">Fame</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Upload Your Photo</label>
              <input type="file" accept="image/*" className="w-full px-4 py-2 rounded-lg border bg-white focus:ring-primary focus:border-primary" />
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

