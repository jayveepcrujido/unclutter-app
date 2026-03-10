'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';
import { Mail, ScanLine, LayoutList, Trash2, Lock, Inbox } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
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
    { icon: ScanLine, label: 'Instant Detection', desc: 'Finds every newsletter in your inbox automatically' },
    { icon: LayoutList, label: 'One Dashboard', desc: 'See every subscription at a glance' },
    { icon: Trash2, label: 'Bulk Removal', desc: 'Unsubscribe from dozens of senders in one click' },
  ];

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-white border border-border w-full max-w-[480px] rounded-[16px] shadow-soft p-[56px] px-[48px] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex flex-col items-center">
          <div className="w-[40px] h-[40px] bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Inbox size={24} />
          </div>
          <p className="text-[14px] font-semibold text-primary uppercase tracking-[0.05em] mt-3">Unclutter</p>
          <h1 className="text-[30px] font-bold text-text-primary mt-[20px] text-center leading-[1.1]">
            Your inbox, finally <br /> under control.
          </h1>
          <p className="text-[15px] text-text-secondary text-center mt-[8px]">
            Scan your Gmail, see every subscription, and clean it all up in one click.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-[28px]">
          <button
            onClick={handleConnect}
            disabled={loading}
            className={cn(
              "w-full h-[46px] rounded-[8px] flex items-center justify-center gap-2 transition-all duration-150 shadow-sm active:scale-[0.98] bg-[#6366F1] text-white hover:bg-[#4F46E5]",
              loading && "opacity-70 cursor-not-allowed"
            )}
          >
            <Mail size={18} color="#FFFFFF" />
            <span className="text-white">{loading ? 'Connecting...' : 'Connect Gmail Account'}</span>
          </button>
          
          <div className="flex items-center justify-center gap-2 text-[13px] text-text-muted mt-4">
            <Lock size={13} />
            <span>Read-only access. We never send emails on your behalf.</span>
          </div>
        </div>

        {/* Features Divider */}
        <div className="mt-[36px] flex flex-col gap-6 pt-8 border-t border-[#E2E8F0]">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-widest text-center">Why Unclutter?</p>
          <div className="space-y-6">
            {features.map((f, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-[36px] h-[36px] rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-text-primary">{f.label}</h3>
                  <p className="text-[13px] text-text-secondary mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
