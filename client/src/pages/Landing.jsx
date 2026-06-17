import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_INFO, PLANS } from '@shared/constants';
import { Shield, Sparkles, CreditCard, ChevronDown, Check, ArrowRight, Zap } from 'lucide-react';
import Logo from '../components/Logo.jsx';

export default function Landing() {
  const [activeFaq, setActiveFaq] = useState(null);

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
      a: "We keep it extremely lean and high-performance. The backend is Node.js + Express with SQLite (using the ultra-fast better-sqlite3 driver). The frontend is built with React, Vite, and Tailwind CSS."
    },
    {
      q: "Can I use ShipKit for client projects?",
      a: "Absolutely. With our Extended License, you can use the template to build unlimited commercial SaaS applications for yourself or your clients."
    }
  ];

  const features = [
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: "Vite + React Frontend",
      desc: "Ultra-fast HMR, optimized production builds, and clean Tailwind layout out of the box."
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Secure Authentication",
      desc: "JWT-based sessions in HTTP-only cookies, with forgot password & email verification flows."
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: "Stripe Billing",
      desc: "Pre-configured Stripe Checkout and robust webhook processing for recurring subscriptions."
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Admin Dashboard",
      desc: "Manage users, track revenue with live charts, and update app config on the fly."
    }
  ];

  return (
    <div className="bg-[#F2F1ED] min-h-screen flex flex-col font-sans">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#F2F1ED]/80 backdrop-blur-md border-b border-black/8">
        <div className="max-w-6xl mx-auto px-6 h-14 grid grid-cols-3 items-center">
          <Logo />
          <nav className="hidden md:flex justify-center gap-8 text-sm text-neutral-500">
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#pricing" className="hover:text-black transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center justify-end gap-3">
            <Link to="/login" className="px-5 py-2 text-sm font-medium rounded-full border border-black/15 hover:bg-white transition-colors">
              Sign in
            </Link>
            <Link to="/signup" className="px-5 py-2 bg-[#0a0a0a] text-white text-sm font-medium rounded-full hover:bg-neutral-700 transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium text-neutral-500 bg-white/60 border border-black/8 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Ready for Stripe, Auth & SQLite
          </div>
          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-[#0a0a0a] leading-[1.1] mb-6">
            Launch your SaaS<br />in hours, not weeks.
          </h1>
          <p className="text-lg text-neutral-500 leading-relaxed max-w-xl mx-auto mb-10">
            {APP_INFO.description} Built on Express, React, and SQLite — everything wired up, ready to ship.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#pricing" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-full hover:bg-neutral-700 transition-colors">
              View pricing <ArrowRight className="h-4 w-4" />
            </a>
            <Link to="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/60 text-[#0a0a0a] text-sm font-medium rounded-full border border-black/10 hover:bg-white transition-colors">
              Explore dashboard
            </Link>
          </div>
          <p className="mt-8 text-xs text-neutral-400 tracking-wide">★★★★★ &nbsp; Loved by solo founders and developers</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 border-t border-black/8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-3xl font-semibold tracking-tight mb-3">Everything configured, ready to roll</h2>
            <p className="text-neutral-500 text-sm leading-relaxed">Skip the boilerplate. Auth, billing, email and admin — all wired up.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feat, i) => (
              <div key={i} className="p-6 rounded-[20px] bg-white/60 border border-black/8 hover:bg-white transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#0a0a0a] text-white flex items-center justify-center mb-4">
                  {feat.icon}
                </div>
                <h3 className="font-medium text-[#0a0a0a] mb-2">{feat.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 border-t border-black/8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-3xl font-semibold tracking-tight mb-3">Simple, one-time pricing</h2>
            <p className="text-neutral-500 text-sm leading-relaxed">Buy once, own it forever. No subscriptions, no royalties.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">

            {/* Free */}
            <div className="p-8 rounded-[20px] bg-white/60 border border-black/8 flex flex-col">
              <h3 className="font-medium text-[#0a0a0a]">{PLANS.FREE.name}</h3>
              <p className="mt-1 text-xs text-neutral-400">Perfect for exploring locally</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">${PLANS.FREE.price}</span>
                <span className="text-sm text-neutral-400">/ forever</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm text-neutral-500 flex-1">
                {PLANS.FREE.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-[#0a0a0a] shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="mt-8 block w-full py-3 text-center text-sm font-medium rounded-full border border-black/15 hover:bg-white transition-colors">
                Try local demo
              </Link>
            </div>

            {/* Monthly — featured */}
            <div className="p-8 rounded-[20px] bg-[#0a0a0a] border border-[#0a0a0a] flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-white text-[#0a0a0a] text-xs font-medium rounded-full border border-black/10">
                Most popular
              </div>
              <h3 className="font-medium text-white">{PLANS.MONTHLY.name}</h3>
              <p className="mt-1 text-xs text-neutral-400">Ideal for launching a SaaS</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight text-white">${PLANS.MONTHLY.price}</span>
                <span className="text-sm text-neutral-400">/ month</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm text-neutral-300 flex-1">
                {PLANS.MONTHLY.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-white shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup?plan=monthly" className="mt-8 block w-full py-3 text-center text-sm font-medium rounded-full bg-white text-[#0a0a0a] hover:bg-neutral-100 transition-colors">
                Get started
              </Link>
            </div>

            {/* Yearly */}
            <div className="p-8 rounded-[20px] bg-white/60 border border-black/8 flex flex-col">
              <h3 className="font-medium text-[#0a0a0a]">{PLANS.YEARLY.name}</h3>
              <p className="mt-1 text-xs text-neutral-400">For serious indie hackers</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">${PLANS.YEARLY.price}</span>
                <span className="text-sm text-neutral-400">/ year</span>
              </div>
              <ul className="mt-8 space-y-3 text-sm text-neutral-500 flex-1">
                {PLANS.YEARLY.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <Check className="h-3.5 w-3.5 text-[#0a0a0a] shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup?plan=yearly" className="mt-8 block w-full py-3 text-center text-sm font-medium rounded-full border border-black/15 hover:bg-white transition-colors">
                Get yearly plan
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 border-t border-black/8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-[20px] bg-white/60 border border-black/8 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between text-sm font-medium text-[#0a0a0a] hover:bg-white transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-neutral-400 shrink-0 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-5 pt-1 text-sm text-neutral-500 leading-relaxed border-t border-black/8">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-black/8">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-semibold tracking-tight mb-4">Launch your product this weekend</h2>
          <p className="text-neutral-500 text-sm leading-relaxed mb-8">
            Stop rebuilding auth and billing from scratch. Buy ShipKit once and start shipping.
          </p>
          <a href="#pricing" className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#0a0a0a] text-white text-sm font-medium rounded-full hover:bg-neutral-700 transition-colors">
            Get instant access ⚡
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/8 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Logo className="text-sm" />
          <p className="text-xs text-neutral-400">© {new Date().getFullYear()} {APP_INFO.name}. All rights reserved.</p>
          <div className="flex gap-5 text-xs text-neutral-400">
            <a href={`mailto:${APP_INFO.supportEmail}`} className="hover:text-black transition-colors">Support</a>
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
