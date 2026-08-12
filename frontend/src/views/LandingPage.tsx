import React from 'react';
import type { Opportunity } from '../types';
import { OpportunityCard } from '../components/common/OpportunityCard';
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Building2,
  Heart,
  Search,
  BookOpen,
  Users,
  Award,
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  featuredOpportunities: Opportunity[];
  onSelectOpportunity: (opp: Opportunity) => void;
  onNavigateRAG: () => void;
  onExplore: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  featuredOpportunities,
  onSelectOpportunity,
  onNavigateRAG,
  onExplore,
}) => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#e6eeff] via-[#f8f9ff] to-white rounded-3xl p-8 sm:p-14 border border-[#d9e3f6]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#d9e3f6] shadow-xs text-xs font-semibold font-geist text-[#00647c]">
            <Sparkles size={14} className="text-[#ea580c]" />
            <span>AI-Driven Education & Career Opportunity Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#121c2a] tracking-tight leading-tight font-display">
            Turning Knowledge into <span className="text-[#00647c]">Opportunity</span>
          </h1>

          <p className="text-base sm:text-lg text-[#3e484d] max-w-2xl mx-auto leading-relaxed">
            Striver connects Sri Lankan learners with verified tutors, accredited courses, industry mentorships, and community sponsorship through embedding-based AI matching and grounded RAG knowledge search.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="px-6 py-3 bg-[#00647c] hover:bg-[#004e61] text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={onNavigateRAG}
              className="px-6 py-3 bg-[#fff7ed] hover:bg-[#ffedd5] text-[#c2410c] border border-[#fea619]/40 font-semibold text-sm rounded-xl transition-all flex items-center gap-2 ai-glow"
            >
              <Sparkles size={16} className="text-[#ea580c]" />
              <span>Ask AI Assistant</span>
            </button>
          </div>

          {/* Stat highlights */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-[#d9e3f6]/60">
            <div>
              <div className="text-2xl font-bold text-[#121c2a] font-display">1,400+</div>
              <div className="text-xs text-[#6e797e] font-geist">Learners Reached</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#121c2a] font-display">100%</div>
              <div className="text-xs text-[#6e797e] font-geist">Verified Tutors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#121c2a] font-display">LKR 575K+</div>
              <div className="text-xs text-[#6e797e] font-geist">Pledged Sponsorships</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#121c2a] font-display">Sub-sec</div>
              <div className="text-xs text-[#6e797e] font-geist">AI Matching</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow: Learn / Prepare / Discover */}
      <section className="max-w-5xl mx-auto text-center space-y-8">
        <div>
          <span className="text-xs font-bold text-[#00647c] uppercase tracking-wider font-geist">
            Ecosystem Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#121c2a] mt-1 font-display">
            How TakeUForward Empowers Every Stakeholder
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#d9e3f6] shadow-xs text-left hover:border-[#00647c] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#e6eeff] text-[#00647c] flex items-center justify-center mb-4">
              <Search size={24} />
            </div>
            <h3 className="font-bold text-lg text-[#121c2a] mb-2 font-display">1. Discover & Match</h3>
            <p className="text-xs text-[#3e484d] leading-relaxed mb-4">
              AI vector search pairs learner interests, budget limits, and target A/L levels with verified educational offerings.
            </p>
            <span className="text-[11px] font-semibold text-[#00647c] font-geist inline-flex items-center gap-1">
              <span>Learner Experience</span> →
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#d9e3f6] shadow-xs text-left hover:border-[#00647c] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center mb-4">
              <BookOpen size={24} />
            </div>
            <h3 className="font-bold text-lg text-[#121c2a] mb-2 font-display">2. RAG Assistant</h3>
            <p className="text-xs text-[#3e484d] leading-relaxed mb-4">
              Ground answers using verified government scholarships, diploma entries, and industry opportunities with direct citations.
            </p>
            <span className="text-[11px] font-semibold text-[#ea580c] font-geist inline-flex items-center gap-1">
              <span>Knowledge Base</span> →
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#d9e3f6] shadow-xs text-left hover:border-[#00647c] transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#f0fdf4] text-emerald-700 flex items-center justify-center mb-4">
              <Award size={24} />
            </div>
            <h3 className="font-bold text-lg text-[#121c2a] mb-2 font-display">3. Sponsor & Grow</h3>
            <p className="text-xs text-[#3e484d] leading-relaxed mb-4">
              Sponsors directly pledge financial support for high-potential learners to bridge socioeconomic gaps.
            </p>
            <span className="text-[11px] font-semibold text-emerald-700 font-geist inline-flex items-center gap-1">
              <span>Impact Funding</span> →
            </span>
          </div>
        </div>
      </section>

      {/* Featured Opportunities Section */}
      <section className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#121c2a] font-display">
              Featured Educational Opportunities
            </h2>
            <p className="text-xs text-[#3e484d]">
              Verified courses, tuition sessions, and workshops ready for instant booking.
            </p>
          </div>
          <button
            type="button"
            onClick={onExplore}
            className="text-xs font-semibold text-[#00647c] hover:underline font-geist flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredOpportunities.slice(0, 3).map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onSelect={onSelectOpportunity}
              onAskAI={() => onNavigateRAG()}
            />
          ))}
        </div>
      </section>

      {/* Role Selection Call to Action */}
      <section className="bg-[#e6eeff] rounded-3xl p-8 sm:p-12 border border-[#d9e3f6]">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#121c2a] font-display">
            Join the platform in the role that fits you
          </h2>
          <p className="text-sm text-[#3e484d]">
            Create an account to unlock a role-specific workspace. Your permissions and navigation are assigned securely after sign-in.
          </p>

          <div className="grid sm:grid-cols-4 gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="p-4 bg-white rounded-xl border border-[#d9e3f6] hover:border-[#00647c] shadow-xs text-center flex flex-col items-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <GraduationCap size={24} className="text-[#00647c]" />
              <span className="font-bold text-xs text-[#121c2a] font-display">Learner</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="p-4 bg-white rounded-xl border border-[#d9e3f6] hover:border-[#00647c] shadow-xs text-center flex flex-col items-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <Building2 size={24} className="text-[#00647c]" />
              <span className="font-bold text-xs text-[#121c2a] font-display">Provider</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="p-4 bg-white rounded-xl border border-[#d9e3f6] hover:border-[#00647c] shadow-xs text-center flex flex-col items-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <Heart size={24} className="text-[#00647c]" />
              <span className="font-bold text-xs text-[#121c2a] font-display">Sponsor</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="p-4 bg-white rounded-xl border border-[#d9e3f6] hover:border-[#00647c] shadow-xs text-center flex flex-col items-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <Users size={24} className="text-[#00647c]" />
              <span className="font-bold text-xs text-[#121c2a] font-display">Admin</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
