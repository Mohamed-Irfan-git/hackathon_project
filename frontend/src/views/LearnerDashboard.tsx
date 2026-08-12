import React, { useState } from 'react';
import type { Opportunity, Booking, LearnerProfileData } from '../types';
import { OpportunityCard } from '../components/common/OpportunityCard';
import { Badge } from '../components/common/Badge';
import { AITag } from '../components/common/AITag';
import { Sparkles, Search, CalendarCheck, ArrowRight, Clock, Video } from 'lucide-react';

interface LearnerDashboardProps {
  profile: LearnerProfileData;
  recommendedOpportunities: Opportunity[];
  upcomingBookings: Booking[];
  onSelectOpportunity: (opp: Opportunity) => void;
  onBookOpportunity: (opp: Opportunity) => void;
  onNavigateTab: (tab: any) => void;
  onAskRAG: (query: string) => void;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  profile,
  recommendedOpportunities,
  upcomingBookings,
  onSelectOpportunity,
  onBookOpportunity,
  onNavigateTab,
  onAskRAG,
}) => {
  const [ragQuery, setRagQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ragQuery.trim()) {
      onAskRAG(ragQuery);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#00647c] to-[#007f9d] rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xs text-white text-xs font-geist font-medium">
            <Sparkles size={12} className="text-[#fea619]" />
            <span>Learner Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
            Welcome back, {profile.full_name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans">
            Target Level: <span className="font-semibold text-white">{profile.education_level}</span> • Field:{' '}
            <span className="font-semibold text-white">{profile.field_of_interest}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateTab('discover')}
            className="px-4 py-2.5 bg-white text-[#00647c] hover:bg-slate-100 font-semibold text-xs rounded-xl transition-colors shadow-xs"
          >
            Browse All Opportunities
          </button>
        </div>
      </div>

      {/* Prominent RAG Assistant Entry Point Bar */}
      <div className="bg-white rounded-2xl p-5 border border-[#fea619]/40 shadow-xs ai-glow">
        <div className="flex items-center gap-2 text-xs font-bold text-[#855300] font-geist uppercase tracking-wider mb-2">
          <Sparkles size={14} className="text-[#ea580c]" />
          <span>Ask the AI Opportunity Assistant</span>
        </div>
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-3 text-[#6e797e]" />
            <input
              type="text"
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              placeholder="e.g. I am an A/L student interested in ICT with a limited budget..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#bdc8ce] focus:outline-none focus:border-[#00647c] focus:ring-1 focus:ring-[#00647c]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#855300] hover:bg-[#684000] text-white font-semibold text-xs rounded-xl transition-colors shrink-0 flex items-center gap-1.5 font-geist"
          >
            <span>Ask AI</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#6e797e]">
          <span className="font-semibold text-[#3e484d]">Sample Queries:</span>
          <button
            type="button"
            onClick={() => onAskRAG('What government scholarships exist for A/L ICT students?')}
            className="px-2 py-0.5 rounded bg-[#f8f9ff] hover:bg-[#e6eeff] text-[#00647c] border border-[#d9e3f6]"
          >
            A/L ICT Scholarships
          </button>
          <button
            type="button"
            onClick={() => onAskRAG('Are there free Python web development workshops?')}
            className="px-2 py-0.5 rounded bg-[#f8f9ff] hover:bg-[#e6eeff] text-[#00647c] border border-[#d9e3f6]"
          >
            Free Python Workshops
          </button>
          <button
            type="button"
            onClick={() => onAskRAG('What internships are available for IT school leavers?')}
            className="px-2 py-0.5 rounded bg-[#f8f9ff] hover:bg-[#e6eeff] text-[#00647c] border border-[#d9e3f6]"
          >
            IT Internships
          </button>
        </div>
      </div>

      {/* Main Grid: AI Match Recommendations + Upcoming Bookings Sidebar */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: AI Recommended Matches */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#121c2a] font-display">
                Recommended for You
              </h2>
              <AITag label="AI Match" size="sm" />
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('discover')}
              className="text-xs font-semibold text-[#00647c] hover:underline font-geist"
            >
              View All →
            </button>
          </div>

          <p className="text-xs text-[#6e797e] -mt-2">
            Recommendations are ranked by semantic similarity to your profile preferences, subjects, budget, and learning goals.
          </p>

          {recommendedOpportunities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#d9e3f6] bg-white p-6 text-center text-xs text-[#6e797e]">
              No AI matches yet. Complete your preferences, then regenerate your profile embedding to receive recommendations.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {recommendedOpportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onSelect={onSelectOpportunity}
                  onBook={onBookOpportunity}
                  onAskAI={(o) => onAskRAG(`Tell me more about "${o.title}"`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Upcoming Bookings & Profile Quick Summary */}
        <div className="space-y-6">
          {/* Upcoming Bookings Widget */}
          <div className="bg-white rounded-xl border border-[#d9e3f6] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarCheck size={18} className="text-[#00647c]" />
                <h3 className="font-bold text-sm text-[#121c2a] font-display">Upcoming Bookings</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('bookings')}
                className="text-xs font-semibold text-[#00647c] hover:underline font-geist"
              >
                Manage
              </button>
            </div>

            {upcomingBookings.length === 0 ? (
              <p className="text-xs text-[#6e797e] py-4 text-center">No upcoming bookings.</p>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-3 rounded-lg bg-[#f8f9ff] border border-[#eff4ff] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#00647c] truncate max-w-[140px]">
                        {bk.provider_name}
                      </span>
                      <Badge type={bk.status} />
                    </div>
                    <h4 className="font-semibold text-xs text-[#121c2a] line-clamp-1">
                      {bk.opportunity_title}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-[#6e797e]">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{new Date(bk.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Video size={12} />
                        <span>Online</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Profile Summary Box */}
          <div className="bg-white rounded-xl border border-[#d9e3f6] p-5 shadow-xs text-left">
            <h3 className="font-bold text-sm text-[#121c2a] font-display mb-3">Learner Profile</h3>
            <div className="space-y-2 text-xs text-[#3e484d]">
              <div>
                <span className="text-[#6e797e] block">Budget Constraint:</span>
                <span className="font-semibold text-[#121c2a]">
                  Max LKR {profile.budget_max?.toLocaleString() || '15,000'} / course
                </span>
              </div>
              <div>
                <span className="text-[#6e797e] block">Location Preference:</span>
                <span className="font-semibold text-[#121c2a]">{profile.location}</span>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab('profile')}
                  className="w-full py-1.5 border border-[#d9e3f6] text-[#00647c] font-semibold rounded-lg hover:bg-[#e6eeff] transition-colors text-center text-xs"
                >
                  Edit Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
