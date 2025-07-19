import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function CandidateProfile() {
  const router = useRouter();
  const { id, section } = router.query;
  const scrollRef = useRef(null);
  const [candidate, setCandidate] = useState(null);

  // Fetch candidate + subscribe to real-time updates
  useEffect(() => {
    if (!id) return;

    const fetchCandidate = async () => {
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
      }
    };

    fetchCandidate();

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

  // Scroll to section when available
  useEffect(() => {
    if (section && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [section]);

  return (
    <div>
      <Head>
        <title>Candidate Profile</title>
      </Head>
      <Header />

      {candidate ? (
        <VotingSection candidate={candidate} scrollRef={scrollRef} />
      ) : (
        <div className="text-center py-20">Loading...</div>
      )}

      <Footer />
    </div>
  );
}

function VotingSection({ candidate, scrollRef }) {
  const [form, setForm] = useState({ votes: 1 });
  const [showConfirmVote, setShowConfirmVote] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showGiftPrompt, setShowGiftPrompt] = useState(false);
  const router = useRouter();

  const giftValueMap = {
    Flower: 50000,
    Teddy: 20000,
    Ring: 3000000,
    Crown: 500000,
    Gold: 700000,
    Love: 5000000,
  };

  const giftStyles = {
    Flower: "bg-pink-300 hover:bg-green-500",
    Teddy: "bg-yellow-500 hover:bg-green-500",
    Ring: "bg-blue-500 hover:bg-green-500",
    Crown: "bg-purple-500 hover:bg-green-500",
    Gold: "bg-orange-600 hover:bg-green-500",
    Love: "bg-rose-600 hover:bg-green-500",
  };

  const handleVote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/auth/login");

    const voteCost = parseInt(form.votes || 0) * 100;
    const { data: summary } = await supabase
      .from("wallet_summary")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (!summary || summary.balance < voteCost) {
      alert("Insufficient balance.");
      return;
    }

    await supabase.from("wallets").insert([{
      user_id: user.id,
      amount: -voteCost,
      type: "vote",
      status: "completed",
      candidate_id: candidate.id,
    }]);

    await supabase.rpc("increment_vote", {
      candidate_id_param: candidate.id,
      vote_count: parseInt(form.votes),
    });

    setShowConfirmVote(false);
    setShowGiftPrompt(true);
  };

  const handleGift = async (gift) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/auth/login");

    const giftAmount = giftValueMap[gift];
    const { data: summary } = await supabase
      .from("wallet_summary")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (!summary || summary.balance < giftAmount) {
      alert("Insufficient balance.");
      return;
    }

    await supabase.from("wallets").insert([{
      user_id: user.id,
      amount: -giftAmount,
      type: "gift",
      status: "completed",
      candidate_id: candidate.id,
      metadata: { gift },
    }]);

    await supabase.rpc("increment_vote", {
      candidate_id_param: candidate.id,
      vote_count: giftAmount,
    });

    setShowGiftModal(null);
    setShowThankYou(true);
  };


  return (
    <>
      <Head>
        <title>{candidate.name} – Lovemate</title>
      </Head>


      {/* Hero Section */}
      <section className="relative h-[26rem] bg-black">
        <div className="absolute inset-0 overflow-hidden">
          <Image
  src={candidate.image_url}
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

      <section ref={scrollRef} className="bg-gradient-to-br from-pink-50 to-rose-100 py-12 px-4">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-6 text-rose-600">Vote {candidate.name}</h2>
        <div className="space-y-4">
          <input
            type="number"
            placeholder="Number of Votes"
            min={1}
            className="w-full px-4 py-3 rounded border border-gray-300 shadow-sm bg-white text-gray-900"
            value={form.votes}
            onChange={(e) => setForm({ ...form, votes: e.target.value })}
          />
          <p className="text-sm text-gray-600 mt-1">💰 Total Cost: ₦{parseInt(form.votes || 0) * 100}</p>
          <button
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-full shadow"
            onClick={() => setShowConfirmVote(true)}
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
                <p className="text-sm text-gray-600 mt-1">₦{giftValueMap[gift].toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showConfirmVote && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow">
            <h3 className="text-lg font-bold mb-4 text-center">Confirm Your Vote</h3>
            <p className="text-center mb-4">
              You are voting {form.votes} times for {candidate.name} (₦{parseInt(form.votes) * 100})
            </p>
            <div className="flex gap-4">
              <button
                className="flex-1 bg-rose-600 text-white py-2 rounded"
                onClick={handleVote}
              >
                Confirm
              </button>
              <button
                className="flex-1 border border-gray-300 py-2 rounded"
                onClick={() => setShowConfirmVote(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showGiftModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow">
            <h3 className="text-lg font-bold mb-4 text-center">
              Confirm gifting {showGiftModal} to {candidate.name}?
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => handleGift(showGiftModal)}
                className="flex-1 bg-yellow-400 text-yellow-900 font-semibold py-2 rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowGiftModal(null)}
                className="flex-1 border border-gray-300 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showGiftPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full shadow-lg text-center">
            <h3 className="text-lg font-bold mb-4">🎉 Thank you for supporting {candidate.name}!</h3>
            <p className="mb-4">Would you like to send a gift?</p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowGiftPrompt(false);
                  scrollRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex-1 bg-rose-500 text-white py-2 rounded"
              >
                Yes, show gifts
              </button>
              <button
                onClick={() => setShowGiftPrompt(false)}
                className="flex-1 border border-gray-300 py-2 rounded"
              >
                No, maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {showThankYou && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center w-full max-w-sm shadow">
            <h3 className="text-xl font-bold text-green-600 mb-4">
              🎁 Gift sent with love!
            </h3>
            <p className="mb-2">Thank you for your heartfelt gift to {candidate.name}!</p>
            <button
              onClick={() => setShowThankYou(false)}
              className="mt-4 bg-rose-500 text-white py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>

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
