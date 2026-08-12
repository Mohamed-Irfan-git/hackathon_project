import React, { useState } from 'react';
import type {
  ImpactMetrics,
  ProviderProfileData,
  KnowledgeBaseEntry,
  Opportunity,
  KnowledgeCategory,
} from '../types';
import { MetricTile } from '../components/common/MetricTile';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  ShieldCheck,
  Users,
  Layers,
  HeartHandshake,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  PlusCircle,
} from 'lucide-react';

interface AdminDashboardProps {
  impactMetrics: ImpactMetrics;
  providers: ProviderProfileData[];
  knowledgeBase: KnowledgeBaseEntry[];
  opportunities: Opportunity[];
  onVerifyProvider: (providerId: string, decision: 'verified' | 'rejected') => void;
  onUpsertKnowledge: (entry: Partial<KnowledgeBaseEntry>) => void;
  onToggleKnowledgeStatus: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  impactMetrics,
  providers,
  knowledgeBase,
  opportunities,
  onVerifyProvider,
  onUpsertKnowledge,
  onToggleKnowledgeStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'providers' | 'rag' | 'opportunities'>('metrics');

  // KB Modal state
  const [isKbModalOpen, setIsKbModalOpen] = useState(false);
  const [kbTitle, setKbTitle] = useState('');
  const [kbCategory, setKbCategory] = useState<KnowledgeCategory>('scholarship');
  const [kbContent, setKbContent] = useState('');
  const [kbSourceUrl, setKbSourceUrl] = useState('');
  const [kbStatus, setKbStatus] = useState<'draft' | 'verified'>('verified');

  const pendingProviders = providers.filter((p) => p.verification_status === 'pending');

