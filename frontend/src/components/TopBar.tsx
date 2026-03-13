'use client';

import React from 'react';
import { Menu, RefreshCw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TopBarProps {
  title: string;
  onScan: () => void;
  isScanning: boolean;
  onOpenSidebar?: () => void;
}

export default function TopBar({ title, onScan, isScanning, onOpenSidebar }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-border bg-white/90 px-4 py-4 shadow-soft backdrop-blur sm:px-6">
      <div className="flex flex-1 items-center gap-3">
        {onOpenSidebar && (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-text-primary transition-colors duration-150 hover:text-primary lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
        )}
        <h1 className="text-[18px] font-semibold text-text-primary tracking-tight sm:text-[20px]">{title}</h1>
      </div>

      <button
        onClick={onScan}
        disabled={isScanning}
        suppressHydrationWarning={true}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-xl px-6 text-[14px] font-bold transition-all duration-200 shadow-[0_10px_25px_rgba(4,54,51,0.25)] border border-white/20 active:scale-[0.98]",
          isScanning 
            ? "bg-surface-hover text-text-muted cursor-not-allowed opacity-70" 
            : "bg-gradient-to-r from-[#0B766D] via-[#08554E] to-[#043633] text-white hover:shadow-[0_12px_30px_rgba(4,54,51,0.35)]"
        )}
      >
        <RefreshCw size={18} className={cn(isScanning && "animate-spin")} />
        <span>
          {isScanning ? 'Scanning…' : 'Scan Inbox'}
        </span>
      </button>
    </header>
  );
}
