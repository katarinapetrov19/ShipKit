import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { APP_INFO } from '@shared/constants';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Users, DollarSign, Settings, TrendingUp, ShieldAlert, 
  BarChart3, Search, Mail, Edit2, Trash2, X, Check, Loader2, AlertCircle, Filter, Activity, Cpu
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Admin() {
  const { user: currentUser } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('analytics'); // 'directory' | 'analytics' | 'settings'
  
  // Registered Users Search/CRUD States
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  // System Stats/Analytics States
  const [analytics, setAnalytics] = useState({
    metrics: {
      totalUsers: 0,
      verifiedUsers: 0,
      premiumUsers: 0,
      mrr: 0,
      estimatedRevenue: 0
    },
    dailySignups: [],
    subscriptionBreakdown: {
      free: 0,
      monthly: 0,
      yearly: 0
    },
    recentTransactions: []
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState('');

  // Global System Settings States
  const [systemSettings, setSystemSettings] = useState({
    app_name: 'ShipKit',
    support_email: 'support@shipkit.dev',
    maintenance_mode: 'false'
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Edit User Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'user',
    is_verified: 0
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch Users (CRUD List)
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams({
        search,
        role: roleFilter,
        is_verified: verifiedFilter,
        limit: limit.toString(),
        offset: offset.toString()
      });

      const res = await fetch(`/api/admin/users?${queryParams.toString()}`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch registered users.');
      }

      setUsers(data.users || []);
      setTotalUsers(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, verifiedFilter, limit, offset]);

  // Fetch Live Analytics
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to retrieve real-time statistics.');
      }

      setAnalytics({
        metrics: data.metrics,
        dailySignups: data.dailySignups,
        subscriptionBreakdown: data.subscriptionBreakdown,
        recentTransactions: data.recentTransactions
      });
    } catch (err) {
      setAnalyticsError(err.message);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // Fetch System Settings
  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError('');
    try {
      const res = await fetch('/api/admin/settings', {
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch global configurations.');
      }

      if (data.settings) {
        setSystemSettings(data.settings);
      }
    } catch (err) {
      setSettingsError(err.message);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  // Sync / Fetch handlers based on Active Tab
  useEffect(() => {
    if (activeSubTab === 'directory') {
      const delayDebounce = setTimeout(() => {
        fetchUsers();
      }, 300);
      return () => clearTimeout(delayDebounce);
    } else if (activeSubTab === 'analytics') {
      fetchAnalytics();
    } else if (activeSubTab === 'settings') {
      fetchSettings();
    }
  }, [activeSubTab, fetchUsers, fetchAnalytics, fetchSettings]);

  // Handle System Settings Save
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsSuccess('');
    setSettingsError('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(systemSettings)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to save configurations.');
      }

      setSettingsSuccess('System configurations successfully saved.');
      setTimeout(() => setSettingsSuccess(''), 4000);
    } catch (err) {
      setSettingsError(err.message);
    } finally {
      setSettingsSaving(false);
    }
  };

  // Open Edit User Modal
  const handleEditOpen = (userToEdit) => {
    setSelectedUser(userToEdit);
    setEditForm({
      name: userToEdit.name || '',
      email: userToEdit.email || '',
      role: userToEdit.role || 'user',
      is_verified: userToEdit.is_verified ?? 0
    });
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  // Submit User PUT Update
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);

    if (!editForm.name.trim() || !editForm.email.trim()) {
      setEditError('Name and email are required fields.');
      setEditLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          role: editForm.role,
          is_verified: editForm.is_verified
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update user details.');
      }

      setSuccessMsg(`Account of ${data.user.name} was successfully updated.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      handleEditClose();
      fetchUsers();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // Delete User Account
  const handleDeleteUser = async (userToDelete) => {
    if (userToDelete.id === currentUser.id) {
      alert('Security lock triggered: You cannot delete your own logged-in administrator account!');
      return;
    }

    const confirmDelete = window.confirm(`Are you absolutely sure you want to permanently delete the account of ${userToDelete.name || userToDelete.email}? This action is destructive and irreversible.`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete user account.');
      }

      setSuccessMsg(`Successfully deleted user account: ${userToDelete.name || userToDelete.email}`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchUsers();
    } catch (err) {
      alert(`Deletion Failed: ${err.message}`);
    }
  };

  const getPlanName = (stripePriceId) => {
    if (!stripePriceId) return 'Free Trial';
    if (stripePriceId.includes('year') || stripePriceId === 'STRIPE_PRICE_ID_YEARLY') return 'Pro Yearly';
    return 'Starter Monthly';
  };

  const fieldClass = "block w-full rounded-2xl border border-black/10 py-2.5 px-4 text-sm text-[#0a0a0a] bg-[#F2F1ED] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/20 transition-colors";
  const selectClass = "block w-full rounded-2xl border border-black/10 py-2.5 px-4 text-sm text-[#0a0a0a] bg-[#F2F1ED] focus:outline-none focus:ring-2 focus:ring-black/20 transition-colors";

  return (
    <div className="flex h-screen bg-[#F2F1ED] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-[#0a0a0a] shrink-0">
        <div className="h-14 flex items-center px-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Logo className="text-white [&_svg]:fill-white [&_svg]:stroke-white" />
            <span className="text-[10px] font-medium bg-white/10 text-white/50 px-2 py-0.5 rounded border border-white/10">ADMIN</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { tab: 'analytics', icon: <BarChart3 className="h-4 w-4 shrink-0" />, label: 'Metrics' },
            { tab: 'directory', icon: <Users className="h-4 w-4 shrink-0" />, label: 'Users' },
            { tab: 'settings', icon: <Settings className="h-4 w-4 shrink-0" />, label: 'Settings' },
          ].map(({ tab, icon, label }) => (
            <button key={tab} onClick={() => setActiveSubTab(tab)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-sm transition-colors ${
                activeSubTab === tab ? 'bg-white/10 text-white font-medium' : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {icon} {label}
            </button>
          ))}
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors mt-2 border-t border-white/10 pt-4">
            <Activity className="h-4 w-4 shrink-0" /> Back to app
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-[#F2F1ED] border-b border-black/8 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-sm font-medium text-[#0a0a0a] capitalize">Admin · {activeSubTab}</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Live
            </span>
            <div className="h-7 w-7 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center text-xs font-medium">A</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-5">

            {successMsg && (
              <div className="p-4 bg-white/60 border border-black/8 rounded-[20px] flex items-center gap-3">
                <Check className="h-4 w-4 text-green-600 shrink-0" />
                <p className="text-sm text-[#0a0a0a]">{successMsg}</p>
              </div>
            )}

            {/* TAB 1: ANALYTICS */}
            {activeSubTab === 'analytics' && (
              <div className="space-y-5">
                {analyticsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white/60 border border-black/8 rounded-[20px]">
                    <Loader2 className="h-8 w-8 text-[#0a0a0a] animate-spin" />
                    <p className="text-sm text-neutral-400 mt-4">Loading metrics…</p>
                  </div>
                ) : analyticsError ? (
                  <div className="p-5 bg-red-50 border border-red-100 rounded-[20px] flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{analyticsError}</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Total Registered', value: analytics.metrics.totalUsers, sub: `Verified: ${analytics.metrics.verifiedUsers}`, icon: <Users className="h-5 w-5 text-neutral-400" /> },
                        { label: 'MRR', value: `$${analytics.metrics.mrr}`, sub: 'Monthly recurring', icon: <DollarSign className="h-5 w-5 text-neutral-400" /> },
                        { label: 'Active Subscriptions', value: analytics.metrics.premiumUsers, sub: 'Active Stripe plans', icon: <TrendingUp className="h-5 w-5 text-neutral-400" /> },
                        { label: 'Est. Product Value', value: `$${analytics.metrics.estimatedRevenue}`, sub: 'Lifetime billing', icon: <Cpu className="h-5 w-5 text-neutral-400" /> },
                      ].map((card, i) => (
                        <div key={i} className="bg-white/60 border border-black/8 rounded-[20px] p-5 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-400 uppercase tracking-widest">{card.label}</span>
                            {card.icon}
                          </div>
                          <p className="text-3xl font-semibold tracking-tight text-[#0a0a0a] mt-2">{card.value}</p>
                          <p className="text-xs text-neutral-400 mt-1">{card.sub}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="bg-white/60 border border-black/8 rounded-[20px] p-6 lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between border-b border-black/8 pb-4">
                          <p className="text-sm font-medium">Daily Signups (Last 7 Days)</p>
                          <span className="text-xs text-neutral-400 bg-black/5 px-2 py-1 rounded-lg">SQLite strftime</span>
                        </div>
                        <div className="h-56 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.dailySignups}>
                              <defs>
                                <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0a0a0a" stopOpacity={0.15}/>
                                  <stop offset="95%" stopColor="#0a0a0a" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                              <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="#a3a3a3" fontSize={11} />
                              <YAxis tickLine={false} axisLine={false} stroke="#a3a3a3" fontSize={11} allowDecimals={false} />
                              <Tooltip contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} />
                              <Area type="monotone" dataKey="count" name="Signups" stroke="#0a0a0a" strokeWidth={2} fillOpacity={1} fill="url(#signupGradient)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-white/60 border border-black/8 rounded-[20px] p-6 space-y-5">
                        <div className="border-b border-black/8 pb-4">
                          <p className="text-sm font-medium">Subscription Breakdown</p>
                          <p className="text-xs text-neutral-400 mt-0.5">Tier distribution</p>
                        </div>
                        {[
                          { label: 'Free Trial', count: analytics.subscriptionBreakdown.free },
                          { label: 'Starter Monthly', count: analytics.subscriptionBreakdown.monthly },
                          { label: 'Pro Yearly', count: analytics.subscriptionBreakdown.yearly },
                        ].map((tier) => (
                          <div key={tier.label}>
                            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
                              <span>{tier.label}</span><span>{tier.count}</span>
                            </div>
                            <div className="w-full bg-black/8 h-2 rounded-full overflow-hidden">
                              <div className="bg-[#0a0a0a] h-2 rounded-full transition-all" style={{ width: `${(tier.count / Math.max(analytics.metrics.totalUsers, 1)) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                        <p className="text-xs text-neutral-400 leading-relaxed pt-2 border-t border-black/8">
                          Counts accounts with active Stripe webhook status in SQLite.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/60 border border-black/8 rounded-[20px] p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-black/8 pb-4">
                        <p className="text-sm font-medium">Recent Subscriptions</p>
                        <span className="text-xs text-neutral-400">Last 5</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="text-left text-xs text-neutral-400 uppercase tracking-widest">
                              <th className="py-2.5 px-4">Customer</th><th className="py-2.5 px-4">Plan</th>
                              <th className="py-2.5 px-4">Amount</th><th className="py-2.5 px-4 text-center">Status</th>
                              <th className="py-2.5 px-4 text-right">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-black/5 text-sm">
                            {analytics.recentTransactions.length > 0 ? analytics.recentTransactions.map((tx, i) => (
                              <tr key={i} className="hover:bg-black/3">
                                <td className="py-3 px-4"><div className="font-medium text-[#0a0a0a]">{tx.name}</div><div className="text-xs text-neutral-400">{tx.email}</div></td>
                                <td className="py-3 px-4 text-neutral-500">{tx.plan}</td>
                                <td className="py-3 px-4 font-medium">${tx.amount}</td>
                                <td className="py-3 px-4 text-center"><span className="px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700 border border-green-100 capitalize">{tx.status}</span></td>
                                <td className="py-3 px-4 text-right text-xs text-neutral-400">{tx.date}</td>
                              </tr>
                            )) : (
                              <tr><td colSpan="5" className="py-8 text-center text-neutral-400 text-sm">No transactions yet.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 2: DIRECTORY */}
            {activeSubTab === 'directory' && (
              <div className="bg-white/60 border border-black/8 rounded-[20px] overflow-hidden">
                <div className="p-5 border-b border-black/8 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-2.5 h-4 w-4 text-neutral-400" />
                    <input type="text" placeholder="Search by name or email…" value={search}
                      onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
                      className="pl-10 w-full rounded-2xl border border-black/10 py-2.5 px-4 text-sm bg-[#F2F1ED] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/20"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Filter className="h-4 w-4 text-neutral-400" />
                    <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setOffset(0); }} className={selectClass + " w-auto"}>
                      <option value="">All roles</option><option value="user">User</option><option value="admin">Admin</option>
                    </select>
                    <select value={verifiedFilter} onChange={(e) => { setVerifiedFilter(e.target.value); setOffset(0); }} className={selectClass + " w-auto"}>
                      <option value="">All</option><option value="1">Verified</option><option value="0">Unverified</option>
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center py-16"><Loader2 className="h-7 w-7 text-[#0a0a0a] animate-spin" /><p className="text-xs text-neutral-400 mt-3">Loading…</p></div>
                ) : error ? (
                  <div className="p-6 text-center text-sm text-red-500">{error}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left text-xs text-neutral-400 uppercase tracking-widest border-b border-black/8">
                          <th className="py-3 px-5">User</th><th className="py-3 px-5">Role</th>
                          <th className="py-3 px-5">Email</th><th className="py-3 px-5">Plan</th>
                          <th className="py-3 px-5">Customer ID</th><th className="py-3 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 text-sm">
                        {users.length > 0 ? users.map((item) => (
                          <tr key={item.id} className="hover:bg-black/3">
                            <td className="py-3.5 px-5"><div className="font-medium text-[#0a0a0a]">{item.name || 'Anonymous'}</div><div className="text-xs text-neutral-400">{item.email}</div></td>
                            <td className="py-3.5 px-5">
                              <span className={`px-2 py-0.5 rounded-full text-xs border ${item.role === 'admin' ? 'bg-[#0a0a0a] text-white border-transparent' : 'bg-black/5 text-neutral-600 border-black/8'}`}>
                                {item.role === 'admin' ? 'Admin' : 'User'}
                              </span>
                            </td>
                            <td className="py-3.5 px-5">
                              {item.is_verified
                                ? <span className="flex items-center gap-1 text-green-600 text-xs"><Check className="h-3.5 w-3.5" /> Verified</span>
                                : <span className="flex items-center gap-1 text-neutral-400 text-xs"><X className="h-3.5 w-3.5" /> Unverified</span>}
                            </td>
                            <td className="py-3.5 px-5 text-neutral-500">{getPlanName(item.stripe_price_id)}</td>
                            <td className="py-3.5 px-5 text-neutral-400 text-xs font-mono">{item.stripe_customer_id || '—'}</td>
                            <td className="py-3.5 px-5 text-right space-x-1">
                              <button onClick={() => handleEditOpen(item)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-black/5 hover:text-[#0a0a0a] transition-colors"><Edit2 className="h-4 w-4" /></button>
                              <button onClick={() => handleDeleteUser(item)} className="p-1.5 rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="6" className="py-12 text-center text-neutral-400 text-sm">No users found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SETTINGS */}
            {activeSubTab === 'settings' && (
              <div className="bg-white/60 border border-black/8 rounded-[20px] p-6 space-y-6">
                <div>
                  <p className="text-sm font-medium text-[#0a0a0a]">System Settings</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Core metadata stored in the SQLite system config table.</p>
                </div>

                {settingsLoading ? (
                  <div className="flex flex-col items-center py-10"><Loader2 className="h-7 w-7 text-[#0a0a0a] animate-spin" /></div>
                ) : settingsError ? (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3"><AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" /><p className="text-sm text-red-600">{settingsError}</p></div>
                ) : (
                  <>
                    <form onSubmit={handleSaveSettings} className="space-y-5">
                      {settingsSuccess && (
                        <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-600 shrink-0" /><p className="text-sm text-green-700">{settingsSuccess}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1.5">Application name</label>
                          <input type="text" value={systemSettings.app_name} onChange={(e) => setSystemSettings({ ...systemSettings, app_name: e.target.value })} className={fieldClass} required />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1.5">Support email</label>
                          <input type="email" value={systemSettings.support_email} onChange={(e) => setSystemSettings({ ...systemSettings, support_email: e.target.value })} className={fieldClass} required />
                        </div>
                        <div>
                          <label className="block text-xs text-neutral-500 mb-1.5">Maintenance mode</label>
                          <select value={systemSettings.maintenance_mode} onChange={(e) => setSystemSettings({ ...systemSettings, maintenance_mode: e.target.value })} className={selectClass}>
                            <option value="false">Disabled</option>
                            <option value="true">Enabled (admins only)</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end pt-2 border-t border-black/8">
                        <button type="submit" disabled={settingsSaving} className="px-5 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-full hover:bg-neutral-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                          {settingsSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
                        </button>
                      </div>
                    </form>

                    <div className="border-t border-black/8 pt-6 space-y-3">
                      <p className="text-sm font-medium">SMTP Diagnostics</p>
                      <p className="text-xs text-neutral-400">Send a test email to <b>{currentUser?.email}</b> to verify your SMTP configuration.</p>
                      <div className="flex items-center gap-4">
                        <button type="button" disabled={settingsSaving}
                          onClick={async () => {
                            setSettingsSaving(true); setSettingsError(''); setSettingsSuccess('');
                            try {
                              const res = await fetch('/api/admin/test-email', { headers: { 'Accept': 'application/json' } });
                              const data = await res.json();
                              if (!res.ok) throw new Error(data.message || 'Test failed.');
                              setSettingsSuccess(data.message);
                            } catch (err) { setSettingsError(err.message); }
                            finally { setSettingsSaving(false); }
                          }}
                          className="px-4 py-2 bg-[#0a0a0a] text-white text-xs font-medium rounded-full hover:bg-neutral-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                          <Mail className="h-3.5 w-3.5" /> Send test email
                        </button>
                        <span className="text-xs text-neutral-400">Check Railway logs if using simulation mode.</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F2F1ED] rounded-[20px] max-w-md w-full overflow-hidden border border-black/8 shadow-xl">
            <div className="p-5 border-b border-black/8 flex items-center justify-between">
              <p className="text-sm font-medium">Edit user</p>
              <button onClick={handleEditClose} className="p-1 rounded-lg hover:bg-black/5 text-neutral-400 hover:text-[#0a0a0a] transition-colors"><X className="h-4 w-4" /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editError && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">{editError}</div>}
              <div>
                <label className="block text-xs text-neutral-500 mb-1.5">Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={fieldClass} required />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1.5">Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className={fieldClass} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1.5">Role</label>
                  <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className={selectClass}>
                    <option value="user">User</option><option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1.5">Email verified</label>
                  <select value={editForm.is_verified} onChange={(e) => setEditForm({ ...editForm, is_verified: parseInt(e.target.value, 10) })} className={selectClass}>
                    <option value={1}>Verified</option><option value={0}>Unverified</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-black/8">
                <button type="button" onClick={handleEditClose} className="px-4 py-2 text-sm font-medium rounded-full border border-black/15 hover:bg-white transition-colors">Cancel</button>
                <button type="submit" disabled={editLoading} className="px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-full hover:bg-neutral-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                  {editLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
