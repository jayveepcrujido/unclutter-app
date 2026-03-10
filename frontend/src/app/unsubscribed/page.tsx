'use client';

import React, { useState } from 'react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useScan } from '../../hooks/useScan';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import SubscriptionRow from '../../components/SubscriptionRow';
import SkeletonRow from '../../components/SkeletonRow';
import { Search, MailCheck, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export default function UnsubscribedPage() {
  const { subscriptions, loading: subsLoading, refetch } = useSubscriptions('unsubscribed');
  const { scan, loading: isScanning } = useScan(refetch);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredSubscriptions = subscriptions.filter(s => 
    s.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.sender_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          title="Unsubscribed" 
          onScan={scan} 
          isScanning={isScanning} 
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-10">
          <div className="max-w-6xl mx-auto space-y-8">
            
            <div className="flex items-center gap-2 text-text-secondary">
              <Info size={14} className="text-primary" />
              <p className="text-[14px] font-medium">{subscriptions.length} senders successfully unsubscribed.</p>
            </div>

            {/* Toolbar Row */}
            <div className="bg-white rounded-[12px] p-3 px-6 shadow-soft flex items-center justify-between h-[60px] border border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <span className="text-[14px] text-text-primary font-bold uppercase tracking-widest">History</span>
              </div>

              <div className="relative w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="text" 
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[36px] bg-[#F3F4F6] rounded-[10px] pl-9 pr-3 text-[13px] text-text-primary focus:bg-white focus:border-[#E2E8F0] border border-transparent transition-all placeholder:text-text-muted outline-none"
                />
              </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-[12px] shadow-soft overflow-hidden border border-[#E2E8F0]">
              {/* Table Header */}
              <div className="flex items-center px-8 h-[48px] bg-[#F9FAFB] text-[11px] font-bold text-text-muted uppercase tracking-widest border-b border-[#E2E8F0]">
                <div className="flex-1 px-4">Sender</div>
                <div className="w-[100px] px-2 text-center">Emails</div>
                <div className="w-[120px] px-2">Unsubscribed On</div>
                <div className="w-[100px] px-2">Method</div>
                <div className="w-[100px] px-2 text-right">Status</div>
                <div className="w-[48px]" />
              </div>

              {/* Table Body */}
              <div className="bg-white">
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
                  <div className="flex flex-col items-center justify-center py-[80px] text-center space-y-4 bg-white">
                    <MailCheck size={48} className="text-[#D1D5DB]" />
                    <div className="space-y-1">
                      <h3 className="text-[16px] font-medium text-[#374151]">Nothing unsubscribed yet</h3>
                      <p className="text-[14px] text-text-muted">Head to Current Subscriptions to get started.</p>
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
