'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';
import {
  Mail,
  Sparkles,
  ShieldCheck,
  Target,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Quote,
  ArrowRight,
  Inbox,
  Users,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const personas = [
  {
    label: 'Inbox owners at scaling startups',
    desc: 'Founders and ops leads who still field every marketing email and receipt themselves.',
  },
  {
    label: 'Lifecycle & growth teams',
    desc: 'Teams that must see every campaign but need a safety net to silence the noise fast.',
  },
  {
    label: 'Executive assistants',
    desc: 'Chiefs of staff protecting leadership inboxes from relentless vendor spam.',
  },
];

const painPoints = [
  {
    title: 'You have no live inventory of who is emailing you.',
    desc: 'Complex inboxes hide thousands of recurring senders across promos, receipts, and stale partnerships.',
  },
  {
    title: 'Manual unsubscribes steal entire afternoons.',
    desc: 'Every "unsubscribe" link behaves differently and most lead to forms or confirmations you forget to finish.',
  },
  {
    title: 'Critical comms get buried.',
    desc: 'That renewal reminder or investor update arrives right after a wave of marketing blasts, so it is missed or late.',
  },
];

const outcomes = [
  {
    title: 'Immediate visibility',
    desc: 'Unclutter maps every sender, cadence, and unsubscribe method so you know exactly what fills the inbox.',
  },
  {
    title: 'Hybrid cleanup',
    desc: 'One click handles 70% of unsubscribes automatically and routes edge cases into a guided manual queue.',
  },
  {
    title: 'Noise-free rituals',
    desc: 'Run a scan before weekly planning and the inbox is clear before you dive into the work that matters.',
  },
];

const proofStats = [
  { value: '18 hrs', label: 'manual triage saved / month' },
  { value: '2,143', label: 'senders fingerprinted per scan' },
  { value: '92%', label: 'auto-confirm success rate' },
];

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

const testimonials: Testimonial[] = [];

const sampleSenders = [
  { name: 'Field Notes Weekly', email: 'updates@fieldnotes.io', emails: 28, status: 'Auto' },
  { name: 'Orbit Rewards', email: 'news@orbitrewards.com', emails: 12, status: 'Manual' },
  { name: 'Nord Commerce', email: 'hello@nordcommerce.com', emails: 43, status: 'Auto' },
  { name: 'Atlas Fitness', email: 'studio@atlas.fit', emails: 8, status: 'Link' },
];

export default function LandingPage() {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { auth_url } = await api.connectEmail();
      window.location.href = auth_url;
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-16 md:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-14">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-panel relative overflow-hidden rounded-[22px] p-8 md:p-10">
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-1/3"
              style={{ background: 'radial-gradient(circle at 50% 20%, rgba(13,148,136,0.2), transparent 55%)' }}
            />
            <div className="relative z-10 space-y-7">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/80 px-4 py-1.5 text-[13px] font-semibold text-primary shadow-soft">
                <Sparkles size={16} /> Inbox ops control room
              </div>
              <div className="space-y-5">
                <p className="text-[13px] font-semibold uppercase tracking-[0.35em] text-primary/80">Built for overwhelmed owners</p>
                <h1 className="text-[42px] leading-tight md:text-[56px]">
                  Silence promo chaos and keep critical email visible.
                </h1>
                <p className="text-[16px] text-text-secondary md:text-[18px]">
                  Unclutter is for operators who manage revenue, finance, or leadership inboxes. We categorize every recurring sender, auto-confirm unsubscribes, and hand you the short list that still needs a manual tap.
                </p>
              </div>

              <div className="space-y-3 text-[15px] text-text-secondary">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-primary" /> OAuth-only, read-only Gmail access
                </div>
                <div className="flex items-center gap-3">
                  <Target size={20} className="text-primary" /> Built for EA / ops workflows
                </div>
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-primary" /> Covers shared leadership inboxes
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className={cn(
                    'inline-flex h-[56px] w-full items-center justify-center gap-3 rounded-xl border border-white/30 bg-gradient-to-r from-[#0B766D] via-[#08554E] to-[#043633] px-8 text-[16px] font-semibold text-white shadow-[0_15px_45px_rgba(4,54,51,0.55)] transition-all duration-200 hover:shadow-[0_18px_55px_rgba(4,54,51,0.65)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 sm:w-auto',
                    loading && 'opacity-70 cursor-not-allowed'
                  )}
                >
                  <Mail size={20} className="text-white" />
                  {loading ? 'Connecting…' : 'Connect Gmail & run first scan'}
                </button>
                <p className="text-[13px] text-text-muted">Takes ~60 seconds. Read-only until you approve each action.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[20px] border border-white/40 bg-gradient-to-br from-[#0E947F] via-[#0B7269] to-[#073b36] p-8 text-white shadow-card">
              <div className="flex items-center justify-between text-white/80">
                <p className="text-[13px] uppercase tracking-[0.35em]">What you get</p>
                <BarChart3 size={20} />
              </div>
              <p className="mt-5 text-[28px] leading-snug">Every sender fingerprinted, auto unsubscribes queued, and the rest ready for review.</p>
              <div className="mt-6 space-y-4">
                {sampleSenders.map((sender) => (
                  <div key={sender.email} className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm">
                    <div>
                      <p className="font-semibold">{sender.name}</p>
                      <p className="text-white/70">{sender.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] uppercase tracking-widest text-white/70">{sender.emails} emails/mo</p>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold',
                          sender.status === 'Auto'
                            ? 'bg-white/20'
                            : sender.status === 'Manual'
                            ? 'bg-amber-400/20 text-amber-100'
                            : 'bg-white/15'
                        )}
                      >
                        <CheckCircle2 size={14} /> {sender.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-border bg-white/90 p-6 shadow-soft">
              <p className="text-[13px] font-semibold uppercase tracking-[0.3em] text-text-muted">Proof we obsess over trust</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {proofStats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border/60 bg-surface px-4 py-3">
                    <p className="text-[32px] font-semibold text-text-primary">{stat.value}</p>
                    <p className="text-[12px] uppercase tracking-[0.3em] text-text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-border bg-white/92 p-8 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[13px] uppercase tracking-[0.35em] text-text-muted">Who this is for</p>
              <h2 className="text-[32px] font-semibold text-text-primary">If you own outcomes tied to an inbox, Unclutter is built for you.</h2>
            </div>
            <div className="flex items-center gap-2 text-text-secondary text-[13px]">
              <ShieldCheck size={16} className="text-primary" /> SOC2-ready architecture
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {personas.map((persona) => (
              <div key={persona.label} className="rounded-2xl border border-border/70 bg-surface-hover px-5 py-4">
                <p className="text-[15px] font-semibold text-text-primary">{persona.label}</p>
                <p className="mt-2 text-[14px] text-text-secondary">{persona.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 rounded-[20px] border border-border bg-white/90 p-8 shadow-soft lg:grid-cols-2">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50/60 px-3 py-1 text-[12px] font-semibold text-rose-600">
              <AlertTriangle size={14} /> The pain you feel
            </div>
            <h3 className="text-[28px] font-semibold text-text-primary">Every high-stakes inbox slowly turns into a marketing graveyard.</h3>
            <div className="space-y-4">
              {painPoints.map((pain) => (
                <div key={pain.title} className="rounded-2xl border border-rose-100 bg-white/70 p-4">
                  <p className="text-[16px] font-semibold text-rose-700">{pain.title}</p>
                  <p className="mt-2 text-[14px] text-text-secondary">{pain.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[12px] font-semibold text-emerald-700">
              <CheckCircle2 size={14} /> What changes after Unclutter
            </div>
            <h3 className="text-[28px] font-semibold text-text-primary">Run a scan and your inbox priorities become obvious.</h3>
            <div className="space-y-4">
              {outcomes.map((item) => (
                <div key={item.title} className="rounded-2xl border border-emerald-100 bg-white/80 p-4">
                  <p className="text-[16px] font-semibold text-emerald-800">{item.title}</p>
                  <p className="mt-2 text-[14px] text-text-secondary">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 rounded-[20px] border border-border bg-white/90 p-8 shadow-soft lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[18px] border border-border/80 bg-surface px-6 py-6">
            <p className="text-[13px] uppercase tracking-[0.35em] text-text-muted">Proof & validation</p>
            <div className="mt-4 space-y-6">
              {testimonials.length > 0 ? (
                testimonials.map((testimonial) => (
                  <div key={testimonial.name} className="space-y-4">
                    <Quote size={24} className="text-primary" />
                    <p className="text-[18px] text-text-primary">“{testimonial.quote}”</p>
                    <div className="text-[14px] text-text-secondary">
                      <p className="font-semibold text-text-primary">{testimonial.name}</p>
                      <p>{testimonial.role}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-border/60 bg-white/80 p-4 text-[15px] text-text-secondary">
                  <p>We&apos;re still onboarding the first operators, so public proof will land here once we have real results.</p>
                  <p className="mt-2 text-[13px] uppercase tracking-[0.35em] text-text-muted">Stay tuned.</p>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-[18px] border border-dashed border-border/80 bg-surface-hover px-6 py-6">
            <p className="text-[13px] uppercase tracking-[0.35em] text-text-muted">How it works in action</p>
            <div className="mt-5 space-y-5">
              {[
                'Secure OAuth connects your Gmail with read-only scope.',
                'Unclutter scans 500+ messages and fingerprints every sender.',
                'One-click unsubscribes fire automatically, confirmations are handled, and tricky workflows drop into your manual queue.',
                'You come back to a prioritized, quiet inbox.',
              ].map((step, idx) => (
                <div key={step} className="flex gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-[14px] font-semibold text-primary">
                    {idx + 1}
                  </div>
                  <p className="flex-1 text-[15px] text-text-secondary">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[22px] border border-border bg-white/95 p-8 shadow-soft text-center">
          <div className="mx-auto max-w-3xl space-y-4">
            <p className="text-[13px] uppercase tracking-[0.35em] text-text-muted">Ready?
            </p>
            <h3 className="text-[34px] font-semibold text-text-primary">Connect Gmail, auto-unsubscribe 70% of the noise, and send the rest to a small manual queue.</h3>
            <p className="text-[16px] text-text-secondary">
              The next scan can be running in under a minute. Keep calendar invites, receipts, and investor notes front-and-center while Unclutter handles the mess behind the scenes.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={handleConnect}
              disabled={loading}
              className={cn(
                'inline-flex h-[52px] items-center justify-center gap-3 rounded-xl bg-primary px-8 text-[15px] font-semibold text-white shadow-soft transition-all hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30',
                loading && 'opacity-70 cursor-not-allowed'
              )}
            >
              <Mail size={18} /> {loading ? 'Connecting…' : 'Connect Gmail & start cleanup'}
            </button>
            <a
              href="/dashboard"
              className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl border border-border px-6 text-[15px] font-semibold text-text-primary transition-colors hover:border-text-primary"
            >
              <Inbox size={18} /> View interactive demo
            </a>
          </div>
          <p className="mt-4 text-[13px] text-text-muted">No calendars or contacts touched. You decide every unsubscribe before it sends.</p>
        </section>
      </div>
    </main>
  );
}
