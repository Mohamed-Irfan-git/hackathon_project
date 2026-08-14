import React from 'react';
import type { UserRole } from '../../types';
import { Logo } from './Logo';
import { Sparkles, LogIn, Menu, Shield, Globe, MessageSquare } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onHome: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigateRAG: () => void;
  onNavigateMessages?: () => void;
  onToggleSidebarMobile: () => void;
  userName?: string;
  isLoggedIn: boolean;
  onLogout: () => void;
  unreadMessageCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onHome,
  onOpenAuth,
  onNavigateRAG,
  onNavigateMessages,
  onToggleSidebarMobile,
  userName = 'User',
  isLoggedIn,
  onLogout,
  unreadMessageCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#d9e3f6] shadow-xs">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left branding & mobile menu */}
        <div className="flex items-center gap-3">
          {currentRole !== 'public' && (
            <button
              type="button"
              onClick={onToggleSidebarMobile}
              className="lg:hidden p-2 text-[#3e484d] hover:bg-[#e6eeff] rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={20} />
            </button>
          )}

          <Logo onClick={onHome} size="md" />
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#eff4ff] rounded-xl border border-[#d9e3f6] text-xs font-semibold text-[#00647c] font-geist">
          {isLoggedIn ? <><Shield size={14} /><span className="capitalize">{currentRole} workspace</span></> : <><Globe size={14} /><span>Explore opportunities freely</span></>}
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Messages Quick Access Button */}
          {isLoggedIn && onNavigateMessages && (
            <button
              type="button"
              onClick={onNavigateMessages}
              className="relative p-2 text-[#00647c] hover:bg-[#e6eeff] border border-[#d9e3f6] rounded-lg transition-colors font-geist"
              title="View Messages"
            >
              <MessageSquare size={16} />
              {Boolean(unreadMessageCount && unreadMessageCount > 0) && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ea580c] text-white text-[9px] font-bold rounded-full flex items-center justify-center font-geist">
                  {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                </span>
              )}
            </button>
          )}

          {/* RAG Assistant quick trigger */}
          <button
            type="button"
            onClick={onNavigateRAG}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fff7ed] border border-[#f97316]/30 text-[#c2410c] hover:bg-[#ffedd5] text-xs font-semibold rounded-lg transition-colors font-geist ai-glow"
          >
            <Sparkles size={14} className="text-[#ea580c]" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>


          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#d9e3f6]">
                <div className="w-8 h-8 rounded-full bg-[#00647c] text-white flex items-center justify-center font-bold text-xs font-geist">
                  {userName.charAt(0)}
                </div>
                <div className="text-left leading-tight">
                  <span className="block font-semibold text-xs text-[#121c2a]">{userName}</span>
                  <span className="block text-[10px] text-[#6e797e] font-geist uppercase capitalize">
                    {currentRole}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-1.5 border border-[#bdc8ce] text-[#3e484d] hover:text-[#121c2a] hover:bg-[#f8f9ff] text-xs font-semibold rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-[#00647c] hover:bg-[#e6eeff] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-1.5 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
