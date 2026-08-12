import React from 'react';
import type { Opportunity } from '../types';
import { OpportunityCard } from '../components/common/OpportunityCard';
import { ArrowRight, BookOpen, Building2, CheckCircle2, Compass, GraduationCap, Heart, Search, ShieldCheck, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  featuredOpportunities: Opportunity[];
  onSelectOpportunity: (opp: Opportunity) => void;
  onNavigateRAG: () => void;
  onExplore: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, featuredOpportunities, onSelectOpportunity, onNavigateRAG, onExplore }) => {
  const opportunityCount = featuredOpportunities.length;
  const freeCount = featuredOpportunities.filter((opportunity) => opportunity.price === 0).length;

  return (
    <div className="space-y-16 pb-16">
      <section className="relative isolate overflow-hidden rounded-3xl border border-[#d9e3f6] bg-gradient-to-br from-[#e6eeff] via-white to-[#fff7ed] px-6 py-10 sm:px-12 sm:py-16">
        <div className="absolute -right-16 -top-16 -z-10 h-64 w-64 rounded-full bg-[#b7eaff]/60 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 -z-10 h-52 w-52 rounded-full bg-[#fea619]/20 blur-3xl" />
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#b7eaff] bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#00647c] shadow-xs">
              <Sparkles size={14} className="text-[#ea580c]" />
              Sri Lanka’s learning opportunity platform
            </div>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-[#121c2a] sm:text-6xl font-display">
              Find the next step for your <span className="text-[#00647c]">future.</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-[#3e484d] sm:text-lg">
              Discover affordable learning opportunities, get matched to what fits your goals, and ask grounded questions about scholarships, courses, and career pathways.
            </p>
            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <button type="button" onClick={onExplore} className="inline-flex items-center gap-2 rounded-xl bg-[#00647c] px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#004e61]">
                Explore opportunities <ArrowRight size={16} />
              </button>
              <button type="button" onClick={onNavigateRAG} className="inline-flex items-center gap-2 rounded-xl border border-[#fea619]/50 bg-white px-5 py-3 text-sm font-semibold text-[#855300] transition-colors hover:bg-[#fff7ed]">
                <Sparkles size={16} className="text-[#ea580c]" /> Ask the AI assistant
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-medium text-[#3e484d] lg:justify-start">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#00647c]" /> Browse without an account</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#00647c]" /> Verified knowledge sources only</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#d9e3f6] bg-white/90 p-5 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-[#eff4ff] pb-4">
              <div><p className="text-xs font-semibold uppercase tracking-wider text-[#00647c]">Start discovering</p><h2 className="mt-1 text-lg font-bold text-[#121c2a] font-display">What are you looking for?</h2></div>
              <div className="rounded-xl bg-[#fff7ed] p-2 text-[#ea580c]"><Search size={20} /></div>
            </div>
            <div className="mt-4 space-y-3">
              <button type="button" onClick={onExplore} className="flex w-full items-center gap-3 rounded-xl border border-[#d9e3f6] p-3 text-left transition-colors hover:border-[#00647c] hover:bg-[#f8f9ff]"><div className="rounded-lg bg-[#e6eeff] p-2 text-[#00647c]"><Compass size={18} /></div><span><b className="block text-sm text-[#121c2a]">Browse learning opportunities</b><small className="text-xs text-[#6e797e]">Courses, tuition, workshops and mentoring</small></span><ArrowRight className="ml-auto text-[#00647c]" size={16} /></button>
              <button type="button" onClick={onNavigateRAG} className="flex w-full items-center gap-3 rounded-xl border border-[#fea619]/40 p-3 text-left transition-colors hover:bg-[#fff7ed]"><div className="rounded-lg bg-[#fff7ed] p-2 text-[#ea580c]"><BookOpen size={18} /></div><span><b className="block text-sm text-[#121c2a]">Ask about scholarships or ICT</b><small className="text-xs text-[#6e797e]">Answers cite verified platform knowledge</small></span><ArrowRight className="ml-auto text-[#ea580c]" size={16} /></button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#f8f9ff] p-3 text-center"><div><b className="block text-xl text-[#00647c]">{opportunityCount}</b><span className="text-[11px] text-[#6e797e]">live opportunities</span></div><div><b className="block text-xl text-emerald-700">{freeCount}</b><span className="text-[11px] text-[#6e797e]">free / sponsored</span></div></div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
        {[{ icon: GraduationCap, title: 'For learners', text: 'Build a profile, receive relevant AI matches, and book opportunities that suit your budget.', action: 'Create learner account' }, { icon: Building2, title: 'For providers', text: 'Turn your skills into tutoring, courses, workshops, and career support opportunities.', action: 'Become a provider' }, { icon: Heart, title: 'For sponsors', text: 'Pledge support for learners and help make education more accessible.', action: 'Support a learner' }].map(({ icon: Icon, title, text, action }) => <button key={title} type="button" onClick={() => onOpenAuth('register')} className="group rounded-2xl border border-[#d9e3f6] bg-white p-6 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-[#00647c] hover:shadow-md"><Icon className="mb-4 text-[#00647c]" size={26} /><h2 className="font-bold text-[#121c2a] font-display">{title}</h2><p className="mt-2 text-xs leading-relaxed text-[#3e484d]">{text}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#00647c]">{action} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span></button>)}
      </section>

      <section className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-[#00647c]">Available now</p><h2 className="mt-1 text-2xl font-bold text-[#121c2a] font-display">Explore learning opportunities</h2><p className="mt-1 text-xs text-[#6e797e]">Open an opportunity to see the details. Sign in only when you are ready to book.</p></div><button type="button" onClick={onExplore} className="text-xs font-semibold text-[#00647c] hover:underline">View all opportunities →</button></div>
        {featuredOpportunities.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{featuredOpportunities.slice(0, 3).map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} onSelect={onSelectOpportunity} onAskAI={() => onNavigateRAG()} />)}</div> : <div className="rounded-2xl border border-dashed border-[#d9e3f6] bg-white p-8 text-center text-sm text-[#6e797e]">Opportunities will appear here as verified providers publish them.</div>}
      </section>

      <section className="mx-auto max-w-6xl rounded-3xl bg-[#00647c] p-8 text-center text-white sm:p-12"><Sparkles className="mx-auto text-[#fea619]" size={28} /><h2 className="mt-4 text-2xl font-bold font-display sm:text-3xl">Guidance you can trust, not a generic chatbot.</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/80">The assistant retrieves only verified platform knowledge before responding. If there is no relevant source, it says so instead of inventing an answer.</p><button type="button" onClick={onNavigateRAG} className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#00647c] transition-colors hover:bg-[#e6eeff]">Try the grounded assistant</button></section>
    </div>
  );
};
