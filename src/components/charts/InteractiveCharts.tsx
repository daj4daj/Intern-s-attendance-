import React, { useState } from 'react';

// 1. Attendance Trend Line / Area Chart
export interface TrendDataPoint {
  label: string;
  rate: number; // 0 - 100%
  presentCount: number;
  total: number;
}

export const AttendanceTrendChart: React.FC<{
  data: TrendDataPoint[];
  title?: string;
  isArabic?: boolean;
}> = ({ data, title, isArabic }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No trend data available</div>;
  }

  const height = 220;
  const width = 560;
  const paddingX = 40;
  const paddingY = 30;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * innerWidth;
    const y = height - paddingY - (d.rate / 100) * innerHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="relative w-full">
      {title && <h3 className="text-sm font-semibold text-slate-900 mb-3">{title}</h3>}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-64 select-none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(val => {
            const y = height - paddingY - (val / 100) * innerHeight;
            return (
              <g key={val}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                <text x={paddingX - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Area gradient fill */}
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#trendGradient)" />

          {/* Line stroke */}
          <path d={pathD} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points & Interactive Tooltips */}
          {points.map((p, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  className="fill-white stroke-indigo-600 transition-all duration-150"
                  strokeWidth={isHovered ? 3 : 2}
                />
                {/* X labels */}
                {i % Math.ceil(data.length / 7) === 0 && (
                  <text x={p.x} y={height - 8} textAnchor="middle" className="text-[10px] fill-slate-500 font-mono">
                    {p.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {hoveredIdx !== null && (
        <div
          className="absolute z-10 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded shadow pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(points[hoveredIdx].x / width) * 100}%`,
            top: `${(points[hoveredIdx].y / height) * 100}%`,
          }}
        >
          <div className="font-semibold">{points[hoveredIdx].label}</div>
          <div className="text-indigo-200 font-mono">{points[hoveredIdx].rate}% Attendance</div>
          <div className="text-slate-400 text-[10px]">
            {points[hoveredIdx].presentCount} / {points[hoveredIdx].total} Present
          </div>
        </div>
      )}
    </div>
  );
};

// 2. Bar Chart (Students by Program / Department Attendance)
export interface BarDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  percentage?: number;
}

export const HorizontalBarChart: React.FC<{
  data: BarDataPoint[];
  title?: string;
  suffix?: string;
  color?: string;
}> = ({ data, title, suffix = '', color = 'bg-indigo-600' }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold text-slate-900 mb-3">{title}</h3>}
      <div className="space-y-3">
        {data.map((item, idx) => {
          const pct = Math.round((item.value / maxValue) * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-700">
                <span className="truncate pr-2 max-w-[240px]" title={item.label}>
                  {item.label}
                </span>
                <span className="font-mono text-slate-900 shrink-0">
                  {item.value} {suffix}
                  {item.percentage !== undefined && (
                    <span className="text-slate-400 ml-1 font-normal">({item.percentage}%)</span>
                  )}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${Math.max(5, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 3. Donut / Pie Chart (Leave Types / Attendance Status)
export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  sublabel?: string;
}

export const DonutChart: React.FC<{
  data: DonutSegment[];
  title?: string;
  centerText?: string;
  centerSubtext?: string;
}> = ({ data, title, centerText, centerSubtext }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((acc, cur) => acc + cur.value, 0);
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="w-full flex flex-col items-center">
      {title && <h3 className="text-sm font-semibold text-slate-900 mb-2 w-full text-left">{title}</h3>}
      <div className="relative flex items-center justify-center my-2">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {total > 0 &&
            data.map((item, idx) => {
              const fraction = item.value / total;
              const strokeDasharray = `${fraction * circumference} ${circumference}`;
              const strokeDashoffset = -(accumulatedPercent * circumference);
              accumulatedPercent += fraction;

              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold font-mono text-slate-900">
            {hoveredIdx !== null ? data[hoveredIdx].value : centerText || total}
          </span>
          <span className="text-[11px] text-slate-500 uppercase tracking-wider">
            {hoveredIdx !== null ? data[hoveredIdx].label : centerSubtext || 'Total'}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 w-full text-xs">
        {data.map((item, idx) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div
              key={idx}
              className={`flex items-center justify-between p-1 rounded transition-colors ${
                hoveredIdx === idx ? 'bg-slate-100 font-semibold' : 'text-slate-600'
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.label}</span>
              </div>
              <span className="font-mono text-slate-900 ml-1 shrink-0">
                {item.value} <span className="text-slate-400 font-normal">({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
