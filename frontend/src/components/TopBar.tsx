'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TopBarProps {
  title: string;
  onScan: () => void;
  isScanning: boolean;
}

export default function TopBar({ title, onScan, isScanning }: TopBarProps) {
  return (
    <header className="h-[56px] bg-white px-6 flex items-center justify-between sticky top-0 z-20 shadow-soft border-b border-[#E2E8F0]">
      <h1 className="text-[18px] font-semibold text-text-primary">{title}</h1>
      
      <button
        onClick={onScan}
        disabled={isScanning}
        className={cn(
          "h-[36px] px-4 rounded-[8px] flex items-center gap-2 text-[14px] font-medium transition-all duration-150 shadow-sm active:scale-[0.98]",
          isScanning 
            ? "bg-surface-hover text-text-muted cursor-not-allowed" 
            : "bg-[#6366F1] text-white hover:bg-[#4F46E5]"
        )}
      >
        <RefreshCw size={16} className={cn(isScanning && "animate-spin")} color="#FFFFFF" />
        <span className="text-white">
          {isScanning ? 'Scanning...' : 'Scan Inbox'}
        </span>
      </button>
    </header>
  );
}
