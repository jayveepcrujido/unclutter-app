'use client';

import React, { useState } from 'react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useScan } from '../../hooks/useScan';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import SubscriptionRow from '../../components/SubscriptionRow';
import SkeletonRow from '../../components/SkeletonRow';
import { RefreshCw, Clock, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export default function PendingPage() {
  const { subscriptions, loading: subsLoading, refetch } = useSubscriptions('pending_confirmation');
  const { scan, loading: isScanning } = useScan(refetch);
  
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen text-text-primary overflow-hidden">
      <Sidebar onCollapseChange={setIsCollapsed} />
      
      <main 
        className={cn(
          "flex-1 flex flex-col h-screen transition-all duration-200",
          isCollapsed ? "ml-[64px]" : "ml-[240px]"
        )}
      >
        <TopBar 
          title="Pending Confirmation" 
          onScan={scan} 
          isScanning={isScanning} 
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-10">
          <div className="max-w-6xl mx-auto space-y-8">
            
            <div className="flex items-center gap-2 text-text-secondary bg-indigo-50 border border-indigo-100 p-4 rounded-[12px]">
              <Info size={18} className="text-primary shrink-0" />
              <p className="text-[14px] font-medium text-indigo-900">
                These senders often require a second step. Unclutter is watching your inbox for confirmation emails to automatically finalize the unsubscription.
              </p>
            </div>

            {/* Status Row */}
            <div className="bg-white rounded-[12px] p-3 px-6 shadow-soft flex items-center justify-between h-[60px] border border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <span className="text-[14px] text-text-primary font-bold uppercase tracking-widest">Awaiting Confirmation</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted text-[13px]">
                <Clock size={14} />
                <span>Last checked: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Pending Table */}
            <div className="bg-white rounded-[12px] shadow-soft overflow-hidden border border-[#E2E8F0]">
              {/* Table Header */}
              <div className="flex items-center px-8 h-[48px] bg-[#F9FAFB] text-[11px] font-bold text-text-muted uppercase tracking-widest border-b border-[#E2E8F0]">
                <div className="flex-1 px-4">Sender</div>
                <div className="w-[100px] px-2 text-center">Emails</div>
                <div className="w-[120px] px-2">Attempted At</div>
                <div className="w-[100px] px-2">Method</div>
                <div className="w-[100px] px-2 text-right">Status</div>
                <div className="w-[48px]" />
              </div>

              {/* Table Body */}
              <div className="bg-white">
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
                  <div className="flex flex-col items-center justify-center py-[80px] text-center space-y-4 bg-white">
                    <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mb-2">
                      <RefreshCw size={32} className="text-text-muted" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[16px] font-medium text-[#374151]">No pending confirmations</h3>
                      <p className="text-[14px] text-text-muted">All your unsubscribe requests are either active or completed.</p>
                    </div>
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
