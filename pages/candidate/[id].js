import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { supabase } from "@/utils/supabaseClient";
import Image from "next/image";


export default function CandidateProfile() {
  const router = useRouter();
  const { id, section } = router.query;
  const scrollRef = useRef(null);

  const [candidate, setCandidate] = useState(null);
  const [form, setForm] = useState({ name: "", contact: "", votes: 1, gift: "" });
  const [showGiftModal, setShowGiftModal] = useState(false);

 useEffect(() => {
  if (!id) return;

  supabase
    .from("candidates")
    .select("*")
    .eq("id", id)
    .single()
    .then(({ data, error }) => {
      if (error) {
        console.error("Error fetching candidate:", error);
        setCandidate(null);
      } else {
        console.log("Fetched candidate:", data); // 🔍 Add this
        setCandidate(data);
      }
    });


    // Subscribe to realtime updates for candidate
    const channel = supabase
      .channel("realtime-candidate")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "candidates",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setCandidate(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  useEffect(() => {
    if (section && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [id, section]);

  if (!candidate) return <div className="text-center py-20">Loading...</div>;
  const handleVote = async (candidateId, voteCost = 100) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    router.push("/auth/login");
    return;
  }

  const { data: summary } = await supabase
    .from("wallet_summary")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  if (!summary || summary.balance < voteCost) {
    alert("Insufficient balance.");
    return;
  }

  // Deduct wallet
  await supabase.from("wallets").insert([
    {
      user_id: user.id,
      amount: -voteCost,
      type: "vote",
      status: "completed",
    },
  ]);

  // Update vote count
  await supabase.rpc("increment_vote", {
    candidate_id_param: candidateId,
    vote_count: voteCost / 100, // assuming ₦100 per vote
  });

  alert("Vote submitted!");
};


  const giftValueMap = {
    Star: 100000,
    Crown: 300000,
    Dragon: 500000,
    Gold: 700000,
    Love: 1000000,
  };
  const giftStyles = {
  Star: "bg-orange-200 text-orange-800 hover:bg-orange-300",
  Crown: "bg-green-200 text-green-800 hover:bg-green-300",
  Dragon: "bg-blue-200 text-blue-800 hover:bg-blue-300",
  Gold: "bg-pink-200 text-pink-800 hover:bg-pink-300",
  Love: "bg-red-200 text-red-800 hover:bg-red-300",
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
          <Image
  src={candidate.image_Url}
  alt={candidate.name}
  layout="fill"
  objectFit="cover"
  className="opacity-80"
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
    <p className="text-3xl font-bold text-rose-600">
      {candidate?.votes ?? 0}
    </p>
    <p className="text-sm text-gray-600">Votes</p>
  </div>
  <div>
    <p className="text-3xl font-bold text-rose-600">
      {candidate?.views ?? 0}
    </p>
    <p className="text-sm text-gray-600">Views</p>
  </div>
  <div>
    <p className="text-3xl font-bold text-rose-600">
      {candidate?.gifts ?? 0}
    </p>
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
    {Array.isArray(candidate.gallery) &&
  candidate.gallery.map((img, i) => (
    <img
      key={i}
      src={img}
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
        className="w-full px-4 py-3 rounded border border-gray-300 shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-rose-500"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Email or Phone"
        className="w-full px-4 py-3 rounded border border-gray-300 shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-rose-500"
        value={form.contact}
        onChange={(e) => setForm({ ...form, contact: e.target.value })}
      />
      <input
  type="number"
  placeholder="Number of Votes"
  min={1}
  className="w-full px-4 py-3 rounded border border-gray-300 shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-rose-500"
  value={form.votes}
  onChange={(e) => setForm({ ...form, votes: e.target.value })}
/>

{/* Live Total Cost */}
<p className="text-sm text-gray-600 mt-1">
  💰 Total Cost: ₦{parseInt(form.votes || 0) * 100}
</p>


      <button
  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-full shadow"
  onClick={() => handleVote(candidate.id, parseInt(form.votes || 0))}
>
  Submit Vote
</button>

      <div className="grid grid-cols-2 gap-4 pt-6">
  {Object.keys(giftValueMap).map((gift) => (
    <div key={gift} className="text-center">
      <button
        onClick={() => setShowGiftModal(gift)}
        className={`w-full font-semibold py-2 px-4 rounded shadow ${giftStyles[gift]}`}
      >
        🎁 {gift}
      </button>
      <p className="text-sm text-gray-600 mt-1">
        ₦{giftValueMap[gift].toLocaleString()}
      </p>
    </div>
  ))}
</div>
    </div>
  </div>
</section>


      {/* Gift Modal */}
{showGiftModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl max-w-sm w-full shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-center">
        Send a {showGiftModal} to {candidate.name}
      </h3>

      <input
        type="text"
        placeholder="Your Name"
        className="w-full mb-3 px-4 py-2 rounded border border-gray-300 shadow-sm bg-white text-gray-900 placeholder-gray-400"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        type="text"
        placeholder="Email or Phone"
        className="w-full mb-3 px-4 py-2 rounded border border-gray-300 shadow-sm bg-white text-gray-900 placeholder-gray-400"
        value={form.contact}
        onChange={(e) => setForm({ ...form, contact: e.target.value })}
      />

      <div className="flex gap-4 mt-4">
        <button
  onClick={async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to send a gift.");
      router.push("/auth/login");
      return;
    }

    const giftAmount = giftValueMap[showGiftModal];

    if (!giftAmount) {
      alert("Invalid gift type.");
      return;
    }

    const { data: summary } = await supabase
      .from("wallet_summary")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (!summary || summary.balance < giftAmount) {
      alert("Insufficient balance.");
      return;
    }

    await supabase.from("wallets").insert([
      {
        user_id: user.id,
        amount: -giftAmount,
        type: "gift",
        status: "completed",
        candidate_id: candidate.id,
        metadata: { gift: showGiftModal },
      },
    ]);

    await supabase.rpc("increment_vote", {
      candidate_id_param: candidate.id,
      vote_count: giftAmount,
    });

    alert(`${showGiftModal} sent successfully to ${candidate.name}! 🎁`);
    setShowGiftModal(false);
  }}
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
