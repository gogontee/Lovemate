// pages/candidate/[id].js
import { useRouter } from "next/router";
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import candidates from "../../data/candidates";
import { useEffect, useRef, useState } from "react";

export default function CandidateProfile() {
  const router = useRouter();
  const { id, section } = router.query;
  const scrollRef = useRef(null);

  const candidate = candidates.find((c) => c.id.toString() === id);

  const [form, setForm] = useState({ name: "", contact: "", votes: 1, gift: "" });
  const [showGiftModal, setShowGiftModal] = useState(false);

  useEffect(() => {
    if (section && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [id, section]);

  if (!candidate) return <div className="text-center py-20">Loading...</div>;

  const giftStyles = {
    Star: "bg-orange-200 text-orange-800 hover:bg-orange-300",
    Crown: "bg-green-200 text-green-800 hover:bg-green-300",
    Dragon: "bg-blue-200 text-blue-800 hover:bg-blue-300",
    Gold: "bg-pink-200 text-pink-800 hover:bg-pink-300",
  };

  return (
    <>
      <Head>
        <title>{candidate.name} – Lovemate</title>
      </Head>
      <Header />

      {/* Hero Section */}
      <section className="relative h-[26rem] bg-black">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={candidate.imageUrl}
            alt={candidate.name}
            className="w-full h-full object-cover object-center opacity-80"
          />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-end p-8 bg-gradient-to-t from-black via-black/60 to-transparent text-white">
          <h1 className="text-4xl font-extrabold mb-2">{candidate.name}</h1>
          <p className="text-lg">{candidate.country}</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-8 flex justify-center gap-10 text-center">
        <div>
          <p className="text-3xl font-bold text-rose-600">{candidate.votes}</p>
          <p className="text-sm text-gray-600">Votes</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-rose-600">1023</p>
          <p className="text-sm text-gray-600">Views</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-rose-600">12</p>
          <p className="text-sm text-gray-600">Gifts</p>
        </div>
      </section>

      {/* Bio */}
      <section className="bg-rose-100 py-10 px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center text-rose-600">About {candidate.name}</h2>
        <p className="text-gray-700 text-center">{candidate.bio}</p>
      </section>

      {/* Gallery */}
      <section className="bg-white py-12 px-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Gallery</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {candidate.gallery.map((img, i) => (
            <img
              key={i}
              src={`/candidates/gallery/${img}`}
              alt={`Gallery ${i + 1}`}
              className="rounded-xl shadow hover:scale-105 transition"
            />
          ))}
        </div>
      </section>

      {/* Unified Voting & Gifting Section */}
      <section ref={scrollRef} className="bg-gradient-to-br from-pink-50 to-rose-100 py-12 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6 text-rose-600">Vote {candidate.name}</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-3 rounded border border-gray-300 shadow-sm focus:ring-2 focus:ring-rose-500 bg-white"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Email or Phone"
              className="w-full px-4 py-3 rounded border border-gray-300 shadow-sm focus:ring-2 focus:ring-rose-500 bg-white"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
            />
            <input
              type="number"
              placeholder="Number of Votes"
              min={10}
              className="w-full px-4 py-3 rounded border border-gray-300 shadow-sm focus:ring-2 focus:ring-rose-500 bg-white text-gray-900"
              value={form.votes}
              onChange={(e) => setForm({ ...form, votes: e.target.value })}
            />
            <button
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-full shadow"
              onClick={() => alert(`Voting ${form.votes} for ${candidate.name} by ${form.name}`)}
            >
              Submit Vote
            </button>

            <div className="grid grid-cols-2 gap-4 pt-6">
              {["Star", "Crown", "Dragon", "Gold"].map((gift) => (
                <button
                  key={gift}
                  onClick={() => setShowGiftModal(gift)}
                  className={`font-semibold py-2 px-4 rounded shadow ${giftStyles[gift]}`}
                >
                  🎁 {gift}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gift Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-center">Send a {showGiftModal} to {candidate.name}</h3>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full mb-3 px-4 py-2 rounded border border-gray-300 shadow-sm bg-white"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Email or Phone"
              className="w-full mb-3 px-4 py-2 rounded border border-gray-300 shadow-sm bg-white"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
            />
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => alert(`Gift: ${showGiftModal} to ${candidate.name} by ${form.name}`)}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold py-2 rounded shadow"
              >
                Send Gift
              </button>
              <button
                onClick={() => setShowGiftModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded shadow"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video */}
      <section className="bg-black py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Featured Video</h2>
          <div className="aspect-video">
            <iframe
              className="w-full h-full"
              src={candidate.video}
              title={`Video for ${candidate.name}`}
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
