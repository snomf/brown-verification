'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquare } from 'lucide-react';
import BrunoBear from './components/BrunoBear';
import { getRandomMessage } from '@/lib/bruno';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Store messages in state to prevent hydration mismatches and ensure stability
  const [greetingMsg, setGreetingMsg] = useState('');
  const [loggedInMsg, setLoggedInMsg] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();

    // Initial random messages
    setGreetingMsg(getRandomMessage('greetings'));

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Update logged in message when user changes
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
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3728] font-sans selection:bg-amber-200">

      {/* Header */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-50">
        <img src="/brown-crest.png" alt="Brown University" className="w-16 h-auto opacity-80 hover:opacity-100 transition-opacity" />
      </div>

      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-50 flex gap-4">
        <Link
          href="/privacy"
          className="text-sm font-bold text-amber-900/60 hover:text-amber-900 underline decoration-dotted underline-offset-4"
        >
          Privacy Policy
        </Link>
      </div>

      <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
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
          {/* Pass state just for tracking, but we handle message rendering manually inside children */}
          <BrunoBear state={user ? "loggedIn" : "greetings"}>
            <div className="space-y-6 text-center md:text-left">
              {!user ? (
                <>
                  <h2 className="text-2xl font-black text-[#591C0B] min-h-[4rem] flex items-center justify-center md:justify-start">
                    {greetingMsg || "Hi! I'm Bruno."}
                  </h2>
                  <button
                    onClick={handleLogin}
                    className="w-full group relative px-8 py-4 bg-[#5865F2] text-white text-lg font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-black flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-5 h-5 fill-current" />
                    Yes! Log in with Discord
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-2">
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Current User"
                      className="w-12 h-12 rounded-full border-2 border-amber-500"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Welcome back,</p>
                      <p className="font-bold text-[#591C0B]">{user.user_metadata.full_name}</p>
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-[#591C0B] min-h-[4rem] flex items-center justify-center md:justify-start leading-tight">
                    {loggedInMsg || "I recognize you!"}
                  </h2>
                  <div className="flex gap-3">
                    <a
                      href="/verify"
                      className="flex-1 py-3 bg-[#CE1126] text-white font-bold rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-black text-center"
                    >
                      Verify Me!
                    </a>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-3 bg-white text-gray-500 font-bold rounded-xl border-2 border-[#591C0B]/10 hover:bg-gray-50 transition-colors"
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

      <footer className="absolute bottom-4 w-full text-center text-[#8C6B5D]/40 text-xs font-bold">
        NOT AFFILIATED WITH BROWN UNIVERSITY • PLEASE DON'T SUE US • WE JUST LIKE BEARS
      </footer>
    </div>
  );
}
