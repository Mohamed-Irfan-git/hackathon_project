import React, { useState } from 'react';
import type { UserRole } from '../../types';
import { Modal } from '../common/Modal';
import { GraduationCap, Building2, Heart, Mail, Lock, User, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onSuccess: (role: UserRole, userName: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'register',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>('learner');
  const [fullName, setFullName] = useState('Kamal Perera');
  const [email, setEmail] = useState('kamal.perera@example.com');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(mode === 'register' ? selectedRole : 'learner', fullName || 'Demo User');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Sign In to TakeUForward' : 'Create Your Striver Account'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-semibold text-[#121c2a] mb-2 font-geist uppercase tracking-wider">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('learner')}
                className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                  selectedRole === 'learner'
                    ? 'border-[#00647c] bg-[#e6eeff] text-[#00647c] font-semibold'
                    : 'border-[#d9e3f6] text-[#3e484d] hover:bg-[#f8f9ff]'
                }`}
              >
                <GraduationCap size={20} />
                <span className="text-xs">Learner</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('provider')}
                className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                  selectedRole === 'provider'
                    ? 'border-[#00647c] bg-[#e6eeff] text-[#00647c] font-semibold'
                    : 'border-[#d9e3f6] text-[#3e484d] hover:bg-[#f8f9ff]'
                }`}
              >
                <Building2 size={20} />
                <span className="text-xs">Provider</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('sponsor')}
                className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                  selectedRole === 'sponsor'
                    ? 'border-[#00647c] bg-[#e6eeff] text-[#00647c] font-semibold'
                    : 'border-[#d9e3f6] text-[#3e484d] hover:bg-[#f8f9ff]'
                }`}
              >
                <Heart size={20} />
                <span className="text-xs">Sponsor</span>
              </button>
            </div>
          </div>
        )}

        {mode === 'register' && (
          <div>
            <label className="block text-xs font-medium text-[#3e484d] mb-1">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-3 text-[#6e797e]" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="e.g. Kamal Perera"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c] focus:ring-1 focus:ring-[#00647c]"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#3e484d] mb-1">Email Address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-3 text-[#6e797e]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@domain.com"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c] focus:ring-1 focus:ring-[#00647c]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#3e484d] mb-1">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-3 text-[#6e797e]" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#d9e3f6] focus:outline-none focus:border-[#00647c] focus:ring-1 focus:ring-[#00647c]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-[#00647c] hover:bg-[#004e61] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs mt-2"
        >
          <span>{mode === 'login' ? 'Sign In' : 'Complete Registration'}</span>
          <ArrowRight size={14} />
        </button>

        <div className="text-center pt-2 border-t border-[#eff4ff]">
          {mode === 'login' ? (
            <p className="text-xs text-[#3e484d]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-semibold text-[#00647c] hover:underline"
              >
                Sign up here
              </button>
            </p>
          ) : (
            <p className="text-xs text-[#3e484d]">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-semibold text-[#00647c] hover:underline"
              >
                Log in here
              </button>
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
};
