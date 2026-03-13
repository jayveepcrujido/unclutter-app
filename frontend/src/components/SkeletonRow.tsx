'use client';

import React from 'react';

export default function SkeletonRow() {
  return (
    <div className="flex flex-col gap-3 border-b border-border bg-white px-4 py-4 md:flex-row md:items-center md:gap-0 md:px-6">
      <div className="hidden w-[40px] flex-shrink-0 md:block">
        <div className="h-4 w-4 rounded-sm shimmer" />
      </div>

      <div className="flex flex-1 items-center gap-3 pr-6">
        <div className="h-8 w-8 rounded-full shimmer" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-24 rounded shimmer" />
          <div className="h-2 w-32 rounded shimmer" />
        </div>
      </div>

      <div className="hidden w-[100px] flex-shrink-0 px-2 md:block">
        <div className="h-5 w-16 rounded-badge shimmer" />
      </div>

      <div className="hidden w-[120px] flex-shrink-0 px-2 md:block">
        <div className="h-3 w-12 rounded shimmer" />
      </div>

      <div className="hidden w-[100px] flex-shrink-0 px-2 md:block">
        <div className="h-5 w-12 rounded-badge shimmer" />
      </div>

      <div className="hidden w-[100px] flex-shrink-0 px-2 md:block">
        <div className="h-5 w-14 rounded-badge shimmer" />
      </div>

      <div className="hidden w-[48px] md:block" />

      <div className="flex flex-wrap gap-2 md:hidden">
        <div className="h-5 w-20 rounded-badge shimmer" />
        <div className="h-5 w-24 rounded-badge shimmer" />
        <div className="h-5 w-20 rounded-badge shimmer" />
      </div>
    </div>
  );
}
