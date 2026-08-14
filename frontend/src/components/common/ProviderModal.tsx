import React from 'react';
import type { Opportunity, ProviderProfileData } from '../../types';
import { Modal } from './Modal';
import { OpportunityCard } from './OpportunityCard';
import {
  CheckCircle2,
  GraduationCap,
  MapPin,
  MessageSquare,
  Sparkles,
  BookOpen,
  Star,
} from 'lucide-react';

interface ProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ProviderProfileData;
  opportunities: Opportunity[];
  onMessageProvider?: (opp?: Opportunity) => void;
  onSelectOpportunity?: (opp: Opportunity) => void;
  onBookOpportunity?: (opp: Opportunity) => void;
  onAskRAG?: (query: string) => void;
}

export const ProviderModal: React.FC<ProviderModalProps> = ({
  isOpen,
  onClose,
  provider,
  opportunities,
  onMessageProvider,
  onSelectOpportunity,
  onBookOpportunity,
  onAskRAG,
}) => {
  const isVerified = provider.verification_status === 'verified';
  const providerOpportunities = opportunities.filter((o) => o.provider_id === provider.user_id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Provider Profile - ${provider.organization_name}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-[#e6eeff] via-white to-[#fff7ed] rounded-2xl border border-[#d9e3f6] p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#00647c] text-white flex items-center justify-center font-bold text-2xl font-display shadow-md shrink-0">
              {provider.organization_name.substring(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-[#121c2a] font-display">
                  {provider.organization_name}
                </h2>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#e6eeff] text-[#00647c] font-geist border border-[#b7eaff]">
                    <CheckCircle2 size={13} className="fill-[#b7eaff] text-[#00647c]" />
                    Verified Provider
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-geist border border-amber-200">
                    Pending Verification
                  </span>
                )}
              </div>

              {(provider.university || provider.faculty) && (
                <div className="flex items-center gap-1.5 text-xs text-[#00647c] font-medium font-geist">
                  <GraduationCap size={15} />
                  <span>
                    {[provider.university, provider.faculty].filter(Boolean).join(' • ')}
                  </span>
                </div>
              )}

              {provider.location && (
                <div className="flex items-center gap-1 text-xs text-[#6e797e] font-geist">
                  <MapPin size={13} />
                  <span>{provider.location}</span>
                </div>
              )}
            </div>

            {onMessageProvider && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onMessageProvider();
                }}
                className="px-4 py-2.5 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs shrink-0 self-start sm:self-center font-geist"
              >
                <MessageSquare size={15} />
                <span>Message Provider</span>
              </button>
            )}
          </div>

          {/* Stats bar */}
          <div className="mt-5 pt-4 border-t border-[#d9e3f6]/60 grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/80 p-2.5 rounded-xl border border-[#d9e3f6]">
              <span className="text-[10px] text-[#6e797e] font-geist uppercase block">Rating</span>
              <span className="font-extrabold text-sm text-[#121c2a] flex items-center justify-center gap-1">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                {provider.rating ?? 4.9} / 5.0
              </span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-[#d9e3f6]">
              <span className="text-[10px] text-[#6e797e] font-geist uppercase block">Active Courses</span>
              <span className="font-extrabold text-sm text-[#00647c]">
                {providerOpportunities.length} Available
              </span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-[#d9e3f6]">
              <span className="text-[10px] text-[#6e797e] font-geist uppercase block">Students Taught</span>
              <span className="font-extrabold text-sm text-emerald-700">
                {provider.total_students ?? 120}+ Students
              </span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {provider.bio && (
          <div className="bg-white rounded-xl border border-[#d9e3f6] p-4 space-y-1">
            <h3 className="text-xs font-bold text-[#121c2a] uppercase tracking-wider font-display">
              About the Provider
            </h3>
            <p className="text-xs text-[#3e484d] leading-relaxed font-geist">{provider.bio}</p>
          </div>
        )}

        {/* All Opportunities Offered by this Provider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#121c2a] font-display flex items-center gap-1.5">
              <BookOpen size={16} className="text-[#00647c]" />
              Educational Opportunities Offered ({providerOpportunities.length})
            </h3>
            {onAskRAG && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAskRAG(`Tell me about courses by ${provider.organization_name}`);
                }}
                className="text-xs font-semibold text-[#855300] hover:underline flex items-center gap-1 font-geist"
              >
                <Sparkles size={13} className="text-[#ea580c]" />
                Ask AI about Provider
              </button>
            )}
          </div>

          {providerOpportunities.length === 0 ? (
            <div className="p-8 text-center bg-[#f8f9ff] border border-dashed border-[#d9e3f6] rounded-xl text-xs text-[#6e797e]">
              This provider has no active opportunities listed right now.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {providerOpportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onSelect={(o) => {
                    onClose();
                    onSelectOpportunity?.(o);
                  }}
                  onBook={(o) => {
                    onClose();
                    onBookOpportunity?.(o);
                  }}
                  onMessageProvider={() => {
                    onClose();
                    onMessageProvider?.(opp);
                  }}
                  onAskAI={(o) => {
                    onClose();
                    onAskRAG?.(`Tell me more about ${o.title}`);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
