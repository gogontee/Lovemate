// components/Countdown.js
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { motion } from "framer-motion";

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [status, setStatus] = useState("loading"); // loading, not_started, open, closed
  const [targetDate, setTargetDate] = useState(null);

  // 1. Fetch dates from Supabase
  useEffect(() => {
    const fetchDates = async () => {
      const { data, error } = await supabase
        .from("lovemate")
        .select("reg_open, reg_closed")
        .single();

      if (data) {
        const now = new Date().getTime();
        const open = new Date(data.reg_open).getTime();
        const closed = new Date(data.reg_closed).getTime();

        if (now < open) {
          setStatus("not_started");
          setTargetDate(open);
        } else if (now >= open && now < closed) {
          setStatus("open");
          setTargetDate(closed);
        } else {
          setStatus("closed");
        }
      }
    };
    fetchDates();
  }, []);

  // 2. Timer logic
  useEffect(() => {
    if (!targetDate || status === "closed") return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
        setStatus(status === "not_started" ? "open" : "closed");
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, status]);

  if (status === "loading") return null;

  if (status === "closed") {
    return (
      <div className="bg-black/40 backdrop-blur-md border border-red-500/30 rounded-xl px-6 py-4 text-center">
        <h3 className="text-red-500 font-bold uppercase tracking-widest text-sm mb-1">Registration Closed</h3>
        <p className="text-gray-300 text-xs">See you next season!</p>
      </div>
    );
  }

  const label = status === "not_started" ? "Registration Opens In" : "Registration Closes In";

  // Helper to format numbers to 2 digits (e.g., "09" instead of "9")
  const pad = (num) => String(num).padStart(2, "0");

  return (
    <motion.div 
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative"
    >
      {/* Sci-Fi Glowing Rings (Background) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-64 h-64 border border-red-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="absolute w-48 h-48 border-2 border-red-500/50 rounded-full border-t-transparent animate-[spin_7s_linear_infinite_reverse]" />
        <div className="absolute w-56 h-56 border border-red-500/20 rounded-full border-l-transparent" />
        <div className="absolute w-[110%] h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent rotate-45" />
        <div className="absolute w-[110%] h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent -rotate-45" />
      </div>

      {/* Timer Content */}
      <div className="relative z-10 flex flex-col items-center bg-black/30 backdrop-blur-sm p-6 rounded-2xl border border-white/5 shadow-2xl">
        <span className="text-red-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">
          {label}
        </span>
        
        <div className="flex items-center gap-1 md:gap-3">
          {/* Days */}
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              {pad(timeLeft.days)}
            </span>
            <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">Days</span>
          </div>
          
          <span className="text-3xl text-red-500/50 font-light mb-4">:</span>
          
          {/* Hours */}
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              {pad(timeLeft.hours)}
            </span>
            <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">Hours</span>
          </div>
          
          <span className="text-3xl text-red-500/50 font-light mb-4">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              {pad(timeLeft.minutes)}
            </span>
            <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">Mins</span>
          </div>
          
          <span className="text-3xl text-red-500/50 font-light mb-4">:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
              {pad(timeLeft.seconds)}
            </span>
            <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">Secs</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}