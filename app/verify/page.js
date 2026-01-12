'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, Key, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';

export default function Verify() {
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState('email'); // 'email' or 'code' or 'success'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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

        try {
            const res = await fetch('/api/verify/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, userId: user.id }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send code');

            setStep('code');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/verify/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, userId: user.id }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Invalid code');

            setStep('success');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#120a07] text-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
                {/* Progress bar */}
                <div className="absolute top-0 left-0 h-1 bg-red-600 transition-all duration-500" style={{ width: step === 'email' ? '33%' : step === 'code' ? '66%' : '100%' }}></div>

                <button
                    onClick={() => step === 'code' ? setStep('email') : router.push('/')}
                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                {step === 'email' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-red-600/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                            <Mail className="w-6 h-6 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">School Email</h1>
                        <p className="text-gray-400 text-sm mb-6">Enter your school email address to receive a verification code.</p>

                        <form onSubmit={handleRequestCode} className="space-y-4">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="student@brown.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-600/50 transition-all"
                                    required
                                />
                            </div>
                            {error && <p className="text-red-500 text-xs">{error}</p>}
                            <button
                                disabled={loading}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Code'}
                            </button>
                        </form>
                    </div>
                )}

                {step === 'code' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-amber-600/20 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                            <Key className="w-6 h-6 text-amber-500" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
                        <p className="text-gray-400 text-sm mb-6">We sent a unique code to <span className="text-white font-medium">{email}</span>. It expires in 10 minutes.</p>

                        <form onSubmit={handleVerifyCode} className="space-y-4">
                            <input
                                type="text"
                                placeholder="6-digit code"
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full tracking-[1em] text-center text-xl bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-600/50 transition-all font-mono"
                                required
                            />
                            {error && <p className="text-red-500 text-xs">{error}</p>}
                            <button
                                disabled={loading}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Code'}
                            </button>
                        </form>
                        <button
                            onClick={() => setStep('email')}
                            className="w-full mt-4 text-sm text-gray-500 hover:text-white transition-colors"
                        >
                            Didn't get a code? Try again.
                        </button>
                    </div>
                )}

                {step === 'success' && (
                    <div className="text-center animate-in zoom-in duration-500">
                        <div className="bg-red-600/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-10 h-10 text-red-500" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Verified!</h1>
                        <p className="text-gray-400 mb-8">Your role has been assigned. You can now close this window and go back to Discord.</p>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all"
                        >
                            Return Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
