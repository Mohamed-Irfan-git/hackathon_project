import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 cursor-pointer group select-none ${className}`}
    >
      {/* Modern Gradient Icon Badge */}
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-br from-[#00647c] via-[#004e61] to-[#ea580c] p-0.5 shadow-md shadow-[#00647c]/20 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-[#00647c]/30 transition-all duration-300 relative flex items-center justify-center overflow-hidden`}
      >
        <div className="w-full h-full bg-[#121c2a]/10 backdrop-blur-xs rounded-[10px] flex items-center justify-center relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3/5 h-3/5 text-white drop-shadow-sm group-hover:rotate-12 transition-transform duration-300"
          >
            {/* Graduation Cap & Forward Arrow hybrid icon */}
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
            <path d="M13 18l3 3m0 0l-3 3m3-3H9" className="text-[#fea619] stroke-[#fea619]" />
          </svg>

          {/* Sparkle accent dot */}
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#fea619] animate-pulse" />
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <span
          className={`font-extrabold ${titleSizes[size]} text-[#121c2a] tracking-tight font-display leading-none flex items-center gap-0.5`}
        >
          <span>Take</span>
          <span className="text-[#00647c]">U</span>
          <span className="bg-gradient-to-r from-[#ea580c] to-[#00647c] bg-clip-text text-transparent">
            Forward
          </span>
        </span>
        {showSubtitle && (
          <span
            className={`${subtitleSizes[size]} font-semibold text-[#6e797e] font-geist tracking-wider uppercase mt-0.5`}
          >
            Knowledge & Opportunity
          </span>
        )}
      </div>
    </div>
  );
};
