'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, GraduationCap, Lock, ArrowRight, MessageSquare } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();

    // Listen for auth changes
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
    <div className="min-h-screen bg-[#120a07] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#120a07] text-white selection:bg-red-600/30">
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 blur-[120px] rounded-full"></div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center">
        {/* Header/Logo Area */}
        <div className="mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="bg-red-600/20 p-3 rounded-2xl border border-red-500/30">
            <GraduationCap className="w-8 h-8 text-red-500" />
          </div>
          <span className="text-xl font-bold tracking-tight">BrownPortal</span>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            Verify Your <span className="text-red-500">Excellence.</span>
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed mb-10">
            Securely connect your Discord account to the Brown University community.
            Privacy-first verification that protects your student identity.
          </p>

          {!user ? (
            <button
              onClick={handleLogin}
              className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <div className="relative z-10 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Connect Discord
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-amber-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-xl">
                {/* Discord Avatar */}
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full ring-2 ring-red-500/50"
                />
                <div className="text-left">
                  <p className="text-sm text-gray-400">Logged in as</p>
                  <p className="font-bold">{user.user_metadata.full_name || user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>

              <a
                href="/verify"
                className="group relative px-8 py-4 bg-red-600 text-white font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              >
                Start Verification
              </a>
            </div>
          )}
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <FeatureCard
            icon={<Lock className="w-6 h-6 text-red-500" />}
            title="Privacy First"
            description="Your email is hashed and deleted. Even the server owner can't see it."
          />
          <FeatureCard
            icon={<ShieldCheck className="w-6 h-6 text-red-500" />}
            title="Secure Login"
            description="Verified through official Discord OAuth2 for maximum security."
          />
          <FeatureCard
            icon={<GraduationCap className="w-6 h-6 text-red-500" />}
            title="Instant Roles"
            description="Get your Discord roles assigned automatically upon success."
          />
        </div>
      </main>

      <footer className="mt-auto py-10 text-center text-gray-500 text-sm">
        &copy; 2026 Brown Verification Portal. Not affiliated with Brown University.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
