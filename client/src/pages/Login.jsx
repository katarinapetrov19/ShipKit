import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_INFO } from '@shared/constants';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const { login, error, setError } = useAuth();
  const navigate = useNavigate();

  // Clear global auth errors when mounting
  useEffect(() => {
    setError(null);
  }, [setError]);

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
    setEmail(quickEmail);
    setPassword('password123');
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

  const handleForgotPasswordClick = () => {
    const userEmail = prompt('Enter your email address to receive a password reset link:');
    if (userEmail) {
      // Direct call to context API
      fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      })
      .then(res => res.json())
      .then(data => alert(data.message || 'Password reset requested.'))
      .catch(err => alert('Failed to request password reset: ' + err.message));
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link to="/" className="text-3xl font-black text-brand-600">
            ⚡ {APP_INFO.name}
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Or{' '}
            <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-500">
              create a new account (14-day free trial)
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-100">
          
          {(localError || error) && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
              {localError || error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 px-3"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900">
                  Password
                </label>
                <div className="text-sm">
                  <button type="button" className="font-semibold text-brand-600 hover:text-brand-500" onClick={handleForgotPasswordClick}>
                    Forgot password?
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 px-3"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full justify-center rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-colors disabled:bg-brand-400"
              >
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs font-medium leading-6">
                <span className="bg-white px-6 text-slate-500">Quick Developer Logins</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleQuickLogin('user@shipkit.dev')}
                className="flex w-full flex-col items-center justify-center gap-0.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-100 transition-colors"
              >
                <span>Demo User</span>
                <span className="text-[10px] text-slate-400 font-normal">user@shipkit.dev</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@shipkit.dev')}
                className="flex w-full flex-col items-center justify-center gap-0.5 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-100 transition-colors"
              >
                <span>Demo Admin</span>
                <span className="text-[10px] text-slate-400 font-normal">admin@shipkit.dev</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
