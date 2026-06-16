import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { APP_INFO } from '@shared/constants';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail } = useAuth();
  
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token was provided in the link.');
      return;
    }

    async function doVerification() {
      try {
        const res = await verifyEmail(token);
        setStatus('success');
        setMessage(res.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Verification link is invalid or has expired.');
      }
    }

    // Delay slightly for visual comfort (avoid instant flash)
    const timer = setTimeout(() => {
      doVerification();
    }, 1200);

    return () => clearTimeout(timer);
  }, [token, verifyEmail]);

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-6 shadow sm:rounded-2xl sm:px-10 border border-slate-100 text-center space-y-6">
          <div className="text-center">
            <span className="text-3xl font-black text-brand-600">⚡ {APP_INFO.name}</span>
          </div>

          {status === 'verifying' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 text-brand-600 animate-spin" />
              <h2 className="text-xl font-bold text-slate-900">Verifying Your Email</h2>
              <p className="text-sm text-slate-500">Please hold on while we confirm your verification link...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-16 w-16 text-emerald-500 animate-bounce" />
              <h2 className="text-2xl font-bold text-slate-900">Email Verified!</h2>
              <p className="text-sm text-slate-600 leading-relaxed px-4">{message}</p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
                >
                  Sign In to Your Account
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-16 w-16 text-red-500 animate-pulse" />
              <h2 className="text-2xl font-bold text-slate-900">Verification Failed</h2>
              <p className="text-sm text-slate-600 leading-relaxed px-4">{message}</p>
              <div className="pt-4">
                <Link
                  to="/signup"
                  className="inline-flex justify-center rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
                >
                  Request a New Verification Link
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
