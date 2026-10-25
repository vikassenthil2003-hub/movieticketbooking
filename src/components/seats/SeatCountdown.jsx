import React, { useState, useEffect } from 'react';
import { Timer, AlertTriangle } from 'lucide-react';

const SeatCountdown = ({ expiresAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;

    const targetTime = new Date(expiresAt).getTime();

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft <= 60 && timeLeft > 0;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all ${
        isUrgent
          ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
          : 'bg-violet-600/20 border-violet-500/40 text-violet-300'
      }`}
    >
      {isUrgent ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <Timer className="w-4 h-4 text-violet-400" />}
      <span>
        Seats Locked: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

export default SeatCountdown;
