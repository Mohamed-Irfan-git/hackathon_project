import React from 'react';

interface MetricTileProps {
  label: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  subtext?: string;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  change,
  icon,
  subtext,
}) => {
  return (
    <div className="bg-white rounded-xl border border-[#d9e3f6] p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-[#6e797e] font-geist uppercase tracking-wider">
          {label}
        </span>
        {icon && <div className="p-2 rounded-lg bg-[#eff4ff] text-[#00647c]">{icon}</div>}
      </div>

      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-[#121c2a] tracking-tight font-display">
          {value}
        </div>
        {(change || subtext) && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[#3e484d]">
            {change && (
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {change}
              </span>
            )}
            {subtext && <span>{subtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
