import React from 'react';
import { CheckCircle2, Clock, XCircle, ShieldCheck, AlertCircle } from 'lucide-react';

export type BadgeType =
  | 'verified'
  | 'pending'
  | 'rejected'
  | 'active'
  | 'draft'
  | 'closed'
  | 'accepted'
  | 'completed'
  | 'pledged';

interface BadgeProps {
  type: BadgeType | string;
  label?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, label, className = '' }) => {
  const normType = type.toLowerCase();
  let styles = 'bg-gray-100 text-gray-700 border-gray-200';
  let icon = <AlertCircle size={13} />;
  let text = label || type;

  switch (normType) {
    case 'verified':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      icon = <ShieldCheck size={13} className="text-emerald-600" />;
      text = label || 'Verified';
      break;
    case 'accepted':
    case 'active':
    case 'completed':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      icon = <CheckCircle2 size={13} className="text-emerald-600" />;
      text = label || (normType.charAt(0).toUpperCase() + normType.slice(1));
      break;
    case 'pending':
    case 'pledged':
      styles = 'bg-amber-50 text-amber-800 border-amber-200';
      icon = <Clock size={13} className="text-amber-600" />;
      text = label || (normType.charAt(0).toUpperCase() + normType.slice(1));
      break;
    case 'rejected':
    case 'closed':
    case 'cancelled':
      styles = 'bg-rose-50 text-rose-700 border-rose-200';
      icon = <XCircle size={13} className="text-rose-600" />;
      text = label || (normType.charAt(0).toUpperCase() + normType.slice(1));
      break;
    case 'draft':
      styles = 'bg-slate-100 text-slate-700 border-slate-300';
      icon = <Clock size={13} className="text-slate-500" />;
      text = label || 'Draft';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border font-geist ${styles} ${className}`}
    >
      {icon}
      <span>{text}</span>
    </span>
  );
};
