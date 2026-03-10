'use client';

import React from 'react';
import { X, MailX } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  senderNames: string[];
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, count, senderNames }: Props) {
  if (!isOpen) return null;

  const displayNames = senderNames.slice(0, 5);
  const remainingCount = count - displayNames.length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/35 backdrop-blur-[4px] animate-in fade-in duration-200">
      <div className="bg-white border border-[#E2E8F0] w-full max-w-[440px] rounded-[12px] shadow-modal animate-in zoom-in-95 duration-200 p-[28px]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[18px] font-semibold text-text-primary">Unsubscribe from {count} senders?</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <p className="text-[14px] text-text-secondary mb-6">
          This will send unsubscribe requests to the following senders. This action cannot be undone.
        </p>

        <div className="space-y-3 mb-8">
          <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar border-y border-[#E2E8F0] py-2">
            {displayNames.map((name, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-[#F3F4F6] last:border-0">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                  {(name || '?')[0].toUpperCase()}
                </div>
                <span className="text-[14px] text-text-primary truncate font-medium">{name || 'Unknown Sender'}</span>
              </div>
            ))}
            {remainingCount > 0 && (
              <div className="text-[13px] text-text-muted pt-2 text-center font-medium">
                + {remainingCount} more senders
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="h-[38px] px-4 rounded-btn border border-[#E2E8F0] text-[14px] font-medium text-[#374151] hover:bg-surface-hover transition-all duration-200"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="h-[38px] px-6 rounded-btn bg-[#DC2626] text-white text-[14px] font-semibold hover:bg-[#B91C1C] transition-all duration-200 shadow-sm"
            style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
          >
            Yes, Unsubscribe
          </button>
        </div>
      </div>
    </div>
  );
}
