'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Instagram, Shield } from 'lucide-react';
import BrunoBear from './components/BrunoBear';
import { getRandomMessage } from '@/lib/bruno';
import Link from 'next/link';

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
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3728] font-sans selection:bg-amber-200 flex flex-col">

      {/* Social Sidebar/Floating */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <a
          href="https://discord.gg/BxjyefMugy"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 bg-white border-2 border-[#591C0B]/10 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-[#5865F2]"
          title="Join the Discord"
        >
          <MessageSquare className="w-6 h-6 fill-current" />
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
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-50">
        <img src="/brown-crest.png" alt="Brown University" className="w-16 h-auto opacity-80 hover:opacity-100 transition-opacity" />
      </div>

      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-50 flex gap-4 items-center">
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
          <h1 className="text-4xl md:text-6xl font-black text-[#591C0B] mb-2 tracking-tight">
            Bruno Verifies
          </h1>
          <p className="text-lg text-[#8C6B5D] font-medium">
            The friendliest way to get into the Discord.
          </p>
        </div>

        <div className="w-full max-w-xl">
          <BrunoBear state={user ? "loggedIn" : "greetings"}>
            <div className="space-y-6 text-center md:text-left">
              {!user ? (
                <>
                  <h2 className="text-2xl font-black text-[#591C0B] min-h-[4rem] flex items-center justify-center md:justify-start leading-tight">
                    {greetingMsg}
                  </h2>
                  <button
                    onClick={handleLogin}
                    className="w-full group relative px-8 py-4 bg-[#5865F2] text-white text-lg font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-black flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <MessageSquare className="w-6 h-6 fill-current" />
                    <span>Get Your Role</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-2">
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Current User"
                      className="w-12 h-12 rounded-full border-2 border-amber-500 shadow-md"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Welcome back,</p>
                      <p className="font-bold text-[#591C0B]">{user.user_metadata.full_name}</p>
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-[#591C0B] min-h-[4rem] flex items-center justify-center md:justify-start leading-tight">
                    {loggedInMsg}
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="/verify"
                      className="flex-1 py-4 bg-[#CE1126] text-white font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-black text-center text-lg"
                    >
                      Verify Me!
                    </a>
                    <button
                      onClick={handleLogout}
                      className="px-6 py-4 bg-white text-gray-500 font-bold rounded-xl border-2 border-[#591C0B]/10 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </BrunoBear>
        </div>
      </main>

      <footer className="w-full text-center p-8 text-[#8C6B5D]/40 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
        NOT AFFILIATED WITH BROWN UNIVERSITY • PROTECTED BY BRUNO THE BEAR • © 2026 BRUNO VERIFIES
      </footer>
    </div>
  );
}