  const handleKbSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpsertKnowledge({
      title: kbTitle,
      category: kbCategory,
      content: kbContent,
      source_url: kbSourceUrl || undefined,
      status: kbStatus,
    });
    setIsKbModalOpen(false);
    setKbTitle('');
    setKbContent('');
    setKbSourceUrl('');
  };

  return (
    <div className="space-y-8">
      {/* Title & Top Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d9e3f6] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={24} className="text-[#00647c]" />
            <h1 className="text-2xl font-extrabold text-[#121c2a] font-display">
              Platform Administration & Oversight
            </h1>
          </div>
          <p className="text-xs text-[#3e484d] mt-1">
            Real-time platform impact summary, provider verification, RAG knowledge indexing, and moderation.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-[#e6eeff] rounded-xl border border-[#d9e3f6] text-xs font-medium font-geist self-start">
          <button
            type="button"
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'metrics'
                ? 'bg-white text-[#00647c] font-semibold shadow-xs'
                : 'text-[#3e484d] hover:text-[#121c2a]'
            }`}
          >
            Impact Summary
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('providers')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'providers'
                ? 'bg-white text-[#00647c] font-semibold shadow-xs'
                : 'text-[#3e484d] hover:text-[#121c2a]'
            }`}
          >
            Provider Queue ({pendingProviders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rag')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'rag'
                ? 'bg-white text-[#00647c] font-semibold shadow-xs'
                : 'text-[#3e484d] hover:text-[#121c2a]'
            }`}
          >
            Knowledge Base ({knowledgeBase.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('opportunities')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'opportunities'
                ? 'bg-white text-[#00647c] font-semibold shadow-xs'
                : 'text-[#3e484d] hover:text-[#121c2a]'
            }`}
          >
            Moderation
          </button>
        </div>
      </div>

      {/* 1. Impact Summary Tab */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricTile
              label="Active Providers"
              value={impactMetrics.active_providers}
              icon={<Users size={20} className="text-[#00647c]" />}
              subtext="Verified educational institutions"
            />
            <MetricTile
              label="Learners Supported"
              value={impactMetrics.learners_supported.toLocaleString()}
              icon={<Users size={20} className="text-emerald-600" />}
              subtext="Enrolled students platform-wide"
            />
            <MetricTile
              label="Total Bookings"
              value={impactMetrics.total_bookings}
              icon={<CalendarCheck size={20} className="text-[#00647c]" />}
              subtext="Completed & active sessions"
            />
            <MetricTile
              label="Sponsored Learners"
              value={impactMetrics.sponsored_learners}
              icon={<HeartHandshake size={20} className="text-amber-600" />}
              subtext="Received educational financial aid"
            />
            <MetricTile
              label="Total Sponsorship Amount"
              value={`LKR ${impactMetrics.sponsorship_amount.toLocaleString()}`}
              icon={<HeartHandshake size={20} className="text-[#00647c]" />}
              subtext="Pledged by sponsors"
            />
            <MetricTile
              label="Total Opportunities"
              value={impactMetrics.opportunities_count}
              icon={<Layers size={20} className="text-[#00647c]" />}
              subtext="Courses, tuition & workshops"
            />
          </div>

          <div className="p-4 bg-white rounded-2xl border border-[#d9e3f6] shadow-xs space-y-2">
            <h3 className="font-bold text-sm text-[#121c2a] font-display">Live Endpoint Verification</h3>
            <p className="text-xs text-[#3e484d] leading-relaxed">
              These metrics are pulled live from the <code>GET /functions/v1/impact-summary</code> endpoint for real-time demonstration during the hackathon evaluation.
            </p>
          </div>
        </div>
      )}

      {/* 2. Provider Verification Queue */}
      {activeTab === 'providers' && (
        <div className="bg-white rounded-2xl border border-[#d9e3f6] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#121c2a] font-display">
              Provider Verification Queue
            </h2>
            <span className="text-xs text-[#6e797e] font-geist">
              Pending ({pendingProviders.length})
            </span>
          </div>

          <div className="space-y-4">
            {providers.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-[#d9e3f6] bg-[#f8f9ff] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#121c2a]">{p.organization_name}</span>
                    <Badge type={p.verification_status} />
                  </div>
                  <p className="text-xs text-[#3e484d]">{p.bio}</p>
                  {p.website_url && (
                    <a
                      href={p.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#00647c] hover:underline font-geist"
                    >
                      {p.website_url}
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {p.verification_status === 'pending' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onVerifyProvider(p.id, 'rejected')}
                        className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors font-geist flex items-center gap-1"
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onVerifyProvider(p.id, 'verified')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors font-geist shadow-xs flex items-center gap-1"
                      >
                        <CheckCircle2 size={14} />
                        <span>Verify Provider</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-emerald-700 font-semibold font-geist flex items-center gap-1">
                      <ShieldCheck size={16} /> Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Knowledge Base Management (RAG) */}
      {activeTab === 'rag' && (
        <div className="bg-white rounded-2xl border border-[#d9e3f6] p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#121c2a] font-display">
                RAG Knowledge Base Management
              </h2>
              <p className="text-xs text-[#3e484d]">
                Only entries marked as <strong>Verified</strong> are retrievable by the RAG assistant.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsKbModalOpen(true)}
              className="px-4 py-2 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-semibold rounded-xl transition-colors font-geist flex items-center gap-1.5 shadow-xs self-start"
            >
              <PlusCircle size={14} />
              <span>Add KB Entry</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#d9e3f6] bg-[#f8f9ff] text-[#6e797e] font-geist font-semibold uppercase">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Source URL</th>
                  <th className="py-3 px-4">Indexing Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff4ff]">
                {knowledgeBase.map((kb) => (
                  <tr key={kb.id} className="hover:bg-[#f8f9ff]">
                    <td className="py-3 px-4 font-semibold text-[#121c2a] max-w-[260px]">
                      {kb.title}
                    </td>
                    <td className="py-3 px-4">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-[#e6eeff] text-[#004e61] font-geist">
                        {kb.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#6e797e] max-w-[150px] truncate">
                      {kb.source_url || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge type={kb.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onToggleKnowledgeStatus(kb.id)}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                          kb.status === 'verified'
                            ? 'border border-amber-200 text-amber-800 hover:bg-amber-50'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {kb.status === 'verified' ? 'Set to Draft' : 'Verify & Embed'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Opportunity Moderation */}
      {activeTab === 'opportunities' && (
        <div className="bg-white rounded-2xl border border-[#d9e3f6] p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#121c2a] font-display">
            All Opportunities Moderation
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#d9e3f6] bg-[#f8f9ff] text-[#6e797e] font-geist font-semibold uppercase">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Fee</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eff4ff]">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-[#f8f9ff]">
                    <td className="py-3 px-4 font-semibold text-[#121c2a]">{opp.title}</td>
                    <td className="py-3 px-4 text-[#3e484d]">{opp.provider_name}</td>
                    <td className="py-3 px-4 font-geist text-[#00647c]">{opp.type}</td>
                    <td className="py-3 px-4 font-bold">
                      {opp.price === 0 ? 'Free' : `LKR ${opp.price.toLocaleString()}`}
                    </td>
                    <td className="py-3 px-4">
                      <Badge type={opp.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add RAG KB Modal */}
      {isKbModalOpen && (
        <Modal
          isOpen={isKbModalOpen}
          onClose={() => setIsKbModalOpen(false)}
          title="Add Entry to Grounded RAG Knowledge Base"
          maxWidth="lg"
        >
          <form onSubmit={handleKbSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#3e484d] mb-1">
                Entry Title
              </label>
              <input
                type="text"
                value={kbTitle}
                onChange={(e) => setKbTitle(e.target.value)}
                required
                placeholder="e.g. Ministry of Higher Education IT Scholarship Scheme 2026"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#3e484d] mb-1">Category</label>
                <select
                  value={kbCategory}
                  onChange={(e) => setKbCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] bg-[#f8f9ff] focus:outline-none focus:border-[#00647c]"
                >
                  <option value="scholarship">scholarship</option>
                  <option value="internship">internship</option>
                  <option value="course">course</option>
                  <option value="workshop">workshop</option>
                  <option value="competition">competition</option>
                  <option value="career_opportunity">career_opportunity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3e484d] mb-1">Source URL</label>
                <input
                  type="url"
                  value={kbSourceUrl}
                  onChange={(e) => setKbSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3e484d] mb-1">Content / Document Text</label>
              <textarea
                value={kbContent}
                onChange={(e) => setKbContent(e.target.value)}
                required
                rows={5}
                placeholder="Full content snippet detailing eligibility, benefits, and submission process..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c]"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#eff4ff]">
              <div className="flex items-center gap-2">
                <label className="text-xs text-[#3e484d] font-semibold">Status:</label>
                <select
                  value={kbStatus}
                  onChange={(e) => setKbStatus(e.target.value as any)}
                  className="px-2 py-1 text-xs rounded border border-[#d9e3f6]"
                >
                  <option value="verified">Verified (RAG Searchable)</option>
                  <option value="draft">Draft (Private)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsKbModalOpen(false)}
                  className="px-4 py-2 border border-[#d9e3f6] text-[#3e484d] text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-semibold rounded-lg font-geist shadow-xs"
                >
                  Save & Index
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
