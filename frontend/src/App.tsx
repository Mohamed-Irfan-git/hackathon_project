import { useState, useEffect, useCallback } from 'react';
import type {
  UserRole,
  Opportunity,
  Booking,
  Sponsorship,
  SponsorshipRequest,
  KnowledgeBaseEntry,
  ImpactMetrics,
  ProviderProfileData,
  LearnerProfileData,
} from './types';
import { api } from './services/api';
import { Header } from './components/common/Header';
import { Sidebar, type NavTab } from './components/common/Sidebar';
import { AuthModal } from './components/auth/AuthModal';
import { isSupabaseConfigured, supabase } from './lib/supabase';

// Views
import { LandingPage } from './views/LandingPage';
import { LearnerDashboard } from './views/LearnerDashboard';
import { DiscoverOpportunities } from './views/DiscoverOpportunities';
import { MyBookings } from './views/MyBookings';
import { RAGAssistant } from './views/RAGAssistant';
import { SponsorshipView } from './views/SponsorshipView';
import { ProviderDashboard } from './views/ProviderDashboard';
import { AdminDashboard } from './views/AdminDashboard';

export function App() {
  // App state
  const [role, setRole] = useState<UserRole>('public');
  const [activeTab, setActiveTab] = useState<NavTab>('learner-dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Domain data
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfileData | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [recommendedOpps, setRecommendedOpps] = useState<Opportunity[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [sponsorshipRequests, setSponsorshipRequests] = useState<SponsorshipRequest[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseEntry[]>([]);
  const [providers, setProviders] = useState<ProviderProfileData[]>([]);
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetrics>({ active_providers: 0, learners_supported: 0, total_bookings: 0, sponsored_learners: 0, sponsorship_amount: 0, opportunities_count: 0 });

  // UI state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [ragInitialQuery, setRagInitialQuery] = useState<string | undefined>();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingOpportunityId, setBookingOpportunityId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(isSupabaseConfigured);
  const [profileForm, setProfileForm] = useState({ education_level: '', interests: '', subjects: '', location: '', learning_goals: '', budget_max: '', availability: '' });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load initial data from service
  const loadData = async (userId?: string, userRole?: UserRole) => {
    setIsLoading(true);
    try {
      setOpportunities(await api.getOpportunities());
      if (!userId || !userRole) return;
      if (userRole === 'learner') {
        const { data } = await supabase.from('learner_profiles').select('*').eq('user_id', userId).single();
        if (data) {
          setLearnerProfile({ id: data.user_id, user_id: data.user_id, full_name: userName, education_level: data.education_level, field_of_interest: data.interests?.join(', '), budget_max: data.budget_max ? Number(data.budget_max) : undefined, location: data.location });
          setProfileForm({ education_level: data.education_level ?? '', interests: data.interests?.join(', ') ?? '', subjects: data.subjects?.join(', ') ?? '', location: data.location ?? '', learning_goals: data.learning_goals ?? '', budget_max: data.budget_max?.toString() ?? '', availability: data.availability ?? '' });
        } else setActiveTab('profile');
        try { setRecommendedOpps(await api.getRecommendedOpportunities(userId)); } catch { setRecommendedOpps([]); }
        setBookings(await api.getBookings(userId));
      }
      if (userRole === 'sponsor') { const [history, requests] = await Promise.all([api.getSponsorships(), api.getSponsorshipRequests()]); setSponsorships(history); setSponsorshipRequests(requests); }
      if (userRole === 'admin') {
        const [metrics, kb, providerRows] = await Promise.all([api.getImpactSummary(), api.getKnowledgeBase(), api.getProviders()]);
        setImpactMetrics(metrics); setKnowledgeBase(kb); setProviders(providerRows);
      }
      if (userRole === 'provider') {
        const { data } = await supabase.from('provider_profiles').select('*').eq('user_id', userId).single();
        if (data) setProviders([{ id: data.user_id, user_id: data.user_id, organization_name: userName, bio: data.bio, verification_status: data.status }]);
        const [providerOpportunities, providerBookings] = await Promise.all([api.getProviderOpportunities(userId), api.getBookings()]);
        setOpportunities(providerOpportunities); setBookings(providerBookings);
      }
    } catch (error) { showToast(error instanceof Error ? error.message : 'Unable to load live data.'); }
    finally { setIsLoading(false); }
  };

  // Sync role switch with default tabs
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'learner') setActiveTab('learner-dashboard');
    else if (newRole === 'provider') setActiveTab('provider-dashboard');
    else if (newRole === 'sponsor') setActiveTab('sponsor-dashboard');
    else if (newRole === 'admin') setActiveTab('admin-impact');
  };

  useEffect(() => {
    // Initial data loading intentionally updates the application data state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Authentication restoration updates state only after this external check completes.
    if (!isSupabaseConfigured) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthLoading(false);
      return;
    }

    const url = new URL(window.location.href);
    if (url.searchParams.get('confirmed') !== '1') return;
    url.searchParams.delete('confirmed');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    setAuthMode('login');
    setIsAuthOpen(true);
    showToast('Email confirmed. Sign in to continue.');
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) { setIsAuthLoading(false); return; }
    supabase.auth.getUser().then(async (result) => {
      const data = result.data;
      if (!data.user) return;
      let { data: appUser } = await supabase.from('users').select('role, full_name').eq('id', data.user.id).maybeSingle();
      if (!appUser) {
        const metadata = data.user.user_metadata ?? {};
        const role = ['learner', 'provider', 'sponsor'].includes(metadata.app_role)
          ? metadata.app_role as UserRole
          : 'learner';
        const fullName = typeof metadata.full_name === 'string' && metadata.full_name.trim()
          ? metadata.full_name.trim()
          : data.user.email?.split('@')[0] || 'User';
        const { error } = await supabase.functions.invoke('complete-profile', { body: { role, full_name: fullName, profile: {} } });
        if (error) throw error;
        ({ data: appUser } = await supabase.from('users').select('role, full_name').eq('id', data.user.id).single());
      }
      setIsLoggedIn(true); setCurrentUserId(data.user.id); setUserName(appUser?.full_name || data.user.email || 'User');
      if (appUser?.role) { handleRoleChange(appUser.role); void loadData(data.user.id, appUser.role); }
    }).finally(() => setIsAuthLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, []);

  // Handlers for user interactions
  const handleBookOpportunity = async (opp: Opportunity) => {
    if (!currentUserId) { setAuthMode('login'); setIsAuthOpen(true); return; }
    setBookingOpportunityId(opp.id);
    try {
      await api.createBooking(opp.id);
      await loadData(currentUserId, 'learner');
      setActiveTab('bookings');
      showToast(`Booking requested for "${opp.title}". You can track its status in My Bookings.`);
    } catch (error) { showToast(error instanceof Error ? error.message : 'Booking failed.'); }
    finally { setBookingOpportunityId(null); }
  };

  const handleAskRAG = (query: string) => {
    setRagInitialQuery(query);
    setActiveTab('rag');
  };
  const handleSearchOpportunities = useCallback(async (filters: { subject?: string; level?: string; location?: string; search?: string }) => {
    try { setOpportunities(await api.getOpportunities(filters)); }
    catch (error) { showToast(error instanceof Error ? error.message : 'Search failed.'); }
  }, []);

  const handleRespondBooking = async (bookingId: string, decision: 'accepted' | 'rejected') => {
    try { await api.respondBooking(bookingId, decision); if (currentUserId) await loadData(currentUserId, 'provider'); showToast(`Booking request ${decision}.`); } catch (error) { showToast(error instanceof Error ? error.message : 'Booking update failed.'); }
  };

  const handleCreateOpportunity = async (data: Partial<Opportunity>) => {
    try { const newOpp = await api.upsertOpportunity(data); setOpportunities((prev) => [newOpp, ...prev]); showToast(newOpp.status === 'draft' ? `Saved "${newOpp.title}" as a draft. It can be published after verification.` : `Opportunity "${newOpp.title}" published and embedded.`); } catch (error) { showToast(error instanceof Error ? error.message : 'Opportunity save failed.'); }
  };

  const handleCreatePledge = async (
    req: SponsorshipRequest,
    amount: number,
    note: string
  ) => {
    void note;
    try { const newSponsorship = await api.createSponsorship({
      learner_id: req.learner_id,
      amount, sponsorship_request_id: req.id,
    });
    setSponsorships((prev) => [newSponsorship, ...prev]); setSponsorshipRequests((prev) => prev.map((item) => item.id === req.id ? { ...item, amount_raised: item.amount_raised + amount } : item)); showToast(`Pledged LKR ${amount.toLocaleString()} for ${req.learner_name}.`); } catch (error) { showToast(error instanceof Error ? error.message : 'Sponsorship failed.'); }
  };

  const handleVerifyProvider = async (providerId: string, decision: 'verified' | 'rejected') => {
    const updated = await api.verifyProvider(providerId, decision);
    setProviders((prev) => prev.map((p) => (p.id === providerId ? { ...p, ...updated } : p)));
    showToast(`Provider status updated to ${decision}!`);
  };

  const handleUpsertKnowledge = async (entry: Partial<KnowledgeBaseEntry>) => {
    const newKb = await api.upsertKnowledgeBaseEntry(entry);
    setKnowledgeBase((prev) => [newKb, ...prev]);
    showToast(`Knowledge base entry "${newKb.title}" saved!`);
  };

  const handleToggleKnowledgeStatus = async (id: string) => {
    const entry = knowledgeBase.find((item) => item.id === id); if (!entry) return;
    const updated = await api.toggleKnowledgeStatus(entry);
    setKnowledgeBase((prev) => prev.map((kb) => (kb.id === id ? updated : kb)));
    showToast(`Entry status toggled to ${updated.status}!`);
  };
  const handleIndexKnowledge = async () => {
    try {
      const result = await api.indexVerifiedKnowledge();
      showToast(`Knowledge indexing complete: ${result.indexed} indexed, ${result.skipped} already current, ${result.failed} failed.`);
      if (currentUserId) await loadData(currentUserId, 'admin');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Knowledge indexing failed.'); }
  };
  const handleCreateSponsorshipRequest = async (title: string, reason: string, amount: number) => {
    await api.createSponsorshipRequest({ title, reason, amount_needed: amount });
    showToast('Sponsorship request submitted for review.');
  };

  if (isAuthLoading) return <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-6"><div className="rounded-2xl border border-[#d9e3f6] bg-white px-6 py-5 text-center shadow-xs"><div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#e6eeff] border-t-[#00647c]" /><p className="text-sm font-semibold text-[#121c2a]">Restoring your workspace…</p><p className="mt-1 text-xs text-[#6e797e]">Checking your secure sign-in session.</p></div></div>;

  const displayedLearner: LearnerProfileData = learnerProfile ?? { id: currentUserId ?? '', user_id: currentUserId ?? '', full_name: userName };
  const currentProvider = providers.find((provider) => provider.user_id === currentUserId) || { id: currentUserId ?? '', user_id: currentUserId ?? '', organization_name: userName, verification_status: 'pending' as const };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col font-sans">
      {/* Header */}
      <Header
        currentRole={role}
        onHome={() => {
          if (isLoggedIn) handleRoleChange(role);
          else { setRole('public'); setActiveTab('learner-dashboard'); }
        }}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        onNavigateRAG={() => handleAskRAG('Show verified ICT scholarships')}
        onToggleSidebarMobile={() => setIsMobileSidebarOpen(true)}
        userName={userName}
        isLoggedIn={isLoggedIn}
        onLogout={() => {
          void supabase.auth.signOut();
          setIsLoggedIn(false);
          setRole('public');
          showToast('Signed out successfully.');
        }}
      />

      {/* Main Body */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto flex">
        {/* Sidebar */}
        <Sidebar
          currentRole={role}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          bookingCount={role === 'provider' ? bookings.filter((booking) => booking.status === 'pending').length : bookings.length}
          pendingProviderCount={providers.filter((provider) => provider.verification_status === 'pending').length}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {isLoading && <div className="rounded-xl border border-[#d9e3f6] bg-white p-4 text-xs text-[#6e797e]">Loading live Supabase data…</div>}
          {/* Public Landing View */}
          {role === 'public' && activeTab !== 'discover' && activeTab !== 'rag' && (
            <LandingPage
              onOpenAuth={(mode) => {
                setAuthMode(mode);
                setIsAuthOpen(true);
              }}
              featuredOpportunities={opportunities}
              onSelectOpportunity={() => setIsAuthOpen(true)}
              onNavigateRAG={() => handleAskRAG('What scholarships are available?')}
              onExplore={() => setActiveTab('discover')}
            />
          )}

          {role === 'public' && activeTab === 'discover' && (
            <DiscoverOpportunities
              opportunities={opportunities}
              onBookOpportunity={() => { setAuthMode('register'); setIsAuthOpen(true); showToast('Create a learner account to book an opportunity.'); }}
              onAskRAG={handleAskRAG}
              onSearch={handleSearchOpportunities}
              recommendedOpportunities={recommendedOpps}
              bookingOpportunityId={bookingOpportunityId}
              bookings={bookings}
              isAuthenticated={false}
            />
          )}

          {role === 'public' && activeTab === 'rag' && (
            <RAGAssistant initialQuery={ragInitialQuery} onClearInitialQuery={() => setRagInitialQuery(undefined)} />
          )}

          {/* Learner Views */}
          {role === 'learner' && (
            <>
              {activeTab === 'learner-dashboard' && (
                <LearnerDashboard
                  profile={displayedLearner}
                  recommendedOpportunities={recommendedOpps}
                  upcomingBookings={bookings.filter((b) => b.status === 'accepted')}
                  onSelectOpportunity={() => setActiveTab('discover')}
                  onBookOpportunity={handleBookOpportunity}
                  onNavigateTab={setActiveTab}
                  onAskRAG={handleAskRAG}
                />
              )}

              {activeTab === 'discover' && (
                <DiscoverOpportunities
                  opportunities={opportunities}
                  onBookOpportunity={handleBookOpportunity}
                  onAskRAG={handleAskRAG}
                  onSearch={handleSearchOpportunities}
                  recommendedOpportunities={recommendedOpps}
                  bookingOpportunityId={bookingOpportunityId}
                  bookings={bookings}
                  isAuthenticated={isLoggedIn && role === 'learner'}
                />
              )}

              {activeTab === 'bookings' && (
                <MyBookings
                  bookings={bookings}
                  onNavigateDiscover={() => setActiveTab('discover')}
                />
              )}

              {activeTab === 'rag' && (
                <RAGAssistant
                  initialQuery={ragInitialQuery}
                  learnerId={currentUserId ?? undefined}
                  onClearInitialQuery={() => setRagInitialQuery(undefined)}
                />
              )}

              {activeTab === 'sponsorship' && (
                <SponsorshipView
                  role={role}
                  sponsorships={sponsorships}
                  requests={sponsorshipRequests}
                  onCreatePledge={handleCreatePledge}
                  onCreateRequest={handleCreateSponsorshipRequest}
                />
              )}

              {activeTab === 'profile' && (
                <div className="bg-white rounded-[24px] border border-[#d9e3f6] p-8 md:p-10 shadow-sm max-w-[850px] w-full">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-[#121c2a] font-display">Learner Profile & Embedding Settings</h2>
                    <p className="text-[15px] text-[#6e797e] mt-2">Keep your details updated to get the best AI-powered opportunity matches.</p>
                  </div>
                  
                  <form className="space-y-6" onSubmit={async (event) => {
                    event.preventDefault();
                    if (!currentUserId) return;
                    try {
                      const { error: userError } = await supabase.from('users').update({ full_name: userName, updated_at: new Date().toISOString() }).eq('id', currentUserId);
                      if (userError) throw userError;
                      await api.updateLearnerProfile(currentUserId, { education_level: profileForm.education_level, interests: profileForm.interests.split(',').map((item) => item.trim()).filter(Boolean), subjects: profileForm.subjects.split(',').map((item) => item.trim()).filter(Boolean), location: profileForm.location, learning_goals: profileForm.learning_goals, budget_max: profileForm.budget_max ? Number(profileForm.budget_max) : undefined, availability: profileForm.availability });
                      await api.embedLearnerProfile(currentUserId);
                      await loadData(currentUserId, 'learner');
                      showToast('Profile saved and AI matching embedding refreshed.');
                    } catch (error) { showToast(error instanceof Error ? error.message : 'Profile update failed.'); }
                  }}>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#121c2a] block">Full Name</label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="w-full px-4 py-3 bg-[#f8f9ff]/50 border border-[#d9e3f6] rounded-2xl focus:ring-2 focus:ring-[#00647c]/20 focus:border-[#00647c] outline-none transition-all text-[#3e484d]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#121c2a] block">Education Level</label>
                        <input
                          type="text"
                          value={profileForm.education_level}
                          onChange={(event) => setProfileForm((current) => ({ ...current, education_level: event.target.value }))}
                          className="w-full px-4 py-3 bg-[#f8f9ff]/50 border border-[#d9e3f6] rounded-2xl focus:ring-2 focus:ring-[#00647c]/20 focus:border-[#00647c] outline-none transition-all text-[#3e484d]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#121c2a] block">Field of Interest</label>
                      <input
                        type="text"
                        value={profileForm.interests}
                        onChange={(event) => setProfileForm((current) => ({ ...current, interests: event.target.value }))}
                        placeholder="e.g. ICT, web development, design"
                        className="w-full px-4 py-3 bg-[#f8f9ff]/50 border border-[#d9e3f6] rounded-2xl focus:ring-2 focus:ring-[#00647c]/20 focus:border-[#00647c] outline-none transition-all text-[#3e484d]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#121c2a] block">Subjects</label>
                        <input 
                          type="text"
                          value={profileForm.subjects} 
                          onChange={(event) => setProfileForm((current) => ({ ...current, subjects: event.target.value }))} 
                          placeholder="Subjects, comma separated" 
                          className="w-full px-4 py-3 bg-[#f8f9ff]/50 border border-[#d9e3f6] rounded-2xl focus:ring-2 focus:ring-[#00647c]/20 focus:border-[#00647c] outline-none transition-all text-[#3e484d]" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#121c2a] block">Location</label>
                        <input 
                          type="text"
                          value={profileForm.location} 
                          onChange={(event) => setProfileForm((current) => ({ ...current, location: event.target.value }))} 
                          placeholder="City or Region" 
                          className="w-full px-4 py-3 bg-[#f8f9ff]/50 border border-[#d9e3f6] rounded-2xl focus:ring-2 focus:ring-[#00647c]/20 focus:border-[#00647c] outline-none transition-all text-[#3e484d]" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#121c2a] block">Maximum Budget (LKR)</label>
                        <input 
                          type="number" 
                          min="0" 
                          value={profileForm.budget_max} 
                          onChange={(event) => setProfileForm((current) => ({ ...current, budget_max: event.target.value }))} 
                          placeholder="e.g. 5000" 
                          className="w-full px-4 py-3 bg-[#f8f9ff]/50 border border-[#d9e3f6] rounded-2xl focus:ring-2 focus:ring-[#00647c]/20 focus:border-[#00647c] outline-none transition-all text-[#3e484d]" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#121c2a] block">Learning Goals</label>
                      <textarea 
                        value={profileForm.learning_goals} 
                        onChange={(event) => setProfileForm((current) => ({ ...current, learning_goals: event.target.value }))} 
                        placeholder="What do you want to achieve?" 
                        rows={4}
                        className="w-full px-4 py-3 bg-[#f8f9ff]/50 border border-[#d9e3f6] rounded-2xl focus:ring-2 focus:ring-[#00647c]/20 focus:border-[#00647c] outline-none transition-all text-[#3e484d] resize-y" 
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-[#00647c] hover:bg-[#007f9d] text-white font-semibold rounded-xl font-geist shadow-sm transition-colors duration-200"
                      >
                        Save profile & regenerate match embedding
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}

          {/* Provider Views */}
          {role === 'provider' && (
            <>
              {(activeTab === 'provider-dashboard' ||
                activeTab === 'provider-opportunities' ||
                activeTab === 'provider-bookings' ||
                activeTab === 'provider-profile') && (
                <ProviderDashboard
                  provider={currentProvider}
                  opportunities={opportunities.filter((o) => o.provider_id === currentProvider.user_id)}
                  bookings={bookings}
                  onCreateOpportunity={handleCreateOpportunity}
                  onRespondBooking={handleRespondBooking}
                />
              )}
            </>
          )}

          {/* Sponsor Views */}
          {role === 'sponsor' && (
            <>
              {(activeTab === 'sponsor-dashboard' ||
                activeTab === 'sponsor-browse' ||
                activeTab === 'sponsor-history') && (
                <SponsorshipView
                  role={role}
                  sponsorships={sponsorships}
                  requests={sponsorshipRequests}
                  onCreatePledge={handleCreatePledge}
                />
              )}
            </>
          )}

          {/* Admin Views */}
          {role === 'admin' && (
            <>
              {(activeTab === 'admin-impact' ||
                activeTab === 'admin-knowledge' ||
                activeTab === 'admin-providers' ||
                activeTab === 'admin-opportunities') && (
                <AdminDashboard
                  impactMetrics={impactMetrics}
                  providers={providers}
                  knowledgeBase={knowledgeBase}
                  opportunities={opportunities}
                  onVerifyProvider={handleVerifyProvider}
                  onUpsertKnowledge={handleUpsertKnowledge}
                  onToggleKnowledgeStatus={handleToggleKnowledgeStatus}
                  onIndexKnowledge={handleIndexKnowledge}
                  activeTab={activeTab === 'admin-providers' ? 'providers' : activeTab === 'admin-knowledge' ? 'rag' : activeTab === 'admin-opportunities' ? 'opportunities' : 'metrics'}
                  onSelectTab={(tab) => setActiveTab(tab === 'providers' ? 'admin-providers' : tab === 'rag' ? 'admin-knowledge' : tab === 'opportunities' ? 'admin-opportunities' : 'admin-impact')}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#121c2a] text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold font-geist animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Auth Modal */}
      {isAuthOpen && (
        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authMode}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={(selectedRole, name) => {
            setIsLoggedIn(true);
            setUserName(name);
            handleRoleChange(selectedRole);
            if (selectedRole === 'learner') setActiveTab('profile');
            void supabase.auth.getUser().then(({ data }) => {
              if (data.user) { setCurrentUserId(data.user.id); void loadData(data.user.id, selectedRole); }
            });
            showToast(`Welcome ${name}! Switched to ${selectedRole} profile.`);
          }}
        />
      )}
    </div>
  );
}

export default App;
