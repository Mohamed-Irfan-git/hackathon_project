import React from 'react';
import type { Opportunity } from '../types';
import { OpportunityCard } from '../components/common/OpportunityCard';
import { YouTubePreviewCard } from '../components/common/YouTubePreview';
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Compass,
  GraduationCap,
  Heart,
  Search,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  Users,
  Award,
  Star,
  HelpCircle,
  Video,
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  featuredOpportunities: Opportunity[];
  onSelectOpportunity: (opp: Opportunity) => void;
  onNavigateRAG: (query?: string) => void;
  onExplore: () => void;
  onMessageProvider?: (opp: Opportunity) => void;
  onViewProvider?: (providerId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  featuredOpportunities,
  onSelectOpportunity,
  onNavigateRAG,
  onExplore,
  onMessageProvider,
  onViewProvider,
}) => {
  const opportunityCount = featuredOpportunities.length;
  const freeCount = featuredOpportunities.filter((opportunity) => opportunity.price === 0).length;

  const featuredVideos = [
    {
      id: 'dQw4w9WgXcQ',
      title: 'A/L Combined Mathematics - Integration & Algebra Demystified',
      instructor: 'Kasun Perera (Univ. of Moratuwa)',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      tag: 'Mathematics Tuition',
    },
    {
      id: 'kJQP7kiw5Fk',
      title: 'Full-Stack Web Development Bootcamp Overview',
      instructor: 'Nimesha Fernando (Univ. of Colombo)',
      url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      tag: 'ICT & Programming',
    },
    {
      id: 'fJ9rUzIMcZQ',
      title: 'Mock Technical Interview & Resume Review Session',
      instructor: 'Dilshan Silva (Software Engineer & Mentor)',
      url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
      tag: 'Career Mentorship',
    },
  ];

  const dbVideos = (featuredOpportunities || [])
    .filter((opp) => opp.video_url && opp.video_url.trim())
    .map((opp) => ({
      id: opp.id,
      title: opp.title,
      url: opp.video_url!,
      instructor: opp.provider_name || 'Verified Provider',
      tag: opp.subject || opp.type || 'Course',
    }));

  const displayVideos = dbVideos.length > 0 ? dbVideos : featuredVideos;

  const samplePrompts = [
    'What A/L ICT tuition sessions are available online?',
    'Are there any full scholarships for engineering students in Sri Lanka?',
    'How can I find a mentor for mock technical interviews?',
    'Where can I apply for community educational sponsorships?',
  ];

  const testimonials = [
    {
      quote:
        'Finding an affordable Combined Maths tutor from University of Moratuwa changed my A/L results completely. Direct chat made it so easy to clarify doubts before enrolling!',
      name: 'Kavindu Senanayake',
      role: 'A/L Physical Science Student',
      location: 'Kandy',
      avatar: 'K',
      stars: 5,
    },
    {
      quote:
        'As a university student, TakeUForward gives me the platform to share my software engineering knowledge while supporting high schoolers in my home town.',
      name: 'Shenali De Silva',
      role: 'Undergraduate & Mentor (Univ. of Colombo)',
      location: 'Colombo',
      avatar: 'S',
      stars: 5,
    },
    {
      quote:
        'The grounded AI assistant helped me find verified scholarships that matched my exact budget and stream without any clickbait links.',
      name: 'Mohamed Aslam',
      role: 'ICT Student & Scholarship Recipient',
      location: 'Jaffna',
      avatar: 'M',
      stars: 5,
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
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
              <button type="button" onClick={() => onNavigateRAG()} className="inline-flex items-center gap-2 rounded-xl border border-[#fea619]/50 bg-white px-5 py-3 text-sm font-semibold text-[#855300] transition-colors hover:bg-[#fff7ed]">
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
              <button type="button" onClick={() => onNavigateRAG()} className="flex w-full items-center gap-3 rounded-xl border border-[#fea619]/40 p-3 text-left transition-colors hover:bg-[#fff7ed]"><div className="rounded-lg bg-[#fff7ed] p-2 text-[#ea580c]"><BookOpen size={18} /></div><span><b className="block text-sm text-[#121c2a]">Ask about scholarships or ICT</b><small className="text-xs text-[#6e797e]">Answers cite verified platform knowledge</small></span><ArrowRight className="ml-auto text-[#ea580c]" size={16} /></button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#f8f9ff] p-3 text-center"><div><b className="block text-xl text-[#00647c]">{opportunityCount}</b><span className="text-[11px] text-[#6e797e]">live opportunities</span></div><div><b className="block text-xl text-emerald-700">{freeCount}</b><span className="text-[11px] text-[#6e797e]">free / sponsored</span></div></div>
          </div>
        </div>
      </section>

      {/* Role Cards Section */}
      <section className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
        {[
          { icon: GraduationCap, title: 'For learners', text: 'Build a profile, receive relevant AI matches, and book opportunities that suit your budget.', action: 'Create learner account' },
          { icon: Building2, title: 'For providers', text: 'Turn your skills into tutoring, courses, workshops, and career support opportunities.', action: 'Become a provider' },
          { icon: Heart, title: 'For sponsors', text: 'Pledge support for learners and help make education more accessible.', action: 'Support a learner' },
        ].map(({ icon: Icon, title, text, action }) => (
          <button key={title} type="button" onClick={() => onOpenAuth('register')} className="group rounded-2xl border border-[#d9e3f6] bg-white p-6 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-[#00647c] hover:shadow-md">
            <Icon className="mb-4 text-[#00647c]" size={26} />
            <h2 className="font-bold text-[#121c2a] font-display">{title}</h2>
            <p className="mt-2 text-xs leading-relaxed text-[#3e484d]">{text}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#00647c]">{action} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span>
          </button>
        ))}
      </section>

      {/* Available Now Section */}
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#00647c]">Available now</p>
            <h2 className="mt-1 text-2xl font-bold text-[#121c2a] font-display">Explore learning opportunities</h2>
            <p className="mt-1 text-xs text-[#6e797e]">Open an opportunity to see the details. Sign in only when you are ready to book.</p>
          </div>
          <button type="button" onClick={onExplore} className="text-xs font-semibold text-[#00647c] hover:underline">
            View all opportunities →
          </button>
        </div>
        {featuredOpportunities.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredOpportunities.slice(0, 3).map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onSelect={onSelectOpportunity}
                onAskAI={() => onNavigateRAG(`Tell me about ${opportunity.title}`)}
                onMessageProvider={onMessageProvider}
                onViewProvider={onViewProvider}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#d9e3f6] bg-white p-8 text-center text-sm text-[#6e797e]">
            Opportunities will appear here as verified providers publish them.
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* REDESIGNED LANDING PAGE EXTENSION (SECTIONS BELOW AVAILABLE NOW)           */}
      {/* ========================================================================= */}

      {/* 1. Featured Video Showcase with YouTube Link Thumbnails */}
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff7ed] border border-[#f97316]/30 text-xs font-bold text-[#c2410c] font-geist">
            <Video size={14} className="text-[#ea580c]" />
            <span>Video Learning & Demo Sessions</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#121c2a] font-display">
            Watch University Mentors & Tutors in Action
          </h2>
          <p className="text-xs text-[#6e797e] leading-relaxed">
            Preview real class demos, Combined Maths walkthroughs, and career coaching sessions published by verified university providers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 pt-2">
          {displayVideos.map((vid) => (
            <div
              key={vid.id}
              className="bg-white rounded-2xl border border-[#d9e3f6] p-4 shadow-xs hover:shadow-lg hover:border-[#00647c] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#e6eeff] text-[#00647c] uppercase font-geist">
                    {vid.tag}
                  </span>
                  <span className="text-[11px] text-[#6e797e] flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-[#00647c]" /> Verified
                  </span>
                </div>
                <YouTubePreviewCard url={vid.url} title={vid.title} />
              </div>
              <div className="pt-3 border-t border-[#eff4ff] mt-3 flex items-center justify-between">
                <span className="text-xs font-medium text-[#3e484d] truncate">
                  {vid.instructor}
                </span>
                <button
                  type="button"
                  onClick={onExplore}
                  className="text-xs font-semibold text-[#00647c] hover:underline shrink-0"
                >
                  Explore Class
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. How It Works (3-Step Learner & Provider Connection Flow) */}
      <section className="mx-auto max-w-6xl rounded-3xl border border-[#d9e3f6] bg-gradient-to-b from-[#f8f9ff] to-white p-8 sm:p-12 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#00647c] font-geist">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl font-extrabold text-[#121c2a] font-display">
            How TakeUForward Connects Knowledge to Need
          </h2>
          <p className="text-xs text-[#6e797e]">
            Seamless journey from discovering opportunities to direct messaging and verified session bookings.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="p-6 rounded-2xl bg-white border border-[#d9e3f6] shadow-xs relative space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#e6eeff] text-[#00647c] flex items-center justify-center font-bold text-lg font-display">
              01
            </div>
            <h3 className="text-lg font-bold text-[#121c2a] font-display flex items-center gap-2">
              <Compass size={18} className="text-[#00647c]" />
              Discover & AI Match
            </h3>
            <p className="text-xs text-[#3e484d] leading-relaxed font-geist">
              Browse O/L & A/L tuition, ICT workshops, and mentorship. Use AI matching to find options tailored to your location and budget.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#d9e3f6] shadow-xs relative space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center font-bold text-lg font-display">
              02
            </div>
            <h3 className="text-lg font-bold text-[#121c2a] font-display flex items-center gap-2">
              <MessageSquare size={18} className="text-[#ea580c]" />
              Direct Provider Chat
            </h3>
            <p className="text-xs text-[#3e484d] leading-relaxed font-geist">
              Message university tutors directly in real-time. Discuss course outlines, flexible timing, and share demo video links before booking.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#d9e3f6] shadow-xs relative space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg font-display">
              03
            </div>
            <h3 className="text-lg font-bold text-[#121c2a] font-display flex items-center gap-2">
              <Award size={18} className="text-emerald-700" />
              Enroll or Apply Sponsor
            </h3>
            <p className="text-xs text-[#3e484d] leading-relaxed font-geist">
              Send a 1-click booking request or request community sponsorship if you require financial assistance.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Community Impact & Platform Metrics Showcase */}
      <section className="mx-auto max-w-6xl rounded-3xl bg-[#121c2a] p-8 sm:p-12 text-white shadow-xl">
        <div className="grid md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
          <div className="p-4 space-y-1">
            <Users size={28} className="mx-auto text-[#00647c] mb-2" />
            <b className="block text-3xl font-extrabold font-display">500+</b>
            <span className="text-xs text-slate-400 font-geist">Verified University Tutors</span>
          </div>

          <div className="p-4 space-y-1">
            <GraduationCap size={28} className="mx-auto text-[#fea619] mb-2" />
            <b className="block text-3xl font-extrabold font-display">1,200+</b>
            <span className="text-xs text-slate-400 font-geist">Learners Supported</span>
          </div>

          <div className="p-4 space-y-1">
            <Star size={28} className="mx-auto text-amber-400 mb-2" />
            <b className="block text-3xl font-extrabold font-display">98.4%</b>
            <span className="text-xs text-slate-400 font-geist">Satisfaction Rating</span>
          </div>

          <div className="p-4 space-y-1">
            <Heart size={28} className="mx-auto text-rose-500 mb-2" />
            <b className="block text-3xl font-extrabold font-display">LKR 450K+</b>
            <span className="text-xs text-slate-400 font-geist">Sponsorship Pledges</span>
          </div>
        </div>
      </section>

      {/* 4. Student & Mentor Testimonial Cards */}
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00647c] font-geist">
            Community Impact
          </span>
          <h2 className="text-2xl font-extrabold text-[#121c2a] font-display">
            What Our Learners & Tutors Say
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#d9e3f6] p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#00647c] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-[#3e484d] leading-relaxed italic font-geist">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#eff4ff]">
                <div className="w-9 h-9 rounded-full bg-[#00647c] text-white font-bold text-xs flex items-center justify-center font-display shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#121c2a] font-display">{t.name}</h4>
                  <p className="text-[11px] text-[#6e797e]">{t.role} • {t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Grounded RAG Assistant Interactive Prompt Chips */}
      <section className="mx-auto max-w-6xl rounded-3xl border border-[#fea619]/40 bg-gradient-to-br from-[#fff7ed] via-white to-[#ffedd5] p-8 sm:p-12 text-center space-y-6 shadow-xs">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#ea580c] text-white mx-auto flex items-center justify-center shadow-md">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-bold font-display text-[#121c2a] sm:text-3xl">
            Grounded AI Opportunity Assistant
          </h2>
          <p className="text-xs text-[#684000] leading-relaxed font-geist">
            Unlike standard AI chatbots, TakeUForward's assistant retrieves verified platform knowledge base sources before answering. Try clicking a sample question below:
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onNavigateRAG(prompt)}
              className="px-4 py-2 bg-white border border-[#fea619]/50 hover:border-[#ea580c] hover:bg-[#fff7ed] text-[#855300] text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 font-geist"
            >
              <HelpCircle size={14} className="text-[#ea580c]" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onNavigateRAG()}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#855300] hover:bg-[#684000] text-white px-6 py-3 text-xs font-semibold shadow-md transition-colors font-geist"
        >
          <span>Launch AI RAG Assistant</span>
          <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
};
