import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ApplicationStatus, EligibilityStatus, Priority, ScholarshipStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Tone = 'neutral' | 'blue' | 'amber' | 'violet' | 'teal' | 'moss' | 'red';

export const STATUS_TONE: Record<ApplicationStatus | ScholarshipStatus, Tone> = {
  'Not Started': 'neutral',
  Researching: 'blue',
  Writing: 'amber',
  Preparing: 'amber',
  Submitted: 'violet',
  Applied: 'violet',
  Interview: 'teal',
  'Offer Received': 'moss',
  Accepted: 'moss',
  Awarded: 'moss',
  Rejected: 'red',
  'Not Awarded': 'red',
};

export const PRIORITY_TONE: Record<Priority, Tone> = { High: 'red', Medium: 'amber', Low: 'neutral' };
export const ELIGIBILITY_TONE: Record<EligibilityStatus, Tone> = { Yes: 'moss', Partial: 'amber', No: 'red' };

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'Not Started', 'Researching', 'Writing', 'Submitted', 'Interview', 'Offer Received', 'Accepted', 'Rejected',
];

export const SCHOLARSHIP_STATUSES: ScholarshipStatus[] = ['Not Started', 'Preparing', 'Applied', 'Awarded', 'Not Awarded'];

export const PROVINCES = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];

export const PROVINCE_NAMES: Record<string, string> = {
  AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick', NL: 'Newfoundland and Labrador',
  NS: 'Nova Scotia', NT: 'Northwest Territories', NU: 'Nunavut', ON: 'Ontario', PE: 'Prince Edward Island',
  QC: 'Quebec', SK: 'Saskatchewan', YT: 'Yukon',
};

/** "University of British Columbia (UBC)" and "University of British Columbia" are the same school. */
export const sameUniversity = (a: string, b: string) => {
  const k = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z]/g, '');
  return k(a) === k(b);
};

export const matches = (q: string, ...fields: (string | null | undefined)[]) => {
  const needle = q.trim().toLowerCase();
  return !needle || fields.some(f => f?.toLowerCase().includes(needle));
};
