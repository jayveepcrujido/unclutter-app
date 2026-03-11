'use client';

import React, { useState } from 'react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useScan } from '../../hooks/useScan';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import SubscriptionRow from '../../components/SubscriptionRow';
import SkeletonRow from '../../components/SkeletonRow';
import { RefreshCw, Clock, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function PendingPage() {
  const { subscriptions, loading: subsLoading, refetch } = useSubscriptions('pending_confirmation');
  const { scan, loading: isScanning } = useScan(refetch);
  
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#EAF1F4] via-[#E4EDF4] to-[#F8FBFF] text-text-primary overflow-hidden">
      <Sidebar onCollapseChange={setIsCollapsed} />
      
      <main 
        className={cn(
          "flex-1 flex flex-col h-screen transition-all duration-200",
          isCollapsed ? "ml-[64px]" : "ml-[250px]"
        )}
      >
        <TopBar 
          title="Pending Confirmation" 
          onScan={scan} 
          isScanning={isScanning} 
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-10">
            <div className="max-w-5xl mx-auto space-y-8">

            <div className="flex items-start gap-4 rounded-[16px] border border-primary/20 bg-primary/5 p-5 shadow-soft">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Info size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-[15px] font-semibold text-text-primary">These senders are waiting on confirmation.</p>
                <p className="text-[14px] text-text-secondary">
                  We&apos;re monitoring your inbox for the follow-up email. Once it arrives, we finish the unsubscribe automatically.
                </p>
              </div>
            </div>

            {/* Status Row */}
            <div className="flex flex-col gap-3 rounded-[16px] border border-border bg-white/85 p-5 px-6 shadow-soft md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[14px] text-text-primary font-bold uppercase tracking-[0.35em]">Awaiting Confirmation</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted text-[13px]">
                <Clock size={14} />
                <span>Last checked: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Pending Table */}
            <div className="overflow-hidden rounded-[18px] border border-border bg-white/90 shadow-soft">
              {/* Table Header */}
              <div className="flex h-[48px] items-center px-8 text-[11px] font-bold uppercase tracking-[0.35em] text-text-muted border-b border-border bg-background">
                <div className="flex-1 px-4">Sender</div>
                <div className="w-[100px] px-2 text-center">Emails</div>
                <div className="w-[120px] px-2">Attempted At</div>
                <div className="w-[100px] px-2">Method</div>
                <div className="w-[100px] px-2 text-right">Status</div>
                <div className="w-[48px]" />
              </div>

              {/* Table Body */}
              <div className="bg-white/90">
                {subsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                ) : subscriptions.length > 0 ? (
                  subscriptions.map((sub) => (
                    <SubscriptionRow 
                      key={sub.id}
                      subscription={sub}
                      isSelected={false}
                      onToggle={() => {}}
                      isReadOnly={true}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center bg-white/90 py-[80px] text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                      <RefreshCw size={32} className="text-primary" />
                    </div>
                    <h3 className="text-[18px] font-semibold text-text-primary">No pending confirmations</h3>
                    <p className="mt-1 text-[14px] text-text-secondary">All unsubscribe requests are either active or completed.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
