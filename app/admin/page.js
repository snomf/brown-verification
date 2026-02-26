'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    Search,
    Filter,
    ArrowLeft,
    LogOut,
    CheckCircle2,
    XCircle,
    MoreVertical,
    History,
    RefreshCw,
    UserCircle,
    Globe,
    Settings,
    UserMinus,
    AlertCircle
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import BotStatus from '../components/BotStatus';

const ADMIN_ID = "547599059024740374";

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [verifications, setVerifications] = useState([]);
    const [stats, setStats] = useState({ total: 0, student: 0, alumni: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, student, alumni
    const [filterMethod, setFilterMethod] = useState('all'); // all, website, admin, manual
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            // Critical Fix: Discord ID is in user_metadata.provider_id, not user.id (which is UUID)
            if (!user || user.user_metadata.provider_id !== ADMIN_ID) {
                router.push('/');
                return;
            }
            setUser(user);
            fetchVerifications();
        };
        checkAdmin();
    }, [router]);

    const fetchVerifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No session');

            const res = await fetch('/api/admin/verifications', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || data.error || 'Failed to fetch data');
            }
            const data = await res.json();

            // Map the API data structure (verifications: [], stats: {})
            setVerifications(data.verifications || []);
            if (data.stats) setStats(data.stats);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (discordId) => {
        if (!confirm('Are you sure you want to revoke this verification? The user will lose their role on Discord.')) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('No session');

            const res = await fetch('/api/admin/actions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ action: 'revoke', discordId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || data.error || 'Revoke failed');
            }

            // Refresh
            fetchVerifications();
        } catch (err) {
            alert(err.message);
        }
    };

    const filteredVerifications = verifications.filter(v => {
        const matchesSearch =
            v.discordUser?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.discord_id?.includes(searchQuery) ||
            v.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.discordUser?.displayName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType =
            filterType === 'all' ||
            (filterType === 'student' && v.type?.toLowerCase() === 'student') ||
            (filterType === 'alumni' && v.type?.toLowerCase() === 'alumni');

        const matchesMethod =
            filterMethod === 'all' ||
            (filterMethod === 'website' && v.verification_method === 'Website') ||
            (filterMethod === 'admin' && v.verification_method === 'Admin') ||
            (filterMethod === 'manual' && !v.verification_method);

        return matchesSearch && matchesType && matchesMethod;
    });

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0C0A09] text-[#4A3728] dark:text-stone-300 transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-[#591C0B]/10 dark:border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#CE1126] rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
                                <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-[#591C0B] dark:text-white leading-tight">Admin Central</h1>
                                <p className="text-xs font-bold text-[#8C6B5D] dark:text-stone-500 uppercase tracking-wider">Bruno Verified Control</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <div className="hidden md:flex items-center gap-3 px-3 py-2 bg-[#591C0B]/5 dark:bg-white/5 rounded-xl border border-[#591C0B]/10 dark:border-white/10">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#591C0B] to-[#CE1126] flex items-center justify-center text-white text-xs font-bold">
                                {user?.user_metadata?.full_name?.charAt(0) || 'A'}
                            </div>
                            <span className="text-sm font-bold truncate max-w-[120px]">{user?.user_metadata?.full_name || 'Admin'}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Verified', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                        { label: 'Students', value: stats.student, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-500/10' },
                        { label: 'Alumni', value: stats.alumni, icon: Globe, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                        { label: 'Live Data', value: filteredVerifications.length, icon: LayoutDashboard, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-[#591C0B]/5 dark:border-white/5 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live</span>
                            </div>
                            <div className="text-3xl font-black text-[#591C0B] dark:text-white">{stat.value}</div>
                            <div className="text-sm font-bold text-[#8C6B5D] dark:text-stone-500">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters & Actions */}
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#591C0B]/10 dark:border-white/10 overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-[#591C0B]/5 dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex-1 max-w-xl relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#CE1126] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name, ID, or email hash..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[#FDFBF7] dark:bg-stone-800 border-2 border-transparent focus:border-[#CE1126] dark:focus:border-[#CE1126] rounded-2xl outline-none font-medium transition-all"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-2 bg-[#FDFBF7] dark:bg-stone-800 rounded-xl border border-[#591C0B]/5 dark:border-white/5">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="bg-transparent text-sm font-bold outline-none cursor-pointer"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="student">Students</option>
                                    <option value="alumni">Alumni</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-2 bg-[#FDFBF7] dark:bg-stone-800 rounded-xl border border-[#591C0B]/5 dark:border-white/5">
                                <Globe className="w-4 h-4 text-gray-400" />
                                <select
                                    value={filterMethod}
                                    onChange={(e) => setFilterMethod(e.target.value)}
                                    className="bg-transparent text-sm font-bold outline-none cursor-pointer"
                                >
                                    <option value="all">All Methods</option>
                                    <option value="website">Website</option>
                                    <option value="admin">Admin Panel</option>
                                    <option value="manual">Manual/Discord</option>
                                </select>
                            </div>

                            <button
                                onClick={fetchVerifications}
                                className={`p-3 bg-white dark:bg-stone-800 border-2 border-[#591C0B]/10 dark:border-white/10 rounded-xl hover:bg-[#CE1126] hover:text-white transition-all ${loading ? 'animate-spin' : ''}`}
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#FDFBF7] dark:bg-stone-800/50 text-[#8C6B5D] dark:text-stone-500 uppercase text-[10px] font-black tracking-[0.2em]">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Verification Info</th>
                                    <th className="px-6 py-4">Method & Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#591C0B]/5 dark:divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <RefreshCw className="w-10 h-10 text-[#CE1126] animate-spin" />
                                                <span className="font-bold text-[#8C6B5D]">Syncing with Discord...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredVerifications.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center text-gray-400 font-bold">
                                            No verifications found matching your filters.
                                        </td>
                                    </tr>
                                ) : filteredVerifications.map((v) => (
                                    <tr key={v.discord_id} className="hover:bg-[#FDFBF7]/50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    {v.discordUser?.avatar ? (
                                                        <img src={v.discordUser.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-white dark:border-stone-800 shadow-md" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-stone-500">
                                                            <UserCircle className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-stone-900 rounded-full flex items-center justify-center">
                                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-[#591C0B] dark:text-white">{v.discordUser?.displayName || v.discordUser?.username || 'Unknown'}</span>
                                                    <span className="text-xs font-bold text-[#8C6B5D] dark:text-stone-500">ID: {v.discord_id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                                        v.type?.toLowerCase() === 'alumni'
                                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                                            : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                                                    }`}>
                                                        {v.type || 'Verified'}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] font-mono text-gray-400 truncate max-w-[150px]">
                                                    {v.email_hash || 'No hash stored'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5 text-sm font-bold text-[#591C0B] dark:text-stone-300">
                                                    <History className="w-3.5 h-3.5 text-gray-400" />
                                                    {v.verification_method || 'Manual/Discord'}
                                                </div>
                                                <span className="text-xs text-gray-400 font-medium">
                                                    {v.verified_at ? new Date(v.verified_at).toLocaleDateString() : 'Sync Date'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleRevoke(v.discord_id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Revoke Verification"
                                                >
                                                    <UserMinus className="w-5 h-5" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-all">
                                                    <MoreVertical className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Floating Status Check */}
            <div className="fixed bottom-8 left-8 flex flex-col gap-4">
                <BotStatus />
                <div className="bg-white dark:bg-stone-900 border-2 border-[#591C0B]/10 dark:border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-in slide-in-from-left-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <div>
                        <div className="text-xs font-black uppercase tracking-widest text-[#8C6B5D] mb-0.5">Database Status</div>
                        <div className="text-sm font-bold text-[#591C0B] dark:text-white">Supabase Connected</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
