import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/utils/supabaseClient";
import Image from "next/image";

export default function CandidateProfile() {
  const router = useRouter();
  const { id, section } = router.query;

  const voteRef = useRef(null);
  const giftRef = useRef(null);

  const [candidate, setCandidate] = useState(null);
  const [form, setForm] = useState({ name: "", contact: "", votes: 1 });
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
          setCandidate(data);
        }
      });

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
    if (section === "vote" && voteRef.current) {
      voteRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (section === "gift" && giftRef.current) {
      giftRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [section]);

  if (!candidate) return <div className="text-center py-20">Loading...</div>;

  const handleVote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/auth/login");

    const { data: summary } = await supabase
      .from("wallet_summary")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    const totalCost = form.votes * 100;

    if (!summary || summary.balance < totalCost) {
      alert("Insufficient balance.");
      return;
    }

    await supabase.from("wallets").insert([
      {
        user_id: user.id,
        amount: -totalCost,
        type: "vote",
        status: "completed",
      },
    ]);

    await supabase.rpc("increment_vote", {
      candidate_id_param: id,
      vote_count: form.votes,
    });

    alert("Vote submitted!");
  };

  const handleGift = async (giftName) => {
    const giftValue = giftValueMap[giftName];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/auth/login");

    const { data: summary } = await supabase
      .from("wallet_summary")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (!summary || summary.balance < giftValue) {
      alert("Insufficient balance.");
      return;
    }

    await supabase.from("wallets").insert([
      {
        user_id: user.id,
        amount: -giftValue,
        type: "gift",
        status: "completed",
        meta: { gift: giftName },
      },
    ]);

    await supabase.rpc("increment_vote", {
      candidate_id_param: id,
      vote_count: giftValue / 100,
    });

    alert(`Gift sent: ${giftName}`);
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
        <title>{candidate.name} - Lovemate</title>
      </Head>
      <Header />

      {/* Hero Section */}
      <section className="bg-rose-100 py-10 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <img
            src={candidate.hero || "/placeholder.jpg"}
            alt={candidate.name}
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
          <h1 className="text-3xl font-bold mt-4">{candidate.name}</h1>
        </div>
      </section>

      {/* Stats */}
      <section className="flex justify-center gap-6 py-6 text-center text-gray-700">
        <div>
          <h3 className="text-xl font-bold">{candidate.views || 0}</h3>
          <p>Views</p>
        </div>
        <div>
          <h3 className="text-xl font-bold">{candidate.votes || 0}</h3>
          <p>Votes</p>
        </div>
        <div>
          <h3 className="text-xl font-bold">{candidate.gifts || 0}</h3>
          <p>Gifts</p>
        </div>
      </section>

      {/* Short Intro */}
      <section className="max-w-3xl mx-auto px-4 py-4 text-center">
        <p className="text-lg text-gray-600">{candidate.bio || "No introduction available."}</p>
      </section>

      {/* Gallery */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-4">Gallery</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {candidate.gallery?.length > 0 ? (
            candidate.gallery.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`gallery-${index}`}
                className="w-full h-40 object-cover rounded-md shadow"
              />
            ))
          ) : (
            <p className="text-gray-500">No gallery images available.</p>
          )}
        </div>
      </section>

      {/* Vote Section */}
      <section ref={voteRef} className="bg-gray-50 py-10 px-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Vote for {candidate.name}</h2>
        <input
          type="number"
          min={1}
          value={form.votes}
          onChange={(e) => setForm({ ...form, votes: Number(e.target.value) })}
          className="border p-2 rounded w-24 mx-auto mt-2"
        />
        <button
          onClick={handleVote}
          className="ml-4 px-6 py-2 bg-rose-500 text-white rounded hover:bg-rose-600"
        >
          Vote Now
        </button>
      </section>

      {/* Gift Section */}
      <section ref={giftRef} className="py-10 px-4 bg-white text-center">
        <h2 className="text-2xl font-bold mb-4">Send a Gift</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {Object.entries(giftValueMap).map(([name, value]) => (
            <button
              key={name}
              onClick={() => handleGift(name)}
              className={`px-6 py-3 rounded font-semibold ${giftStyles[name]}`}
            >
              {name} (₦{value.toLocaleString()})
            </button>
          ))}
        </div>
      </section>

      {/* Embedded Video */}
      {candidate.video && (
        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src={candidate.video}
              title="Candidate Video"
              allowFullScreen
              className="w-full h-64 rounded shadow"
            />
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
