import React, { useEffect, useState } from 'react';
import type { Opportunity } from '../types';
import { OpportunityCard } from '../components/common/OpportunityCard';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { AITag } from '../components/common/AITag';
import { Search, Filter, Sparkles, CheckCircle2, MessageSquareText } from 'lucide-react';

interface DiscoverOpportunitiesProps {
  opportunities: Opportunity[];
  onBookOpportunity: (opp: Opportunity) => void;
  onAskRAG: (query: string) => void;
  onSearch?: (filters: { subject?: string; level?: string; location?: string; search?: string }) => void;
  recommendedOpportunities?: Opportunity[];
}

export const DiscoverOpportunities: React.FC<DiscoverOpportunitiesProps> = ({
  opportunities,
  onBookOpportunity,
  onAskRAG,
  onSearch,
  recommendedOpportunities = [],
}) => {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [tab, setTab] = useState<'all' | 'ai'>('all');
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => onSearch?.({ subject: subjectFilter === 'all' ? undefined : subjectFilter, level: levelFilter === 'all' ? undefined : levelFilter, search }), 250);
    return () => window.clearTimeout(timer);
  }, [search, subjectFilter, levelFilter, onSearch]);

  const baseOpportunities = tab === 'ai' ? recommendedOpportunities : opportunities;
  const filteredOpportunities = baseOpportunities.filter((opp) => {

    if (search) {
      const q = search.toLowerCase();
      const matchText =
        opp.title.toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q) ||
        opp.subject.toLowerCase().includes(q) ||
        opp.provider_name.toLowerCase().includes(q);
      if (!matchText) return false;
    }

    if (subjectFilter !== 'all' && opp.subject.toLowerCase() !== subjectFilter.toLowerCase()) {
      return false;
    }

    if (levelFilter !== 'all' && !opp.target_level.toLowerCase().includes(levelFilter.toLowerCase())) {
      return false;
    }

    if (deliveryFilter !== 'all' && opp.delivery_mode !== deliveryFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d9e3f6] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#121c2a] font-display">
            Discover Educational Opportunities
          </h1>
          <p className="text-xs text-[#3e484d] mt-1">
            Browse verified ICT courses, 1-on-1 tuition, workshops, and mentorship sessions.
          </p>
        </div>

        {/* Tab Toggle: All vs AI Recommended */}
        <div className="flex items-center p-1 bg-[#e6eeff] rounded-xl border border-[#d9e3f6] text-xs font-medium font-geist self-start">
          <button
            type="button"
            onClick={() => setTab('all')}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              tab === 'all'
                ? 'bg-white text-[#00647c] font-semibold shadow-xs'
                : 'text-[#3e484d] hover:text-[#121c2a]'
            }`}
          >
            All Opportunities ({opportunities.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('ai')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-all ${
              tab === 'ai'
                ? 'bg-white text-[#c2410c] font-semibold shadow-xs'
                : 'text-[#3e484d] hover:text-[#121c2a]'
            }`}
          >
            <Sparkles size={14} className="text-[#ea580c]" />
            <span>AI Recommended ({recommendedOpportunities.length})</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#d9e3f6] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-3 text-[#6e797e]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, topic, or provider..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c] focus:ring-1 focus:ring-[#00647c]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 text-[#6e797e] font-geist font-medium">
              <Filter size={14} />
              <span>Filters:</span>
            </div>

            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#d9e3f6] bg-[#f8f9ff] text-[#121c2a] text-xs focus:outline-none focus:border-[#00647c]"
            >
              <option value="all">All Subjects</option>
              <option value="ict">ICT</option>
              <option value="computer science">Computer Science</option>
              <option value="web development">Web Development</option>
              <option value="artificial intelligence">AI & ML</option>
              <option value="career development">Career Prep</option>
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#d9e3f6] bg-[#f8f9ff] text-[#121c2a] text-xs focus:outline-none focus:border-[#00647c]"
            >
              <option value="all">All Target Levels</option>
              <option value="a/l">A/L Students</option>
              <option value="beginner">Beginner</option>
              <option value="undergraduate">Undergraduates</option>
              <option value="school leaver">School Leavers</option>
            </select>

            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[#d9e3f6] bg-[#f8f9ff] text-[#121c2a] text-xs focus:outline-none focus:border-[#00647c]"
            >
              <option value="all">All Modes</option>
              <option value="online">Online</option>
              <option value="in-person">In-Person</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Opportunity Cards */}
      {filteredOpportunities.length === 0 ? (
        <EmptyState
          title={tab === 'ai' ? 'No AI matches yet' : 'No opportunities found'}
          description={tab === 'ai' ? 'Complete your learner preferences and save your profile to generate personalized matches.' : 'No educational programs match your selected search terms or filters.'}
          actionLabel="Reset Filters"
          onAction={() => {
            setSearch('');
            setSubjectFilter('all');
            setLevelFilter('all');
            setDeliveryFilter('all');
            setTab('all');
          }}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onSelect={(o) => setSelectedOpp(o)}
              onBook={onBookOpportunity}
              onAskAI={(o) => onAskRAG(`Can you tell me more about ${o.title}?`)}
            />
          ))}
        </div>
      )}

      {/* Detailed Opportunity Modal */}
      {selectedOpp && (
        <Modal
          isOpen={Boolean(selectedOpp)}
          onClose={() => setSelectedOpp(null)}
          title={selectedOpp.title}
          maxWidth="xl"
        >
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eff4ff] pb-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-bold text-sm text-[#00647c]">
                    {selectedOpp.provider_name}
                  </span>
                  {selectedOpp.provider_verified && (
                    <span className="inline-flex text-[#00647c]">
                      <CheckCircle2 size={16} className="fill-[#b7eaff] text-[#00647c]" />
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#6e797e] font-geist">
                  Subject: {selectedOpp.subject} • Target: {selectedOpp.target_level}
                </span>
              </div>

              {selectedOpp.match_score !== undefined && (
                <AITag score={selectedOpp.match_score} />
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="font-bold text-sm text-[#121c2a] mb-1 font-display">
                Program Details
              </h4>
              <p className="text-xs text-[#3e484d] leading-relaxed whitespace-pre-line">
                {selectedOpp.description}
              </p>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#f8f9ff] rounded-xl border border-[#d9e3f6] text-xs">
              <div>
                <span className="text-[#6e797e] block">Fee</span>
                <span className="font-bold text-[#121c2a]">
                  {selectedOpp.price === 0 ? 'Free / Sponsored' : `LKR ${selectedOpp.price.toLocaleString()}`}
                </span>
              </div>
              <div>
                <span className="text-[#6e797e] block">Delivery Mode</span>
                <span className="font-bold text-[#121c2a] capitalize">{selectedOpp.delivery_mode}</span>
              </div>
              <div>
                <span className="text-[#6e797e] block">Duration</span>
                <span className="font-bold text-[#121c2a]">{selectedOpp.duration}</span>
              </div>
              <div>
                <span className="text-[#6e797e] block">Location</span>
                <span className="font-bold text-[#121c2a]">{selectedOpp.location || 'Online'}</span>
              </div>
              <div>
                <span className="text-[#6e797e] block">Type</span>
                <span className="font-bold text-[#121c2a]">{selectedOpp.type}</span>
              </div>
              <div>
                <span className="text-[#6e797e] block">Status</span>
                <span className="font-bold text-emerald-700 capitalize">{selectedOpp.status}</span>
              </div>
            </div>

            {/* AI Match Reasons (if available) */}
            {selectedOpp.match_reasons && selectedOpp.match_reasons.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#fff7ed] border border-[#fea619]/40 text-xs">
                <span className="font-bold text-[#855300] font-geist block mb-1">
                  Why this matched your profile:
                </span>
                <ul className="list-disc list-inside space-y-1 text-[#684000]">
                  {selectedOpp.match_reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#eff4ff]">
              <button
                type="button"
                onClick={() => {
                  const opp = selectedOpp;
                  setSelectedOpp(null);
                  onAskRAG(`Ask detailed questions about "${opp.title}"`);
                }}
                className="px-4 py-2 bg-[#fff7ed] hover:bg-[#ffedd5] text-[#c2410c] border border-[#fea619]/40 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 font-geist"
              >
                <MessageSquareText size={14} />
                <span>Ask AI Assistant</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const opp = selectedOpp;
                  setSelectedOpp(null);
                  onBookOpportunity(opp);
                }}
                className="px-5 py-2 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                Book / Enroll Now
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
