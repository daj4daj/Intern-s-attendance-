import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  highlight?: boolean;
  colorScheme?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  change,
  isPositive,
  icon,
  highlight,
  colorScheme = 'slate',
}) => {
  const borderColors = {
    indigo: 'border-l-indigo-600',
    emerald: 'border-l-emerald-600',
    amber: 'border-l-amber-500',
    rose: 'border-l-rose-500',
    slate: 'border-l-slate-400',
  };

  return (
    <div
      className={`bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs transition-shadow hover:shadow-sm border-l-4 ${borderColors[colorScheme]}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500 truncate">{label}</span>
        {icon && <div className="text-slate-400 shrink-0">{icon}</div>}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight tabular-nums">
          {value}
        </span>
        {change && (
          <span
            className={`text-xs font-semibold font-mono ${
              isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isPositive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>

      {subtext && (
        <div className="mt-1 text-[11px] text-slate-500 truncate">
          {subtext}
        </div>
      )}
    </div>
  );
};
