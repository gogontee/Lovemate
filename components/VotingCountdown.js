"use client"; // Important for Next.js 13+ App Router or hydration safety

import { useEffect, useState } from "react";

export default function VotingCountdown({ endDate }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const updateCountdown = () => {
      const now = new Date();
      const end = new Date(endDate);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Voting closed");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    updateCountdown(); // run once immediately
    const interval = setInterval(updateCountdown, 60000); // update every 60 seconds

    return () => clearInterval(interval);
  }, [endDate]);

  if (!isClient) return null;

  return (
    <span className="text-lg font-bold text-gray-800">{timeLeft}</span>
  );
}
