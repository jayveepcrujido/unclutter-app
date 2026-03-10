'use client';

import React from 'react';

export default function SkeletonRow() {
  return (
    <div className="flex items-center px-4 h-[64px] border-b border-border bg-white">
      <div className="w-[40px] flex-shrink-0">
        <div className="w-4 h-4 rounded-sm shimmer" />
      </div>

      <div className="flex-1 flex items-center gap-3 pr-4">
        <div className="w-8 h-8 rounded-full shimmer" />
        <div className="space-y-2 min-w-0 flex-1">
          <div className="h-3 shimmer rounded w-24" />
          <div className="h-2 shimmer rounded w-32" />
        </div>
      </div>

      <div className="w-[100px] flex-shrink-0 px-2">
        <div className="h-5 shimmer rounded-badge w-16" />
      </div>

      <div className="w-[120px] flex-shrink-0 px-2">
        <div className="h-3 shimmer rounded w-12" />
      </div>

      <div className="w-[100px] flex-shrink-0 px-2">
        <div className="h-5 shimmer rounded-badge w-12" />
      </div>

      <div className="w-[100px] flex-shrink-0 px-2">
        <div className="h-5 shimmer rounded-badge w-14" />
      </div>

      <div className="w-[48px]" />
    </div>
  );
}
