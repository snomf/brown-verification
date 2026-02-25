'use client';

import { useState, useEffect } from 'react';

export default function BotStatus() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'online' | 'offline'

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/bot-status');
        const data = await res.json();
        setStatus(data.status);
      } catch (err) {
        setStatus('offline');
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-stone-800 border-2 border-[#591C0B]/10 dark:border-white/10 rounded-full shadow-sm">
      <div className={`w-2.5 h-2.5 rounded-full ${
        status === 'online' ? 'bg-green-500 animate-pulse' :
        status === 'loading' ? 'bg-amber-400' : 'bg-red-500'
      }`}></div>
      <span className="text-[10px] font-black uppercase tracking-widest text-[#591C0B] dark:text-amber-200">
        Bot: {status}
      </span>
    </div>
  );
}
