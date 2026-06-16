import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { APP_INFO } from '@shared/constants';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { resetPassword, setError } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setLocalError('No password recovery token was found in the link.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!token) {
      setLocalError('No password recovery token was found in the link.');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setLocalError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-12 px-6 shadow sm:rounded-2xl sm:px-10 border border-slate-100 text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-emerald-500 animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Password Reset!</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your password has been updated successfully. You can now sign in to your account with your new password.
            </p>
            <div className="pt-4">
              <Link
                to="/login"
                className="inline-flex justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link to="/" className="text-3xl font-black text-brand-600">
            ⚡ {APP_INFO.name}
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Please enter your new password below.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-100">
          
          {localError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
              {localError}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900">
                New Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 px-3"
                  placeholder="At least 8 characters"
                  disabled={!token || submitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-slate-900">
                Confirm New Password
              </label>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 sm:text-sm sm:leading-6 px-3"
                  placeholder="Confirm password"
                  disabled={!token || submitting}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={!token || submitting}
                className="flex w-full justify-center rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-colors disabled:bg-brand-400"
              >
                {submitting ? 'Resetting password...' : 'Reset Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
