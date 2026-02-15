'use client';
import { useEffect, useState } from 'react';

export default function EventSchedule() {
  const startDate = new Date("2026-02-17T00:00:00");
  const endDate = new Date("2026-03-17T23:59:59");

  const calculateTimeLeft = () => {
    const now = new Date();

    let difference;
    if (now < startDate) {
      difference = startDate - now;
    } else if (now >= startDate && now <= endDate) {
      difference = endDate - now;
    } else {
      difference = 0;
    }

    if (difference <= 0) return null;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (dateObj) =>
    dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div
      className="
        flex flex-nowrap overflow-x-auto sm:flex-wrap justify-center items-center
        gap-2 sm:gap-4 text-gray-800 text-xs sm:text-base
      "
    >
      <div className="min-w-[120px] sm:min-w-[220px] bg-rose-50 px-3 py-1 sm:px-6 sm:py-2 rounded-full shadow border border-gray-300 text-center">
        Start Date: <strong>{formatDate(startDate)}</strong>
      </div>
      <div className="min-w-[120px] sm:min-w-[220px] bg-rose-50 px-3 py-1 sm:px-6 sm:py-2 rounded-full shadow border border-gray-300 text-center">
        End Date: <strong>{formatDate(endDate)}</strong>
      </div>
      <div className="min-w-[120px] sm:min-w-[220px] bg-rose-50 px-3 py-1 sm:px-6 sm:py-2 rounded-full shadow border border-gray-300 text-center">
        ⏳ {new Date() < startDate
          ? "Registration Starts in:"
          : new Date() <= endDate
          ? "Registration Ends in:"
          : "Registration Closed"}
        {" "}
        {timeLeft ? (
          <strong>
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </strong>
        ) : (
          <span className="text-red-600 font-bold">
            {new Date() > endDate ? "Registration Closed" : "Registration Started"}
          </span>
        )}
      </div>
    </div>
  );
}
