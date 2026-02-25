'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Send, Check, Instagram, Shield, FileText } from 'lucide-react';
import BrunoBear from '../components/BrunoBear';
import { getRandomMessage } from '@/lib/bruno';
import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';
import BotStatus from '../components/BotStatus';

export default function Verify() {
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [fullEmail, setFullEmail] = useState('');
    const [isAlumni, setIsAlumni] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState('@brown.edu');
    const [classYear, setClassYear] = useState('2030');
    const [showClassOptions, setShowClassOptions] = useState(false);
    const [code, setCode] = useState('');
    const [step, setStep] = useState('email'); // 'email' | 'code' | 'success'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resendTimer, setResendTimer] = useState(0);

    // Explicit bear message override when needed
    const [customBearMessage, setCustomBearMessage] = useState(null);

    const router = useRouter();

    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

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

        let finalEmail = `${username.trim()}${selectedDomain}`;
        setFullEmail(finalEmail);

        if (selectedDomain === '@alumni.brown.edu') {
            setIsAlumni(true);
        } else {
            setIsAlumni(false);
        }

        try {
            const res = await fetch('/api/verify/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: finalEmail, userId: user.id }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to send code');

            setStep('code');
            setResendTimer(60);
            setCustomBearMessage(getRandomMessage('codeSent', { email: finalEmail }));
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
                body: JSON.stringify({
                    code,
                    userId: user.id,
                    isAlumni: isAlumni,
                    classYear: !isAlumni && showClassOptions ? classYear : null
                }),
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
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] text-[#4A3728] dark:text-[#F5F5F4] font-sans flex flex-col items-center justify-center p-6 overflow-hidden relative transition-colors duration-300">
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

            <div className="absolute top-6 left-6 z-50 flex flex-col gap-2">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-[#8C6B5D] font-bold hover:text-[#591C0B] transition-colors bg-white dark:bg-stone-800 px-4 py-2 rounded-full shadow-sm border border-[#591C0B]/10 dark:border-white/10"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back Home
                </button>
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

            <div className="w-full max-w-3xl flex flex-col items-center">
                <BrunoBear
                    state={step === 'email' ? 'loggedIn' : step === 'code' ? 'codeSent' : 'success'}
                    customMessage={null}
                >
                    <div className="py-2">
                        {step === 'email' && (
                            <form onSubmit={handleRequestCode} className="space-y-4">
                                <div>
                                    <h2 className="text-2xl font-black text-[#591C0B] dark:text-amber-500 mb-1">
                                        {customBearMessage || "What's your Brown (email) username?"}
                                    </h2>
                                    <p className="text-[#8C6B5D] dark:text-stone-400 text-sm mb-4">Just the part before the @brown.edu!</p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="relative group">
                                        <div className="flex bg-[#FDFBF7] dark:bg-stone-900 border-2 border-[#591C0B]/10 dark:border-white/10 rounded-xl overflow-hidden focus-within:border-[#CE1126] focus-within:bg-white dark:focus-within:bg-stone-800 transition-all shadow-sm">
                                            <input
                                                type="text"
                                                placeholder="josiah_carberry"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value.replace(/@/g, ''))}
                                                className="flex-1 pl-4 py-4 text-lg font-medium outline-none bg-transparent placeholder:text-gray-300 dark:placeholder:text-stone-600 dark:text-stone-100"
                                                required
                                                autoFocus
                                            />
                                            <select
                                                value={selectedDomain}
                                                onChange={(e) => setSelectedDomain(e.target.value)}
                                                className="bg-[#591C0B]/5 dark:bg-white/5 border-l-2 border-[#591C0B]/10 dark:border-white/10 px-4 py-4 text-sm font-bold text-[#591C0B] dark:text-amber-200 outline-none cursor-pointer hover:bg-[#591C0B]/10 dark:hover:bg-white/10 transition-colors appearance-none pr-8"
                                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23591C0B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
                                            >
                                                <option value="@brown.edu">@brown.edu</option>
                                                <option value="@alumni.brown.edu">@alumni.brown.edu</option>
                                            </select>
                                        </div>
                                        <p className="mt-1.5 text-xs text-[#8C6B5D] font-medium opacity-60">No need to type the @ domain!</p>
                                    </div>
                                    <button
                                        disabled={loading || !username.trim()}
                                        className="w-full py-4 bg-[#CE1126] text-white font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 border-2 border-black flex items-center justify-center gap-2"
                                    >
                                        {loading ? <img src="/verified-bear.png" className="w-6 h-6 animate-spin-random" alt="Loading..." /> : <><Send className="w-5 h-5" /> Send Verification Code</>}
                                    </button>

                                    {/** Optional Advanced Settings for Current Students */}
                                    {selectedDomain === '@brown.edu' && (
                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowClassOptions(!showClassOptions)}
                                                className="text-xs font-bold text-[#8C6B5D] hover:text-[#591C0B] flex items-center gap-1 mb-2 transition-colors"
                                            >
                                                {showClassOptions ? '[-]' : '[+]'} I want to add my Class Year (Optional)
                                            </button>

                                            {showClassOptions && (
                                                <div className="bg-white/50 p-4 rounded-xl border-2 border-[#591C0B]/5 animate-in slide-in-from-top-2">
                                                    <p className="text-xs text-[#8C6B5D] mb-2 font-bold">Select your Class Year:</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {['2030', '2029', '2028', '2027', '2026'].map((year) => (
                                                            <button
                                                                key={year}
                                                                type="button"
                                                                onClick={() => setClassYear(year === classYear ? '' : year)}
                                                                className={`p-2 rounded-lg text-sm font-bold border-2 transition-all ${classYear === year
                                                                    ? 'bg-[#591C0B] text-white border-[#591C0B]'
                                                                    : 'bg-white text-gray-500 border-transparent hover:border-[#591C0B]/10'
                                                                    }`}
                                                            >
                                                                {year === '2030' ? "Class of '30 (Default)" : `Class of '${year.slice(2)}`}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {error && <p className="text-red-500 font-bold text-sm bg-red-100 p-2 rounded-lg">{error}</p>}
                            </form>
                        )}

                        {step === 'code' && (
                            <form onSubmit={handleVerifyCode} className="space-y-4">
                                <div>
                                    <h2 className="text-2xl font-black text-[#591C0B] dark:text-amber-500 mb-1">{customBearMessage || "Check your inbox!"}</h2>
                                    <p className="text-[#8C6B5D] dark:text-stone-400 text-sm mb-4">
                                        I sent a code to <span className="text-[#CE1126] dark:text-red-400 font-bold">{fullEmail}</span>
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="000000"
                                        maxLength={6}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="flex-1 tracking-[0.5em] text-center text-2xl font-black bg-[#FDFBF7] dark:bg-stone-900 border-2 border-[#591C0B]/10 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#CE1126] focus:bg-white dark:focus:bg-stone-800 transition-all placeholder:text-gray-200 dark:placeholder:text-stone-700 dark:text-stone-100 font-mono"
                                        required
                                        autoFocus
                                    />
                                    <button
                                        disabled={loading}
                                        className="px-6 py-3 bg-[#CE1126] text-white font-bold rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 border-2 border-black"
                                    >
                                        {loading ? <img src="/verified-bear.png" className="w-6 h-6 animate-spin-random" alt="Loading..." /> : <Check className="w-5 h-5" />}
                                    </button>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <button
                                            type="button"
                                            onClick={() => { setStep('email'); }}
                                            className="font-bold text-gray-400 hover:text-[#591C0B] underline transition-colors"
                                        >
                                            Wrong email?
                                        </button>
                                        <button
                                            type="button"
                                            disabled={loading || resendTimer > 0}
                                            onClick={handleRequestCode}
                                            className="font-bold text-[#CE1126] dark:text-red-400 hover:underline disabled:opacity-50 disabled:no-underline transition-all"
                                        >
                                            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                                        </button>
                                    </div>
                                    {error && <p className="text-red-500 font-bold text-sm bg-red-100 p-2 rounded-lg">{error}</p>}
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
                                        <h2 className="text-3xl font-black text-[#591C0B] dark:text-amber-500 mb-1">
                                            {customBearMessage || "You're In!"}
                                        </h2>
                                        <p className="text-[#8C6B5D] dark:text-stone-400 font-medium leading-tight">
                                            Role assigned. You're now a verified Brunonian.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push('/')}
                                    className="w-full py-3 bg-white dark:bg-stone-800 border-2 border-[#591C0B]/10 dark:border-white/10 text-[#591C0B] dark:text-amber-500 font-bold rounded-xl hover:bg-[#FDFBF7] dark:hover:bg-stone-700 transition-colors mt-4"
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
