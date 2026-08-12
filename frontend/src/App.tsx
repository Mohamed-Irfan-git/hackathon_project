import { useState, useEffect } from 'react';
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
import { MOCK_LEARNER } from './services/mockData';
import { Header } from './components/common/Header';
import { Sidebar, type NavTab } from './components/common/Sidebar';
import { AuthModal } from './components/auth/AuthModal';

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
  const [userName, setUserName] = useState('Kamal Perera');

  // Domain data
  const [learnerProfile] = useState<LearnerProfileData>(MOCK_LEARNER);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [recommendedOpps, setRecommendedOpps] = useState<Opportunity[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [sponsorshipRequests, setSponsorshipRequests] = useState<SponsorshipRequest[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseEntry[]>([]);
  const [providers, setProviders] = useState<ProviderProfileData[]>([]);
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetrics>({
    active_providers: 18,
    learners_supported: 1420,
    total_bookings: 385,
    sponsored_learners: 42,
    sponsorship_amount: 575000,
    opportunities_count: 26,
  });

  // UI state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [ragInitialQuery, setRagInitialQuery] = useState<string | undefined>();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load initial data from service
  const loadData = async () => {
    const opps = await api.getOpportunities();
    setOpportunities(opps);

    const recs = await api.getRecommendedOpportunities(learnerProfile.id);
    setRecommendedOpps(recs);

    const bks = await api.getBookings(learnerProfile.id);
    setBookings(bks);

    const sps = await api.getSponsorships();
    setSponsorships(sps);

    const reqs = await api.getSponsorshipRequests();
    setSponsorshipRequests(reqs);

    const kb = await api.getKnowledgeBase();
    setKnowledgeBase(kb);

    const provs = await api.getProviders();
    setProviders(provs);

    const metrics = await api.getImpactSummary();
    setImpactMetrics(metrics);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync role switch with default tabs
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'learner') setActiveTab('learner-dashboard');
    else if (newRole === 'provider') setActiveTab('provider-dashboard');
    else if (newRole === 'sponsor') setActiveTab('sponsor-dashboard');
    else if (newRole === 'admin') setActiveTab('admin-impact');
  };

  // Handlers for user interactions
  const handleBookOpportunity = async (opp: Opportunity) => {
    const newBk = await api.createBooking(opp.id, userName);
    setBookings((prev) => [newBk, ...prev]);
    showToast(`Booking requested for "${opp.title}"! Status: Pending.`);
  };

  const handleAskRAG = (query: string) => {
    setRagInitialQuery(query);
    if (role === 'public') setRole('learner');
    setActiveTab('rag');
  };

  const handleRespondBooking = async (bookingId: string, decision: 'accepted' | 'rejected') => {
    const updated = await api.respondBooking(bookingId, decision);
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
    showToast(`Booking request ${decision}!`);
  };

  const handleCreateOpportunity = async (data: Partial<Opportunity>) => {
    const newOpp = await api.upsertOpportunity(data);
    setOpportunities((prev) => [newOpp, ...prev]);
    showToast(`Opportunity "${newOpp.title}" created & embedded for AI matching!`);
  };

  const handleCreatePledge = async (
    req: SponsorshipRequest,
    amount: number,
    note: string
  ) => {
    const newSponsorship = await api.createSponsorship({
      learner_id: req.learner_id,
      learner_name: req.learner_name,
      amount,
      note,
    });
    setSponsorships((prev) => [newSponsorship, ...prev]);
    showToast(`Pledged LKR ${amount.toLocaleString()} for ${req.learner_name}!`);
  };

  const handleVerifyProvider = async (providerId: string, decision: 'verified' | 'rejected') => {
    const updated = await api.verifyProvider(providerId, decision);
    setProviders((prev) => prev.map((p) => (p.id === providerId ? updated : p)));
    showToast(`Provider status updated to ${decision}!`);
  };

  const handleUpsertKnowledge = async (entry: Partial<KnowledgeBaseEntry>) => {
    const newKb = await api.upsertKnowledgeBaseEntry(entry);
    setKnowledgeBase((prev) => [newKb, ...prev]);
    showToast(`Knowledge base entry "${newKb.title}" saved!`);
  };

  const handleToggleKnowledgeStatus = async (id: string) => {
    const updated = await api.toggleKnowledgeStatus(id);
    setKnowledgeBase((prev) => prev.map((kb) => (kb.id === id ? updated : kb)));
    showToast(`Entry status toggled to ${updated.status}!`);
  };

  const currentProvider = providers[0] || {
    id: 'prov-1',
    user_id: 'usr-prov-1',
    organization_name: 'DevAcademy Sri Lanka',
    verification_status: 'verified',
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col font-sans">
      {/* Header */}
      <Header
        currentRole={role}
        onRoleChange={handleRoleChange}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        onNavigateRAG={() => handleAskRAG('Show verified ICT scholarships')}
        onToggleSidebarMobile={() => setIsMobileSidebarOpen(true)}
        userName={userName}
        isLoggedIn={isLoggedIn}
        onLogout={() => {
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
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* Public Landing View */}
          {role === 'public' && (
            <LandingPage
              onNavigateRole={handleRoleChange}
              onOpenAuth={(mode) => {
                setAuthMode(mode);
                setIsAuthOpen(true);
              }}
              featuredOpportunities={opportunities}
              onSelectOpportunity={() => {
                handleRoleChange('learner');
                setActiveTab('discover');
              }}
              onNavigateRAG={() => handleAskRAG('What scholarships are available?')}
            />
          )}

          {/* Learner Views */}
          {role === 'learner' && (
            <>
              {activeTab === 'learner-dashboard' && (
                <LearnerDashboard
                  profile={learnerProfile}
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
                  onClearInitialQuery={() => setRagInitialQuery(undefined)}
                />
              )}

              {activeTab === 'sponsorship' && (
                <SponsorshipView
                  role={role}
                  sponsorships={sponsorships}
                  requests={sponsorshipRequests}
                  onCreatePledge={handleCreatePledge}
                />
              )}

              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl border border-[#d9e3f6] p-6 shadow-xs max-w-2xl space-y-4">
                  <h2 className="text-xl font-bold text-[#121c2a] font-display">Learner Profile & Embedding Settings</h2>
                  <div className="space-y-3 text-xs text-[#3e484d]">
                    <div>
                      <label className="font-semibold block text-[#121c2a]">Full Name</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg mt-1"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block text-[#121c2a]">Education Level</label>
                      <input
                        type="text"
                        value={learnerProfile.education_level}
                        readOnly
                        className="w-full px-3 py-2 border rounded-lg bg-gray-50 mt-1"
                      />
                    </div>
                    <div>
                      <label className="font-semibold block text-[#121c2a]">Field of Interest</label>
                      <input
                        type="text"
                        value={learnerProfile.field_of_interest}
                        readOnly
                        className="w-full px-3 py-2 border rounded-lg bg-gray-50 mt-1"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast('Learner vector embedding regenerated!')}
                      className="px-4 py-2 bg-[#00647c] text-white font-semibold rounded-lg font-geist"
                    >
                      Regenerate Match Embedding
                    </button>
                  </div>
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
                  opportunities={opportunities.filter((o) => o.provider_id === currentProvider.id || true)}
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
            showToast(`Welcome ${name}! Switched to ${selectedRole} profile.`);
          }}
        />
      )}
    </div>
  );
}

export default App;
