// pages/about.js
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Heart, Clock, Home, Award } from "lucide-react";

export default function About() {
  return (
    <>
      <Head>
        <title>About – Lovemate Show</title>
        <meta
          name="description"
          content="Discover everything about Lovemate – the mission, vision, and how you can be part of the ultimate love showdown."
        />
      </Head>

      <Header />

      {/* Hero Section */}
<section
  className="relative bg-cover bg-center h-[400px] text-white"
  style={{ backgroundImage: "url('https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/hero/hero6.jpg')" }}
>
  {/* Optional dark gradient overlay for better contrast */}
  <div className="absolute inset-0 bg-black/40"></div>

  <div className="relative z-10 max-w-7xl mx-auto h-full flex items-center px-6">
    <div className="w-full md:w-1/2">
      <h1 className="text-4xl font-extrabold mb-6 leading-tight text-white drop-shadow">
        About Lovemate Show
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 gap-4">
        <div className="bg-white/30 backdrop-blur text-white p-4 rounded-lg shadow-md">
          <Heart className="mx-auto mb-2" size={24} />
          <p className="text-lg font-bold text-center">24 Mates</p>
        </div>
        <div className="bg-white/30 backdrop-blur text-white p-4 rounded-lg shadow-md">
          <Clock className="mx-auto mb-2" size={24} />
          <p className="text-lg font-bold text-center">360 Hours</p>
          <p className="text-sm text-center">of Intrigues</p>
        </div>
        <div className="bg-white/30 backdrop-blur text-white p-4 rounded-lg shadow-md">
          <Home className="mx-auto mb-2" size={24} />
          <p className="text-lg font-bold text-center">1 Luxurious Aboard</p>
        </div>
        <div className="bg-white/30 backdrop-blur text-white p-4 rounded-lg shadow-md">
          <Award className="mx-auto mb-2" size={24} />
          <p className="text-lg font-bold text-center">1 Winner</p>
        </div>
      </div>
    </div>
  </div>
</section>


      {/* Detail Section */}
      <section className="bg-white text-gray-800 py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-4">Lovemate</h2>
            <p className="text-lg mb-6">
              Lovemate is not just a show—it’s an emotional battleground where passion, fame, and true connection collide. For 15 unforgettable days, 24 hearts chase love under the unrelenting spotlight. Each moment is raw, each decision crucial. This is where soulmates are unveiled and destinies are rewritten—welcome to Lovemate.
            </p>

            <h2 className="text-3xl font-bold text-primary mb-4">Objective</h2>
            <p className="text-lg mb-6">
              To discover the Universal Love Idol through thrilling challenges and heartwarming stories of connection.
            </p>

            <h2 className="text-3xl font-bold text-primary mb-4">Mission</h2>
            <p className="text-lg mb-6">
              To redefine reality entertainment by creating a platform where singles find true love while showcasing their values and charisma.
            </p>

            <h2 className="text-3xl font-bold text-primary mb-4">Vision</h2>
            <p className="text-lg mb-6">
              To become Africa's biggest love and lifestyle reality show, setting the standard for cultural sophistication and romantic discovery.
            </p>

            <h2 className="text-3xl font-bold text-primary mb-4">Why Love Lovemate?</h2>
            <p className="text-lg mb-6">
              Lovemate is not just a show – it's an experience. From the luxurious villa to the real-time voting and interactive drama, everything is crafted to captivate.
            </p>
          </div>

          <div className="flex flex-col space-y-8">
            <div className="p-6 bg-rose-50 rounded-xl shadow">
              <h3 className="text-2xl font-semibold text-primary mb-2">Be a Participant</h3>
              <p className="text-gray-700 mb-4">
                Think you have what it takes to find love on the big stage? Join the show and let your journey begin.
              </p>
              <a href="/register" className="inline-block text-white bg-primary px-5 py-3 rounded-md font-medium hover:bg-primaryDark transition">
                Register Now
              </a>
            </div>

            <div className="p-6 bg-rose-50 rounded-xl shadow">
              <h3 className="text-2xl font-semibold text-primary mb-2">Become a Sponsor</h3>
              <p className="text-gray-700 mb-4">
                Partner with Lovemate and enjoy massive brand exposure across Africa and beyond. Be part of the love journey.
              </p>
              <a href="/contact" className="inline-block text-white bg-primary px-5 py-3 rounded-md font-medium hover:bg-primaryDark transition">
                Sponsor Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
