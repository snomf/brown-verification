'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Instagram, Shield, FileText } from 'lucide-react';
import BrunoBear from './components/BrunoBear';
import { getRandomMessage } from '@/lib/bruno';
import Link from 'next/link';
import ThemeToggle from './components/ThemeToggle';
import FAQ from './components/FAQ';
import BotStatus from './components/BotStatus';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [greetingMsg, setGreetingMsg] = useState('');
  const [loggedInMsg, setLoggedInMsg] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();

    setGreetingMsg(getRandomMessage('greetings'));

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      setLoggedInMsg(getRandomMessage('loggedIn', { name: user.user_metadata.full_name }));
    }
  }, [user]);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return (
    <div className="min-h-screen loading-gradient flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <img src="/verified-bear.png" className="w-24 h-24 animate-spin-random" alt="Loading..." />
      </div>
      <p className="text-[#591C0B] font-black text-xl animate-pulse uppercase tracking-widest">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] text-[#4A3728] dark:text-[#F5F5F4] font-sans selection:bg-amber-200 flex flex-col transition-colors duration-300">
      {/* Social Sidebar/Floating */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <a
          href="https://discord.gg/BxjyefMugy"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-white border-2 border-[#591C0B]/10 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-[#5865F2] flex items-center justify-center"
          title="Join the Discord"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 0-1.872-.892.077.077 0 0 1-.041-.128c.125-.094.252-.192.37-.29a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .077.01c.12.098.246.196.372.29a.077.077 0 0 1-.041.128 12.983 12.983 0 0 0-1.872.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
          </svg>
        </a>
        <a
          href="https://instagram.com/gusfringed"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-white border-2 border-[#591C0B]/10 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-[#E4405F]"
          title="Follow @gusfringed"
        >
          <Instagram className="w-6 h-6" />
        </a>
      </div>

      {/* Header */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-50 flex flex-col gap-2">
        <img src="/verified-bear.png" alt="Bruno Verifies" className="w-16 h-auto drop-shadow-sm hover:scale-110 transition-transform cursor-pointer" onClick={() => window.location.href = '/'} />
      </div>

      <div className="fixed bottom-6 left-6 z-50">
        <BotStatus />
      </div>

      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-50 flex gap-4 items-center">
        <ThemeToggle />
        <Link
          href="/terms"
          className="text-sm font-bold text-amber-900/60 hover:text-amber-900 underline decoration-dotted underline-offset-4 flex items-center gap-1"
        >
          <FileText className="w-4 h-4" />
          Terms
        </Link>
        <Link
          href="/privacy"
          className="text-sm font-bold text-amber-900/60 hover:text-amber-900 underline decoration-dotted underline-offset-4 flex items-center gap-1"
        >
          <Shield className="w-4 h-4" />
          Privacy Policy
        </Link>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden pt-20">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-2xl text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black text-[#591C0B] dark:text-amber-500 mb-2 tracking-tight">
            Bruno Verifies
          </h1>
          <p className="text-lg text-[#8C6B5D] dark:text-stone-400 font-medium">
            The Bruno-certified way to get your accepted role.
          </p>
        </div>

        <div className="w-full max-w-xl">
          <BrunoBear state={user ? "loggedIn" : "greetings"}>
            <div className="space-y-6 text-center md:text-left">
              {!user ? (
                <>
                  <h2 className="text-2xl font-black text-[#591C0B] dark:text-amber-500 min-h-[4rem] flex items-center justify-center md:justify-start leading-tight">
                    {greetingMsg}
                  </h2>
                  <button
                    onClick={handleLogin}
                    className="w-full group relative px-8 py-4 bg-[#5865F2] text-white text-lg font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-black flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 0-1.872-.892.077.077 0 0 1-.041-.128c.125-.094.252-.192.37-.29a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .077.01c.12.098.246.196.372.29a.077.077 0 0 1-.041.128 12.983 12.983 0 0 0-1.872.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
                    </svg>
                    <span>Get Your Role</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-2">
                    <img
                      src={user?.user_metadata?.avatar_url || ''}
                      alt="Current User"
                      className="w-12 h-12 rounded-full border-2 border-amber-500 shadow-md"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Hello,</p>
                      <p className="font-bold text-[#591C0B] dark:text-amber-200">{user?.user_metadata?.full_name || user?.user_metadata?.name || 'Brunonian'}</p>
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-[#591C0B] dark:text-amber-500 min-h-[4rem] flex items-center justify-center md:justify-start leading-tight">
                    {loggedInMsg}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {user?.user_metadata?.provider_id === '547599059024740374' && (
                      <Link
                        href="/admin"
                        className="flex-1 py-4 bg-stone-800 dark:bg-amber-600 text-white font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-black text-center text-lg"
                      >
                        Admin Dash
                      </Link>
                    )}
                    <a
                      href="/verify"
                      className="flex-1 py-4 bg-[#CE1126] text-white font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-black text-center text-lg"
                    >
                      Verify Meeee!
                    </a>
                    <button
                      onClick={handleLogout}
                      className="px-6 py-4 bg-white dark:bg-stone-800 text-gray-500 dark:text-stone-400 font-bold rounded-xl border-2 border-[#591C0B]/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-stone-700 transition-colors shadow-sm"
                    >
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </BrunoBear>
        </div>

        <FAQ />
      </main>

      <footer className="w-full text-center p-8 text-[#8C6B5D]/40 dark:text-stone-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
        NOT AFFILIATED WITH BROWN UNIVERSITY • PROTECTED BY BRUNO THE BEAR, OF COURSE • © 2026 BRUNO VERIFIES,{' '}
        <a
          href="https://juainny.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#591C0B] dark:hover:text-amber-500 transition-colors underline decoration-dotted underline-offset-2"
        >
          JUAINNY.COM
        </a>
      </footer>
    </div>
  );
}
