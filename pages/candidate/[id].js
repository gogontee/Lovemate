import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

function formatNaira(n) {
  if (n == null) return "G0";
  // add commas, no decimal if integer
  const formatted = Number(n).toLocaleString("en-NG");
  return `G${formatted}`;
}

export default function CandidateProfile() {
  const router = useRouter();
  const { id } = router.query;
  const voteRef = useRef(null);
  const giftRef = useRef(null);
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

  // Scroll to vote or gift based on hash
  useEffect(() => {
    if (!router.isReady) return;
    const hash = router.asPath.split("#")[1];
    if (hash === "vote" && voteRef.current) {
      voteRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (hash === "gift" && giftRef.current) {
      giftRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [router.asPath, router.isReady]);

  return (
    <div>
      <Head>
        <title>Candidate Profile</title>
      </Head>
      <Header />

      {candidate ? (
        <VotingSection
          candidate={candidate}
          voteRef={voteRef}
          giftRef={giftRef}
        />
      ) : (
        <div className="text-center py-20">Loading...</div>
      )}

    </div>
  );
}

function VotingSection({ candidate, voteRef, giftRef }) {
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
    Heart: 100,
  };

  const giftStyles = {
    Flower: "bg-pink-300 hover:bg-green-500",
    Teddy: "bg-yellow-500 hover:bg-green-500",
    Ring: "bg-blue-500 hover:bg-green-500",
    Crown: "bg-purple-500 hover:bg-green-500",
    Gold: "bg-orange-600 hover:bg-green-500",
    Love: "bg-rose-600 hover:bg-green-500",
    Heart: "bg-red-500 hover:bg-green-500",
  };

  const handleVote = async () => {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    alert("Login required to vote.");
    return router.push("/auth/login");
  }

  const votes = Number(form.votes) || 0;
  if (votes < 1) {
    alert("Enter at least 1 vote.");
    return;
  }

  const { error } = await supabase.rpc("cast_vote", {
    p_user_id: user.id,
    p_candidate_id: candidate.id,
    p_vote_count: votes,
  });

  if (error) {
    console.error("cast_vote error:", error);
    if (error.message.includes("insufficient_balance")) {
      alert("Insufficient balance.");
    } else {
      alert("Vote failed. Try again.");
    }
    return;
  }

  setShowConfirmVote(false);
  setShowGiftPrompt(true);
};

const handleGift = async (gift) => {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    alert("Login required to send gift.");
    return router.push("/auth/login");
  }

  const giftAmount = giftValueMap[gift];
  // fetch current wallet balance
  const { data: walletData, error: walletErr } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  const balance = walletData?.balance ?? 0;

  if (walletErr) {
    console.error("Error fetching wallet balance for gift:", walletErr);
    alert("Unable to verify balance. Try again."); 
    return;
  }

  if (balance < giftAmount) {
    // friendly UI message instead of plain alert
    alert(
      `Insufficient balance. You have ₦${Number(balance).toLocaleString(
        "en-NG"
      )}, but the gift costs ₦${Number(giftAmount).toLocaleString("en-NG")}. Please add to your wallet.`
    );
    return;
  }

  // proceed with RPC
  const { error } = await supabase.rpc("send_gift", {
    p_user_id: user.id,
    p_candidate_id: candidate.id,
    p_gift_type: gift,
  });

  if (error) {
    console.error("send_gift error:", error);
    if (error.message.includes("insufficient_balance")) {
      alert("Insufficient balance. Please top up your wallet."); 
    } else if (error.message.includes("invalid_gift")) {
      alert("Invalid gift type.");
    } else {
      alert("Gift failed. Try again.");
    }
    return;
  }

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
      {candidate?.gifts ?? 0}
    </p>
    <p className="text-sm text-gray-600">Gifts</p>
  </div>
  <div>
    <p className="text-3xl font-bold text-rose-600">
      {formatNaira(candidate?.gift_worth)}
    </p>
    <p className="text-sm text-gray-600">Gift Worth</p>
  </div>
</section>


      {/* Bio */}
      <section className="bg-rose-100 py-10 px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center text-rose-600">
          About {candidate.name}
        </h2>
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

      {/* Vote Section */}
      <section
        id="vote"
        ref={voteRef}
        className="bg-gradient-to-br from-pink-50 to-rose-100 py-12 px-4"
      >
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6 text-rose-600">
            Vote {candidate.name}
          </h2>
          <div className="space-y-4">
            <input
              type="number"
              placeholder="Number of Votes"
              min={1}
              className="w-full px-4 py-3 rounded border border-gray-300 shadow-sm bg-white text-gray-900"
              value={form.votes}
              onChange={(e) => setForm({ ...form, votes: e.target.value })}
            />
            <p className="text-sm text-gray-600 mt-1">
              💰 Total Cost: ₦{parseInt(form.votes || 0) * 100}
            </p>
            <button
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-full shadow"
              onClick={() => setShowConfirmVote(true)}
            >
              Submit Vote
            </button>
          </div>
        </div>

        {showConfirmVote && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow text-black">
              <h3 className="text-lg font-bold mb-4 text-center">
                Confirm Your Vote
              </h3>
              <p className="text-center mb-4">
                You are sending {form.votes} votes for {candidate.name} (₦
                {parseInt(form.votes) * 100})
              </p>
              <div className="flex gap-4">
                <button
                  className="flex-1 bg-rose-600 text-white py-2 rounded"
                  onClick={handleVote}
                >
                  Confirm
                </button>
                <button
                  className="flex-1 border border-gray-300 py-2 rounded text-black"
                  onClick={() => setShowConfirmVote(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Gift Section */}
      <section
        id="gift"
        ref={giftRef}
        className="bg-gradient-to-br from-rose-50 to-rose-100 py-12 px-4"
      >
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6 text-yellow-600">
            Send a Gift to {candidate.name}
          </h2>
          <div className="grid grid-cols-2 gap-4">
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

        {showGiftModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow text-black">
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
                  className="flex-1 border border-gray-300 py-2 rounded text-black"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {showGiftPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full shadow-lg text-center">
            <h3 className="text-lg font-bold mb-4 text-black">
              🎉 Thank you for supporting {candidate.name}!
            </h3>
            <p className="mb-4 text-black">Would you like to send a gift?</p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowGiftPrompt(false);
                  voteRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex-1 bg-green-500 text-white py-2 rounded"
              >
                Yes, show gifts
              </button>
              <button
                onClick={() => setShowGiftPrompt(false)}
                className="flex-1 border border-gray-300 py-2 rounded text-black "
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
            <p className="mb-2 text-black">
              Thank you for your heartfelt gift to {candidate.name}!
            </p>
            <button
              onClick={() => setShowThankYou(false)}
              className="mt-4 bg-rose-500 text-white py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Video */}
<section className="bg-black py-8">
  <div className="max-w-4xl mx-auto">
    <h2 className="text-2xl font-bold text-white mb-4 text-center">
      Featured Video
    </h2>
    <div className="aspect-video">
      <iframe
        className="w-full h-full"
        src="https://www.youtube.com/embed/MWzBjSfsLsE?loop=1&playlist=MWzBjSfsLsE"
        title="Featured LoveMate Video"
        allowFullScreen
      ></iframe>
    </div>
  </div>
</section>


      <Footer />
    </>
  );
}
