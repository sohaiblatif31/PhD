import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ApplicationStatus, Priority, FitLevel, ScholarshipStatus, EligibilityStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(status: ApplicationStatus | ScholarshipStatus): string {
  const map: Record<string, string> = {
    'Not Started': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    'Researching': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Writing': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'Preparing': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'Submitted': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Applied': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Interview': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    'Offer Received': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'Accepted': 'bg-green-500/20 text-green-300 border-green-500/30',
    'Awarded': 'bg-green-500/20 text-green-300 border-green-500/30',
    'Rejected': 'bg-red-500/20 text-red-300 border-red-500/30',
    'Not Awarded': 'bg-red-500/20 text-red-300 border-red-500/30',
  };
  return map[status] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
}

export function getPriorityColor(priority: Priority): string {
  const map: Record<Priority, string> = {
    High: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    Medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    Low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return map[priority];
}

export function getFitColor(fit: FitLevel): string {
  const map: Record<FitLevel, string> = {
    High: 'text-emerald-400',
    Medium: 'text-amber-400',
    Low: 'text-slate-400',
  };
  return map[fit];
}

export function getEligibilityColor(e: EligibilityStatus): string {
  const map: Record<EligibilityStatus, string> = {
    Yes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    Partial: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    No: 'bg-red-500/20 text-red-300 border-red-500/30',
  };
  return map[e];
}

export function getDeadlineUrgency(dateStr: string | null): 'overdue' | 'urgent' | 'soon' | 'normal' | 'rolling' {
  if (!dateStr) return 'rolling';
  const date = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return 'overdue';
  if (days <= 30) return 'urgent';
  if (days <= 90) return 'soon';
  return 'normal';
}

export function getDeadlineColor(dateStr: string | null): string {
  const urgency = getDeadlineUrgency(dateStr);
  const map = {
    overdue: 'bg-red-500/20 text-red-300 border-red-500/30',
    urgent: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    soon: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    normal: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    rolling: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  };
  return map[urgency];
}

export function getDaysUntil(dateStr: string | null): string {
  if (!dateStr) return 'Rolling';
  const date = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Today!';
  if (days === 1) return '1 day';
  return `${days} days`;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Rolling';
  return new Date(dateStr).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function getDocumentProgress(docs: { status: string }[]): number {
  if (!docs.length) return 0;
  const done = docs.filter(d => d.status === 'Done').length;
  return Math.round((done / docs.length) * 100);
}

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'Not Started', 'Researching', 'Writing', 'Submitted', 'Interview', 'Offer Received', 'Accepted', 'Rejected'
];

export const SCHOLARSHIP_STATUSES: ScholarshipStatus[] = [
  'Not Started', 'Preparing', 'Applied', 'Awarded', 'Not Awarded'
];

export const PROVINCES = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];

export const PROVINCE_NAMES: Record<string, string> = {
  AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick',
  NL: 'Newfoundland', NS: 'Nova Scotia', ON: 'Ontario', QC: 'Quebec',
  SK: 'Saskatchewan', YT: 'Yukon', NT: 'Northwest Territories', NU: 'Nunavut', PE: 'Prince Edward Island',
};
