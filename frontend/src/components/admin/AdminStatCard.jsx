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
    <div className="p-5 glass-panel rounded-2xl hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--forest-deep)]/10 text-[var(--forest-deep)] backdrop-blur-xs">
            {Icon && <Icon className="w-4 h-4" />}
          </div>
          {badgeText && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#14281a] bg-white/80 px-2.5 py-0.5 rounded-full border border-white/90 shadow-2xs">
              {badgeText}
            </span>
          )}
        </div>

        {(trend !== undefined || trendDirection !== undefined) && (
          <div
            className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
              isUp
                ? 'text-emerald-800 bg-emerald-100/80 border border-emerald-300/80'
                : isDown
                ? 'text-red-700 bg-red-100/80 border border-red-300/80'
                : 'text-gray-700 bg-white/80 border border-white/90'
            }`}
          >
            {isUp && <ArrowUpRight className="w-3.5 h-3.5" />}
            {isDown && <ArrowDownRight className="w-3.5 h-3.5" />}
            {isNeutral && <Minus className="w-3.5 h-3.5" />}
            {trend !== undefined && <span>{Math.abs(trend)}%</span>}
          </div>
        )}
      </div>

      <div className="text-2xl font-extrabold text-[#14281a] font-heading tracking-tight mb-1">
        {value}
      </div>

      <div className="text-xs text-[#2a3426] font-semibold">{label}</div>

      {subValue && (
        <div className="text-[11px] text-[#4d5c48] font-medium mt-1.5">
          <span>{subValue}</span>
        </div>
      )}

      {progress !== undefined && (
        <div className="mt-3.5 pt-3 border-t border-white/70">
          <div className="flex items-center justify-between text-[11px] text-[#3d4d38] mb-1.5">
            <span className="font-semibold">{progressLabel}</span>
            <span className="font-extrabold text-[#14281a]">{progress}%</span>
          </div>
          <div
            className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden"
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
