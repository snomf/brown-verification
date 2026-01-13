'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Send, Check, MessageSquare, Instagram, Shield } from 'lucide-react';
import BrunoBear from '../components/BrunoBear';
import { getRandomMessage } from '@/lib/bruno';
import Link from 'next/link';

export default function Verify() {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [fullEmail, setFullEmail] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState('email'); // 'email' | 'code' | 'success'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Explicit bear message override when needed
    const [customBearMessage, setCustomBearMessage] = useState(null);

    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/');
            } else {
                setUser(user);
            }
        };
        checkUser();
    }, [router]);

    const handleRequestCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setCustomBearMessage(null);

        const emailToVerify = `${username.trim()}@brown.edu`;
        setFullEmail(emailToVerify);

        try {
            const res = await fetch('/api/verify/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailToVerify, userId: user.id }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send code');

            setStep('code');
            setCustomBearMessage(getRandomMessage('codeSent', { email: emailToVerify }));
        } catch (err) {
            setError(err.message);
            setCustomBearMessage(getRandomMessage('error'));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setCustomBearMessage(null);

        try {
            const res = await fetch('/api/verify/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, userId: user.id }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Invalid code');

            setStep('success');
            setCustomBearMessage(getRandomMessage('success', { name: user?.user_metadata?.full_name || user?.user_metadata?.name || 'Friend' }));
        } catch (err) {
            setError(err.message);
            setCustomBearMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#4A3728] font-sans flex flex-col items-center justify-center p-6 overflow-hidden relative">
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

            <div className="absolute top-6 left-6 z-50">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-[#8C6B5D] font-bold hover:text-[#591C0B] transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-[#591C0B]/10"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back Home
                </button>
            </div>

            <div className="absolute top-6 right-6 md:top-10 md:right-10 z-50 flex gap-4">
                <Link
                    href="/privacy"
                    className="text-sm font-bold text-amber-900/60 hover:text-amber-900 underline decoration-dotted underline-offset-4 flex items-center gap-1"
                >
                    <Shield className="w-4 h-4" />
                    Privacy Policy
                </Link>
            </div>

            <div className="w-full max-w-3xl flex flex-col items-center">
                <BrunoBear
                    state={step === 'email' ? 'loggedIn' : step === 'code' ? 'codeSent' : 'success'}
                    customMessage={null}
                >
                    <div className="py-2">
                        {step === 'email' && (
                            <form onSubmit={handleRequestCode} className="space-y-4">
                                <div>
                                    <h2 className="text-2xl font-black text-[#591C0B] mb-1">
                                        {customBearMessage || "What's your Brown (email) username?"}
                                    </h2>
                                    <p className="text-[#8C6B5D] text-sm mb-4">Just the part before the @brown.edu!</p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            placeholder="josiah_carberry"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value.split('@')[0])}
                                            className="w-full bg-[#FDFBF7] border-2 border-[#591C0B]/10 rounded-xl pl-4 pr-32 py-4 text-lg font-medium outline-none focus:border-[#CE1126] focus:bg-white transition-all placeholder:text-gray-300"
                                            required
                                            autoFocus
                                        />
                                        <span className="absolute right-4 text-gray-400 font-bold pointer-events-none">
                                            @brown.edu
                                        </span>
                                    </div>
                                    <button
                                        disabled={loading || !username.trim()}
                                        className="w-full py-4 bg-[#CE1126] text-white font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 border-2 border-black flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Send className="w-5 h-5" /> Send Verification Code</>}
                                    </button>
                                </div>
                                {error && <p className="text-red-500 font-bold text-sm bg-red-100 p-2 rounded-lg">{error}</p>}
                            </form>
                        )}

                        {step === 'code' && (
                            <form onSubmit={handleVerifyCode} className="space-y-4">
                                <div>
                                    <h2 className="text-2xl font-black text-[#591C0B] mb-1">{customBearMessage || "Check your inbox!"}</h2>
                                    <p className="text-[#8C6B5D] text-sm mb-4">
                                        I sent a code to <span className="text-[#CE1126] font-bold">{fullEmail}</span>
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="000000"
                                        maxLength={6}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="flex-1 tracking-[0.5em] text-center text-2xl font-black bg-[#FDFBF7] border-2 border-[#591C0B]/10 rounded-xl px-4 py-3 outline-none focus:border-[#CE1126] focus:bg-white transition-all placeholder:text-gray-200 font-mono"
                                        required
                                        autoFocus
                                    />
                                    <button
                                        disabled={loading}
                                        className="px-6 py-3 bg-[#CE1126] text-white font-bold rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 border-2 border-black"
                                    >
                                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-5 h-5" />}
                                    </button>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <button
                                        type="button"
                                        onClick={() => { setStep('email'); }}
                                        className="font-bold text-gray-400 hover:text-[#591C0B] underline"
                                    >
                                        Wrong email?
                                    </button>
                                    {error && <p className="text-red-500 font-bold">{error}</p>}
                                </div>
                            </form>
                        )}

                        {step === 'success' && (
                            <div className="text-left space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in spin-in-12 duration-500">
                                        <Check className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-[#591C0B] mb-1">
                                            {customBearMessage || "You're In!"}
                                        </h2>
                                        <p className="text-[#8C6B5D] font-medium leading-tight">
                                            Role assigned. You're now a verified Brunonian.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push('/')}
                                    className="w-full py-3 bg-white border-2 border-[#591C0B]/10 text-[#591C0B] font-bold rounded-xl hover:bg-[#FDFBF7] transition-colors mt-4"
                                >
                                    Return to Home
                                </button>
                            </div>
                        )}
                    </div>
                </BrunoBear>
            </div>
        </div>
    );
}
