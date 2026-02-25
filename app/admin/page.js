'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Loader2, User, CheckCircle, XCircle, Trash2, RefreshCw, ExternalLink } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import BotStatus from '../components/BotStatus';

const ADMIN_ID = '547599059024740374';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, student: 0, alumni: 0 });
  const [actionLoading, setActionLoading] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      const discordId = user.user_metadata.provider_id;
      if (discordId !== ADMIN_ID) {
        router.push('/');
        return;
      }

      setUser(user);
      setIsAdmin(true);
      fetchData();
    };
    checkAdmin();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/verifications', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setVerifications(data.verifications);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (discordId, action) => {
    setActionLoading(discordId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ discordId, action }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(`Action ${action} failed:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-[#CE1126] animate-spin" />
        <p className="text-[#591C0B] dark:text-amber-500 font-bold animate-pulse">Checking credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] text-[#4A3728] dark:text-[#F5F5F4] font-sans p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="hover:scale-110 transition-transform">
                <img src="/verified-bear.png" alt="Bruno" className="w-12 h-auto" />
              </Link>
              <div className="flex flex-col">
                <h1 className="text-4xl font-black text-[#591C0B] dark:text-amber-500 tracking-tight uppercase leading-tight">Admin Dashboard</h1>
                <BotStatus />
              </div>
            </div>
            <p className="text-[#8C6B5D] dark:text-stone-400 font-medium pl-1">Manage Brunonian verifications and roles.</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={fetchData}
              className="p-3 bg-white dark:bg-stone-800 border-2 border-[#591C0B]/10 dark:border-white/10 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-[#591C0B] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Back Home
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Verified', value: stats.total, color: 'bg-amber-500' },
            { label: 'Students', value: stats.student, color: 'bg-blue-500' },
            { label: 'Alumni', value: stats.alumni, color: 'bg-green-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-stone-800 p-8 rounded-3xl border-2 border-[#591C0B]/5 dark:border-white/5 shadow-sm">
              <p className="text-sm font-black text-[#8C6B5D] dark:text-stone-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-5xl font-black text-[#591C0B] dark:text-white">{stat.value}</p>
              <div className={`h-2 w-12 ${stat.color} rounded-full mt-4`}></div>
            </div>
          ))}
        </div>

        {/* Verifications Table */}
        <div className="bg-white dark:bg-stone-800 rounded-3xl border-2 border-[#591C0B]/5 dark:border-white/5 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#591C0B]/5 dark:bg-white/5 border-b-2 border-[#591C0B]/5 dark:border-white/5">
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">User</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Roles</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Status / Type</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-xs">Verified At</th>
                  <th className="px-6 py-4 font-black uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#591C0B]/5 dark:divide-white/5">
                {verifications.length > 0 ? verifications.map((v) => (
                  <tr key={v.discord_id} className="hover:bg-stone-50/50 dark:hover:bg-stone-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {v.discordUser?.avatar ? (
                          <img src={v.discordUser.avatar} className="w-10 h-10 rounded-full border-2 border-[#591C0B]/10 shadow-sm" alt="" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center">
                            <User className="w-5 h-5 text-stone-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-[#591C0B] dark:text-amber-200">{v.discordUser?.username || 'Unknown'}</p>
                          <p className="text-xs text-[#8C6B5D] dark:text-stone-500 font-medium truncate max-w-[150px]">{v.discordUser?.displayName || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {v.discordUser?.roles?.length > 0 ? v.discordUser.roles.map((rId) => (
                          <span key={rId} className="px-2 py-0.5 bg-stone-100 dark:bg-stone-700 text-[10px] font-bold rounded text-stone-500 dark:text-stone-400">
                            {rId === '1449839054341410846' ? 'Alumni' :
                             rId === '1449839196671053895' ? 'Student' :
                             rId === '1460126744563548222' ? 'Bot' :
                             rId === '1449839285887963279' ? '2029' :
                             rId === '1449839544877846561' ? '2028' :
                             rId === '1449839612317925436' ? '2027' :
                             rId === '1449839686435471381' ? '2026' :
                             rId.slice(-4)}
                          </span>
                        )) : (
                          <span className="text-xs italic text-stone-400">No roles</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          v.verification_method === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {v.verification_method === 'admin' ? 'Admin Verified' : 'Email Verified'}
                        </span>
                        <span className="text-[10px] font-black uppercase text-[#8C6B5D] dark:text-stone-500 pl-1">
                          {v.type || 'Accepted'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {new Date(v.verified_at).toLocaleDateString()}
                      <span className="block text-[10px] text-[#8C6B5D] dark:text-stone-500 uppercase font-black">
                        {new Date(v.verified_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleAction(v.discord_id, 'revoke')}
                          disabled={actionLoading === v.discord_id}
                          className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          title="Revoke Verification"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <a
                          href={`https://discord.com/users/${v.discord_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-stone-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          title="View Discord Profile"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-[#8C6B5D] dark:text-stone-500 font-bold italic">
                      No Brunonians found in the vault... yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
