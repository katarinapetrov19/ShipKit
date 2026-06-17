import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { APP_INFO } from '@shared/constants';
import Logo from '../components/Logo.jsx';
import { DownloadCloud, AlertTriangle, Loader2 } from 'lucide-react';

export default function Download() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id') || '';
  
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setMessage] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setMessage('No active download session ID was provided. If you purchased ShipKit, please use the direct link from your email receipt or Stripe success page.');
      return;
    }

    async function verifySession() {
      try {
        const response = await fetch('/api/payments/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (response.ok && data.verified) {
          setStatus('success');
        } else {
          setStatus('error');
          setMessage(data.message || 'Invalid or unpaid checkout session ID.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network error verifying download session. Please check your connection and try again.');
      }
    }

    // Small delay to prevent visual flashing
    const timer = setTimeout(() => {
      verifySession();
    }, 1200);

    return () => clearTimeout(timer);
  }, [sessionId]);

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-6 shadow sm:rounded-2xl sm:px-10 border border-slate-100 text-center space-y-6">
          <div className="text-center">
            <Logo />
          </div>

          {status === 'verifying' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 text-brand-600 animate-spin" />
              <h2 className="text-xl font-bold text-slate-900">Verifying Purchase Session</h2>
              <p className="text-sm text-slate-500">Checking checkout confirmation code with Stripe...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-5">
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full">
                <DownloadCloud className="h-16 w-16 animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Purchase Verified!</h2>
              <p className="text-sm text-slate-600 leading-relaxed px-4">
                Thank you for purchasing ShipKit! Your download of the SaaS Boilerplate Starter Kit is now ready for deployment.
              </p>
              
              <div className="pt-4 w-full">
                <a
                  href={`/api/payments/download-file?token=${encodeURIComponent(sessionId)}`}
                  className="inline-flex w-full justify-center items-center rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-brand-700 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  <DownloadCloud className="h-5 w-5 mr-2" />
                  Download shipkit-boilerplate.tar.gz
                </a>
              </div>

              <div className="pt-2 text-xs text-slate-400">
                Size: ~100KB • Format: compressed tarball (.tar.gz)
              </div>
              
              <div className="border-t border-slate-100 pt-5 mt-2 w-full text-left">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Next Steps</h3>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal pl-4">
                  <li>Extract the archive on your local machine: <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-500">tar -xzf shipkit-boilerplate.tar.gz</code></li>
                  <li>Follow the instruction in the <code className="bg-slate-100 px-1 py-0.5 rounded">README.md</code> guide to start development in seconds!</li>
                </ol>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-red-50 text-red-500 p-4 rounded-full">
                <AlertTriangle className="h-12 w-12 animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Download Failed</h2>
              <p className="text-sm text-slate-600 leading-relaxed px-4">{errorMessage}</p>
              <div className="pt-4 w-full space-y-3">
                <Link
                  to="/"
                  className="inline-flex w-full justify-center items-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  Return to Homepage
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
