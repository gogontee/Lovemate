'use client';
import { useEffect, useState } from 'react';

export default function RegistrationCountdown({ startDate, endDate }) {
  const calculateTimeLeft = () => {
    const now = new Date();
    let difference;

    if (now < new Date(startDate)) {
      // Before registration starts
      difference = new Date(startDate) - now;
    } else if (now >= new Date(startDate) && now <= new Date(endDate)) {
      // During registration, countdown to end date
      difference = new Date(endDate) - now;
    } else {
      // After registration ends
      return null;
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [startDate, endDate]);

  if (!timeLeft) {
    return <span className="text-red-600 font-bold">Registration Closed</span>;
  }

  return (
    <strong>
      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
    </strong>
  );
}
