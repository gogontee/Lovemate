'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function EventSchedule() {
  const registrationOpenDate = new Date("2026-04-20T00:00:00").getTime();
  const registrationCloseDate = new Date("2026-05-10T23:59:59").getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [registrationStatus, setRegistrationStatus] = useState('not_started');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      
      if (now < registrationOpenDate) {
        setRegistrationStatus('not_started');
        const distance = registrationOpenDate - now;
        
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } 
      else if (now >= registrationOpenDate && now < registrationCloseDate) {
        setRegistrationStatus('open');
        const distance = registrationCloseDate - now;
        
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
      else {
        setRegistrationStatus('closed');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [registrationOpenDate, registrationCloseDate]);

  const getTimerLabel = () => {
    if (registrationStatus === 'not_started') {
      return "REGISTRATION STARTS IN";
    } else if (registrationStatus === 'open') {
      return "REGISTRATION CLOSES IN";
    } else {
      return "REGISTRATION CLOSED";
    }
  };

  if (registrationStatus === 'closed') {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-gray-500/30 text-center">
          <div className="text-sm text-gray-300/80 uppercase tracking-wider mb-2">
            REGISTRATION CLOSED
          </div>
          <div className="text-gray-400">
            See you next season!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-md mx-auto"
      >
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-rose-500/30">
          <div className="text-xs sm:text-sm text-rose-300/80 uppercase tracking-wider mb-3 sm:mb-4 text-center">
            {getTimerLabel()}
          </div>
          
          <div className="flex justify-center gap-4 sm:gap-8">
            {/* Days */}
            <div className="text-center">
              <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-red-600">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400 uppercase mt-1 sm:mt-2">
                DAYS
              </div>
            </div>
            
            <div className="text-rose-500/50 text-2xl sm:text-4xl md:text-5xl font-bold">:</div>
            
            {/* Hours */}
            <div className="text-center">
              <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-red-600">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400 uppercase mt-1 sm:mt-2">
                HRS
              </div>
            </div>
            
            <div className="text-rose-500/50 text-2xl sm:text-4xl md:text-5xl font-bold">:</div>
            
            {/* Minutes */}
            <div className="text-center">
              <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-red-600">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400 uppercase mt-1 sm:mt-2">
                MIN
              </div>
            </div>
            
            <div className="text-rose-500/50 text-2xl sm:text-4xl md:text-5xl font-bold">:</div>
            
            {/* Seconds */}
            <div className="text-center">
              <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-red-600">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-400 uppercase mt-1 sm:mt-2">
                SEC
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}