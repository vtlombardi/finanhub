'use client';

import React from 'react';

export const OpportunitySkeleton: React.FC = () => {
  return (
    <div className="flex flex-col bg-[#020617]/60 border border-white/[0.05] rounded-2xl overflow-hidden">
      {/* Image skeleton */}
      <div className="relative h-44 bg-white/[0.03] animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="w-20 h-5 bg-white/5 rounded-full" />
          <div className="w-24 h-5 bg-white/5 rounded-full" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex flex-col flex-1 p-5 space-y-4">
        {/* ID row */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-1.5 bg-white/8 rounded-full" />
          <div className="h-px flex-1 bg-white/5" />
          <div className="w-16 h-1.5 bg-white/8 rounded-full" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="w-full h-3.5 bg-white/8 rounded animate-pulse" />
          <div className="w-4/5 h-3.5 bg-white/8 rounded animate-pulse" />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-5 border-y border-white/[0.04] py-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-white/8 rounded" />
            <div className="w-20 h-2 bg-white/8 rounded-full" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-white/8 rounded" />
            <div className="w-8 h-2 bg-white/8 rounded-full" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="w-20 h-1.5 bg-white/5 rounded-full" />
            <div className="w-28 h-5 bg-white/8 rounded animate-pulse" />
          </div>
          <div className="w-28 h-8 bg-white/5 rounded-lg border border-white/5" />
        </div>
      </div>
    </div>
  );
};
