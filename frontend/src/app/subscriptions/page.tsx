'use client';

import React, { useState } from 'react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useScan } from '../../hooks/useScan';
import { api } from '../../lib/api';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import SubscriptionRow from '../../components/SubscriptionRow';
import SkeletonRow from '../../components/SkeletonRow';
import ConfirmModal from '../../components/ConfirmModal';
import ScanProgress from '../../components/ScanProgress';
import { ToastContainer, ToastType } from '../../components/Toast';
import { Search, MailX, CheckSquare, Square, Info, MailOpen } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SubscriptionsPage() {
  const { subscriptions, loading: subsLoading, refetch } = useSubscriptions();
  const { scan, loading: isScanning } = useScan(refetch);
  
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: number, message: string, type: ToastType }[]>([]);

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredSubscriptions = subscriptions.filter(s => 
    s.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.sender_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectableSubscriptions = filteredSubscriptions.filter(s => !['unsubscribed', 'manual_required'].includes(s.status));
  const allSelected = selectedIds.length > 0 && selectedIds.length === selectableSubscriptions.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(selectableSubscriptions.map(s => s.id));
    }
  };

  const handleBulkUnsubscribe = async () => {
    setIsConfirmOpen(false);
    try {
      const response = await api.bulkUnsubscribe(selectedIds);
      const successCount = response.success_count;
      const failedCount = response.failed_count;
      const manualStepCount = response.manual_count || 0;
      
      if (failedCount === 0 && manualStepCount === 0) {
        addToast(`Successfully unsubscribed from ${successCount} senders.`, 'success');
      } else {
        const total = successCount + failedCount + manualStepCount;
        const parts = [
          successCount ? `${successCount} automated` : null,
          manualStepCount ? `${manualStepCount} manual` : null,
          failedCount ? `${failedCount} failed` : null,
        ].filter((part): part is string => Boolean(part)).join(', ');
        const manualNote = manualStepCount ? ' Check the Manual badge to finish those senders.' : '';
        addToast(`Processed ${total} requests: ${parts}.${manualNote}`, failedCount ? 'error' : 'info');
      }
      
      setSelectedIds([]);
      refetch();
    } catch {
      addToast('An error occurred during bulk unsubscribe.', 'error');
    }
  };

  const manualCount = subscriptions.filter(s => s.status === 'manual_required').length;

  const selectedNames = subscriptions
    .filter(s => selectedIds.includes(s.id))
    .map(s => s.sender_name || s.sender_email);

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
          title="Current Subscriptions" 
          onScan={scan} 
          isScanning={isScanning} 
          onOpenSidebar={() => setIsSidebarMobileOpen(true)}
        />

        <div className={cn(
          "flex-1 overflow-y-auto custom-scrollbar p-8 md:p-10",
          isScanning && "opacity-50 pointer-events-none"
        )}>
          <div className="max-w-6xl mx-auto space-y-8">

            {manualCount > 0 && (
              <div className="flex flex-col gap-4 rounded-[12px] border border-amber-200/70 bg-amber-50/70 p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 items-start gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                    <MailX size={20} />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-amber-900">Manual Action Required</h4>
                    <p className="text-[13px] text-amber-800">{manualCount} senders still need you to complete a form. Search for the Manual badge below.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSearchQuery('manual')}
                  className="px-4 py-2 bg-white border border-amber-200 text-amber-700 text-[13px] font-semibold rounded-[12px] hover:bg-amber-100 transition-colors shrink-0"
                >
                  Show Manual
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-border bg-white/70 px-4 py-3 text-text-secondary shadow-soft">
              <Info size={16} className="text-primary" />
              <p className="text-[14px] font-medium">{subscriptions.length} subscriptions indexed • {selectedIds.length} selected</p>
            </div>

            {/* Toolbar Row */}
            <div className="flex flex-col gap-4 rounded-[16px] border border-border bg-white/85 p-4 px-6 shadow-soft md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleSelectAll} 
                  suppressHydrationWarning={true}
                  className="flex items-center gap-2 text-[14px] font-semibold text-text-primary hover:text-primary transition-all duration-150"
                >
                  {allSelected ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
                  <span>Select All</span>
                </button>
                {selectedIds.length > 0 && (
                  <span className="text-[14px] text-text-muted font-medium ml-2">
                    {selectedIds.length} selected
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                {selectedIds.length > 0 ? (
                <button
                  onClick={() => setIsConfirmOpen(true)}
                  suppressHydrationWarning={true}
                  className="h-11 rounded-xl px-6 text-[14px] font-bold flex items-center gap-2 transition-all duration-200 shadow-[0_10px_25px_rgba(4,54,51,0.25)] border border-white/20 active:scale-[0.98] bg-gradient-to-r from-[#0B766D] via-[#08554E] to-[#043633] text-white hover:shadow-[0_12px_30px_rgba(4,54,51,0.35)]"
                >
                    <MailX size={16} color="#FFFFFF" />
                    <span className="text-white">Unsubscribe</span>
                  </button>
                ) : (
                  <>
                    <div className="relative w-full md:w-[220px]">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input 
                        type="text" 
                        placeholder="Search senders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        suppressHydrationWarning={true}
                        className="w-full h-10 rounded-lg border border-border bg-transparent pl-11 pr-4 text-[14px] text-text-primary transition-all placeholder:text-text-muted focus:bg-white"
                      />
                    </div>
                    <select 
                      suppressHydrationWarning={true}
                      className="h-10 rounded-lg border border-border bg-white/70 px-4 text-[13px] text-text-primary cursor-pointer transition-all duration-150 focus:bg-white"
                    >
                      <option>All</option>
                      <option>Active</option>
                      <option>Failed</option>
                    </select>
                  </>
                )}
              </div>
            </div>

            {/* Subscription Table */}
            <div className="bg-white/90 rounded-[18px] shadow-soft overflow-hidden border border-border">
              {/* Table Header */}
              <div className="hidden h-[48px] items-center border-b border-border bg-background px-8 text-[11px] font-bold uppercase tracking-widest text-text-muted md:flex">
                <div className="w-[40px]" />
                <div className="flex-1 px-4">Sender</div>
                <div className="w-[100px] px-2 text-center">Emails</div>
                <div className="w-[120px] px-2">Last Received</div>
                <div className="w-[100px] px-2">Method</div>
                <div className="w-[100px] px-2 text-right">Status</div>
                <div className="w-[48px]" />
              </div>
              <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-text-muted md:hidden">
                <span>All senders</span>
                <span>{filteredSubscriptions.length}</span>
              </div>

              {/* Table Body */}
              <div className="bg-white">
                {subsLoading ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filteredSubscriptions.length > 0 ? (
                  filteredSubscriptions.map((sub) => (
                    <SubscriptionRow 
                      key={sub.id}
                      subscription={sub}
                      isSelected={selectedIds.includes(sub.id)}
                      onToggle={() => toggleSelect(sub.id)}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center bg-white/90 py-[80px] text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                      <MailOpen size={36} className="text-primary" />
                    </div>
                    <h3 className="text-[18px] font-semibold text-text-primary">No subscriptions found</h3>
                    <p className="mt-1 text-[14px] text-text-secondary">Click Scan Inbox to search your Gmail for newsletters.</p>
                    <button
                      onClick={scan}
                      suppressHydrationWarning={true}
                      className="mt-6 h-11 rounded-xl px-8 text-[14px] font-bold transition-all duration-200 active:scale-[0.98] bg-gradient-to-r from-[#0B766D] via-[#08554E] to-[#043633] text-white shadow-[0_10px_25px_rgba(4,54,51,0.25)] border border-white/20 hover:shadow-[0_12px_30px_rgba(4,54,51,0.35)]"
                    >
                      Scan Inbox
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ScanProgress isScanning={isScanning} />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleBulkUnsubscribe}
        count={selectedIds.length}
        senderNames={selectedNames}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
