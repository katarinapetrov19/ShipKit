import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { APP_INFO } from '@shared/constants';
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0 flex-col w-64 bg-slate-900 text-slate-300">
        <div className="flex items-center h-16 px-6 border-b border-slate-800">
          <Link to="/" className="text-xl font-black text-white flex items-center">
            ⚡ {systemSettings.app_name} <span className="ml-2 text-[10px] font-semibold bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded border border-brand-500/30">ADMIN</span>
          </Link>
        </div>
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 px-4 space-y-1">
            <button
              onClick={() => setActiveSubTab('analytics')}
              className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl w-full transition-colors ${
                activeSubTab === 'analytics'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="mr-3 h-5 w-5" />
              Metrics & Graphs
            </button>
            <button
              onClick={() => setActiveSubTab('directory')}
              className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl w-full transition-colors ${
                activeSubTab === 'directory'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="mr-3 h-5 w-5" />
              User Directory
            </button>
            <button
              onClick={() => setActiveSubTab('settings')}
              className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl w-full transition-colors ${
                activeSubTab === 'settings'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className="mr-3 h-5 w-5" />
              System Settings
            </button>

            <Link to="/dashboard" className="group flex items-center px-4 py-3 text-sm font-semibold rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors border-t border-slate-800/80 pt-4 mt-4">
              <Activity className="mr-3 h-5 w-5" />
              Back to User App
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Administrative Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-bold text-slate-800 capitalize">Admin {activeSubTab} Workspace</h1>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5 animate-pulse">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              Live Sync
            </span>
            <div className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
              A
            </div>
          </div>
        </header>

        {/* Dynamic Inner Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
                <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-emerald-700 font-semibold leading-relaxed">{successMsg}</p>
              </div>
            )}

            {/* TAB 1: ANALYTICS & CHARTS */}
            {activeSubTab === 'analytics' && (
              <div className="space-y-6">
                {analyticsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200/60 shadow-sm rounded-2xl">
                    <Loader2 className="h-10 w-10 text-brand-600 animate-spin" />
                    <p className="text-sm font-semibold text-slate-500 mt-4">Calculating database metrics & statistics...</p>
                  </div>
                ) : analyticsError ? (
                  <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-red-900">Failed to load statistics</h3>
                      <p className="text-xs text-red-700 mt-1">{analyticsError}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Performance Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Registered</span>
                        <div className="flex items-baseline justify-between mt-2">
                          <h3 className="text-3xl font-black text-slate-900">{analytics.metrics.totalUsers}</h3>
                          <Users className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Verified emails: <b>{analytics.metrics.verifiedUsers}</b></p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Recurring Revenue</span>
                        <div className="flex items-baseline justify-between mt-2">
                          <h3 className="text-3xl font-black text-slate-900">${analytics.metrics.mrr}</h3>
                          <DollarSign className="h-6 w-6 text-emerald-500" />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Pro premium conversions</p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Subscribed (Active)</span>
                        <div className="flex items-baseline justify-between mt-2">
                          <h3 className="text-3xl font-black text-slate-900">{analytics.metrics.premiumUsers}</h3>
                          <TrendingUp className="h-6 w-6 text-indigo-500" />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Active Stripe billing plans</p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Est. Product Value</span>
                        <div className="flex items-baseline justify-between mt-2">
                          <h3 className="text-3xl font-black text-slate-900">${analytics.metrics.estimatedRevenue}</h3>
                          <Cpu className="h-6 w-6 text-rose-500" />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Lifetime billing value</p>
                      </div>
                    </div>

                    {/* Chart & Subscription distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Live Signups Graph */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                          <h3 className="font-bold text-slate-800">Daily Signups (Last 7 Days)</h3>
                          <span className="text-xs font-semibold bg-brand-50 text-brand-700 px-2 py-1 rounded">SQLite strftime API</span>
                        </div>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics.dailySignups}>
                              <defs>
                                <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} />
                              <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                              <Tooltip contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} />
                              <Area type="monotone" dataKey="count" name="New Signups" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#signupGradient)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Distribution breakdown card */}
                      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
                        <div className="border-b border-slate-100 pb-4">
                          <h3 className="font-bold text-slate-800">Subscription Breakdown</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Tier distribution in the database</p>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                              <span>Free Trial</span>
                              <span>{analytics.subscriptionBreakdown.free} users</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-slate-400 h-2.5 rounded-full" style={{ width: `${(analytics.subscriptionBreakdown.free / Math.max(analytics.metrics.totalUsers, 1)) * 100}%` }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-xs font-semibold text-brand-600 mb-1">
                              <span>Starter Monthly</span>
                              <span>{analytics.subscriptionBreakdown.monthly} subscribers</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-brand-500 h-2.5 rounded-full" style={{ width: `${(analytics.subscriptionBreakdown.monthly / Math.max(analytics.metrics.totalUsers, 1)) * 100}%` }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 mb-1">
                              <span>Pro Yearly</span>
                              <span>{analytics.subscriptionBreakdown.yearly} subscribers</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${(analytics.subscriptionBreakdown.yearly / Math.max(analytics.metrics.totalUsers, 1)) * 100}%` }}></div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 leading-relaxed">
                          Subscribed metrics count accounts possessing active <b>Stripe webhooks status updates</b> mapped locally in SQLite.
                        </div>
                      </div>
                    </div>

                    {/* Recent Transactions list */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h3 className="font-bold text-slate-800">Recent Customer Subscriptions</h3>
                        <span className="text-xs text-slate-500">Last 5 active purchases</span>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                          <thead>
                            <tr className="text-left text-xs font-semibold text-slate-400 uppercase">
                              <th className="py-3 px-4">Customer</th>
                              <th className="py-3 px-4">Email</th>
                              <th className="py-3 px-4">Plan</th>
                              <th className="py-3 px-4">Amount</th>
                              <th className="py-3 px-4 text-center">Status</th>
                              <th className="py-3 px-4 text-right">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                            {analytics.recentTransactions.length > 0 ? (
                              analytics.recentTransactions.map((tx, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="py-3 px-4 font-bold text-slate-800">{tx.name}</td>
                                  <td className="py-3 px-4">{tx.email}</td>
                                  <td className="py-3 px-4">{tx.plan}</td>
                                  <td className="py-3 px-4 font-semibold text-slate-900">${tx.amount}</td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100 capitalize">
                                      {tx.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right text-slate-400 text-xs">{tx.date}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="6" className="py-6 text-center text-slate-400 text-sm">
                                  No transaction logs found in DB yet. Simulate updates in your dashboard!
                                </td>
                              </tr>
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
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                {/* Search & Filter bar */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
                      className="pl-10 block w-full rounded-xl border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm px-3 focus:outline-none"
                    />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-500 uppercase">Filters:</span>
                    </div>

                    <select
                      value={roleFilter}
                      onChange={(e) => { setRoleFilter(e.target.value); setOffset(0); }}
                      className="rounded-xl border-0 py-1.5 px-3 text-slate-800 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-brand-600 text-xs font-semibold focus:outline-none bg-white"
                    >
                      <option value="">All Roles</option>
                      <option value="user">User</option>
                      <option value="admin">Administrator</option>
                    </select>

                    <select
                      value={verifiedFilter}
                      onChange={(e) => { setVerifiedFilter(e.target.value); setOffset(0); }}
                      className="rounded-xl border-0 py-1.5 px-3 text-slate-800 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-brand-600 text-xs font-semibold focus:outline-none bg-white"
                    >
                      <option value="">All Verifications</option>
                      <option value="1">Verified Email</option>
                      <option value="0">Unverified Email</option>
                    </select>
                  </div>
                </div>

                {/* Table View */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
                    <p className="text-xs font-semibold text-slate-400 mt-3">Loading users database...</p>
                  </div>
                ) : error ? (
                  <div className="p-6 text-center text-sm text-red-600 font-bold">{error}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead>
                        <tr className="bg-slate-50/50 text-left text-xs font-bold text-slate-400 uppercase border-b border-slate-100">
                          <th className="py-3.5 px-5">User</th>
                          <th className="py-3.5 px-5">Role</th>
                          <th className="py-3.5 px-5">Email Status</th>
                          <th className="py-3.5 px-5">Active Subscription</th>
                          <th className="py-3.5 px-5">Customer ID</th>
                          <th className="py-3.5 px-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                        {users.length > 0 ? (
                          users.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/30">
                              <td className="py-4 px-5">
                                <div className="font-bold text-slate-800">{item.name || 'Anonymous User'}</div>
                                <div className="text-xs text-slate-400">{item.email}</div>
                              </td>
                              <td className="py-4 px-5">
                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${
                                  item.role === 'admin' 
                                    ? 'bg-rose-50 text-rose-700 border-rose-100' 
                                    : 'bg-blue-50 text-blue-700 border-blue-100'
                                }`}>
                                  {item.role === 'admin' ? 'Administrator' : 'User'}
                                </span>
                              </td>
                              <td className="py-4 px-5">
                                {item.is_verified ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                                    <Check className="h-4 w-4" /> Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-medium">
                                    <X className="h-4 w-4" /> Unverified
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-5 font-bold text-slate-700">
                                {getPlanName(item.stripe_price_id)}
                              </td>
                              <td className="py-4 px-5 text-slate-400 text-xs font-mono">
                                {item.stripe_customer_id || '—'}
                              </td>
                              <td className="py-4 px-5 text-right space-x-2">
                                <button
                                  onClick={() => handleEditOpen(item)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                                  title="Edit User Role/Email"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(item)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                  title="Delete Account"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="py-12 text-center text-slate-400 text-sm">
                              No matching accounts found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SYSTEM CONFIG SETTINGS */}
            {activeSubTab === 'settings' && (
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden space-y-6 p-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Global System Settings</h3>
                  <p className="text-xs text-slate-500">Configure core metadata parameters stored dynamically in the SQLite system configuration table.</p>
                </div>

                {settingsLoading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="h-8 w-8 text-brand-600 animate-spin" />
                    <p className="text-xs font-semibold text-slate-400 mt-2">Loading system configuration...</p>
                  </div>
                ) : settingsError ? (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <p className="text-sm text-red-700">{settingsError}</p>
                  </div>
                ) : (
                  <>
                    <form onSubmit={handleSaveSettings} className="space-y-6">
                      {settingsSuccess && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 shadow-sm">
                          <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-emerald-700 font-semibold">{settingsSuccess}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-900">Application Name</label>
                          <input
                            type="text"
                            value={systemSettings.app_name}
                            onChange={(e) => setSystemSettings({ ...systemSettings, app_name: e.target.value })}
                            className="mt-2 block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm px-3 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-900">Support Email Address</label>
                          <input
                            type="email"
                            value={systemSettings.support_email}
                            onChange={(e) => setSystemSettings({ ...systemSettings, support_email: e.target.value })}
                            className="mt-2 block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm px-3 focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-900 font-medium">System Maintenance Mode</label>
                          <select
                            value={systemSettings.maintenance_mode}
                            onChange={(e) => setSystemSettings({ ...systemSettings, maintenance_mode: e.target.value })}
                            className="mt-2 block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm px-3 focus:outline-none bg-white"
                          >
                            <option value="false">Disabled (Normal Operations)</option>
                            <option value="true">Enabled (Admins Only Access)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button
                          type="submit"
                          disabled={settingsSaving}
                          className="px-5 py-2.5 bg-slate-900 text-white font-semibold text-sm rounded-xl hover:bg-slate-800 disabled:opacity-50 shadow-sm transition-colors flex items-center gap-2"
                        >
                          {settingsSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                          Save System Configurations
                        </button>
                      </div>
                    </form>

                    {/* SMTP Email Test Section */}
                    <div className="border-t border-slate-100 pt-6 mt-6">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">SMTP Email System Diagnostics</h4>
                        <p className="text-xs text-slate-500">Test your SMTP settings by triggering a real-time system diagnostic test email to your admin address (<b>{currentUser?.email}</b>).</p>
                      </div>
                      
                      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <button
                          type="button"
                          onClick={async () => {
                            setSettingsSaving(true);
                            setSettingsError('');
                            setSettingsSuccess('');
                            try {
                              const res = await fetch('/api/admin/test-email', {
                                headers: { 'Accept': 'application/json' }
                              });
                              const data = await res.json();
                              if (!res.ok) throw new Error(data.message || 'SMTP test email failed.');
                              setSettingsSuccess(data.message);
                            } catch (err) {
                              setSettingsError(err.message);
                            } finally {
                              setSettingsSaving(false);
                            }
                          }}
                          disabled={settingsSaving}
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
                        >
                          <Mail className="h-4 w-4" />
                          Trigger Test Email
                        </button>
                        <span className="text-[11px] text-slate-400 font-medium">
                          Note: If using Mailtrap or default simulated templates, look closely at your server's command-line output.
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ADMIN EDIT USER MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Edit Registered User</h3>
              <button onClick={handleEditClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 font-medium">
                  {editError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">User Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-2 block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm px-3 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="mt-2 block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm px-3 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">System Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="mt-2 block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-brand-600 sm:text-sm px-3 focus:outline-none bg-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Email Verified</label>
                  <select
                    value={editForm.is_verified}
                    onChange={(e) => setEditForm({ ...editForm, is_verified: parseInt(e.target.value, 10) })}
                    className="mt-2 block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-brand-600 sm:text-sm px-3 focus:outline-none bg-white"
                  >
                    <option value={1}>Verified</option>
                    <option value={0}>Not Verified</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleEditClose}
                  className="px-4 py-2.5 bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2.5 bg-brand-600 text-white font-semibold text-sm rounded-xl hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {editLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
