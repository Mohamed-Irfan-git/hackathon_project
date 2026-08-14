import React, { useState } from 'react';
import type { Booking } from '../types';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { CalendarCheck, Clock, Video, MessageSquare } from 'lucide-react';

interface MyBookingsProps {
  bookings: Booking[];
  onNavigateDiscover: () => void;
  onContactProvider?: (booking: Booking) => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({ bookings, onNavigateDiscover, onContactProvider }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  const filtered = bookings.filter((b) => (filter === 'all' ? true : b.status === filter));

  return (
    <div className="space-y-6">
      {/* Title & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#d9e3f6] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#121c2a] font-display">My Bookings</h1>
          <p className="text-xs text-[#3e484d] mt-1">
            Track your course enrollments, tuition requests, and session status.
          </p>
        </div>

        <div className="flex items-center p-1 bg-[#e6eeff] rounded-xl border border-[#d9e3f6] text-xs font-medium font-geist self-start">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-white text-[#00647c] font-semibold shadow-xs'
                : 'text-[#3e484d] hover:text-[#121c2a]'
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'pending'
                ? 'bg-white text-[#00647c] font-semibold shadow-xs'
                : 'text-[#3e484d] hover:text-[#121c2a]'
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() => setFilter('accepted')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'accepted'
                ? 'bg-white text-[#00647c] font-semibold shadow-xs'
                : 'text-[#3e484d] hover:text-[#121c2a]'
            }`}
          >
            Accepted
          </button>
          <button
            type="button"
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'rejected'
                ? 'bg-white text-[#00647c] font-semibold shadow-xs'
                : 'text-[#3e484d] hover:text-[#121c2a]'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description="You don't have any bookings matching this status filter."
          actionLabel="Browse Opportunities"
          onAction={onNavigateDiscover}
          icon={<CalendarCheck size={28} />}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((bk) => (
            <div
              key={bk.id}
              className="bg-white rounded-xl border border-[#d9e3f6] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#00647c] transition-all"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#00647c] font-geist">
                    {bk.provider_name}
                  </span>
                  <Badge type={bk.status} />
                </div>
                <h3 className="font-bold text-base text-[#121c2a] font-display">
                  {bk.opportunity_title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#6e797e] font-geist">
                  <div className="flex items-center gap-1">
                    <Clock size={13} />
                    <span>Requested Date: {new Date(bk.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Video size={13} />
                    <span>Type: {bk.opportunity_type}</span>
                  </div>
                  <span className="font-semibold text-[#121c2a]">
                    {bk.price === 0 ? 'Free / Sponsored' : `LKR ${bk.price.toLocaleString()}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#eff4ff]">
                {onContactProvider && (
                  <button
                    type="button"
                    onClick={() => onContactProvider(bk)}
                    className="px-3.5 py-2 bg-[#e6eeff] hover:bg-[#d9e3f6] text-[#00647c] text-xs font-semibold rounded-lg transition-colors font-geist flex items-center gap-1.5"
                  >
                    <MessageSquare size={14} />
                    <span>Message Provider</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => alert(`Viewing session details for ${bk.opportunity_title}`)}
                  className="px-4 py-2 border border-[#d9e3f6] text-[#00647c] hover:bg-[#e6eeff] text-xs font-semibold rounded-lg transition-colors font-geist"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

