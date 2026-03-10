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

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export default function DashboardPage() {
  const { subscriptions, loading: subsLoading, refetch } = useSubscriptions();
  const { scan, loading: isScanning } = useScan(refetch);
  
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const activeFiltered = filteredSubscriptions.filter(s => s.status !== 'unsubscribed');
  const allSelected = selectedIds.length > 0 && selectedIds.length === activeFiltered.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(activeFiltered.map(s => s.id));
    }
  };

  const handleBulkUnsubscribe = async () => {
    setIsConfirmOpen(false);
    setIsProcessing(true);
    try {
      const response = await api.bulkUnsubscribe(selectedIds);
      const successCount = response.success_count;
      const failedCount = response.failed_count;
      
      if (failedCount === 0) {
        addToast(`Successfully unsubscribed from ${successCount} senders.`, 'success');
      } else {
        addToast(`Processed ${successCount + failedCount} requests: ${successCount} successes, ${failedCount} failures. Check for "Manual" or "Failed" tags.`, 'info');
      }
      
      setSelectedIds([]);
      refetch();
    } catch (error) {
      addToast('An error occurred during bulk unsubscribe.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const manualCount = subscriptions.filter(s => s.status === 'failed' && (s.error_message?.includes('manual') || s.error_message?.includes('form'))).length;

  const selectedNames = subscriptions
    .filter(s => selectedIds.includes(s.id))
    .map(s => s.sender_name || s.sender_email);

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
          title="Current Subscriptions" 
          onScan={scan} 
          isScanning={isScanning} 
        />

        <div className={cn(
          "flex-1 overflow-y-auto custom-scrollbar p-8 md:p-10",
          isScanning && "opacity-50 pointer-events-none"
        )}>
          <div className="max-w-6xl mx-auto space-y-8">
            
            {manualCount > 0 && (
              <div className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 p-4 rounded-[12px] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                    <MailX size={20} />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-amber-900">Manual Action Required</h4>
                    <p className="text-[13px] text-amber-700">{manualCount} senders require you to fill out a form to unsubscribe. Look for the "Manual" button below.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSearchQuery('failed')}
                  className="px-4 py-2 bg-white border border-amber-200 text-amber-700 text-[13px] font-bold rounded-[8px] hover:bg-amber-100 transition-colors shrink-0"
                >
                  Show Manual
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 text-text-secondary">
              <Info size={14} className="text-primary" />
              <p className="text-[14px] font-medium">{subscriptions.length} active subscriptions found in your inbox.</p>
            </div>

            {/* Toolbar Row */}
            <div className="bg-white rounded-[12px] p-3 px-6 shadow-soft flex items-center justify-between h-[60px] border border-[#E2E8F0]">
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

              <div className="flex items-center gap-3">
                {selectedIds.length > 0 ? (
                  <button
                    onClick={() => setIsConfirmOpen(true)}
                    suppressHydrationWarning={true}
                    className="h-[36px] px-4 rounded-[8px] text-[13px] font-bold flex items-center gap-2 transition-all duration-150 shadow-sm active:scale-[0.98] bg-[#DC2626] text-white hover:bg-[#B91C1C]"
                  >
                    <MailX size={16} color="#FFFFFF" />
                    <span className="text-white">Unsubscribe</span>
                  </button>
                ) : (
                  <>
                    <div className="relative w-[220px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input 
                        type="text" 
                        placeholder="Search senders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        suppressHydrationWarning={true}
                        className="w-full h-[36px] bg-[#F3F4F6] rounded-[10px] pl-9 pr-3 text-[13px] text-text-primary focus:bg-white focus:border-[#E2E8F0] border border-transparent transition-all duration-150 placeholder:text-text-muted outline-none hover:bg-[#EBEEF2]"
                      />
                    </div>
                    <select 
                      suppressHydrationWarning={true}
                      className="h-[36px] px-3 bg-[#F3F4F6] rounded-[10px] text-[13px] text-text-primary focus:bg-white focus:border-[#E2E8F0] border border-transparent cursor-pointer transition-all duration-150 outline-none hover:bg-[#EBEEF2]"
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
            <div className="bg-white rounded-[12px] shadow-soft overflow-hidden border border-[#E2E8F0]">
              {/* Table Header */}
              <div className="flex items-center px-8 h-[48px] bg-background text-[11px] font-bold text-text-muted uppercase tracking-widest border-b border-[#E2E8F0]">
                <div className="w-[40px]" />
                <div className="flex-1 px-4">Sender</div>
                <div className="w-[100px] px-2 text-center">Emails</div>
                <div className="w-[120px] px-2">Last Received</div>
                <div className="w-[100px] px-2">Method</div>
                <div className="w-[100px] px-2 text-right">Status</div>
                <div className="w-[48px]" />
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
                  <div className="flex flex-col items-center justify-center py-[80px] text-center space-y-4 bg-white">
                    <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center mb-2">
                      <MailOpen size={32} className="text-text-muted" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[16px] font-semibold text-text-primary">No subscriptions found</h3>
                      <p className="text-[14px] text-text-muted">Click Scan Inbox to search your Gmail for newsletters.</p>
                    </div>
                    <button
                      onClick={scan}
                      suppressHydrationWarning={true}
                      className="h-[40px] px-8 rounded-[8px] text-[14px] font-bold transition-all duration-150 active:scale-[0.98] bg-[#6366F1] text-white hover:bg-[#4F46E5]"
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
