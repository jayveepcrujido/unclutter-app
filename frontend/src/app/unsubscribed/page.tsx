'use client';

import React, { useState } from 'react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useScan } from '../../hooks/useScan';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import SubscriptionRow from '../../components/SubscriptionRow';
import SkeletonRow from '../../components/SkeletonRow';
import { Search, MailCheck, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function UnsubscribedPage() {
  const { subscriptions, loading: subsLoading, refetch } = useSubscriptions('unsubscribed');
  const { scan, loading: isScanning } = useScan(refetch);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  const filteredSubscriptions = subscriptions.filter(s => 
    s.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.sender_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#EAF1F4] via-[#E4EDF4] to-[#F8FBFF] text-text-primary">
      <Sidebar 
        onCollapseChange={setIsCollapsed}
        isMobileOpen={isSidebarMobileOpen}
        onMobileOpenChange={setIsSidebarMobileOpen}
      />
      
      <main 
        className={cn(
          "flex min-h-screen flex-col transition-all duration-200 lg:h-screen",
          "lg:ml-[250px]",
          isCollapsed && "lg:ml-[64px]"
        )}
      >
        <TopBar 
          title="Unsubscribed" 
          onScan={scan} 
          isScanning={isScanning} 
          onOpenSidebar={() => setIsSidebarMobileOpen(true)}
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-10">
          <div className="max-w-5xl mx-auto space-y-8">
            
            <div className="flex items-start gap-3 rounded-lg border border-border bg-white/70 px-4 py-3 text-text-secondary shadow-soft">
              <Info size={16} className="text-primary" />
              <p className="text-[14px] font-medium">{subscriptions.length} senders successfully unsubscribed.</p>
            </div>

            {/* Toolbar Row */}
            <div className="flex flex-col gap-4 rounded-[16px] border border-border bg-white/85 p-5 px-6 shadow-soft md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[14px] text-text-primary font-bold uppercase tracking-[0.35em]">History</span>
              </div>

              <div className="relative w-full md:w-[260px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="text" 
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  suppressHydrationWarning={true}
                  className="w-full h-10 rounded-lg border border-border bg-transparent pl-11 pr-4 text-[14px] text-text-primary transition-all placeholder:text-text-muted focus:bg-white"
                />
              </div>
            </div>

            {/* History Table */}
            <div className="overflow-hidden rounded-[18px] border border-border bg-white/90 shadow-soft">
              {/* Table Header */}
              <div className="hidden h-[48px] items-center border-b border-border bg-background px-8 text-[11px] font-bold uppercase tracking-[0.35em] text-text-muted md:flex">
                <div className="w-[40px]" />
                <div className="flex-1 px-4">Sender</div>
                <div className="w-[100px] px-2 text-center">Emails</div>
                <div className="w-[120px] px-2">Unsubscribed On</div>
                <div className="w-[100px] px-2">Method</div>
                <div className="w-[100px] px-2 text-right">Status</div>
                <div className="w-[48px]" />
              </div>
              <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-text-muted md:hidden">
                <span>History</span>
                <span>{filteredSubscriptions.length}</span>
              </div>

              {/* Table Body */}
              <div className="bg-white/90">
                {subsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filteredSubscriptions.length > 0 ? (
                  filteredSubscriptions.map((sub) => (
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
                      <MailCheck size={40} className="text-primary" />
                    </div>
                    <h3 className="text-[18px] font-semibold text-text-primary">Nothing unsubscribed yet</h3>
                    <p className="mt-1 text-[14px] text-text-secondary">Head to Current Subscriptions to get started.</p>
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
