import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_INFO } from '@shared/constants';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const fieldClass = "block w-full rounded-2xl border border-black/10 py-2.5 px-4 text-sm text-[#0a0a0a] bg-white/60 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/20 transition-colors";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const { login, error, setError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { setError(null); }, [setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (quickEmail) => {
    setLocalError(null);
    setSubmitting(true);
    try {
      await login(quickEmail, 'password123');
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    const userEmail = prompt('Enter your email to receive a reset link:');
    if (userEmail) {
      fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      })
      .then(r => r.json())
      .then(d => alert(d.message || 'Reset link sent.'))
      .catch(() => alert('Something went wrong.'));
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F1ED] flex flex-col items-center justify-center px-4 py-16 font-sans">
      <Logo className="mb-10" />

      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-center mb-1">Sign in</h1>
        <p className="text-sm text-neutral-500 text-center mb-8">
          No account?{' '}
          <Link to="/signup" className="text-[#0a0a0a] underline underline-offset-2 hover:opacity-60 transition-opacity">
            Create one free
          </Link>
        </p>

        <div className="bg-white/60 border border-black/8 rounded-[20px] p-8">
          {(localError || error) && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600">
              {localError || error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Email</label>
              <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={fieldClass} placeholder="name@example.com" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-neutral-500">Password</label>
                <button type="button" onClick={handleForgotPassword} className="text-xs text-neutral-400 hover:text-black transition-colors">
                  Forgot password?
                </button>
              </div>
              <input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className={fieldClass} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={submitting} className="w-full py-3 bg-[#0a0a0a] text-white text-sm font-medium rounded-full hover:bg-neutral-700 transition-colors disabled:opacity-50 mt-2">
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/8" /></div>
            <div className="relative flex justify-center"><span className="bg-white/80 px-3 text-xs text-neutral-400">Developer quick login</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleQuickLogin('user@shipkit.dev')} className="flex flex-col items-center py-2.5 px-3 rounded-xl border border-black/10 bg-[#F2F1ED] hover:bg-white transition-colors text-xs">
              <span className="font-medium">Demo User</span>
              <span className="text-neutral-400 text-[10px]">user@shipkit.dev</span>
            </button>
            <button onClick={() => handleQuickLogin('admin@shipkit.dev')} className="flex flex-col items-center py-2.5 px-3 rounded-xl border border-black/10 bg-[#F2F1ED] hover:bg-white transition-colors text-xs">
              <span className="font-medium">Demo Admin</span>
              <span className="text-neutral-400 text-[10px]">admin@shipkit.dev</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
