import React from 'react';
import type { Opportunity } from '../../types';
import { AITag } from './AITag';
import { Clock, MapPin, Video, CheckCircle2, MessageSquareText } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onSelect?: (opp: Opportunity) => void;
  onAskAI?: (opp: Opportunity) => void;
  onBook?: (opp: Opportunity) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onSelect,
  onAskAI,
  onBook,
}) => {
  const isFree = opportunity.price === 0;

  return (
    <div className="bg-white rounded-xl border border-[#d9e3f6] p-5 shadow-xs hover:shadow-md hover:border-[#00647c] transition-all flex flex-col justify-between group">
      <div>
        {/* Header Metadata */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-xs text-[#00647c] truncate">
              {opportunity.provider_name}
            </span>
            {opportunity.provider_verified && (
              <span title="Verified Provider" className="inline-flex text-[#00647c]">
                <CheckCircle2 size={14} className="fill-[#b7eaff] text-[#00647c]" />
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#e6eeff] text-[#004e61] uppercase tracking-wider font-geist">
            {opportunity.type}
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect && onSelect(opportunity)}
          className="font-bold text-lg text-[#121c2a] group-hover:text-[#00647c] transition-colors cursor-pointer line-clamp-2 mb-2"
        >
          {opportunity.title}
        </h3>

        {/* AI Match Badge */}
        {opportunity.match_score !== undefined && (
          <div className="mb-3">
            <AITag score={opportunity.match_score} size="sm" />
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-[#3e484d] line-clamp-2 mb-4 leading-relaxed">
          {opportunity.description}
        </p>

        {/* Tags / Details */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[#3e484d] mb-5 border-t border-b border-[#eff4ff] py-2.5">
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-[#6e797e]" />
            <span>{opportunity.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            {opportunity.delivery_mode === 'online' ? (
              <Video size={14} className="text-[#00647c]" />
            ) : (
              <MapPin size={14} className="text-amber-600" />
            )}
            <span className="capitalize">{opportunity.delivery_mode}</span>
          </div>
          <span className="text-xs text-[#6e797e] font-geist bg-[#f8f9ff] px-2 py-0.5 rounded">
            {opportunity.target_level}
          </span>
        </div>
      </div>

      {/* Footer / Price & Actions */}
      <div className="pt-2 flex items-center justify-between gap-3">
        <div>
          <span className="text-xs text-[#6e797e] block">Fee</span>
          <span className="font-extrabold text-base text-[#121c2a]">
            {isFree ? (
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-xs">
                Free / Sponsored
              </span>
            ) : (
              `LKR ${opportunity.price.toLocaleString()}`
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onAskAI && (
            <button
              type="button"
              onClick={() => onAskAI(opportunity)}
              title="Ask AI Assistant about this opportunity"
              className="p-2 text-[#855300] bg-[#fff8f0] border border-[#fea619]/40 hover:bg-[#ffedd5] rounded-lg transition-colors"
            >
              <MessageSquareText size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={() => onBook ? onBook(opportunity) : onSelect?.(opportunity)}
            className="px-3.5 py-2 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            Book / Enroll
          </button>
        </div>
      </div>
    </div>
  );
};
