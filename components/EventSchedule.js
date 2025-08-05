'use client';
import { useEffect, useState } from 'react';

export default function EventSchedule({ startDate, endDate }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(endDate) - +new Date();
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
  }, [endDate]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div
      className="
        flex flex-nowrap overflow-x-auto sm:flex-wrap justify-center items-center
        gap-4 text-gray-700 text-sm sm:text-base
      "
    >
      <div className="min-w-[220px] bg-rose-50 px-6 py-2 rounded-full shadow border border-gray-300 text-center">
        Start Date: <strong>{formatDate(startDate)}</strong>
      </div>
      <div className="min-w-[220px] bg-rose-50 px-6 py-2 rounded-full shadow border border-gray-300 text-center">
        End Date: <strong>{formatDate(endDate)}</strong>
      </div>
      <div className="min-w-[220px] bg-rose-50 px-6 py-2 rounded-full shadow border border-gray-300 text-center">
        ⏳ Voting closes in:{' '}
        {timeLeft ? (
          <strong>
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </strong>
        ) : (
          <span className="text-red-600 font-bold">Voting closed</span>
        )}
      </div>
    </div>
  );
}
