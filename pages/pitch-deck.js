import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LovematePitchDeck({
  logoSrc = 'https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/logo/logo.png',
  slides = null
}) {
  const router = useRouter();

  const defaultSlides = [
  {
    title: 'Overview',
    page: '/overview',
    subtitle: 'Lovemate Season 1 — Partnership & Investment',
    img: 'https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/candidate/cc.jpg',
    body: `Lovemate is more than a reality show — it’s Africa’s next big cultural and entertainment phenomenon, designed to connect hearts and captivate millions. 
    Over an electrifying 360 hours, 24 contestants will live together, build relationships, and compete under the world’s gaze. 
    Every interaction, challenge, and romantic twist unfolds live on [lovemateshow.com](https://www.lovemateshow.com) and across all major social platforms, with audiences shaping the story through real-time voting and gifting directly from their digital wallets. 
    The show promises maximum audience engagement, premium brand visibility, and measurable returns for our partners. 
    By merging luxury lifestyle, competitive romance, and cutting-edge interactivity, Lovemate redefines African matchmaking entertainment, offering advertisers, sponsors, and investors an untapped market of emotionally invested viewers.`
  },
  {
    title: 'Show Concept',
    page: '/show-concept',
    subtitle: 'Format & Flow',
    img: 'https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/candidate/aa.jpg',
    body: `For 360 thrilling hours, 24 vibrant singles come together under one roof in a breathtaking luxury villa with one goal — to find genuine connection. 
    Each day blends exciting challenges, heartfelt moments, and unexpected twists that test their charm, resilience, and emotional depth. 
    The audience takes center stage through real-time voting and interactive polls that can instantly alter the course of the game. 
    From laughter-filled bonding sessions to high-stakes eliminations, Lovemate keeps viewers hooked and emotionally invested.`
  },
  {
    title: 'Market Opportunity',
    page: '/market-opportunity',
    subtitle: 'Why Now',
    img: 'https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/candidate/ff.jpg',
    body: `Africa’s entertainment market is booming, with reality romance shows consistently ranking among the most watched formats. 
    The massive success of Big Brother Naija proves the continent’s appetite for immersive, interactive content.  
    • High Demand — Romance-driven reality shows attract millions of loyal fans.  
    • Digital Engagement — Over 500M mobile internet users in Africa enable monetization via voting, livestreams, and digital sponsorships.  
    • Youth Market — Africa’s median age of 19.5 years means a vast, engaged audience seeking relatable entertainment.  
    • Brand Integration — Strong opportunities for lifestyle, fashion, beauty, and tech brands to integrate seamlessly into the show.  
    Lovemate taps into this demand, delivering cultural relevance, emotional engagement, and measurable reach.`
  },
  {
    title: 'Revenue Model',
    page: '/revenue-model',
    subtitle: 'How We Make Money',
    img: 'https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/asset/candidate/mm.jpg',
    body: `Lovemate’s diverse revenue streams ensure profitability before, during, and after the season:  
    • Wallet Voting — Viewers purchase voting credits via mobile money, bank transfers, or cards to influence outcomes.  
    • Digital Gifting — Fans send virtual gifts during livestreams, boosting fan engagement and revenue.  
    • Sponsorships & Partnerships — Title sponsorships, branded challenges, villa branding, and wardrobe/product placements.  
    • Advertising — On-screen ads, social media promotions, and pre-roll video ads on streaming platforms.  
    • Merchandise — Branded apparel, accessories, and memorabilia for fans.  
    • Streaming Monetization — Pay-per-view access to exclusive content and international distribution deals.`
  },
  {
    title: 'Investment Offer',
    page: '/investment-offer',
    subtitle: '40% ROI',
    img: 'https://via.placeholder.com/600x400?text=Investment+Offer',
    body: `We are offering limited investor slots with a guaranteed 40% return on investment within the four-month season revenue cycle.  
    Partners enjoy full transparency via a real-time dashboard, weekly financial reports, and direct brand exposure throughout the show.`
  },
  {
    title: 'Marketing Strategy',
    page: '/marketing-strategy',
    subtitle: 'Hype & Reach',
    img: 'https://via.placeholder.com/600x400?text=Marketing+Strategy',
    body: `Our marketing plan maximizes reach and excitement:  
    • Influencer partnerships for targeted social buzz.  
    • PR launches and press tours across major African cities.  
    • Paid digital ads on high-traffic platforms.  
    • Teasers, countdowns, and interactive polls to build anticipation.  
    • Cross-platform activations to engage both TV and online audiences.`
  },
  {
    title: 'Timeline',
    page: '/timeline',
    subtitle: 'Roadmap',
    img: 'https://via.placeholder.com/600x400?text=Timeline',
    body: `• Pre-Production (1 Month) — Casting, sponsorship acquisition, and branding setup.  
    • Show Run (3 Months) — Weekly episodes, challenges, and audience voting.  
    • Finale (15 Days) — Live events and grand finale broadcast.  
    • Post-Production (2 Weeks) — Highlights, wrap-up content, and ROI distribution.`
  },
  {
    title: 'Call to Action',
    page: '/call-to-action',
    subtitle: 'Join Us',
    img: 'https://via.placeholder.com/600x400?text=Call+to+Action',
    body: `Contact us today to reserve your partnership slot and receive our detailed investor packet.  
    Let’s redefine African reality entertainment — together.`
  }
];


  const deck = slides || defaultSlides;
  const [active, setActive] = useState(0);
  const containerRef = useRef(null);
  const startX = useRef(0);
  const isDragging = useRef(false);
  const translateX = useRef(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = `slide-${active + 1}`;
    }
  }, [active]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function goTo(index) {
    const clamped = Math.max(0, Math.min(deck.length - 1, index));
    setActive(clamped);
  }
  function goNext() { goTo(active + 1); }
  function goPrev() { goTo(active - 1); }

  function onPointerDown(e) {
    isDragging.current = true;
    startX.current = e.touches ? e.touches[0].clientX : e.clientX;
  }
  function onPointerMove(e) {
    if (!isDragging.current) return;
    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    translateX.current = currentX - startX.current;
    const el = containerRef.current;
    if (el) el.style.transform = `translateX(${ -active * 100 + (translateX.current / el.offsetWidth) * 100 }%)`;
  }
  function onPointerUp() {
    if (!isDragging.current) return;
    isDragging.current = false;
    const threshold = 80;
    if (translateX.current > threshold) {
      goPrev();
    } else if (translateX.current < -threshold) {
      goNext();
    } else {
      const el = containerRef.current;
      if (el) el.style.transition = 'transform 400ms cubic-bezier(.22,.9,.32,1)';
      if (el) el.style.transform = `translateX(${ -active * 100 }%)`;
      setTimeout(() => {
        if (el) el.style.transition = '';
      }, 450);
    }
    translateX.current = 0;
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.transition = 'transform 550ms cubic-bezier(.22,.9,.32,1)';
    el.style.transform = `translateX(${ -active * 100 }%)`;
    const t = setTimeout(() => { if (el) el.style.transition = ''; }, 600);
    return () => clearTimeout(t);
  }, [active]);

  return (
  <div className="w-full min-h-screen bg-gradient-to-b from-rose-50 to-rose-100 text-black flex flex-col">
    {/* Header */}
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-sm shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <img src={logoSrc} alt="Lovemate logo" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-xl font-semibold text-rose-600">Partnership Pitch Deck</h1>
            </div>
          </div>

          {/* Desktop Tabs */}
          <nav className="hidden md:flex items-center justify-end flex-1 gap-1">
            <div className="flex items-center gap-1">
              {deck.map((s, i) => (
                <button
                  key={s.title}
                  onClick={() => goTo(i)}
                  className={`relative px-2.5 py-1 rounded text-xs font-medium transition-transform
                    ${active === i ? 'scale-105 shadow-md bg-white' : 'bg-white/60 hover:scale-102'}
                  `}
                  aria-current={active === i}
                >
                  <span className={`inline-block ${active === i ? 'text-rose-700' : 'text-gray-700'}`}>
                    {s.title}
                  </span>
                  <span
                    className={`absolute left-1 right-1 -bottom-0.5 h-0.5 rounded-full transition-all
                      ${active === i ? 'bg-rose-600/90 w-[calc(100%-0.25rem)]' : 'bg-transparent w-0'}
                    `}
                  ></span>
                </button>
              ))}
            </div>
          </nav>

          {/* Mobile arrows */}
          <div className="md:hidden flex items-center gap-1 ml-auto pb-2">
            <button onClick={goPrev} className="p-1.5 rounded-md bg-white/60 shadow-sm">◀</button>
            <div className="flex gap-1.5">
              {deck.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === active ? 'bg-rose-600' : 'bg-white/60'}`}
                ></div>
              ))}
            </div>
            <button onClick={goNext} className="p-1.5 rounded-md bg-white/60 shadow-sm">▶</button>
          </div>
        </div>
      </div>
    </header>

    {/* Main content */}
    <main className="flex-2 overflow-hidden pt-[25rem] sm:pt-28">
      <div
        className="w-full flex h-[calc(100vh-80px)] relative"
        onMouseDown={(e) => onPointerDown(e)}
        onMouseMove={(e) => onPointerMove(e)}
        onMouseUp={() => onPointerUp()}
        onMouseLeave={() => onPointerUp()}
        onTouchStart={(e) => onPointerDown(e)}
        onTouchMove={(e) => onPointerMove(e)}
        onTouchEnd={() => onPointerUp()}
      >
        <div
          ref={containerRef}
          className="flex h-full w-full"
          style={{ width: `${deck.length * 100}%`, transform: `translateX(${ -active * 100 }%)` }}
        >
          {deck.map((s, i) => (
            <section key={s.title} className="w-full flex-shrink-0 p-4 sm:p-8 flex items-center justify-center">
              <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                
                {/* Info card */}
                <div className="order-1 md:order-none bg-white rounded-xl shadow-xl p-6 md:p-8 pb-20 z-10">
                  <h3 className="text-3xl font-extrabold text-rose-700">{s.title}</h3>
                  <p className="mt-4 text-gray-700 leading-relaxed">{s.body}</p>
                  <div className="mt-6 flex gap-3">
                    
                  </div>
                  <div className="mt-6 text-sm text-gray-500">Slide {i + 1} of {deck.length}</div>
                </div>

                {/* Image card */}
                <div className="rounded-xl shadow-2xl overflow-hidden bg-white">
                  <div className="h-80 sm:h-96 md:h-[520px] bg-gray-100 flex items-center justify-center">
                    <img src={s.img || 'https://via.placeholder.com/600x400?text=Placeholder'} alt={s.title} className="object-cover w-full h-full" />
                  </div>
                  <div className="p-6 bg-white">
                    <h2 className="text-2xl font-bold text-rose-700">{s.title}</h2>
                    <p className="mt-2 text-gray-600">{s.subtitle}</p>
                  </div>
                </div>

              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Desktop footer controls (stay inside main) */}
      <div className="hidden md:flex max-w-7xl mx-auto p-4 pt-40 flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {deck.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`px-3 py-1 rounded ${i === active ? 'bg-rose-600 text-white' : 'bg-white'}`}
            >
              {i + 1}
            </button>
          ))}
          <button onClick={goPrev} className="px-1 py-1 bg-white rounded shadow hover:scale-105">Prev</button>
          <button onClick={goNext} className="px-1 py-1 bg-rose-600 text-white rounded shadow hover:scale-105">Next</button>
        </div>
      </div>
    </main>

    {/* Mobile footer controls (always visible before footer) */}
    <div className="md:hidden max-w-7xl mx-auto p-4 pt-10 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        {deck.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`px-3 py-1 rounded ${i === active ? 'bg-rose-600 text-white' : 'bg-white'}`}
          >
            {i + 1}
          </button>
        ))}
        <button onClick={goPrev} className="px-1 py-1 bg-white rounded shadow hover:scale-105">Prev</button>
        <button onClick={goNext} className="px-1 py-1 bg-rose-600 text-white rounded shadow hover:scale-105">Next</button>
      </div>
    
    </div>
  </div>
);
}
