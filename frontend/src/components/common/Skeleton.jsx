import React from 'react';

export function StatCardSkeleton() {
  return (
    <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-xl bg-[var(--canvas)]" />
        <div className="w-14 h-4 rounded-full bg-[var(--canvas)]" />
      </div>
      <div className="w-24 h-7 rounded-md bg-[var(--canvas)]" />
      <div className="w-32 h-3 rounded-md bg-[var(--canvas)]" />
    </div>
  );
}

export function ChartContainerSkeleton() {
  return (
    <div className="card p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="w-48 h-4 rounded-md bg-[var(--canvas)]" />
          <div className="w-36 h-3 rounded-md bg-[var(--canvas)]" />
        </div>
        <div className="w-20 h-4 rounded-md bg-[var(--canvas)]" />
      </div>
      <div className="h-64 sm:h-72 w-full bg-[var(--canvas)]/70 rounded-xl flex items-end justify-between p-6 gap-2">
        {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
          <div
            key={i}
            className="w-full bg-[var(--border)]/60 rounded-t-md"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function PortalPageSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--canvas)] animate-pulse">
      {/* Navbar skeleton */}
      <div className="h-16 bg-[var(--surface)] border-b border-[var(--border)] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--leaf-pale)]" />
          <div className="w-32 h-5 rounded-md bg-[var(--border)]" />
        </div>
        <div className="w-24 h-8 rounded-xl bg-[var(--border)]" />
      </div>

      {/* Hero banner skeleton */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="h-80 rounded-[2rem] bg-[var(--forest-deep)]/90 p-8 flex flex-col justify-end gap-4">
          <div className="w-28 h-6 rounded-full bg-white/20" />
          <div className="w-2/3 h-10 rounded-xl bg-white/20" />
          <div className="w-1/2 h-4 rounded-md bg-white/10" />
        </div>

        {/* Cards skeleton */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 space-y-4">
              <div className="w-1/2 h-6 rounded-md bg-[var(--canvas)]" />
              <div className="w-full h-4 rounded-md bg-[var(--canvas)]" />
              <div className="w-3/4 h-4 rounded-md bg-[var(--canvas)]" />
              <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center">
                <div className="w-20 h-6 rounded-md bg-[var(--canvas)]" />
                <div className="w-16 h-8 rounded-xl bg-[var(--canvas)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
