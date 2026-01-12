'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Send, Check } from 'lucide-react';
import BrunoBear from '../components/BrunoBear';

export default function Verify() {
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState('email'); // 'email' | 'code' | 'success'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [bearState, setBearState] = useState('loggedIn'); // 'loggedIn' | 'codeSent' | 'success' | 'error'

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

        try {
            const res = await fetch('/api/verify/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, userId: user.id }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send code');

            setStep('code');
            setBearState('codeSent');
        } catch (err) {
            setError(err.message);
            setBearState('error');
            setCustomBearMessage(err.message); // Have the bear say the error!
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
            setBearState('success');
        } catch (err) {
            setError(err.message);
            setBearState('error');
            setCustomBearMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#4A3728] font-sans flex flex-col items-center justify-center p-6 overflow-hidden relative">
            <div className="absolute top-6 left-6 z-50">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-[#8C6B5D] font-bold hover:text-[#591C0B] transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-[#591C0B]/10"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back Home
                </button>
            </div>

            <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">

                {/* Left: Interactive Bear */}
                <div className="flex justify-center md:justify-end order-1">
                    <BrunoBear state={bearState} customMessage={customBearMessage} />
                </div>

                {/* Right: Interaction Card */}
                <div className="order-2 w-full max-w-md animate-in fade-in slide-in-from-right-8 duration-700">
                    <div className="bg-white p-8 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(89,28,11,0.1)] border-2 border-[#591C0B]/10 relative">

                        {/* Progress Dots */}
                        <div className="absolute top-6 right-6 flex gap-2">
                            <div className={`w-3 h-3 rounded-full transition-colors ${step === 'email' ? 'bg-[#CE1126]' : 'bg-gray-200'}`}></div>
                            <div className={`w-3 h-3 rounded-full transition-colors ${step === 'code' ? 'bg-[#CE1126]' : 'bg-gray-200'}`}></div>
                            <div className={`w-3 h-3 rounded-full transition-colors ${step === 'success' ? 'bg-[#CE1126]' : 'bg-gray-200'}`}></div>
                        </div>

                        {step === 'email' && (
                            <form onSubmit={handleRequestCode} className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black text-[#591C0B] mb-2">Student Email</h2>
                                    <p className="text-[#8C6B5D]">Where should Bruno send the secret code?</p>
                                </div>

                                <div>
                                    <input
                                        type="email"
                                        placeholder="josiah_carberry@brown.edu"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#FDFBF7] border-2 border-[#591C0B]/10 rounded-xl px-4 py-4 text-lg font-medium outline-none focus:border-[#CE1126] focus:bg-white transition-all placeholder:text-gray-300"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <button
                                    disabled={loading}
                                    className="w-full py-4 bg-[#CE1126] text-white font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none border-2 border-black"
                                >
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                        <>
                                            Send Code <Send className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {step === 'code' && (
                            <form onSubmit={handleVerifyCode} className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-black text-[#591C0B] mb-2">Check Inbox!</h2>
                                    <p className="text-[#8C6B5D] text-sm break-all">
                                        We sent a code to <span className="text-[#CE1126] font-bold">{email}</span>
                                    </p>
                                </div>

                                <div>
                                    <input
                                        type="text"
                                        placeholder="000000"
                                        maxLength={6}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full tracking-[1rem] text-center text-3xl font-black bg-[#FDFBF7] border-2 border-[#591C0B]/10 rounded-xl px-4 py-4 outline-none focus:border-[#CE1126] focus:bg-white transition-all placeholder:text-gray-200 font-mono"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <button
                                    disabled={loading}
                                    className="w-full py-4 bg-[#CE1126] text-white font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none border-2 border-black"
                                >
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                        <>
                                            Verify Me! <Check className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setStep('email'); setBearState('loggedIn'); }}
                                    className="w-full text-center text-sm font-bold text-gray-400 hover:text-[#591C0B]"
                                >
                                    Wrong email? Go back.
                                </button>
                            </form>
                        )}

                        {step === 'success' && (
                            <div className="text-center space-y-6 py-4">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-in zoom-in spin-in-12 duration-500">
                                    <Check className="w-10 h-10 text-green-600" />
                                </div>

                                <div>
                                    <h2 className="text-3xl font-black text-[#591C0B] mb-2">You're In!</h2>
                                    <p className="text-[#8C6B5D]">
                                        Your Discord role has been assigned. You're officially a verified Brownie.
                                    </p>
                                </div>

                                <button
                                    onClick={() => router.push('/')}
                                    className="w-full py-4 bg-white border-2 border-[#591C0B]/10 text-[#591C0B] font-bold rounded-xl hover:bg-[#FDFBF7] transition-colors"
                                >
                                    Return to Home
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
