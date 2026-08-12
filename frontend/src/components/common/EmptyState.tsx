import React from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'There are no items matching your criteria or database at this time.',
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white rounded-xl border border-dashed border-[#bdc8ce] text-center my-4">
      <div className="w-12 h-12 rounded-full bg-[#eff4ff] text-[#00647c] flex items-center justify-center mb-4">
        {icon || <SearchX size={24} />}
      </div>
      <h4 className="font-bold text-base text-[#121c2a] mb-1 font-display">{title}</h4>
      <p className="text-sm text-[#3e484d] max-w-md mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-2 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
