import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { APP_INFO } from '@shared/constants';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard, CreditCard, User, LogOut, Bell,
  Check, Key, Shield, AlertCircle, Loader2
} from 'lucide-react';

const fieldClass = "block w-full rounded-2xl border border-black/10 py-2.5 px-4 text-sm text-[#0a0a0a] bg-[#F2F1ED] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/20 transition-colors";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');

  const [profile, setProfile] = useState({ name: '', email: '', plan: 'Free Trial', status: 'active' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState('');

  useEffect(() => {
    if (user) {
      let planName = 'Free Trial';
      if (user.stripe_price_id) {
        planName = user.stripe_price_id.includes('year') || user.stripe_price_id === 'STRIPE_PRICE_ID_YEARLY'
          ? 'Pro Yearly' : 'Starter Monthly';
      }
      setProfile({ name: user.name || '', email: user.email || '', plan: planName, status: user.stripe_status || 'active' });
    }
  }, [user]);

  useEffect(() => {
    const mockSuccess = searchParams.get('mock_success');
    const priceId = searchParams.get('price_id');
    if (mockSuccess === 'true' && priceId) {
      async function completeMockUpgrade() {
        try {
          const res = await fetch('/api/payments/simulate-upgrade', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ priceId }) });
          const data = await res.json();
          if (res.ok && data.status === 'success') {
            const meRes = await fetch('/api/auth/me');
            const meData = await meRes.json();
            if (meRes.ok && meData.status === 'success') setUser(meData.user);
            setProfileSuccess('Billing Simulation: Successfully simulated Stripe Checkout and upgraded plan!');
            setTimeout(() => setProfileSuccess(''), 6000);
          }
        } catch (err) { console.error(err.message); }
        finally { setSearchParams({}); }
      }
      completeMockUpgrade();
    }
    const mockPortal = searchParams.get('mock_portal');
    if (mockPortal === 'true') {
      setProfileSuccess('Billing Simulation: Stripe Billing Portal would open here in production.');
      setTimeout(() => setProfileSuccess(''), 6000);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, setUser]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError(''); setProfileSuccess('');
    if (!profile.name.trim() || !profile.email.trim()) { setProfileError('Name and email are required.'); return; }
    setProfileLoading(true);
    try {
      const res = await fetch('/api/users/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: profile.name, email: profile.email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile.');
      setUser(data.user);
      setProfileSuccess('Profile saved.');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) { setProfileError(err.message); }
    finally { setProfileLoading(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordError(''); setPasswordSuccess('');
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) { setPasswordError('All fields are required.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }
    if (newPassword.length < 6) { setPasswordError('Password must be at least 6 characters.'); return; }
    setPasswordLoading(true);
    try {
      const res = await fetch('/api/users/password', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change password.');
      setPasswordSuccess('Password updated.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) { setPasswordError(err.message); }
    finally { setPasswordLoading(false); }
  };

  const handleSubscribe = async (priceIdVar) => {
    setBillingError(''); setBillingLoading(true);
    try {
      const res = await fetch('/api/payments/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ priceId: priceIdVar }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create checkout session.');
      window.location.href = data.url;
    } catch (err) { setBillingError(err.message); }
    finally { setBillingLoading(false); }
  };

  const handlePortalSession = async () => {
    setBillingError(''); setBillingLoading(true);
    try {
      const res = await fetch('/api/payments/create-portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to open billing portal.');
      window.location.href = data.url;
    } catch (err) { setBillingError(err.message); }
    finally { setBillingLoading(false); }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) return;
    setBillingError(''); setBillingLoading(true);
    try {
      const res = await fetch('/api/payments/cancel-subscription', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel subscription.');
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meRes.ok && meData.status === 'success') setUser(meData.user);
      setProfileSuccess(data.message || 'Subscription cancelled.');
      setTimeout(() => setProfileSuccess(''), 5000);
    } catch (err) { setBillingError(err.message); }
    finally { setBillingLoading(false); }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const getInitials = (n) => {
    if (!n) return 'U';
    const p = n.trim().split(' ');
    return p.length > 1 ? (p[0][0] + p[1][0]).toUpperCase() : p[0][0].toUpperCase();
  };

  const navItem = (tab, icon, label) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-sm transition-colors ${
        activeTab === tab
          ? 'bg-[#0a0a0a] text-white font-medium'
          : 'text-neutral-500 hover:text-[#0a0a0a] hover:bg-black/5'
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#F2F1ED] overflow-hidden font-sans">

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r border-black/8 bg-[#F2F1ED] shrink-0">
        <div className="h-14 flex items-center px-5 border-b border-black/8">
          <Logo />
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItem('overview', <LayoutDashboard className="h-4 w-4 shrink-0" />, 'Overview')}
          {navItem('billing', <CreditCard className="h-4 w-4 shrink-0" />, 'Billing')}
          {navItem('profile', <User className="h-4 w-4 shrink-0" />, 'Profile')}
          {user?.role === 'admin' && (
            <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-sm text-red-500 hover:bg-red-50 transition-colors mt-2">
              <Shield className="h-4 w-4 shrink-0" /> Admin
            </Link>
          )}
        </nav>
        <div className="p-3 border-t border-black/8">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl w-full text-sm text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="h-4 w-4 shrink-0" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-14 border-b border-black/8 bg-[#F2F1ED] flex items-center justify-between px-6 shrink-0">
          <Logo className="md:hidden text-sm" />
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <button className="relative p-1.5 rounded-full hover:bg-black/5 text-neutral-400 transition-colors">
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#0a0a0a]" />
              <Bell className="h-4 w-4" />
            </button>
            <span className="text-sm text-neutral-500">{profile.name || 'User'}</span>
            <div className="h-8 w-8 rounded-full bg-[#0a0a0a] text-white flex items-center justify-center text-xs font-medium">
              {getInitials(profile.name || user?.email)}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6">

            {profileSuccess && (
              <div className="p-4 bg-white/60 border border-black/8 rounded-[20px] flex items-center gap-3">
                <Check className="h-4 w-4 text-green-600 shrink-0" />
                <p className="text-sm text-[#0a0a0a]">{profileSuccess}</p>
              </div>
            )}

            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">Welcome back, {profile.name || 'User'}</h1>
                  <p className="text-sm text-neutral-500 mt-0.5">Here's a summary of your account.</p>
                </div>

                <div className="p-5 bg-white/60 border border-black/8 rounded-[20px] flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-xl bg-[#0a0a0a] text-white flex items-center justify-center shrink-0">
                    <Key className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0a0a0a]">Stripe Billing Active</p>
                    <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                      Stripe checkout is online. Purchase subscriptions, simulate payments, or open the Customer Portal from the Billing tab.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-white/60 border border-black/8 rounded-[20px]">
                    <p className="text-xs text-neutral-400 uppercase tracking-widest mb-2">Account Status</p>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user?.is_verified ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                      {user?.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  <div className="p-5 bg-white/60 border border-black/8 rounded-[20px]">
                    <p className="text-xs text-neutral-400 uppercase tracking-widest mb-2">Plan</p>
                    <p className="text-xl font-semibold tracking-tight">{profile.plan}</p>
                  </div>
                  <div className="p-5 bg-white/60 border border-black/8 rounded-[20px]">
                    <p className="text-xs text-neutral-400 uppercase tracking-widest mb-2">Role</p>
                    <p className="text-xl font-semibold tracking-tight capitalize">{user?.role}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Billing */}
            {activeTab === 'billing' && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">Billing</h1>
                  <p className="text-sm text-neutral-500 mt-0.5">Manage your subscription and payment methods.</p>
                </div>

                {billingError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-[20px] flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-600">{billingError}</p>
                  </div>
                )}

                {profile.plan !== 'Free Trial' ? (
                  <div className="p-6 bg-white/60 border border-black/8 rounded-[20px] space-y-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-black/8">
                      <div>
                        <p className="text-xs text-neutral-400 uppercase tracking-widest mb-1">Current plan</p>
                        <p className="text-xl font-semibold tracking-tight">{profile.plan}</p>
                        <p className="text-xs text-neutral-400 mt-0.5 capitalize">Status: {profile.status}</p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={handlePortalSession} disabled={billingLoading} className="px-4 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-full hover:bg-neutral-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                          {billingLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          Manage billing
                        </button>
                        {profile.status === 'active' && (
                          <button onClick={handleCancelSubscription} disabled={billingLoading} className="px-4 py-2 border border-red-200 text-red-500 text-sm font-medium rounded-full hover:bg-red-50 disabled:opacity-50 transition-colors">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 items-start p-4 bg-[#F2F1ED] rounded-xl border border-black/8">
                      <Shield className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        In production, "Manage billing" redirects to Stripe's Customer Portal where users can update payment methods and download invoices.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-white/60 border border-black/8 rounded-[20px] flex gap-3 items-start">
                      <AlertCircle className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        You're on a <strong className="text-[#0a0a0a]">Free Trial</strong>. Upgrade to unlock all features.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Monthly */}
                      <div className="p-6 bg-white/60 border border-black/8 rounded-[20px] flex flex-col gap-5">
                        <div>
                          <span className="text-xs text-neutral-400 uppercase tracking-widest">Monthly</span>
                          <p className="text-2xl font-semibold tracking-tight mt-1">$19 <span className="text-sm font-normal text-neutral-400">/mo</span></p>
                          <p className="text-xs text-neutral-400 mt-1">For developer test runs and MVPs.</p>
                        </div>
                        <ul className="space-y-2 text-xs text-neutral-500 flex-1">
                          {['Full auth templates', 'Stripe checkout', 'Email notifications', 'Admin console'].map((f, i) => (
                            <li key={i} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#0a0a0a] shrink-0" />{f}</li>
                          ))}
                        </ul>
                        <button onClick={() => handleSubscribe('STRIPE_PRICE_ID_MONTHLY')} disabled={billingLoading} className="w-full py-2.5 border border-black/15 text-sm font-medium rounded-full hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                          {billingLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Subscribe monthly
                        </button>
                      </div>

                      {/* Yearly — featured */}
                      <div className="p-6 bg-[#0a0a0a] border border-[#0a0a0a] rounded-[20px] flex flex-col gap-5 relative">
                        <div className="absolute top-4 right-4 px-2.5 py-0.5 bg-white text-[#0a0a0a] text-[10px] font-medium rounded-full">Best value</div>
                        <div>
                          <span className="text-xs text-neutral-400 uppercase tracking-widest">Yearly</span>
                          <p className="text-2xl font-semibold tracking-tight text-white mt-1">$149 <span className="text-sm font-normal text-neutral-400">/yr</span></p>
                          <p className="text-xs text-neutral-400 mt-1">Save 35%+ vs monthly.</p>
                        </div>
                        <ul className="space-y-2 text-xs text-neutral-300 flex-1">
                          {['Everything in Monthly', 'Multiple projects', 'Priority support', 'Lifetime updates'].map((f, i) => (
                            <li key={i} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-white shrink-0" />{f}</li>
                          ))}
                        </ul>
                        <button onClick={() => handleSubscribe('STRIPE_PRICE_ID_YEARLY')} disabled={billingLoading} className="w-full py-2.5 bg-white text-[#0a0a0a] text-sm font-medium rounded-full hover:bg-neutral-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                          {billingLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Subscribe yearly
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile */}
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">Account Settings</h1>
                  <p className="text-sm text-neutral-500 mt-0.5">Update your profile details and password.</p>
                </div>

                {/* Profile form */}
                <div className="bg-white/60 border border-black/8 rounded-[20px] overflow-hidden">
                  <div className="px-6 py-4 border-b border-black/8">
                    <p className="text-sm font-medium">Profile information</p>
                  </div>
                  <form onSubmit={handleProfileSave} className="p-6 space-y-5">
                    {profileError && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                        <p className="text-xs text-red-600">{profileError}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1.5">Full name</label>
                        <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className={fieldClass} placeholder="Your name" />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1.5">Email</label>
                        <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className={fieldClass} placeholder="your@email.com" />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2 border-t border-black/8">
                      <button type="submit" disabled={profileLoading} className="px-5 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-full hover:bg-neutral-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                        {profileLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
                      </button>
                    </div>
                  </form>
                </div>

                {/* Password form */}
                <div className="bg-white/60 border border-black/8 rounded-[20px] overflow-hidden">
                  <div className="px-6 py-4 border-b border-black/8">
                    <p className="text-sm font-medium">Change password</p>
                  </div>
                  <form onSubmit={handlePasswordSave} className="p-6 space-y-5">
                    {passwordError && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                        <p className="text-xs text-red-600">{passwordError}</p>
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                        <p className="text-xs text-green-700">{passwordSuccess}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1.5">Current password</label>
                      <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className={fieldClass} placeholder="••••••••" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1.5">New password</label>
                        <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className={fieldClass} placeholder="Min. 6 characters" />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1.5">Confirm new password</label>
                        <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className={fieldClass} placeholder="Repeat password" />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2 border-t border-black/8">
                      <button type="submit" disabled={passwordLoading} className="px-5 py-2.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-full hover:bg-neutral-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                        {passwordLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Update password
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
