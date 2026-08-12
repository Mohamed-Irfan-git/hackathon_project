import React from 'react';
import type { UserRole } from '../../types';
import { Sparkles, LogIn, Menu, Shield, GraduationCap, Building2, Heart, Globe } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigateRAG: () => void;
  onToggleSidebarMobile: () => void;
  userName?: string;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onOpenAuth,
  onNavigateRAG,
  onToggleSidebarMobile,
  userName = 'Kamal Perera',
  isLoggedIn,
  onLogout,
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

          <div
            onClick={() => onRoleChange('public')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#00647c] flex items-center justify-center text-white font-bold text-lg font-display shadow-xs group-hover:bg-[#004e61] transition-colors">
              S
            </div>
            <div>
              <span className="font-extrabold text-lg text-[#121c2a] tracking-tight font-display block leading-none">
                TakeUForward
              </span>
              <span className="text-[10px] font-medium text-[#6e797e] font-geist tracking-wider uppercase block mt-0.5">
                Striver Platform
              </span>
            </div>
          </div>
        </div>

        {/* Center Role Switcher bar (Essential for overnight demo testing) */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-[#eff4ff] rounded-xl border border-[#d9e3f6] text-xs font-medium font-geist">
          <span className="px-2 text-[11px] text-[#6e797e] uppercase tracking-wider font-semibold">
            Demo Role:
          </span>
          <button
            type="button"
            onClick={() => onRoleChange('public')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              currentRole === 'public'
                ? 'bg-white text-[#00647c] font-semibold shadow-xs'
                : 'text-[#3e484d] hover:text-[#121c2a]'
            }`}
          >
            <Globe size={13} />
            <span>Public</span>
          </button>
          <button
            type="button"
            onClick={() => onRoleChange('learner')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              currentRole === 'learner'
                ? 'bg-white text-[#00647c] font-semibold shadow-xs'
                : 'text-[#3e484d] hover:text-[#121c2a]'
            }`}
          >
            <GraduationCap size={13} />
            <span>Learner</span>
          </button>
          <button
            type="button"
            onClick={() => onRoleChange('provider')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              currentRole === 'provider'
                ? 'bg-white text-[#00647c] font-semibold shadow-xs'
                : 'text-[#3e484d] hover:text-[#121c2a]'
            }`}
          >
            <Building2 size={13} />
            <span>Provider</span>
          </button>
          <button
            type="button"
            onClick={() => onRoleChange('sponsor')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              currentRole === 'sponsor'
                ? 'bg-white text-[#00647c] font-semibold shadow-xs'
                : 'text-[#3e484d] hover:text-[#121c2a]'
            }`}
          >
            <Heart size={13} />
            <span>Sponsor</span>
          </button>
          <button
            type="button"
            onClick={() => onRoleChange('admin')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              currentRole === 'admin'
                ? 'bg-white text-[#00647c] font-semibold shadow-xs'
                : 'text-[#3e484d] hover:text-[#121c2a]'
            }`}
          >
            <Shield size={13} />
            <span>Admin</span>
          </button>
        </div>

        {/* Right CTAs */}
        <div className="flex items-center gap-2 sm:gap-3">
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
