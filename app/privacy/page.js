'use client';

import { useState } from 'react';
import { Lock, RefreshCw, ChevronRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
    const [demoEmail, setDemoEmail] = useState('');
    const [demoHash, setDemoHash] = useState('');
    const router = useRouter();

    const handleSimulateHash = async (e) => {
        const val = e.target.value;
        setDemoEmail(val);

        if (val.length === 0) {
            setDemoHash('');
            return;
        }

        const msgBuffer = new TextEncoder().encode(val);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setDemoHash(hashHex);
    };

    return (
        <div className="min-h-screen bg-[#1a100d] text-white selection:bg-red-500/30 font-sans p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Bruno
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-red-600/20 p-4 rounded-2xl">
                        <Lock className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">Privacy Policy</h1>
                </div>

                <div className="space-y-12 text-gray-300 leading-relaxed text-lg">
                    <section>
                        <p className="text-xl font-medium text-white mb-4">
                            We take your privacy seriously. The best way to keep data safe is to <span className="text-red-400 underline decoration-wavy">never verify or store it in the first place</span>.
                        </p>
                        <p>
                            This service exists solely to connect your Discord account to your Brown University identity so you can access the server. Once that link is established, we want to forget who you are as quickly as possible.
                        </p>
                    </section>

                    <section className="bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <RefreshCw className="w-6 h-6 text-amber-500" />
                            The Hashing Machine
                        </h2>
                        <p className="mb-6">
                            We do not save your email address in our database. Instead, we run it through a cryptographic function called <strong>SHA-256</strong>. This creates a one-way "hash" or fingerprint. We save this fingerprint to ensure one email equals one Discord account, but we can't reverse it to find out your real email.
                        </p>

                        {/* Interactive Demo */}
                        <div className="bg-black/40 p-6 rounded-2xl border border-white/5 space-y-4">
                            <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 items-center">
                                <div>
                                    <label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Your Email (Not Sent to Server)</label>
                                    <input
                                        type="text"
                                        placeholder="josiah_carberry@brown.edu"
                                        value={demoEmail}
                                        onChange={handleSimulateHash}
                                        className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                    />
                                </div>

                                <div className="flex justify-center pt-6 md:pt-0">
                                    <ChevronRight className="w-6 h-6 text-gray-600 rotate-90 md:rotate-0" />
                                </div>

                                <div>
                                    <label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">What We Store</label>
                                    <div className="w-full bg-green-900/20 border border-green-500/30 rounded-xl px-4 py-3 text-xs font-mono break-all min-h-[46px] flex items-center text-green-400">
                                        {demoHash || "waiting for input..."}
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 italic text-center">
                                Type above to test the hashing live in your browser.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">Our Promises</h2>
                        <ul className="grid gap-4">
                            <li className="bg-white/5 p-4 rounded-xl flex gap-3 items-start border border-white/5">
                                <div className="bg-green-500/20 p-1 rounded-full"><div className="w-2 h-2 bg-green-500 rounded-full"></div></div>
                                <span>We <strong>NEVER</strong> store your Brown password. (We don't even ask for it!)</span>
                            </li>
                            <li className="bg-white/5 p-4 rounded-xl flex gap-3 items-start border border-white/5">
                                <div className="bg-green-500/20 p-1 rounded-full"><div className="w-2 h-2 bg-green-500 rounded-full"></div></div>
                                <span>We <strong>NEVER</strong> sell or share your data with 3rd parties.</span>
                            </li>
                            <li className="bg-white/5 p-4 rounded-xl flex gap-3 items-start border border-white/5">
                                <div className="bg-green-500/20 p-1 rounded-full"><div className="w-2 h-2 bg-green-500 rounded-full"></div></div>
                                <span>We <strong>DO NOT</strong> read your Discord DMs.</span>
                            </li>
                        </ul>
                    </section>
                </div>

                <footer className="mt-20 pt-10 border-t border-white/10 text-center text-gray-600 text-sm">
                    <p>This page is open source.</p>
                </footer>
            </div>
        </div>
    );
}
