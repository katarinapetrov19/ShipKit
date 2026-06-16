import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { APP_INFO } from '@shared/constants';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  LayoutDashboard, CreditCard, User, LogOut, Bell, 
  Check, Key, Shield, AlertCircle, Loader2, RefreshCw 
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Profile Form States
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    plan: 'Free Trial',
    status: 'active'
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password Form States
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Billing Operations States
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState('');

  // Sync state with authenticated user details
  useEffect(() => {
    if (user) {
      let planName = 'Free Trial';
      if (user.stripe_price_id) {
        planName = user.stripe_price_id.includes('year') || user.stripe_price_id === 'STRIPE_PRICE_ID_YEARLY' 
          ? 'Pro Yearly' 
          : 'Starter Monthly';
      }
      setProfile({
        name: user.name || '',
        email: user.email || '',
        plan: planName,
        status: user.stripe_status || 'active'
      });
    }
  }, [user]);

  // Intercept Simulation/Checkout Success parameters from Stripe URL Redirects
  useEffect(() => {
    const mockSuccess = searchParams.get('mock_success');
    const priceId = searchParams.get('price_id');

    if (mockSuccess === 'true' && priceId) {
      async function completeMockUpgrade() {
        try {
          const res = await fetch('/api/payments/simulate-upgrade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priceId })
          });
          const data = await res.json();
          if (res.ok && data.status === 'success') {
            // Refresh user profile details
            const meRes = await fetch('/api/auth/me');
            const meData = await meRes.json();
            if (meRes.ok && meData.status === 'success') {
              setUser(meData.user);
            }
            setProfileSuccess('Billing Simulation: Successfully simulated Stripe Checkout and upgraded plan!');
            setTimeout(() => setProfileSuccess(''), 6000);
          }
        } catch (err) {
          console.error('[Billing Simulation Error] Upgrade simulation failed:', err.message);
        } finally {
          // Clear query params to clean up the URL
          setSearchParams({});
        }
      }
      completeMockUpgrade();
    }

    const mockPortal = searchParams.get('mock_portal');
    if (mockPortal === 'true') {
      setProfileSuccess('Billing Simulation: Direct configuration would be accessible here via Stripe Billing Portal in production.');
      setTimeout(() => setProfileSuccess(''), 6000);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, setUser]);

  // Profile Update Submit Handler
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profile.name.trim() || !profile.email.trim()) {
      setProfileError('Name and email are required.');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile settings.');
      }

      setUser(data.user);
      setProfileSuccess('Profile settings successfully saved.');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  // Password Change Submit Handler
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and password confirmation do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to change your account password.');
      }

      setPasswordSuccess('Password was updated successfully.');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Subscribe Checkout Session Handler
  const handleSubscribe = async (priceIdVar) => {
    setBillingError('');
    setBillingLoading(true);

    try {
      const res = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: priceIdVar })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create subscription checkout session.');
      }

      // Redirect browser to checkout URL (Stripe Checkout or Simulation redirect url)
      window.location.href = data.url;
    } catch (err) {
      setBillingError(err.message);
    } finally {
      setBillingLoading(false);
    }
  };

  // Portal Session Handler
  const handlePortalSession = async () => {
    setBillingError('');
    setBillingLoading(true);

    try {
      const res = await fetch('/api/payments/create-portal', {
        method: 'POST'
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to construct Stripe portal billing session.');
      }

      window.location.href = data.url;
    } catch (err) {
      setBillingError(err.message);
    } finally {
      setBillingLoading(false);
    }
  };

  // Subscription Cancellation Handler
  const handleCancelSubscription = async () => {
    const confirmCancel = window.confirm('Are you absolutely sure you want to cancel your active subscription? You will lose premium access features upon cancellation.');
    if (!confirmCancel) return;

    setBillingError('');
    setBillingLoading(true);

    try {
      const res = await fetch('/api/payments/cancel-subscription', {
        method: 'POST'
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to cancel subscription.');
      }

      // Refresh user details
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meRes.ok && meData.status === 'success') {
        setUser(meData.user);
      }

      setProfileSuccess(data.message || 'Your subscription has been successfully canceled.');
      setTimeout(() => setProfileSuccess(''), 5000);
    } catch (err) {
      setBillingError(err.message);
    } finally {
      setBillingLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get initials for avatar
  const getInitials = (nameString) => {
    if (!nameString) return 'U';
    const parts = nameString.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0 flex-col w-64 bg-white border-r border-slate-200">
        <div className="flex items-center h-16 px-6 border-b border-slate-100">
          <Link to="/" className="text-xl font-black text-brand-600 flex items-center">
            ⚡ {APP_INFO.name}
          </Link>
        </div>
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 px-4 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl w-full transition-colors ${
                activeTab === 'overview'
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="mr-3 h-5 w-5 flex-shrink-0" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl w-full transition-colors ${
                activeTab === 'billing'
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <CreditCard className="mr-3 h-5 w-5 flex-shrink-0" />
              Billing
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl w-full transition-colors ${
                activeTab === 'profile'
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <User className="mr-3 h-5 w-5 flex-shrink-0" />
              Profile Settings
            </button>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="group flex items-center px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors mt-4"
              >
                <Shield className="mr-3 h-5 w-5 flex-shrink-0" />
                Admin Panel
              </Link>
            )}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="group flex items-center px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl w-full transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-rose-500" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Space */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center space-x-4 md:hidden">
            <span className="text-xl font-black text-brand-600">⚡ {APP_INFO.name}</span>
          </div>
          <div className="flex-1 flex justify-end items-center space-x-4">
            {/* Notification Bell */}
            <button className="p-1.5 rounded-full hover:bg-slate-50 text-slate-500 relative">
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white"></span>
              <Bell className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-slate-700">{profile.name || 'User'}</span>
            <div className="h-8 w-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
              {getInitials(profile.name || user?.email)}
            </div>
            {/* Mobile logout */}
            <button onClick={handleLogout} className="md:hidden p-1.5 rounded-full hover:bg-rose-50 text-rose-600">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Inner Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            
            {profileSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
                <Check className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-emerald-700 font-semibold leading-relaxed">{profileSuccess}</p>
              </div>
            )}

            {/* Overview Section */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Welcome back, {profile.name || 'User'}!</h1>
                  <p className="text-sm text-slate-600">Here's a summary of your account and workspace setup.</p>
                </div>

                {/* Info Alert Box */}
                <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 flex gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm h-fit">
                    <Key className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-brand-900">Stripe Billing System Active!</h3>
                    <p className="text-xs text-brand-700 leading-relaxed mt-1">
                      Our Stripe checkout pipeline is online. You can seamlessly purchase subscriptions, simulate payments, or enter the Stripe Customer Portal directly from the Billing tab.
                    </p>
                  </div>
                </div>

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Status</span>
                    <div className="mt-2 flex items-baseline">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                        {user?.is_verified ? 'Verified Account' : 'Unverified Email'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subscription Plan</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">{profile.plan}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Access Role</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-2 capitalize">{user?.role}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Section */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Subscription & Billing</h1>
                  <p className="text-sm text-slate-600">Manage your subscription plans, card payment methods, and invoices.</p>
                </div>

                {billingError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{billingError}</p>
                  </div>
                )}

                {/* If user is subscribed (not on Free Trial) */}
                {profile.plan !== 'Free Trial' ? (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Active Plan</span>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{profile.plan}</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Billing Status: <span className="capitalize font-bold text-brand-600">{profile.status}</span>.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={handlePortalSession}
                          disabled={billingLoading}
                          className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 disabled:bg-brand-400 shadow-sm transition-colors flex items-center gap-2"
                        >
                          {billingLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                          Manage Billing & Invoices
                        </button>

                        {profile.status === 'active' && (
                          <button
                            onClick={handleCancelSubscription}
                            disabled={billingLoading}
                            className="px-4 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-600 font-semibold text-sm hover:bg-rose-50 disabled:opacity-50 transition-colors"
                          >
                            Cancel Subscription
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                      <Shield className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-slate-500 leading-relaxed">
                        In a live production workspace, clicking <b>"Manage Billing & Invoices"</b> will securely redirect your indie buyers to Stripe's Customer Billing Portal. Here they can dynamically upgrade plans, swap payment cards, or retrieve historical invoices.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* If on Free Trial - Display Gorgeous Pricing Options */
                  <div className="space-y-6">
                    <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 flex gap-4">
                      <AlertCircle className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-bold text-brand-900">Select a Subscription Tier</h3>
                        <p className="text-xs text-brand-700 leading-relaxed mt-1">
                          You are currently on a <b>Free Trial</b>. Please upgrade below to unlock full SaaS auth templates, database schemas, and nodemailer notifier triggers.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                      {/* Starter Monthly */}
                      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6 flex flex-col justify-between hover:border-brand-500 transition-colors duration-150">
                        <div className="space-y-4">
                          <div>
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200/50">
                              Monthly Plan
                            </span>
                            <h3 className="text-2xl font-black text-slate-900 mt-2">Starter Monthly</h3>
                            <p className="text-xs text-slate-500">Perfect for developer test runs and MVP deployments.</p>
                          </div>

                          <div className="flex items-baseline text-slate-900">
                            <span className="text-4xl font-extrabold tracking-tight">$19</span>
                            <span className="ml-1 text-sm font-semibold text-slate-500">/month</span>
                          </div>

                          <ul className="space-y-3 text-sm text-slate-600 border-t border-slate-100 pt-4">
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              <span>Full authentication templates</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              <span>Stripe checkout pipelines</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              <span>Nodemailer notifier triggers</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              <span>Admin management console</span>
                            </li>
                          </ul>
                        </div>

                        <button
                          onClick={() => handleSubscribe('STRIPE_PRICE_ID_MONTHLY')}
                          disabled={billingLoading}
                          className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                        >
                          {billingLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                          Subscribe Monthly
                        </button>
                      </div>

                      {/* Pro Yearly */}
                      <div className="bg-white rounded-3xl border-2 border-brand-500 shadow-md p-6 space-y-6 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-brand-500 text-white font-black text-[10px] uppercase tracking-wider py-1 px-4 rounded-bl-2xl">
                          Best Value
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 border border-brand-100">
                              Yearly Plan
                            </span>
                            <h3 className="text-2xl font-black text-slate-900 mt-2">Pro Yearly</h3>
                            <p className="text-xs text-slate-500">The premier boilerplate bundle for active Indie Hackers.</p>
                          </div>

                          <div className="flex items-baseline text-slate-900">
                            <span className="text-4xl font-extrabold tracking-tight">$149</span>
                            <span className="ml-1 text-sm font-semibold text-slate-500">/year</span>
                            <span className="ml-3 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Save 35%+</span>
                          </div>

                          <ul className="space-y-3 text-sm text-slate-600 border-t border-slate-100 pt-4">
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              <span><b>Everything</b> in Starter Monthly</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              <span>Multiple projects license</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              <span>Priority email support channels</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                              <span>Lifetime updates out-of-the-box</span>
                            </li>
                          </ul>
                        </div>

                        <button
                          onClick={() => handleSubscribe('STRIPE_PRICE_ID_YEARLY')}
                          disabled={billingLoading}
                          className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                        >
                          {billingLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                          Subscribe Yearly
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Settings Section */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Profile Details Form */}
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
                    <p className="text-sm text-slate-600">Update your email, profile details, and account password.</p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 p-4 bg-slate-50/50">
                      <h3 className="text-sm font-bold text-slate-800">Profile Information</h3>
                    </div>
                    
                    <form onSubmit={handleProfileSave} className="p-6 space-y-6">
                      {profileError && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-red-700 font-medium">{profileError}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-900">Full Name</label>
                          <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="mt-2 block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm px-3 focus:outline-none"
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-900">Email Address</label>
                          <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="mt-2 block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm px-3 focus:outline-none"
                            placeholder="your.email@example.com"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                        <button
                          type="submit"
                          disabled={profileLoading}
                          className="px-5 py-2.5 bg-brand-600 text-white font-semibold text-sm rounded-xl hover:bg-brand-700 disabled:bg-brand-400 shadow-sm shadow-brand-100 transition-colors flex items-center gap-2"
                        >
                          {profileLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                          Save Profile
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Password Change Form */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 p-4 bg-slate-50/50">
                      <h3 className="text-sm font-bold text-slate-800">Change Password</h3>
                    </div>

                    <form onSubmit={handlePasswordSave} className="p-6 space-y-6">
                      {passwordError && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-red-700 font-medium">{passwordError}</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-900">Current Password</label>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="mt-2 block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm px-3 focus:outline-none"
                            placeholder="••••••••"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-slate-900">New Password</label>
                            <input
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              className="mt-2 block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm px-3 focus:outline-none"
                              placeholder="Minimum 6 characters"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-900">Confirm New Password</label>
                            <input
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              className="mt-2 block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm px-3 focus:outline-none"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="px-5 py-2.5 bg-brand-600 text-white font-semibold text-sm rounded-xl hover:bg-brand-700 disabled:bg-brand-400 shadow-sm shadow-brand-100 transition-colors flex items-center gap-2"
                        >
                          {passwordLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
