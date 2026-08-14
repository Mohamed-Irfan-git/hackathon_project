import React from 'react';
import type { BookingStatus, Opportunity } from '../../types';
import { AITag } from './AITag';
import { YouTubePreviewCard } from './YouTubePreview';
import { Clock, MapPin, Video, CheckCircle2, MessageSquareText, MessageSquare } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onSelect?: (opp: Opportunity) => void;
  onAskAI?: (opp: Opportunity) => void;
  onBook?: (opp: Opportunity) => void;
  onMessageProvider?: (opp: Opportunity) => void;
  onViewProvider?: (providerId: string) => void;
  isBooking?: boolean;
  bookingStatus?: BookingStatus;
  isAuthenticated?: boolean;
}

export function getTopicFallbackImage(subject: string = '', type: string = ''): string {
  const s = subject.toLowerCase();
  const t = type.toLowerCase();

  if (s.includes('ict') || s.includes('python') || s.includes('web') || s.includes('code') || s.includes('computer')) {
    return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80';
  }
  if (s.includes('math') || s.includes('algebra') || s.includes('calc') || s.includes('combined')) {
    return 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80';
  }
  if (s.includes('physic') || s.includes('chem') || s.includes('biol') || s.includes('science')) {
    return 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80';
  }
  if (t.includes('mentorship') || t.includes('interview') || s.includes('career')) {
    return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80';
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onSelect,
  onAskAI,
  onBook,
  onMessageProvider,
  onViewProvider,
  isBooking = false,
  bookingStatus,
  isAuthenticated = false,
}) => {
  const isFree = opportunity.price === 0;
  const bookingLabel: Record<BookingStatus, string> = {
    pending: 'Request sent',
    accepted: 'Enrolled',
    rejected: 'Request declined',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  const actionLabel = isBooking
    ? 'Sending request…'
    : bookingStatus
      ? bookingLabel[bookingStatus]
      : isAuthenticated ? 'Request to enroll' : 'Sign in to enroll';

  const displayImage = opportunity.image_url || getTopicFallbackImage(opportunity.subject, opportunity.type);

  return (
    <div className="bg-white rounded-2xl border border-[#d9e3f6] shadow-xs hover:shadow-lg hover:border-[#00647c] transition-all flex flex-col justify-between overflow-hidden group">
      <div>
        {/* Cover Photo Header */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <img
            src={displayImage}
            alt={opportunity.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />

          {/* Type Badge & Price Tag */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-xs text-[#004e61] uppercase tracking-wider font-geist shadow-xs">
              {opportunity.type}
            </span>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#121c2a]/90 text-white font-geist backdrop-blur-xs">
              {isFree ? 'FREE / SPONSORED' : `LKR ${opportunity.price.toLocaleString()}`}
            </span>
          </div>

          {/* Clickable Provider Pill at bottom of banner */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onViewProvider) onViewProvider(opportunity.provider_id);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 hover:bg-white text-[#121c2a] text-xs font-bold font-display shadow-sm transition-all hover:scale-105"
            >
              <div className="w-5 h-5 rounded-full bg-[#00647c] text-white flex items-center justify-center text-[10px] font-bold">
                {opportunity.provider_name.substring(0, 1).toUpperCase()}
              </div>
              <span className="truncate max-w-[140px] text-[#00647c]">{opportunity.provider_name}</span>
              {opportunity.provider_verified && (
                <CheckCircle2 size={13} className="fill-[#b7eaff] text-[#00647c] shrink-0" />
              )}
            </button>

            {opportunity.match_score !== undefined && (
              <AITag score={opportunity.match_score} size="sm" />
            )}
          </div>
        </div>

        {/* Body Details */}
        <div className="p-5 space-y-3">
          <h3
            onClick={() => onSelect && onSelect(opportunity)}
            className="font-bold text-base text-[#121c2a] group-hover:text-[#00647c] transition-colors cursor-pointer line-clamp-2 leading-snug font-display"
          >
            {opportunity.title}
          </h3>

          <p className="text-xs text-[#3e484d] line-clamp-2 leading-relaxed font-geist">
            {opportunity.description}
          </p>

          {opportunity.video_url && (
            <div className="pt-1">
              <div className="text-[11px] font-semibold text-[#00647c] mb-1.5 flex items-center gap-1 font-geist">
                <Video size={12} /> Class Demo & Walkthrough
              </div>
              <YouTubePreviewCard url={opportunity.video_url} title={opportunity.title} />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[#6e797e] font-geist pt-2 border-t border-[#eff4ff]">
            <div className="flex items-center gap-1">
              <Clock size={13} />
              <span>{opportunity.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              {opportunity.delivery_mode === 'online' ? (
                <Video size={13} className="text-[#00647c]" />
              ) : (
                <MapPin size={13} className="text-amber-600" />
              )}
              <span className="capitalize">{opportunity.delivery_mode}</span>
            </div>
            <span className="bg-[#f8f9ff] px-2 py-0.5 rounded text-[11px] font-semibold text-[#00647c]">
              {opportunity.target_level}
            </span>
          </div>
        </div>
      </div>

      {/* Footer CTA Buttons */}
      <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-[#eff4ff] mt-2">
        <div className="flex items-center gap-1.5">
          {onMessageProvider && (
            <button
              type="button"
              onClick={() => onMessageProvider(opportunity)}
              title="Message Provider"
              className="p-2 text-[#00647c] bg-[#e6eeff] hover:bg-[#d9e3f6] border border-[#d9e3f6] rounded-xl transition-colors"
            >
              <MessageSquare size={16} />
            </button>
          )}

          {onAskAI && (
            <button
              type="button"
              onClick={() => onAskAI(opportunity)}
              title="Ask AI Assistant about this opportunity"
              className="p-2 text-[#855300] bg-[#fff8f0] border border-[#fea619]/40 hover:bg-[#ffedd5] rounded-xl transition-colors"
            >
              <MessageSquareText size={16} />
            </button>
          )}
        </div>

        <button
          type="button"
          disabled={isBooking || Boolean(bookingStatus)}
          onClick={() => onBook ? onBook(opportunity) : onSelect?.(opportunity)}
          className="px-4 py-2 bg-[#00647c] hover:bg-[#004e61] disabled:cursor-wait disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};
