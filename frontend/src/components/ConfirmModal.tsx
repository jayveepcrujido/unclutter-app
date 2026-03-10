'use client';

import React from 'react';
import { X } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-[500px] rounded-[18px] border border-border p-8 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[20px] font-semibold text-text-primary">Unsubscribe from {count} senders?</h2>
          <button onClick={onClose} className="rounded-full p-1 text-text-muted hover:text-text-primary transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <p className="text-[15px] text-text-secondary mb-6">
          This will send unsubscribe requests to the following senders. This action cannot be undone.
        </p>

        <div className="space-y-3 mb-8">
          <div className="max-h-[240px] overflow-y-auto pr-2 custom-scrollbar border-y border-border py-2">
            {displayNames.map((name, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-surface-hover last:border-0">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-[12px]">
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
            className="h-[44px] px-5 rounded-lg border border-border text-[14px] font-semibold text-text-primary hover:bg-surface-hover transition-all duration-200"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="h-[44px] px-6 rounded-xl bg-gradient-to-r from-[#0B766D] via-[#08554E] to-[#043633] text-white text-[14px] font-bold hover:shadow-[0_12px_30px_rgba(4,54,51,0.35)] transition-all duration-200 shadow-[0_10px_25px_rgba(4,54,51,0.25)] border border-white/20 active:scale-[0.98]"
          >
            Yes, Unsubscribe
          </button>
        </div>
      </div>
    </div>
  );
}
