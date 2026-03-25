import Link from 'next/link';
import { Shield, Users, MessageSquare, Calendar, CheckCircle2, ChevronDown, Instagram } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export const metadata = {
  title: "Brown University Discord | Class of 2030 | Verified Students (& Other Applicants)",
  description: "Join the official unofficial verified Brown University Discord server for the Class of 2030. Connect with classmates, access organized channels, voice chat, and more.",
  openGraph: {
    title: "Brown University Discord | Class of 2030 | Verified Students (& Other Applicants)",
    description: "Connect with the Brown University Class of 2030 in the official unofficial Discord server. Enjoy organized channels, voice chat, and more.",
    url: 'https://brown.juainny.com/discord',
    siteName: 'Brown University Class of 2030 Discord',
    images: [
      {
        url: '/verified-bear.png',
        width: 800,
        height: 800,
        alt: 'Brown University Verified Bear',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Brown University Discord | Class of 2030 | Verified Students",
    description: "Join the official unofficial verified Brown University Discord server for the Class of 2030. Connect with classmates, access organized channels, voice chat.",
    images: ['/verified-bear.png'],
  },
};

const schemaMarkup = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Brown University Discord | Class of 2030",
  "description": "The official verified Discord server for Brown University Class of 2030 students.",
  "url": "https://brown.juainny.com/discord",
  "publisher": {
    "@type": "Organization",
    "name": "Bruno Verifies",
    "logo": "https://brown.juainny.com/icon.png"
  }
};

export default function DiscordLandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] text-[#4A3728] dark:text-[#F5F5F4] font-sans selection:bg-amber-200 flex flex-col transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      {/* Header */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-50 flex flex-col gap-2">
        <Link href="/">
          <img src="/verified-bear.png" alt="Bruno Verifies" className="w-16 h-auto drop-shadow-sm hover:scale-110 transition-transform cursor-pointer" />
        </Link>
      </div>

      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-50 flex gap-4 items-center">
        <ThemeToggle />
      </div>

      <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#5865F2]/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Hero Section */}
        <section className="w-full max-w-4xl text-center mb-24 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 font-bold text-sm mb-6 shadow-sm border border-amber-200 dark:border-amber-800/50">
            <Shield className="w-4 h-4" />
            <span>Official Class of 2030 Network</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-[#591C0B] dark:text-amber-500 mb-6 tracking-tight leading-tight">
            Welcome Brown <br className="hidden md:block" /> Class of 2030 🐻
          </h1>

          <p className="text-xl md:text-2xl text-[#8C6B5D] dark:text-stone-300 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the largest verified community for incoming students. Meet your future classmates, find roommates, and stay updated.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://discord.gg/BxjyefMugy"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-10 py-5 bg-[#5865F2] text-white text-xl font-bold rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all border-2 border-black flex items-center justify-center gap-3"
            >
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 0-1.872-.892.077.077 0 0 1-.041-.128c.125-.094.252-.192.37-.29a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .077.01c.12.098.246.196.372.29a.077.077 0 0 1-.041.128 12.983 12.983 0 0 0-1.872.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
              </svg>
              Join Discord Server
            </a>
            <Link
              href="/"
              className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-stone-800 text-[#591C0B] dark:text-stone-200 text-xl font-bold rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all border-2 border-[#591C0B]/20 dark:border-stone-600 flex items-center justify-center gap-3"
            >
              Verify Account
            </Link>
          </div>
          <p className="mt-4 text-sm text-[#8C6B5D]/80 dark:text-stone-400 font-semibold uppercase tracking-widest">Dozens of students already joined! You're next, pls?</p>
        </section>

        {/* Why Discord > Insta */}
        <section className="w-full max-w-5xl mb-24 z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-[#591C0B] dark:text-amber-500 mb-4">
              Discord vs. Instagram
            </h2>
            <p className="text-lg text-[#8C6B5D] dark:text-stone-400 font-medium">Why we moved away from instagram DM groups.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Instagram Card (Con) */}
            <div className="bg-white/50 dark:bg-stone-800/50 backdrop-blur-md p-8 rounded-3xl border-2 border-stone-200 dark:border-stone-700/50 relative overflow-hidden group">
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Instagram className="w-24 h-24" />
              </div>
              <h3 className="text-2xl font-black text-rose-500 mb-6 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 block"></span>
                Instagram Groupchats
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold mt-1">✕</span>
                  <span className="text-[#8C6B5D] dark:text-stone-300 font-semibold">250 member limit forces multiple groups</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold mt-1">✕</span>
                  <span className="text-[#8C6B5D] dark:text-stone-300 font-semibold">Chaotic single stream of messages, can never catch up I swear</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold mt-1">✕</span>
                  <span className="text-[#8C6B5D] dark:text-stone-300 font-semibold">Random internet strangers can join, Brown's ED groupchat has Stanford students (where everyone else is)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold mt-1">✕</span>
                  <span className="text-[#8C6B5D] dark:text-stone-300 font-semibold">No voice or screen-sharing casually, or you could get annoying calls</span>
                </li>
              </ul>
            </div>

            {/* Discord Card (Pro) */}
            <div className="bg-white dark:bg-stone-800 p-8 rounded-3xl border-2 border-[#5865F2] shadow-[8px_8px_0px_0px_#5865F2] relative overflow-hidden group">
              <h3 className="text-2xl font-black text-[#5865F2] mb-6 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#5865F2] block"></span>
                The Official Unofficial Discord
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#5865F2] shrink-0 mt-0.5" />
                  <span className="text-[#4A3728] dark:text-stone-200 font-bold">Unlimited members in one unified space</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#5865F2] shrink-0 mt-0.5" />
                  <span className="text-[#4A3728] dark:text-stone-200 font-bold">Organized channels by topic and importance (you can suggest more too!)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#5865F2] shrink-0 mt-0.5" />
                  <span className="text-[#4A3728] dark:text-stone-200 font-bold">Bot-verified authentic students only for student-only channels</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#5865F2] shrink-0 mt-0.5" />
                  <span className="text-[#4A3728] dark:text-stone-200 font-bold">Drop-in voice channel</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full max-w-5xl mb-24 z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-[#591C0B] dark:text-amber-500 mb-4">
              Server Features
            </h2>
            <p className="text-lg text-[#8C6B5D] dark:text-stone-400 font-medium">People that are at the same step you are, where you're going.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 hover:-translate-y-1 transition-transform">
              <Shield className="w-10 h-10 text-amber-500 mb-4" />
              <h3 className="text-xl font-bold text-[#591C0B] dark:text-amber-400 mb-2">Verified Only</h3>
              <p className="text-[#8C6B5D] dark:text-stone-400 font-medium">Our custom bot verifies every member against Brown's systems. No trolls, no randoms. Mods are always there to fix errors and ensure that Brunonians are real.</p>
            </div>

            <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 hover:-translate-y-1 transition-transform">
              <MessageSquare className="w-10 h-10 text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-[#591C0B] dark:text-amber-400 mb-2">Organized Channels</h3>
              <p className="text-[#8C6B5D] dark:text-stone-400 font-medium">Dedicated chats for organized chatting (trust me you need it, you know if you've been in the IG groupchats.).</p>
            </div>

            <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 hover:-translate-y-1 transition-transform">
              <Users className="w-10 h-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-[#591C0B] dark:text-amber-400 mb-2">Role Customization</h3>
              <p className="text-[#8C6B5D] dark:text-stone-400 font-medium">Grab roles for your application process, location and more. More personal roles coming after Ivy Day.</p>
            </div>

            <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 md:col-span-3 lg:col-span-1 hover:-translate-y-1 transition-transform">
              <Calendar className="w-10 h-10 text-purple-500 mb-4" />
              <h3 className="text-xl font-bold text-[#591C0B] dark:text-amber-400 mb-2">Events & Voice Chats</h3>
              <p className="text-[#8C6B5D] dark:text-stone-400 font-medium">Soon, and certainly before your Freshman Fall, we'll have fun events in server.</p>
            </div>
          </div>
        </section>

        {/* Provisional Verification Section */}
        <section className="w-full max-w-5xl mb-24 z-10">
          <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800/50 p-8 md:p-12 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <h2 className="text-3xl md:text-5xl font-black text-[#591C0B] dark:text-amber-500 mb-6 relative z-10">
              New admit without a Brown email yet?
            </h2>
            
            <div className="space-y-6 text-lg text-[#8C6B5D] dark:text-stone-300 relative z-10">
              <p className="font-medium">
                We know it takes time to get your official <strong className="text-[#591C0B] dark:text-amber-400">@brown.edu</strong> email address after Ivy Day. We've built a temporary provisional verification flow just for you!
              </p>
              
              <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700">
                <h3 className="text-xl font-bold text-[#591C0B] dark:text-amber-400 mb-4 flex items-center gap-2">
                  <span className="bg-[#5865F2] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                  Join the Server & Run the Command
                </h3>
                <p className="mb-4">
                  First, join the Discord server. Then, go to any channel and type the slash command:
                </p>
                <div className="bg-stone-100 dark:bg-stone-900 p-4 rounded-xl font-mono text-sm text-[#5865F2] border border-stone-200 dark:border-stone-700 mb-4 inline-block">
                  /ivy-verify
                </div>
                <p className="text-sm">
                  Attach a screenshot of your admissions portal showing your acceptance. Our secure automated bot will review it, or pass it to a human moderator if it can't read it clearly.
                </p>
              </div>

              <div className="bg-white dark:bg-stone-800 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700">
                <h3 className="text-xl font-bold text-[#591C0B] dark:text-amber-400 mb-2 flex items-center gap-2">
                  <span className="bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                  Provisional Verification (No Email)
                </h3>
                <p className="text-sm">
                  Once approved, you'll get your roles for <strong>28 days</strong>. Note: This grants "Provisional" status, which allows you to chat but does <strong>not</strong> include the "Certified Brunonian" internal role. Your temporary access will expire unless you fully authenticate with a Brown email later.
                </p>
              </div>

              <div className="bg-[#5865F2]/10 dark:bg-[#5865F2]/20 p-6 rounded-2xl border-2 border-[#5865F2] relative group">
                <div className="absolute -top-3 -right-3 bg-[#5865F2] text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-lg group-hover:scale-110 transition-transform">
                  Recommended
                </div>
                <h3 className="text-xl font-bold text-[#5865F2] mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Certified Verification (With Email)
                </h3>
                <p className="text-sm text-[#4A3728] dark:text-stone-200">
                  Verifying with your <strong>@brown.edu</strong> email on this website is the gold standard. It grants you <strong>Permanent Access</strong> and the exclusive <strong><CheckCircle2 className="inline w-4 h-4" /> Certified Brunonian</strong> role, proving your identity 100% to the community.
                </p>
              </div>

              <div className="mt-8 text-sm text-[#8C6B5D]/80 dark:text-stone-400 flex items-start gap-3">
                <Shield className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-500" />
                <p>
                  <strong>Privacy Notice:</strong> Your screenshot is processed securely by our bot and only viewable by our moderators in a private, audit-logged channel if manual review is needed. We do not permanently host or save your screenshot.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full max-w-3xl z-10 mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black text-[#591C0B] dark:text-amber-500 mb-4">
              Frequently Asked
            </h2>
          </div>

          <div className="space-y-4">
            <details className="group bg-white dark:bg-stone-800 rounded-2xl shadow-sm border-2 border-transparent hover:border-amber-200 dark:hover:border-stone-600 transition-colors [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-lg text-[#591C0B] dark:text-stone-200 list-none">
                <span>What is this Discord server?</span>
                <ChevronDown className="w-5 h-5 text-amber-500 group-open:-rotate-180 transition-transform duration-300" />
              </summary>
              <div className="px-6 pb-6 text-[#8C6B5D] dark:text-stone-400 font-medium mt-[-10px]">
                The Brown University Class of 2030 Discord is the central hub for incoming freshmen. It's an online community where you can chat, ask questions, find roommates, and connect with your future classmates before stepping on campus.
              </div>
            </details>

            <details className="group bg-white dark:bg-stone-800 rounded-2xl shadow-sm border-2 border-transparent hover:border-amber-200 dark:hover:border-stone-600 transition-colors [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-lg text-[#591C0B] dark:text-stone-200 list-none">
                <span>How do I get verified?</span>
                <ChevronDown className="w-5 h-5 text-amber-500 group-open:-rotate-180 transition-transform duration-300" />
              </summary>
              <div className="px-6 pb-6 text-[#8C6B5D] dark:text-stone-400 font-medium mt-[-10px]">
                There are two ways to get verified! 
                <ul className="mt-2 space-y-2 list-disc pl-5">
                  <li><strong>Certified (Best):</strong> Use our <Link href="/" className="text-amber-600 dark:text-amber-400 underline font-bold">verification portal</Link> with your <strong>@brown.edu</strong> email for permanent access and a "Certified" role.</li>
                  <li><strong>Provisional:</strong> Use the <code>/ivy-verify</code> command in Discord to upload your acceptance letter for a temporary 28-day pass (no email required).</li>
                </ul>
              </div>
            </details>

            <details className="group bg-white dark:bg-stone-800 rounded-2xl shadow-sm border-2 border-transparent hover:border-amber-200 dark:hover:border-stone-600 transition-colors [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-lg text-[#591C0B] dark:text-stone-200 list-none">
                <span>Is this server officially run by Brown University?</span>
                <ChevronDown className="w-5 h-5 text-amber-500 group-open:-rotate-180 transition-transform duration-300" />
              </summary>
              <div className="px-6 pb-6 text-[#8C6B5D] dark:text-stone-400 font-medium mt-[-10px]">
                No, this is a student-run community created by your peers. It is the most active space for the incoming class, but it is not officially affiliated with Brown University administration.
              </div>
            </details>

            <details className="group bg-white dark:bg-stone-800 rounded-2xl shadow-sm border-2 border-transparent hover:border-amber-200 dark:hover:border-stone-600 transition-colors [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-lg text-[#591C0B] dark:text-stone-200 list-none">
                <span>Why do I need to be verified?</span>
                <ChevronDown className="w-5 h-5 text-amber-500 group-open:-rotate-180 transition-transform duration-300" />
              </summary>
              <div className="px-6 pb-6 text-[#8C6B5D] dark:text-stone-400 font-medium mt-[-10px]">
                Verification prevents spam bots, trolls, and non-students from accessing our unique community spaces. It ensures everyone in the specific channels is actually part of the Class of 2030 or a verified upperclassman.
              </div>
            </details>
          </div>
        </section>
      </main>

      <footer className="w-full text-center p-8 text-[#8C6B5D]/40 dark:text-stone-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-auto">
        NOT AFFILIATED WITH BROWN UNIVERSITY • PROTECTED BY BRUNO THE BEAR, OF COURSE • © 2026 BRUNO VERIFIES
      </footer>
    </div>
  );
}
