'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useScan } from '../../hooks/useScan';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import ScanProgress from '../../components/ScanProgress';
import { Info, Sparkles, Activity, Zap, Target, TrendingDown, BarChart3, ArrowRight, Clock, MailOpen, MailX } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AnalyticsDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const { subscriptions, loading } = useSubscriptions();
  const { scan, loading: isScanning } = useScan();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  const [manualCount, unsubscribedCount, activeCount, averageEmails] = useMemo(() => {
    const manual = subscriptions.filter(s => s.status === 'manual_required').length;
    const unsubscribed = subscriptions.filter(s => s.status === 'unsubscribed').length;
    const active = subscriptions.filter(s => s.status !== 'unsubscribed').length;
    const avgEmails = subscriptions.length
      ? Math.round(subscriptions.reduce((total, entry) => total + (entry.email_count || 0), 0) / subscriptions.length)
      : 0;
    return [manual, unsubscribed, active, avgEmails];
  }, [subscriptions]);

  const successRate = subscriptions.length
    ? Math.round((unsubscribedCount / subscriptions.length) * 100)
    : 0;

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const focusStats = [
    { label: 'Active senders', value: activeCount, sub: `${subscriptions.length} total indexed`, icon: Activity },
    { label: 'Senders silenced', value: unsubscribedCount, sub: 'Auto or mailto actions', icon: MailX },
    { label: 'Manual actions', value: manualCount, sub: 'Need human input', icon: Target },
    { label: 'Avg emails / sender', value: isNaN(averageEmails) ? 0 : averageEmails, sub: 'Rolling 30 days', icon: MailOpen },
  ];

  const efficiencyInsights = [
    { label: 'Inbox noise reduced', value: `${successRate}%`, caption: `${unsubscribedCount} senders silenced`, trend: '+4% vs last scan', icon: TrendingDown },
    { label: 'Automation coverage', value: `${Math.max(0, 100 - manualCount * 3)}%`, caption: 'One-click unsubscribes', trend: 'Most senders auto', icon: Zap },
    { label: 'Manual queue', value: manualCount, caption: 'Forms waiting', trend: manualCount > 0 ? 'Resolve soon' : 'All clear', icon: Target },
  ];

  const clutterLeaders = useMemo(() => {
    return subscriptions
      .filter(s => s.status !== 'unsubscribed')
      .sort((a, b) => (b.email_count || 0) - (a.email_count || 0))
      .slice(0, 5);
  }, [subscriptions]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#EAF1F4] via-[#E4EDF4] to-[#F8FBFF] text-text-primary">
      <Sidebar 
        onCollapseChange={setIsCollapsed}
        isMobileOpen={isSidebarMobileOpen}
        onMobileOpenChange={setIsSidebarMobileOpen}
      />

      <main 
        className={cn(
          'flex min-h-screen flex-col transition-all duration-200 lg:h-screen',
          'lg:ml-[250px]',
          isCollapsed && 'lg:ml-[64px]'
        )}
      >
        <TopBar 
          title="Intelligence Dashboard" 
          onScan={scan} 
          isScanning={isScanning} 
          onOpenSidebar={() => setIsSidebarMobileOpen(true)}
        />

        <div className={cn('flex-1 overflow-y-auto custom-scrollbar p-8 md:p-10', isScanning && 'opacity-50 pointer-events-none')}>
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
            <section className="relative overflow-hidden rounded-[22px] border border-border bg-white/90 p-10 shadow-soft">
              <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 80% 0%, rgba(13,148,136,0.2), transparent 50%)' }} />
              <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-4 py-2 text-[13px] font-semibold text-primary">
                    <Sparkles size={16} /> Inbox posture
                  </div>
                  <div className="space-y-4">
                    <h1 className="text-[40px] font-semibold leading-tight text-text-primary">{activeCount} active senders are still talking to you.</h1>
                    <p className="text-[16px] text-text-secondary md:text-[18px]">
                      Track how much noise automation removed and where human attention is required.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/subscriptions"
                      className="inline-flex h-[46px] items-center gap-2 rounded-lg bg-primary px-6 text-[14px] font-semibold text-white shadow-soft transition-colors hover:bg-primary-hover"
                    >
                      Go to subscriptions
                      <ArrowRight size={16} />
                    </Link>
                    <div className="flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-[13px] text-text-muted">
                      <Clock size={16} className="text-primary" /> Last scan processed {subscriptions.length} senders
                    </div>
                  </div>
                </div>
                <div className="grid w-full gap-4 rounded-[18px] border border-border bg-surface/95 p-6 shadow-soft lg:w-[360px]">
                  <div className="flex items-center justify-between text-[12px] uppercase tracking-[0.35em] text-text-muted">
                    <span>Success rate</span>
                    <BarChart3 size={18} className="text-primary" />
                  </div>
                  <p className="text-[48px] font-semibold text-text-primary">{successRate}%</p>
                  <p className="text-[14px] text-text-secondary">{unsubscribedCount} senders muted since last scan.</p>
                  <div className="rounded-xl border border-dashed border-border/80 bg-surface-hover px-4 py-3 text-[13px] text-text-secondary">
                    {manualCount > 0 ? `${manualCount} manual ${manualCount === 1 ? 'task remains' : 'tasks remain'}` : 'No manual unsubscribe steps pending.'}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {focusStats.map((stat) => {
                const IconComp = stat.icon;
                return (
                  <div key={stat.label} className="rounded-[18px] border border-border bg-white/90 p-5 shadow-soft">
                    <div className="flex items-center justify-between text-[13px] text-text-muted">
                      <span className="uppercase tracking-[0.35em]">{stat.label}</span>
                      <IconComp size={18} className="text-primary" />
                    </div>
                    <p className="mt-4 text-[36px] font-semibold text-text-primary">{loading ? '—' : stat.value}</p>
                    <p className="text-[14px] text-text-secondary">{stat.sub}</p>
                  </div>
                );
              })}
            </section>

            <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[20px] border border-border bg-white/90 p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] uppercase tracking-[0.35em] text-text-muted">Top senders to clean</p>
                    <h3 className="mt-2 text-[20px] font-semibold text-text-primary">Most frequent newsletters still active</h3>
                  </div>
                  <Link href="/subscriptions" className="text-[13px] font-semibold text-primary hover:underline">Manage</Link>
                </div>
                <div className="mt-6 space-y-3">
                  {clutterLeaders.length > 0 ? (
                    clutterLeaders.map((sender) => (
                      <div key={sender.id} className="flex items-center justify-between rounded-lg border border-border/70 bg-surface px-4 py-3">
                        <div>
                          <p className="text-[15px] font-semibold text-text-primary">{sender.sender_name || 'Unknown Sender'}</p>
                          <p className="text-[13px] text-text-secondary">{sender.sender_email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] uppercase tracking-[0.25em] text-text-muted">{sender.email_count || 0} emails</p>
                          <span className="text-[12px] font-semibold text-primary">{sender.unsubscribe_method === 'list-unsubscribe-post' ? 'One-click' : sender.unsubscribe_method === 'list-unsubscribe' ? 'Auto' : 'Manual'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-[14px] text-text-secondary">
                      Nothing to highlight yet. Scan your inbox to populate this view.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[20px] border border-border bg-white/90 p-6 shadow-soft">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Info size={16} className="text-primary" />
                  <p className="text-[13px] font-semibold uppercase tracking-[0.35em]">Efficiency snapshot</p>
                </div>
                <div className="mt-4 space-y-4">
                  {efficiencyInsights.map((insight) => {
                    const IconComp = insight.icon;
                    return (
                      <div key={insight.label} className="rounded-lg border border-border/70 bg-surface px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[14px] font-semibold text-text-primary">{insight.label}</p>
                            <p className="text-[13px] text-text-secondary">{insight.caption}</p>
                          </div>
                          <IconComp size={20} className="text-primary" />
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-[32px] font-semibold text-text-primary">{insight.value}</p>
                          <span className="text-[13px] font-medium text-primary/80">{insight.trend}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="rounded-[20px] border border-border bg-white/90 p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] uppercase tracking-[0.35em] text-text-muted">Next recommended steps</p>
                  <h3 className="mt-2 text-[20px] font-semibold text-text-primary">Keep automation ahead of new senders</h3>
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {[
                  { title: 'Resolve manual unsubscribes', desc: manualCount > 0 ? `${manualCount} senders require manual attention` : 'No manual actions pending', action: 'Open queue', href: '/subscriptions?filter=manual' },
                  { title: 'Run another scan', desc: 'Catch new senders before they pile up', action: 'Scan inbox', href: '/subscriptions' },
                  { title: 'Audit successes', desc: `${unsubscribedCount} senders stopped this week`, action: 'View log', href: '/unsubscribed' },
                ].map((card) => (
                  <Link key={card.title} href={card.href} className="rounded-lg border border-border/70 bg-surface px-5 py-4 transition-all hover:-translate-y-1">
                    <p className="text-[15px] font-semibold text-text-primary">{card.title}</p>
                    <p className="mt-1 text-[13px] text-text-secondary">{card.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-primary">
                      {card.action}
                      <ArrowRight size={14} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <ScanProgress isScanning={isScanning} />
    </div>
  );
}
