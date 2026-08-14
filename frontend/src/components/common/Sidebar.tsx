import React from 'react';
import type { UserRole } from '../../types';
import {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  Sparkles,
  HeartHandshake,
  User,
  ShieldAlert,
  Database,
  CheckCircle,
  Layers,
  X,
  MessageSquare,
} from 'lucide-react';

export type NavTab =
  | 'learner-dashboard'
  | 'discover'
  | 'bookings'
  | 'messages'
  | 'rag'
  | 'sponsorship'
  | 'profile'
  | 'provider-dashboard'
  | 'provider-opportunities'
  | 'provider-bookings'
  | 'provider-profile'
  | 'sponsor-dashboard'
  | 'sponsor-browse'
  | 'sponsor-history'
  | 'admin-impact'
  | 'admin-knowledge'
  | 'admin-providers'
  | 'admin-opportunities';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  bookingCount?: number;
  pendingProviderCount?: number;
  unreadMessageCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
  bookingCount = 0,
  pendingProviderCount = 0,
  unreadMessageCount = 0,
}) => {
  if (currentRole === 'public') return null;

  interface MenuItem {
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    isAI?: boolean;
  }

  let menuItems: MenuItem[] = [];

  if (currentRole === 'learner') {
    menuItems = [
      { id: 'learner-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { id: 'discover', label: 'Discover Opportunities', icon: <Compass size={18} /> },
      { id: 'bookings', label: 'My Bookings', icon: <CalendarCheck size={18} />, badge: bookingCount ? String(bookingCount) : undefined },
      { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} />, badge: unreadMessageCount ? String(unreadMessageCount) : undefined },
      { id: 'rag', label: 'AI RAG Assistant', icon: <Sparkles size={18} />, isAI: true },
      { id: 'sponsorship', label: 'Sponsorships', icon: <HeartHandshake size={18} /> },
      { id: 'profile', label: 'My Profile', icon: <User size={18} /> },
    ];
  } else if (currentRole === 'provider') {
    menuItems = [
      { id: 'provider-dashboard', label: 'Provider Portal', icon: <LayoutDashboard size={18} /> },
      { id: 'provider-opportunities', label: 'My Opportunities', icon: <Layers size={18} /> },
      { id: 'provider-bookings', label: 'Booking Requests', icon: <CalendarCheck size={18} />, badge: bookingCount ? String(bookingCount) : undefined },
      { id: 'messages', label: 'Messages', icon: <MessageSquare size={18} />, badge: unreadMessageCount ? String(unreadMessageCount) : undefined },
      { id: 'provider-profile', label: 'Profile & Verification', icon: <CheckCircle size={18} /> },
    ];
  } else if (currentRole === 'sponsor') {
    menuItems = [
      { id: 'sponsor-dashboard', label: 'Sponsor Portal', icon: <LayoutDashboard size={18} /> },
      { id: 'sponsor-browse', label: 'Browse Sponsorships', icon: <Compass size={18} /> },
      { id: 'sponsor-history', label: 'Pledge History', icon: <HeartHandshake size={18} /> },
    ];
  } else if (currentRole === 'admin') {
    menuItems = [
      { id: 'admin-impact', label: 'Impact Summary', icon: <LayoutDashboard size={18} /> },
      { id: 'admin-knowledge', label: 'Knowledge Base (RAG)', icon: <Database size={18} /> },
      { id: 'admin-providers', label: 'Provider Queue', icon: <CheckCircle size={18} />, badge: pendingProviderCount ? String(pendingProviderCount) : undefined },
      { id: 'admin-opportunities', label: 'Opportunity Moderation', icon: <ShieldAlert size={18} /> },
    ];
  }


  const navContent = (
    <div className="flex flex-col h-full bg-[#f8f9ff] border-r border-[#d9e3f6] p-4 w-[260px]">
      {/* Role Indicator Banner */}
      <div className="mb-6 p-3 rounded-xl bg-[#e6eeff] border border-[#d9e3f6] flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold text-[#6e797e] font-geist uppercase tracking-wider block">
            Workspace Mode
          </span>
          <span className="text-xs font-bold text-[#00647c] capitalize font-display block">
            {currentRole} Dashboard
          </span>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden p-1 text-[#6e797e] hover:text-[#121c2a]"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white text-[#00647c] font-semibold shadow-xs border border-[#d9e3f6] border-l-4 border-l-[#00647c]'
                  : 'text-[#3e484d] hover:bg-[#e6eeff] hover:text-[#121c2a]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-[#00647c]' : item.isAI ? 'text-[#ea580c]' : 'text-[#6e797e]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#00647c] text-white font-geist">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* RAG Assistant Promo Box inside Sidebar */}
      <div className="mt-auto pt-4 border-t border-[#d9e3f6]">
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] border border-[#fea619]/40 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#855300] font-display mb-1">
            <Sparkles size={14} className="text-[#ea580c]" />
            <span>AI Opportunity RAG</span>
          </div>
          <p className="text-[11px] text-[#684000] leading-snug mb-2.5">
            Ask verified questions about scholarships, A/L ICT subjects, and internships.
          </p>
          <button
            type="button"
            onClick={() => {
              onSelectTab('rag');
              onCloseMobile();
            }}
            className="w-full py-1.5 bg-[#855300] hover:bg-[#684000] text-white text-[11px] font-semibold rounded-lg transition-colors text-center font-geist"
          >
            Launch Assistant
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[260px] shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-[260px] h-full shadow-2xl">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
