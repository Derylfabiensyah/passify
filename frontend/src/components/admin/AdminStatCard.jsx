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
    <div className="p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-100/80 text-gray-900">
            {Icon && <Icon className="w-4 h-4" />}
          </div>
          {badgeText && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500 bg-gray-100/80 px-2.5 py-0.5 rounded-full">
              {badgeText}
            </span>
          )}
        </div>

        {trend !== undefined && (
          <div
            className={`inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
              trendUp
                ? 'text-emerald-700 bg-emerald-50/70'
                : 'text-red-600 bg-red-50/70'
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

      <div className="text-2xl font-bold text-gray-900 font-['Outfit'] tracking-tight mb-1">
        {value}
      </div>

      <div className="text-xs text-gray-500 font-normal">{label}</div>

      {subValue && (
        <div className="text-[11px] text-gray-400 mt-2">
          <span>{subValue}</span>
        </div>
      )}

      {progress !== undefined && (
        <div className="mt-3.5 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1.5">
            <span>Keterisian Kuota</span>
            <span className="font-semibold text-gray-900">{progress}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-gray-100 overflow-hidden">
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
