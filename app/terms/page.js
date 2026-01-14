'use client';

import { FileText, ArrowLeft, ShieldAlert, Ban } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
    const router = useRouter();

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
                        <FileText className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">Terms of Service</h1>
                </div>

                <div className="space-y-12 text-gray-300 leading-relaxed text-lg">
                    <section>
                        <p className="text-xl font-medium text-white mb-4">
                            By using Bruno Verifies, you agree to these <span className="text-red-400 underline decoration-wavy">simple rules.</span>
                        </p>
                        <p>
                            This service is designed to verify your status as a Brown University student on Discord. We want to keep this community safe and authentic.
                        </p>
                    </section>

                    <section className="bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <ShieldAlert className="w-6 h-6 text-amber-500" />
                            No Affiliation with Brown
                        </h2>
                        <p className="mb-6">
                            Bruno Verifies is a student-run project and is <strong>not</strong> officially affiliated with, endorsed by, or connected to Brown University administration.
                        </p>
                        <p>
                            We provide this service "as is" without any warranties. While we try our best to keep things running smoothly, things might break occasionally.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">Usage Rules</h2>
                        <ul className="grid gap-4">
                            <li className="bg-white/5 p-4 rounded-xl flex gap-3 items-start border border-white/5">
                                <div className="bg-red-500/20 p-1 rounded-full"><div className="w-2 h-2 bg-red-500 rounded-full"></div></div>
                                <span><strong>Do not</strong> attempt to verify with an email address that does not belong to you.</span>
                            </li>
                            <li className="bg-white/5 p-4 rounded-xl flex gap-3 items-start border border-white/5">
                                <div className="bg-red-500/20 p-1 rounded-full"><div className="w-2 h-2 bg-red-500 rounded-full"></div></div>
                                <span><strong>Do not</strong> spam the verification bot or API endpoints.</span>
                            </li>
                            <li className="bg-white/5 p-4 rounded-xl flex gap-3 items-start border border-white/5">
                                <div className="bg-red-500/20 p-1 rounded-full"><div className="w-2 h-2 bg-red-500 rounded-full"></div></div>
                                <span>We reserve the right to <strong>revoke</strong> your verification or ban you from the service (and server) if you violate these terms.</span>
                            </li>
                        </ul>
                    </section>
                </div>

                <footer className="mt-20 pt-10 border-t border-white/10 text-center text-gray-600 text-sm">
                    <p>Last updated: January 2026</p>
                </footer>
            </div>
        </div>
    );
}
