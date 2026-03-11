'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';
import { Mail, ScanLine, LayoutList, Trash2, Lock, Inbox, ShieldCheck, Sparkles, BarChart3, CheckCircle2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

  const features = [
    { icon: ScanLine, label: 'Inbox radar', desc: 'Real-time audit that surfaces every recurring sender and classifies it for you.' },
    { icon: LayoutList, label: 'Living dashboard', desc: 'Track spend, cadence, and deliverability across all newsletters without Excel.' },
    { icon: Trash2, label: 'Precision unsubscribes', desc: 'Batch remove noisy senders or trigger manual workflows inside one control room.' },
  ];

  const workflow = [
    { title: 'Connect Gmail securely', desc: 'OAuth 2.0 connection with read-only scope keeps sensitive mail locked down.', badge: 'No passwords needed' },
    { title: 'We map every sender', desc: 'Signal-based scan groups retailers, SaaS receipts, and marketing streams automatically.', badge: 'AI classification' },
    { title: 'Approve the cleanup', desc: 'Review, pause, or bulk unsubscribe with full context before anything is sent.', badge: 'Human-in-the-loop' },
  ];

  const metrics = [
    { value: '2.1k', label: 'senders flagged / scan' },
    { value: '38s', label: 'average scan time' },
    { value: '92%', label: 'success rate on first pass' },
  ];

  const sampleSenders = [
    { name: 'Field Notes Weekly', email: 'updates@fieldnotes.io', emails: 28, status: 'Auto' },
    { name: 'Orbit Rewards', email: 'news@orbitrewards.com', emails: 12, status: 'Manual' },
    { name: 'Nord Commerce', email: 'hello@nordcommerce.com', emails: 43, status: 'Auto' },
    { name: 'Atlas Fitness', email: 'studio@atlas.fit', emails: 8, status: 'Link' },
  ];

  return (
    <main className="min-h-screen px-6 py-16 md:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="glass-panel rounded-[20px] p-8 md:p-10 relative overflow-hidden">
            <div className="absolute inset-y-0 right-0 w-1/3 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 20%, rgba(13,148,136,0.25), transparent 55%)' }} />
            <div className="relative z-10 space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/80 px-4 py-2 text-[13px] font-semibold text-primary shadow-soft">
                <Sparkles size={16} /> Inbox Intelligence Platform
              </div>
              <div className="space-y-5">
                <div className="flex items-center gap-3 text-primary">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Inbox size={24} />
                  </div>
                  <span className="font-semibold uppercase tracking-[0.2em] text-[12px] text-primary">Unclutter</span>
                </div>
                <h1 className="text-[40px] leading-tight md:text-[52px]">
                  Untangle every newsletter and reclaim your inbox in minutes.
                </h1>
                <p className="text-[16px] text-text-secondary md:text-[18px]">
                  We scan Gmail securely, map recurring senders, and hand you a control center to silence noisy marketing without silencing what matters.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className={cn(
                    "inline-flex h-[54px] w-full items-center justify-center gap-3 rounded-xl border border-white/30 bg-gradient-to-r from-[#0B766D] via-[#08554E] to-[#043633] px-8 text-[16px] font-semibold text-white shadow-[0_15px_45px_rgba(4,54,51,0.55)] transition-all duration-200 hover:shadow-[0_18px_55px_rgba(4,54,51,0.65)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 sm:w-auto",
                    loading && "opacity-70 cursor-not-allowed"
                  )}
                >
                  <Mail size={20} className="text-white" />
                  {loading ? 'Connecting…' : 'Connect Google'}
                </button>
                <div className="flex items-center gap-2 text-[13px] text-text-muted">
                  <Lock size={14} />
                  Read-only OAuth access
                </div>
              </div>

              <div className="grid gap-4 rounded-xl border border-white/40 bg-white/80 p-5 backdrop-blur">
                <div className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                  <ShieldCheck size={16} className="text-primary" /> Verified workflow
                </div>
                <div className="grid gap-5 md:grid-cols-3">
                  {metrics.map((metric) => (
                    <div key={metric.label} className="space-y-1">
                      <p className="text-[32px] font-semibold text-text-primary">{metric.value}</p>
                      <p className="text-[13px] uppercase tracking-widest text-text-muted">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-[18px] border border-white/40 bg-gradient-to-br from-[#0E947F] via-[#0B7269] to-[#073b36] p-8 text-white shadow-card">
              <div className="flex items-center justify-between text-white/80">
                <p className="text-[14px] uppercase tracking-[0.35em]">Live preview</p>
                <BarChart3 size={20} />
              </div>
              <p className="mt-4 text-[28px] font-semibold leading-snug">Know exactly who is filling your inbox.</p>
              <div className="mt-6 space-y-4">
                {sampleSenders.map((sender) => (
                  <div key={sender.email} className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm">
                    <div>
                      <p className="font-semibold">{sender.name}</p>
                      <p className="text-white/70">{sender.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] uppercase tracking-widest text-white/70">{sender.emails} emails/mo</p>
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold",
                        sender.status === 'Auto' ? 'bg-white/20' : sender.status === 'Manual' ? 'bg-amber-400/20 text-amber-100' : 'bg-white/15'
                      )}>
                        <CheckCircle2 size={14} /> {sender.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[16px] border border-border bg-surface shadow-soft p-6">
              <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-text-muted">How it works</p>
              <div className="mt-4 space-y-5">
                {workflow.map((step, index) => (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-[14px] font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-[16px] font-semibold text-text-primary">{step.title}</h3>
                        <span className="text-[12px] font-semibold uppercase tracking-widest text-primary/80">{step.badge}</span>
                      </div>
                      <p className="text-[14px] text-text-secondary">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="grid gap-6 rounded-[16px] border border-border bg-surface/90 p-8 shadow-soft md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.label} className="flex flex-col gap-4 rounded-xl border border-dashed border-border/70 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-[18px] font-semibold text-text-primary">{feature.label}</h3>
                <p className="text-[14px] text-text-secondary">{feature.desc}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
