import React, { useState } from 'react';
import type { Opportunity, Booking, ProviderProfileData } from '../types';
import { MetricTile } from '../components/common/MetricTile';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { OpportunityCard } from '../components/common/OpportunityCard';
import {
  CheckCircle2,
  Clock,
  PlusCircle,
  Users,
  Layers,
  Sparkles,
  AlertCircle,
  XCircle,
  Edit2,
  LogOut,
} from 'lucide-react';

interface ProviderDashboardProps {
  provider: ProviderProfileData;
  opportunities: Opportunity[];
  bookings: Booking[];
  onCreateOpportunity: (data: Partial<Opportunity>) => void;
  onRespondBooking: (bookingId: string, decision: 'accepted' | 'rejected') => void;
  onUpdateProfile?: (data: { bio?: string; university?: string; faculty?: string; location?: string }) => void;
  activeTab?: 'provider-dashboard' | 'provider-opportunities' | 'provider-bookings' | 'provider-profile';
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  provider,
  opportunities,
  bookings,
  onCreateOpportunity,
  onRespondBooking,
  onUpdateProfile,
  activeTab = 'provider-dashboard',
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isSubmittingOpp, setIsSubmittingOpp] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Opportunity['type']>('COURSE');
  const [subject, setSubject] = useState('ICT');
  const [targetLevel, setTargetLevel] = useState('A/L Students');
  const [price, setPrice] = useState<number>(8500);
  const [deliveryMode, setDeliveryMode] = useState<'online' | 'in-person'>('online');
  const [location, setLocation] = useState('Online via Zoom');
  const [duration, setDuration] = useState('6 Weeks');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'active'>('active');
  
  // Profile edit form state
  const [profileForm, setProfileForm] = useState({
    bio: provider.bio || '',
    university: provider.university || '',
    faculty: provider.faculty || '',
    location: provider.location || '',
  });

  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const acceptedBookings = bookings.filter((b) => b.status === 'accepted');
  const rejectedBookings = bookings.filter((b) => b.status === 'rejected');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOpp(true);
    try {
      await onCreateOpportunity({
        provider_id: provider.id,
        provider_name: provider.organization_name,
        provider_verified: provider.verification_status === 'verified',
        title,
        type,
        subject,
        target_level: targetLevel,
        price: Number(price),
        delivery_mode: deliveryMode,
        location,
        duration,
        description,
        status,
      });

      setIsFormOpen(false);
      // Reset fields
      setTitle('');
      setDescription('');
      setPrice(8500);
    } finally {
      setIsSubmittingOpp(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      await onUpdateProfile({
        bio: profileForm.bio,
        university: profileForm.university,
        faculty: profileForm.faculty,
        location: profileForm.location,
      });
    }
    setIsProfileEditOpen(false);
  };

  // Determine what to render based on activeTab
  const isDashboardTab = activeTab === 'provider-dashboard';
  const isOpportunitiesTab = activeTab === 'provider-opportunities';
  const isBookingsTab = activeTab === 'provider-bookings';
  const isProfileTab = activeTab === 'provider-profile';

  return (
    <div className="space-y-6">
      {/* Verification Notice Banner if Pending */}
      {provider.verification_status === 'pending' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-600 shrink-0" />
            <span>
              Your provider profile is <strong>Pending Verification</strong>. Your opportunities will display a pending badge until verified.
            </span>
          </div>
        </div>
      )}

      {/* TAB: Dashboard */}
      {isDashboardTab && (
        <div className="space-y-6">
          {/* Header with Provider Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d9e3f6] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#121c2a] font-display">
                  {provider.organization_name}
                </h1>
                <Badge type={provider.verification_status} />
              </div>
              <p className="text-xs text-[#3e484d] mt-1">
                Provider Portal Dashboard
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2.5 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs font-geist self-start"
            >
              <PlusCircle size={16} />
              <span>Create Opportunity</span>
            </button>
          </div>

          {/* Impact Metric Strip */}
          <div className="grid sm:grid-cols-3 gap-4">
            <MetricTile
              label="Learners Reached"
              value={provider.total_students ?? 0}
              icon={<Users size={20} className="text-[#00647c]" />}
              subtext="Enrolled across all courses"
            />
            <MetricTile
              label="Sessions Completed"
              value={provider.sessions_completed ?? 0}
              icon={<CheckCircle2 size={20} className="text-emerald-600" />}
              subtext="Completed educational sessions"
            />
            <MetricTile
              label="Active Opportunities"
              value={opportunities.length}
              icon={<Layers size={20} className="text-[#00647c]" />}
              subtext="Published & draft offerings"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[#d9e3f6] p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#6e797e] mb-1">Pending Requests</p>
                  <p className="text-2xl font-bold text-[#121c2a]">{pendingBookings.length}</p>
                </div>
                <Clock size={32} className="text-amber-600 opacity-20" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#d9e3f6] p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#6e797e] mb-1">Accepted Bookings</p>
                  <p className="text-2xl font-bold text-emerald-600">{acceptedBookings.length}</p>
                </div>
                <CheckCircle2 size={32} className="text-emerald-600 opacity-20" />
              </div>
            </div>
          </div>

          {/* Recent Pending Requests */}
          {pendingBookings.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#d9e3f6] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-amber-600" />
                <h2 className="text-base font-bold text-[#121c2a] font-display">
                  Recent Pending Requests ({pendingBookings.length})
                </h2>
              </div>

              <div className="space-y-3">
                {pendingBookings.slice(0, 3).map((bk) => (
                  <div
                    key={bk.id}
                    className="p-4 rounded-xl bg-[#f8f9ff] border border-[#d9e3f6] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-[#121c2a]">{bk.learner_name}</span>
                        <Badge type={bk.status} />
                      </div>
                      <h4 className="font-semibold text-xs text-[#00647c]">
                        {bk.opportunity_title}
                      </h4>
                      <span className="text-[11px] text-[#6e797e] block">
                        Requested: {new Date(bk.date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onRespondBooking(bk.id, 'rejected')}
                        className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors font-geist flex items-center gap-1"
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onRespondBooking(bk.id, 'accepted')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors font-geist shadow-xs flex items-center gap-1"
                      >
                        <CheckCircle2 size={14} />
                        <span>Accept</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: My Opportunities */}
      {isOpportunitiesTab && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d9e3f6] pb-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[#121c2a] font-display">
                My Opportunities
              </h1>
              <p className="text-xs text-[#3e484d] mt-1">
                Manage and view all your educational offerings
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2.5 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs font-geist self-start"
            >
              <PlusCircle size={16} />
              <span>Create Opportunity</span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#121c2a] font-display">All Opportunities</h2>
            <span className="text-xs text-[#6e797e] font-geist font-medium">
              Total: {opportunities.length}
            </span>
          </div>

          {opportunities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#d9e3f6] p-8 shadow-xs text-center">
              <Layers size={48} className="mx-auto text-[#d9e3f6] mb-3 opacity-50" />
              <p className="text-sm text-[#6e797e] mb-4">No opportunities created yet</p>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="px-4 py-2 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <PlusCircle size={14} className="inline mr-2" />
                Create Your First Opportunity
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Booking Requests */}
      {isBookingsTab && (
        <div className="space-y-6">
          <div className="border-b border-[#d9e3f6] pb-4">
            <h1 className="text-2xl font-extrabold text-[#121c2a] font-display">
              Booking Requests
            </h1>
            <p className="text-xs text-[#3e484d] mt-1">
              Manage learner booking requests and responses
            </p>
          </div>

          {/* Pending Bookings */}
          {pendingBookings.length > 0 && (
            <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-amber-900">
                ⏳ Pending ({pendingBookings.length})
              </h3>
              <div className="space-y-3">
                {pendingBookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-4 rounded-xl bg-white border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-[#121c2a]">{bk.learner_name}</span>
                        <Badge type={bk.status} />
                      </div>
                      <h4 className="font-semibold text-xs text-[#00647c]">
                        {bk.opportunity_title}
                      </h4>
                      <span className="text-[11px] text-[#6e797e] block">
                        Requested: {new Date(bk.date).toLocaleDateString()} • Fee:{' '}
                        {bk.price === 0 ? 'Free' : `LKR ${bk.price.toLocaleString()}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onRespondBooking(bk.id, 'rejected')}
                        className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors font-geist flex items-center gap-1"
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onRespondBooking(bk.id, 'accepted')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors font-geist shadow-xs flex items-center gap-1"
                      >
                        <CheckCircle2 size={14} />
                        <span>Accept</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accepted Bookings */}
          {acceptedBookings.length > 0 && (
            <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-emerald-900">
                ✅ Accepted ({acceptedBookings.length})
              </h3>
              <div className="space-y-3">
                {acceptedBookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-4 rounded-xl bg-white border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-[#121c2a]">{bk.learner_name}</span>
                        <Badge type={bk.status} />
                      </div>
                      <h4 className="font-semibold text-xs text-[#00647c]">
                        {bk.opportunity_title}
                      </h4>
                      <span className="text-[11px] text-[#6e797e] block">
                        Accepted: {new Date(bk.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejected Bookings */}
          {rejectedBookings.length > 0 && (
            <div className="bg-white rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-rose-900">
                ❌ Rejected ({rejectedBookings.length})
              </h3>
              <div className="space-y-3">
                {rejectedBookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-4 rounded-xl bg-white border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-[#121c2a]">{bk.learner_name}</span>
                        <Badge type={bk.status} />
                      </div>
                      <h4 className="font-semibold text-xs text-[#00647c]">
                        {bk.opportunity_title}
                      </h4>
                      <span className="text-[11px] text-[#6e797e] block">
                        Rejected: {new Date(bk.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingBookings.length === 0 && acceptedBookings.length === 0 && rejectedBookings.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#d9e3f6] p-8 shadow-xs text-center">
              <Clock size={48} className="mx-auto text-[#d9e3f6] mb-3 opacity-50" />
              <p className="text-sm text-[#6e797e]">No booking requests yet</p>
            </div>
          )}
        </div>
      )}

      {/* TAB: Profile */}
      {isProfileTab && (
        <div className="space-y-6">
          <div className="border-b border-[#d9e3f6] pb-4">
            <h1 className="text-2xl font-extrabold text-[#121c2a] font-display">
              Profile & Verification
            </h1>
            <p className="text-xs text-[#3e484d] mt-1">
              Manage your profile information and verification status
            </p>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#121c2a] font-display">Profile & Settings</h2>
            <button
              type="button"
              onClick={() => setIsProfileEditOpen(true)}
              className="px-4 py-2 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Edit2 size={14} />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* Profile Info Display */}
          <div className="bg-white rounded-2xl border border-[#d9e3f6] p-6 shadow-xs space-y-4">
            <div>
              <p className="text-xs text-[#6e797e] mb-1">Organization Name</p>
              <p className="text-base font-bold text-[#121c2a]">{provider.organization_name}</p>
            </div>

            {provider.bio && (
              <div>
                <p className="text-xs text-[#6e797e] mb-1">Bio</p>
                <p className="text-sm text-[#3e484d]">{provider.bio}</p>
              </div>
            )}

            {provider.university && (
              <div>
                <p className="text-xs text-[#6e797e] mb-1">University</p>
                <p className="text-sm text-[#3e484d]">{provider.university}</p>
              </div>
            )}

            {provider.location && (
              <div>
                <p className="text-xs text-[#6e797e] mb-1">Location</p>
                <p className="text-sm text-[#3e484d]">{provider.location}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-[#6e797e] mb-1">Verification Status</p>
              <Badge type={provider.verification_status} />
            </div>

            <div>
              <p className="text-xs text-[#6e797e] mb-1">Total Students</p>
              <p className="text-sm text-[#3e484d]">{provider.total_students ?? 0} learners</p>
            </div>

            <div>
              <p className="text-xs text-[#6e797e] mb-1">Sessions Completed</p>
              <p className="text-sm text-[#3e484d]">{provider.sessions_completed ?? 0} sessions</p>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-2xl border border-[#d9e3f6] p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#121c2a] font-display">Account Actions</h3>
            <button
              type="button"
              className="w-full px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Opportunity Form Modal */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title="Create New Educational Opportunity"
          maxWidth="xl"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#3e484d] mb-1">
                Opportunity Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. G.C.E. A/L ICT Python & Database Masterclass"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#3e484d] mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] bg-[#f8f9ff] focus:outline-none focus:border-[#00647c]"
                >
                  <option value="COURSE">COURSE</option>
                  <option value="TUITION">TUITION</option>
                  <option value="WORKSHOP">WORKSHOP</option>
                  <option value="MENTORSHIP">MENTORSHIP</option>
                  <option value="MOCK_INTERVIEW">MOCK_INTERVIEW</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3e484d] mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="e.g. ICT, Computer Science"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#3e484d] mb-1">Target Level</label>
                <input
                  type="text"
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                  required
                  placeholder="e.g. A/L Students"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3e484d] mb-1">Price (LKR)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  min={0}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3e484d] mb-1">Mode</label>
                <select
                  value={deliveryMode}
                  onChange={(e) => setDeliveryMode(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] bg-[#f8f9ff] focus:outline-none focus:border-[#00647c]"
                >
                  <option value="online">Online</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#3e484d] mb-1">Location / Venue</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Zoom / Google Meet / Address"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3e484d] mb-1">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 6 Weeks (12 Sessions)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3e484d] mb-1">Full Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                placeholder="Detail syllabus coverage, prerequisites, and learning outcomes..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c]"
              />
            </div>

            {/* AI Vector Embedding Notice */}
            <div className="p-3.5 rounded-xl bg-[#fff7ed] border border-[#fea619]/40 text-xs flex items-center gap-2">
              <Sparkles size={16} className="text-[#ea580c] shrink-0" />
              <span className="text-[#684000]">
                <strong>AI Vector Match:</strong> Saving generates a semantic embedding for AI learner matching.
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#eff4ff]">
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#3e484d] font-semibold">Status:</label>
                <button
                  type="button"
                  onClick={() => setStatus(status === 'active' ? 'draft' : 'active')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md border ${
                    status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {status === 'active' ? 'Active' : 'Draft'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-[#d9e3f6] text-[#3e484d] text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOpp}
                  className="px-5 py-2 bg-[#00647c] hover:bg-[#004e61] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs font-geist"
                >
                  {isSubmittingOpp ? 'Saving & Embedding...' : 'Save & Embed'}
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Profile Edit Modal */}
      {isProfileEditOpen && (
        <Modal
          isOpen={isProfileEditOpen}
          onClose={() => setIsProfileEditOpen(false)}
          title="Edit Provider Profile"
          maxWidth="lg"
        >
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#3e484d] mb-1">
                Organization Name
              </label>
              <input
                type="text"
                value={provider.organization_name}
                disabled
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] bg-[#f8f9ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3e484d] mb-1">Bio</label>
              <textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                rows={3}
                placeholder="Tell learners about your experience and expertise..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3e484d] mb-1">University</label>
              <input
                type="text"
                value={profileForm.university}
                onChange={(e) => setProfileForm({ ...profileForm, university: e.target.value })}
                placeholder="Your university or institution"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3e484d] mb-1">Faculty / Department</label>
              <input
                type="text"
                value={profileForm.faculty}
                onChange={(e) => setProfileForm({ ...profileForm, faculty: e.target.value })}
                placeholder="Your faculty or department"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3e484d] mb-1">Location</label>
              <input
                type="text"
                value={profileForm.location}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                placeholder="City or region"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#eff4ff]">
              <button
                type="button"
                onClick={() => setIsProfileEditOpen(false)}
                className="px-4 py-2 border border-[#d9e3f6] text-[#3e484d] text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-semibold rounded-lg shadow-xs font-geist"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
