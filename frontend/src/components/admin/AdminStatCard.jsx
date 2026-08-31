import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { StatCardSkeleton } from '../common/Skeleton';

export default function AdminStatCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  trendDirection, // 'up' | 'down' | 'neutral'
  progress,
  progressLabel = 'Keterisian Kuota',
  badgeText,
  isLoading = false
}) {
  if (isLoading) {
    return <StatCardSkeleton />;
  }

  // Determine trend direction
  const isUp = trendDirection ? trendDirection === 'up' : (trend !== undefined && trend > 0);
  const isDown = trendDirection ? trendDirection === 'down' : (trend !== undefined && trend < 0);
  const isNeutral = trendDirection ? trendDirection === 'neutral' : (trend !== undefined && trend === 0);

  // Dynamic progress threshold color
  const getProgressColor = (pct) => {
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 75) return 'bg-amber-500';
    return 'bg-[var(--leaf)]';
  };

  return (
    <div className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--canvas)] text-[var(--forest-deep)]">
            {Icon && <Icon className="w-4 h-4" />}
          </div>
          {badgeText && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--ink-soft)] bg-[var(--canvas)] px-2.5 py-0.5 rounded-full border border-[var(--border)]">
              {badgeText}
            </span>
          )}
        </div>

        {(trend !== undefined || trendDirection !== undefined) && (
          <div
            className={`inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
              isUp
                ? 'text-emerald-700 bg-emerald-50/70 border border-emerald-200/60'
                : isDown
                ? 'text-red-600 bg-red-50/70 border border-red-200/60'
                : 'text-gray-600 bg-gray-50 border border-gray-200'
            }`}
          >
            {isUp && <ArrowUpRight className="w-3.5 h-3.5" />}
            {isDown && <ArrowDownRight className="w-3.5 h-3.5" />}
            {isNeutral && <Minus className="w-3.5 h-3.5" />}
            {trend !== undefined && <span>{Math.abs(trend)}%</span>}
          </div>
        )}
      </div>

      <div className="text-2xl font-bold text-[var(--forest-deep)] font-heading tracking-tight mb-1">
        {value}
      </div>

      <div className="text-xs text-[var(--ink-soft)] font-normal">{label}</div>

      {subValue && (
        <div className="text-[11px] text-[var(--ink-soft)]/80 mt-2">
          <span>{subValue}</span>
        </div>
      )}

      {progress !== undefined && (
        <div className="mt-3.5 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center justify-between text-[11px] text-[var(--ink-soft)] mb-1.5">
            <span>{progressLabel}</span>
            <span className="font-semibold text-[var(--forest-deep)]">{progress}%</span>
          </div>
          <div
            className="w-full h-1.5 rounded-full bg-[var(--canvas)] overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.min(100, Math.max(0, progress))}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progressLabel}: ${progress}%`}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
