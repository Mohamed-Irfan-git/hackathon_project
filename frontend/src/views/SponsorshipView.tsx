import React, { useState } from 'react';
import type { UserRole, Sponsorship, SponsorshipRequest } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { MetricTile } from '../components/common/MetricTile';
import { Heart, HeartHandshake, PlusCircle, Users, CheckCircle2 } from 'lucide-react';

interface SponsorshipViewProps {
  role: UserRole;
  sponsorships: Sponsorship[];
  requests: SponsorshipRequest[];
  onCreatePledge: (req: SponsorshipRequest, amount: number, note: string) => void;
  onCreateRequest?: (title: string, reason: string, amount: number) => Promise<void>;
}

export const SponsorshipView: React.FC<SponsorshipViewProps> = ({
  role,
  sponsorships,
  requests,
  onCreatePledge,
  onCreateRequest,
}) => {
  const [selectedReq, setSelectedReq] = useState<SponsorshipRequest | null>(null);
  const [pledgeAmount, setPledgeAmount] = useState<number>(5000);
  const [pledgeNote, setPledgeNote] = useState('');
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [isRequestModal, setIsRequestModal] = useState(false);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [requestAmount, setRequestAmount] = useState<number>(0);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const totalContributed = sponsorships.reduce((sum, s) => sum + s.amount, 0);

  const handlePledgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReq) {
      onCreatePledge(selectedReq, pledgeAmount, pledgeNote);
      setSelectedReq(null);
      setIsSuccessModal(true);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d9e3f6] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#121c2a] font-display">
            Sponsorship & Educational Support
          </h1>
          <p className="text-xs text-[#3e484d] mt-1">
            Empowering underprivileged Sri Lankan students through direct funding for courses, exam vouchers, and learning tools.
          </p>
        </div>

        {role === 'learner' && (
          <button
            type="button"
            onClick={() => setIsRequestModal(true)}
            className="px-4 py-2 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs font-geist self-start"
          >
            <PlusCircle size={14} />
            <span>Request Sponsorship</span>
          </button>
        )}
      </div>

      {/* Sponsor Impact Summary Strip (if sponsor or admin) */}
      {(role === 'sponsor' || role === 'admin') && (
        <div className="grid sm:grid-cols-3 gap-4">
          <MetricTile
            label="Total Pledged Contributions"
            value={`LKR ${totalContributed.toLocaleString()}`}
            icon={<Heart size={20} className="text-[#00647c]" />}
            subtext="Fully directed to student tuition"
          />
          <MetricTile
            label="Active Sponsorships"
            value={sponsorships.length}
            icon={<HeartHandshake size={20} className="text-[#00647c]" />}
            subtext="Students currently supported"
          />
          <MetricTile
            label="Pending Requests"
            value={requests.length}
            icon={<Users size={20} className="text-amber-600" />}
            subtext="Eligible candidates seeking funding"
          />
        </div>
      )}

      {/* Browse Sponsorship Requests Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#121c2a] font-display">
          Eligible Sponsorship Candidates
        </h2>

        {requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d9e3f6] bg-white p-8 text-center text-xs text-[#6e797e]">
            No sponsorship requests have been submitted yet. Candidate requests will appear here when this workflow is added to the live backend.
          </div>
        ) : <div className="grid md:grid-cols-2 gap-6">
          {requests.map((req) => {
            const percentRaised = Math.min(100, Math.round((req.amount_raised / req.amount_needed) * 100));
            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-[#d9e3f6] p-6 shadow-xs flex flex-col justify-between hover:border-[#00647c] transition-all space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-sm text-[#00647c] font-display">
                      {req.learner_name}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#e6eeff] text-[#004e61] font-geist">
                      {req.education_level}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-[#121c2a] mb-2">{req.title}</h3>
                  <p className="text-xs text-[#3e484d] line-clamp-3 leading-relaxed mb-4">
                    {req.reason}
                  </p>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[#6e797e] font-geist">
                      <span>Funded: LKR {req.amount_raised.toLocaleString()}</span>
                      <span className="font-bold text-[#121c2a]">Goal: LKR {req.amount_needed.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#eff4ff] overflow-hidden">
                      <div
                        className="h-full bg-[#00647c] rounded-full transition-all"
                        style={{ width: `${percentRaised}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#eff4ff] flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700 font-geist">
                    {percentRaised}% Funded
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReq(req);
                      setPledgeAmount(req.amount_needed - req.amount_raised || 5000);
                    }}
                    className="px-4 py-2 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-semibold rounded-lg transition-colors font-geist shadow-xs flex items-center gap-1"
                  >
                    <Heart size={14} />
                    <span>Pledge Support</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>}
      </div>

      {/* Sponsorship History Table */}
      <div className="bg-white rounded-2xl border border-[#d9e3f6] p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-[#121c2a] font-display">Sponsorship History</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#d9e3f6] bg-[#f8f9ff] text-[#6e797e] font-geist font-semibold uppercase">
                <th className="py-3 px-4">Sponsor</th>
                <th className="py-3 px-4">Recipient Learner</th>
                <th className="py-3 px-4">Opportunity</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-[#eff4ff]">
              {sponsorships.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-[#6e797e]">No sponsorship records yet.</td></tr> : sponsorships.map((s) => (
                <tr key={s.id} className="hover:bg-[#f8f9ff]">
                  <td className="py-3 px-4 font-semibold text-[#121c2a]">{s.sponsor_name}</td>
                  <td className="py-3 px-4 text-[#3e484d]">{s.learner_name || 'Not specified'}</td>
                  <td className="py-3 px-4 text-[#3e484d] max-w-[200px] truncate">
                    {s.opportunity_title || 'General ICT Sponsorship'}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#121c2a]">
                    LKR {s.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <Badge type={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pledge Creation Modal */}
      {isRequestModal && (
        <Modal isOpen={isRequestModal} onClose={() => setIsRequestModal(false)} title="Request Educational Sponsorship" maxWidth="md">
          <form onSubmit={async (event) => { event.preventDefault(); if (!onCreateRequest) return; setIsSubmittingRequest(true); try { await onCreateRequest(requestTitle, requestReason, requestAmount); setIsRequestModal(false); setRequestTitle(''); setRequestReason(''); setRequestAmount(0); } finally { setIsSubmittingRequest(false); } }} className="space-y-4">
            <p className="text-xs text-[#3e484d]">Describe the learning opportunity you need help funding. Sponsors can see this request, not your private profile details.</p>
            <div><label className="mb-1 block text-xs font-semibold">Request title</label><input required value={requestTitle} onChange={(event) => setRequestTitle(event.target.value)} placeholder="e.g. A/L ICT tuition support" className="w-full rounded-lg border border-[#d9e3f6] px-3 py-2 text-xs" /></div>
            <div><label className="mb-1 block text-xs font-semibold">Why do you need support?</label><textarea required value={requestReason} onChange={(event) => setRequestReason(event.target.value)} rows={4} className="w-full rounded-lg border border-[#d9e3f6] px-3 py-2 text-xs" /></div>
            <div><label className="mb-1 block text-xs font-semibold">Amount needed (LKR)</label><input required min="1" type="number" value={requestAmount || ''} onChange={(event) => setRequestAmount(Number(event.target.value))} className="w-full rounded-lg border border-[#d9e3f6] px-3 py-2 text-xs" /></div>
            <button disabled={isSubmittingRequest} className="w-full rounded-lg bg-[#00647c] py-2 text-xs font-semibold text-white disabled:opacity-50">{isSubmittingRequest ? 'Submitting…' : 'Submit request'}</button>
          </form>
        </Modal>
      )}
      {selectedReq && (
        <Modal
          isOpen={Boolean(selectedReq)}
          onClose={() => setSelectedReq(null)}
          title={`Pledge Sponsorship for ${selectedReq.learner_name}`}
          maxWidth="md"
        >
          <form onSubmit={handlePledgeSubmit} className="space-y-4">
            <div className="p-3 bg-[#f8f9ff] rounded-xl border border-[#d9e3f6] text-xs space-y-1">
              <span className="font-bold text-[#121c2a] block">{selectedReq.title}</span>
              <span className="text-[#6e797e] block">{selectedReq.education_level}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3e484d] mb-1">
                Pledge Amount (LKR)
              </label>
              <input
                type="number"
                value={pledgeAmount}
                onChange={(e) => setPledgeAmount(Number(e.target.value))}
                min={1000}
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3e484d] mb-1">
                Encouragement Note for Student (Optional)
              </label>
              <textarea
                value={pledgeNote}
                onChange={(e) => setPledgeNote(e.target.value)}
                placeholder="Keep up the great work in ICT!"
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c]"
              />
            </div>

            <p className="text-[11px] text-[#6e797e] leading-snug">
              Note: In the MVP, confirming this pledge creates a verified sponsorship record without requiring credit card processing.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eff4ff]">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 border border-[#d9e3f6] text-[#3e484d] text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-semibold rounded-lg font-geist shadow-xs"
              >
                Confirm Pledge
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Success Modal */}
      {isSuccessModal && (
        <Modal
          isOpen={isSuccessModal}
          onClose={() => setIsSuccessModal(false)}
          title="Sponsorship Pledged Successfully!"
          maxWidth="sm"
        >
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <p className="text-xs text-[#3e484d] leading-relaxed">
              Thank you! Your pledge record has been created. The learner will be notified of your educational sponsorship.
            </p>
            <button
              type="button"
              onClick={() => setIsSuccessModal(false)}
              className="w-full py-2 bg-[#00647c] text-white text-xs font-semibold rounded-lg"
            >
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
