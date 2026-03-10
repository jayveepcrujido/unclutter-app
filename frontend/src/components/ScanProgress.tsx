'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function ScanProgress({ isScanning }: { isScanning: boolean }) {
  if (!isScanning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[480px] rounded-panel shadow-card p-12 text-center animate-in zoom-in-95 duration-200 relative overflow-hidden">
        {/* Animated Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10">
          <div className="h-full bg-primary shimmer w-full rounded-badge" />
        </div>

        <div className="flex flex-col items-center gap-6">
          <RefreshCw size={32} className="text-primary animate-spin" />
          <div className="space-y-2">
            <h3 className="text-[18px] font-semibold text-text-primary">Scanning your inbox</h3>
            <p className="text-[14px] text-text-secondary max-w-sm mx-auto">
              This usually takes 15–30 seconds. We&apos;re going through your emails to find active subscriptions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
