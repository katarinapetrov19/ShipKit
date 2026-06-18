import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { APP_INFO } from '@shared/constants';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { CheckCircle } from 'lucide-react';

const fieldClass = "block w-full rounded-2xl border border-black/10 py-2.5 px-4 text-sm text-[#0a0a0a] bg-white/60 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/20 transition-colors";

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [verifyLink, setVerifyLink] = useState(null);
  const { signup, error, setError } = useAuth();

  useEffect(() => { setError(null); }, [setError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);
    try {
      const data = await signup(name, email, password);
      if (data.verificationLink) {
        setVerifyLink(data.verificationLink);
      }
      setSuccess(true);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F2F1ED] flex flex-col items-center justify-center px-4 py-16 font-sans">
        <div className="w-full max-w-sm bg-white/60 border border-black/8 rounded-[20px] p-10 text-center space-y-4">
          <CheckCircle className="h-10 w-10 text-green-600 mx-auto" />
          <h2 className="text-xl font-semibold tracking-tight">Check your inbox</h2>
          <p className="text-sm text-neutral-500 leading-relaxed">
            We sent a verification link to <span className="text-[#0a0a0a] font-medium">{email}</span>. Click it to activate your account.
          </p>
          {verifyLink && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left space-y-2">
              <p className="text-xs font-medium text-amber-800">⚠️ Dev mode — no real email sent</p>
              <p className="text-xs text-amber-700">Click the link below to verify:</p>
              <a href={verifyLink} className="text-xs text-blue-600 underline break-all font-medium hover:text-blue-700">{verifyLink}</a>
            </div>
          )}
          <Link to="/login" className="inline-block mt-2 px-6 py-3 bg-[#0a0a0a] text-white text-sm font-medium rounded-full hover:bg-neutral-700 transition-colors">
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F1ED] flex flex-col items-center justify-center px-4 py-16 font-sans">
      <Logo className="mb-10" />

      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-center mb-1">Create your account</h1>
        <p className="text-sm text-neutral-500 text-center mb-8">
          Already have one?{' '}
          <Link to="/login" className="text-[#0a0a0a] underline underline-offset-2 hover:opacity-60 transition-opacity">
            Sign in
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
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Full name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className={fieldClass} placeholder="Maria Müller" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={fieldClass} placeholder="name@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={fieldClass} placeholder="••••••••" />
            </div>
            <div className="flex items-start gap-2.5 pt-1">
              <input id="terms" type="checkbox" required className="mt-0.5 h-3.5 w-3.5 rounded border-black/20 accent-black" />
              <label htmlFor="terms" className="text-xs text-neutral-500 leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-[#0a0a0a] underline underline-offset-2">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-[#0a0a0a] underline underline-offset-2">Privacy Policy</a>
              </label>
            </div>
            <button type="submit" disabled={submitting} className="w-full py-3 bg-[#0a0a0a] text-white text-sm font-medium rounded-full hover:bg-neutral-700 transition-colors disabled:opacity-50 mt-2">
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
