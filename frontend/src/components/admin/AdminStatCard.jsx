import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminStatCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  progress,
  badgeText
}) {
  const trendUp = trend > 0;

  return (
    <div className="card p-5 bg-zinc-950 border border-zinc-800 rounded-xl shadow-sm hover:border-zinc-700/80 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-900 border border-zinc-800">
            {Icon && <Icon className="w-4.5 h-4.5 text-zinc-200" />}
          </div>
          {badgeText && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              {badgeText}
            </span>
          )}
        </div>

        {trend !== undefined && (
          <div
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
              trendUp
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            }`}
          >
            {trendUp ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-['Outfit'] tracking-tight mb-1">
        {value}
      </div>

      <div className="text-xs text-zinc-400 font-medium">{label}</div>

      {subValue && (
        <div className="text-[11px] text-zinc-500 mt-1.5 flex items-center gap-1.5">
          <span>{subValue}</span>
        </div>
      )}

      {progress !== undefined && (
        <div className="mt-3 pt-3 border-t border-zinc-900">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5">
            <span>Keterisian Kuota</span>
            <span className="font-semibold text-zinc-200">{progress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
