'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowRight, MessageSquare, ShieldCheck } from 'lucide-react';
import BrunoBear from './components/BrunoBear';
import PrivacyModal from './components/PrivacyModal';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />

      {/* Navbarish thing */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-50">
        <img src="/brown-crest.png" alt="Brown University" className="w-16 h-auto opacity-80 hover:opacity-100 transition-opacity" />
      </div>

      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-50 flex gap-4">
        <button
          onClick={() => setShowPrivacy(true)}
          className="text-sm font-bold text-amber-900/60 hover:text-amber-900 underline decoration-dotted underline-offset-4"
        >
          Privacy Policy
        </button>
      </div>

      <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Doodles (CSS or SVG could go here for extra silly vibes) */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">

          {/* Left: Bruno Bear */}
          <div className="flex justify-center md:justify-end order-2 md:order-1">
            <BrunoBear state={user ? "loggedIn" : "greetings"} />
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col items-center md:items-start order-1 md:order-2 space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
            <div>
              <h1 className="text-5xl md:text-7xl font-black text-[#591C0B] mb-2 tracking-tight">
                Bruno Verifies
              </h1>
              <p className="text-xl text-[#8C6B5D] font-medium">
                The friendliest way to get into the Discord.
              </p>
            </div>

            {!user ? (
              <button
                onClick={handleLogin}
                className="group relative px-8 py-5 bg-[#5865F2] text-white text-xl font-bold rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-black cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 fill-current" />
                  Log in with Discord
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ) : (
              <div className="bg-white p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(89,28,11,0.1)] border-2 border-[#591C0B]/10 w-full max-w-md">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Current User"
                    className="w-14 h-14 rounded-full border-2 border-amber-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Logged in as</p>
                    <p className="font-bold text-lg text-[#591C0B]">{user.user_metadata.full_name}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-auto text-xs font-bold text-gray-400 hover:text-red-500"
                  >
                    Logout
                  </button>
                </div>

                <a
                  href="/verify"
                  className="block w-full text-center py-4 bg-[#CE1126] text-white font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-black"
                >
                  Start Verification
                </a>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-[#8C6B5D]/80 font-medium bg-amber-100/50 px-4 py-2 rounded-full">
              <ShieldCheck className="w-4 h-4" />
              <span>We don't store your email. Ever.</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-4 w-full text-center text-[#8C6B5D]/40 text-xs font-bold">
        NOT AFFILIATED WITH BROWN UNIVERSITY • PLEASE DON'T SUE US • WE JUST LIKE BEARS
      </footer>
    </div>
  );
}
