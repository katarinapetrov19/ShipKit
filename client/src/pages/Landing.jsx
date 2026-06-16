import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_INFO, PLANS } from '@shared/constants';
import { Zap, Shield, Sparkles, CreditCard, ChevronDown, Check, Star, ArrowRight } from 'lucide-react';

export default function Landing() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "What is included in the ShipKit boilerplate?",
      a: "ShipKit comes packed with everything you need to launch: fully integrated user authentication (JWT + cookies), modular user settings, Stripe Checkout & Webhooks, a powerful system-wide Admin Dashboard with database management, Nodemailer configurations, and a clean, responsive Tailwind UI."
    },
    {
      q: "Is there a recurring fee?",
      a: "No! ShipKit is a one-time purchase. Once you buy a license, you own the code and can use it forever. No monthly subscriptions, no royalty fees, ever."
    },
    {
      q: "Which tech stack does ShipKit use?",
      a: "We keep it extremely lean and high-performance. The backend is Node.js + Express with SQLite (using the ultra-fast better-sqlite3 driver). The frontend is built with React, Vite, and Tailwind CSS. No complex frameworks like Next.js required."
    },
    {
      q: "Can I use ShipKit for client projects?",
      a: "Absolutely. With our Extended License, you can use the template to build unlimited commercial SaaS applications for yourself or your clients."
    }
  ];

  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-brand-600" />,
      title: "Vite + React Frontend",
      desc: "Ultra-fast hot module replacement (HMR), optimized production builds, and clean Tailwind layout."
    },
    {
      icon: <Shield className="h-6 w-6 text-brand-600" />,
      title: "Secure Authentication",
      desc: "JWT-based sessions stored in secure HTTP-only cookies, with forgot password & email verification flows."
    },
    {
      icon: <CreditCard className="h-6 w-6 text-brand-600" />,
      title: "Stripe Billing & Lifecycle",
      desc: "Pre-configured Stripe Checkout and robust webhook processing for recurring subscriptions and payments."
    },
    {
      icon: <Zap className="h-6 w-6 text-brand-600" />,
      title: "Interactive Admin Dashboard",
      desc: "Manage users, track revenue with live charts, and update application configuration on the fly."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-brand-600 flex items-center">
              ⚡ {APP_INFO.name}
            </span>
          </div>
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-brand-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-brand-600 transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="inline-flex justify-center rounded-lg text-sm font-semibold py-2 px-4 bg-brand-600 text-white hover:bg-brand-700 transition-all shadow-md shadow-brand-100">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold leading-5 text-brand-700 bg-brand-50 border border-brand-100 mb-6">
              <span className="animate-pulse">🟢</span> Ready for Stripe, Auth & SQLite
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
              Launch Your SaaS in <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">Hours, Not Weeks</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {APP_INFO.description} Built on Express, React, and SQLite. Fully functional template to speed up your development.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#pricing" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl text-base font-semibold py-3 px-6 bg-brand-600 text-white hover:bg-brand-700 transition-all shadow-lg shadow-brand-100">
                View Pricing <ArrowRight className="h-5 w-5" />
              </a>
              <Link to="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl text-base font-semibold py-3 px-6 bg-white text-slate-800 hover:bg-slate-50 transition-all border border-slate-200">
                Explore Dashboard
              </Link>
            </div>
            {/* Social Proof */}
            <div className="mt-12 flex items-center justify-center gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <span>Loved by solo founders and developers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything Configured, Ready to Roll
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Skip the boilerplate. ShipKit has configured database migrations, authentication, billing, and transactional email.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all">
                <div className="p-3 bg-white rounded-xl shadow-sm w-fit mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Pricing Options to Fit Your Projects
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              One-time purchase of high-quality code. Start building your next idea immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 flex flex-col shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">{PLANS.FREE.name}</h3>
              <p className="mt-2 text-sm text-slate-500">Perfect for exploring the local setup</p>
              <div className="mt-4 flex items-baseline text-slate-900">
                <span className="text-4xl font-extrabold tracking-tight">${PLANS.FREE.price}</span>
                <span className="ml-1 text-sm text-slate-500">/ forever</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-slate-600 flex-1">
                {PLANS.FREE.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-brand-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Link to="/login" className="mt-8 block w-full py-3 px-4 text-center text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 transition-colors">
                Try Local Demo
              </Link>
            </div>

            {/* Monthly Premium (Featured) */}
            <div className="bg-white p-8 rounded-3xl border-2 border-brand-500 flex flex-col shadow-xl relative scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-brand-500 px-4 py-1 text-xs font-bold text-white uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-slate-900">{PLANS.MONTHLY.name}</h3>
              <p className="mt-2 text-sm text-slate-500">Ideal for launching a simple SaaS subscription</p>
              <div className="mt-4 flex items-baseline text-slate-900">
                <span className="text-4xl font-extrabold tracking-tight">${PLANS.MONTHLY.price}</span>
                <span className="ml-1 text-sm text-slate-500">/ month</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-slate-600 flex-1">
                {PLANS.MONTHLY.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-brand-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup?plan=monthly" className="mt-8 block w-full py-3 px-4 text-center text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-md shadow-brand-100">
                Buy Starter Subscription
              </Link>
            </div>

            {/* Yearly Tier */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 flex flex-col shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">{PLANS.YEARLY.name}</h3>
              <p className="mt-2 text-sm text-slate-500">Ultimate option for serious indie hackers</p>
              <div className="mt-4 flex items-baseline text-slate-900">
                <span className="text-4xl font-extrabold tracking-tight">${PLANS.YEARLY.price}</span>
                <span className="ml-1 text-sm text-slate-500">/ year</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-slate-600 flex-1">
                {PLANS.YEARLY.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-brand-600 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup?plan=yearly" className="mt-8 block w-full py-3 px-4 text-center text-sm font-semibold rounded-xl border border-brand-200 hover:bg-brand-50 text-brand-700 transition-colors">
                Get Yearly Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 transition-all">
                <button onClick={() => toggleFaq(index)} className="w-full text-left px-6 py-4 flex items-center justify-between font-semibold text-slate-800 hover:bg-slate-100 transition-colors">
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-slate-500 transition-transform ${activeFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-4 pt-2 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-brand-600 to-indigo-700 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Launch Your Product This Weekend</h2>
          <p className="text-lg text-brand-100 mb-8 max-w-xl mx-auto">
            Stop building auth and billing over and over. Buy ShipKit once and start generating actual business.
          </p>
          <a href="#pricing" className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-brand-50 transition-all font-bold py-3.5 px-8 rounded-xl text-base shadow-xl">
            Get Instant Access ⚡
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-black text-white flex items-center gap-2">
            ⚡ {APP_INFO.name}
          </div>
          <p className="text-xs">
            &copy; {new Date().getFullYear()} {APP_INFO.name}. All rights reserved. Built with love for developers.
          </p>
          <div className="flex gap-6 text-sm">
            <a href={`mailto:${APP_INFO.supportEmail}`} className="hover:text-white transition-colors">Support</a>
            <span className="text-slate-700">|</span>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <span className="text-slate-700">|</span>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
