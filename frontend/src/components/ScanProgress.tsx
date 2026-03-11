'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function ScanProgress({ isScanning }: { isScanning: boolean }) {
  if (!isScanning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-md">
      <div className="glass-panel relative w-full max-w-[520px] overflow-hidden rounded-[20px] p-12 text-center animate-in zoom-in-95 duration-200">
        {/* Animated Progress Bar */}
        <div className="absolute top-0 left-0 h-1 w-full bg-primary/10">
          <div className="h-full w-full rounded-badge bg-primary shimmer" />
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <RefreshCw size={32} className="text-primary animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-[22px] font-semibold text-text-primary">Scanning your inbox</h3>
            <p className="mx-auto max-w-sm text-[15px] text-text-secondary">
              This usually takes 15–30 seconds. We&apos;re going through your emails to find active subscriptions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
