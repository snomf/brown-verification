'use client';

import { useState } from 'react';
import { X, Lock, RefreshCw, ChevronRight } from 'lucide-react';
import { hashEmail } from '@/lib/crypto'; // We might need to move this to a client-safe spot or duplicate simple sha256 logic if it's node-only. 
// Assuming lib/crypto is shared or we can implement a simple client-side hash for demo.

export default function PrivacyModal({ isOpen, onClose }) {
    const [demoEmail, setDemoEmail] = useState('');
    const [demoHash, setDemoHash] = useState('');

    if (!isOpen) return null;

    const handleSimulateHash = async (e) => {
        const val = e.target.value;
        setDemoEmail(val);

        if (val.length === 0) {
            setDemoHash('');
            return;
        }

        // Simple textual simulation for visual effect or real hash if possible.
        // For privacy demonstration, showing a real SHA256 slice is cool.
        const msgBuffer = new TextEncoder().encode(val);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setDemoHash(hashHex);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-[#1a100d] text-white border border-white/10 rounded-3xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-red-600/20 p-3 rounded-xl">
                        <Lock className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-bold">Privacy Policy</h2>
                </div>

                <div className="space-y-6 text-gray-300 leading-relaxed">
                    <p>
                        At <strong>Bruno Verifies</strong>, we take your privacy seriously. In fact, we designed this entire system so that <strong>we assume we cannot trust ourselves</strong> with your data.
                    </p>

                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-amber-500" />
                            How Hashing Works
                        </h3>
                        <p className="mb-4 text-sm">
                            We never store your actual email address. Instead, we convert it into a unique mathematical "fingerprint" called a <strong>Hash</strong>. This process is irreversible.
                        </p>

                        {/* Interactive Demo */}
                        <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-3">
                            <div className="grid md:grid-cols-[1fr,auto,1fr] gap-2 items-center">
                                <div>
                                    <label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-1 block">Your Email</label>
                                    <input
                                        type="text"
                                        placeholder="josiah_carberry@brown.edu"
                                        value={demoEmail}
                                        onChange={handleSimulateHash}
                                        className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 transition-colors"
                                    />
                                </div>

                                <div className="flex justify-center">
                                    <ChevronRight className="w-5 h-5 text-gray-500" />
                                </div>

                                <div>
                                    <label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-1 block">What We See</label>
                                    <div className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono break-all min-h-[38px] flex items-center text-green-400">
                                        {demoHash || "waiting for input..."}
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 italic text-center">
                                Try typing above to see how your email is transformed instantly.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">The "One User, One Account" Rule</h3>
                        <p>
                            We store this hash to ensure that each student email is only used once. If you try to verify a second Discord account with the same email, the system will see that the hash already exists and prevent it.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Data We Do NOT Store</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>We do <span className="text-red-400">NOT</span> store your Brown password.</li>
                            <li>We do <span className="text-red-400">NOT</span> store your emails.</li>
                            <li>We do <span className="text-red-400">NOT</span> have access to your Discord DMs.</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
                    >
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );
}
