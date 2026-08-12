import React from 'react';
import { Sparkles } from 'lucide-react';

interface AITagProps {
  label?: string;
  score?: number;
  className?: string;
  size?: 'sm' | 'md';
}

export const AITag: React.FC<AITagProps> = ({
  label,
  score,
  className = '',
  size = 'md',
}) => {
  let displayLabel = label;
  if (!displayLabel && score !== undefined) {
    if (score >= 0.9) displayLabel = `Strong Match (${Math.round(score * 100)}%)`;
    else if (score >= 0.75) displayLabel = `Good Match (${Math.round(score * 100)}%)`;
    else displayLabel = `AI Match (${Math.round(score * 100)}%)`;
  }
  if (!displayLabel) displayLabel = 'AI Powered';

  const py = size === 'sm' ? 'py-0.5 px-2 text-[11px]' : 'py-1 px-2.5 text-xs';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-geist font-medium bg-[#fff7ed] border border-[#f97316]/30 text-[#c2410c] ai-glow ${py} ${className}`}
    >
      <Sparkles size={iconSize} className="text-[#ea580c] animate-pulse" />
      <span className="uppercase tracking-wider font-semibold">{displayLabel}</span>
    </span>
  );
};
