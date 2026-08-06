export type ApplicationStatus =
  | 'Not Started'
  | 'Researching'
  | 'Writing'
  | 'Submitted'
  | 'Interview'
  | 'Offer Received'
  | 'Accepted'
  | 'Rejected';

export type Priority = 'High' | 'Medium' | 'Low';
export type Language = 'English' | 'French' | 'Bilingual';
export type FitLevel = 'High' | 'Medium' | 'Low';
export type GmatRequired = 'Yes' | 'No' | 'Optional';

export type DocumentStatus = 'Not Started' | 'In Progress' | 'Done';

export interface AppDocument {
  id: string;
  name: string;
  status: DocumentStatus;
}

export interface Program {
  id: string;
  university: string;
  school: string;
  program: string;
  specialization: string;
  fit: FitLevel;
  funding: string;
  fundingAmount: string; // e.g. "$115,000+"
  deadline: string;
  deadlineDate: string | null; // ISO date string for sorting/calendar
  applyLink: string;
  eligibility: string;
  requirements: string;
  competitiveness: string;
  otherInfo: string;
  city: string;
  province: string;
  language: Language;
  gmatRequired: GmatRequired;
  duration: string;
  status: ApplicationStatus;
  priority: Priority;
  supervisors: string[]; // supervisor IDs
  notes: string;
  documents: AppDocument[];
  createdAt: string;
  updatedAt: string;
}

export type ScholarshipStatus = 'Not Started' | 'Preparing' | 'Applied' | 'Awarded' | 'Not Awarded';
export type EligibilityStatus = 'Yes' | 'Partial' | 'No';

export interface Scholarship {
  id: string;
  name: string;
  shortName: string;
  value: string;
  valueAmount: string; // e.g. "$40,000"
  deadline: string;
  deadlineDate: string | null;
  link: string;
  eligibility: string;
  requirements: string;
  competitiveness: string;
  notes: string;
  eligibleForMe: EligibilityStatus;
  status: ScholarshipStatus;
  internationalEligible: boolean;
  category: 'Federal' | 'Provincial' | 'Industry' | 'Foundation';
}

export type SupervisorResponse = 'Positive' | 'Negative' | 'Awaiting' | null;

export interface Supervisor {
  id: string;
  university: string;
  name: string;
  researchFocus: string;
  email: string;
  website: string;
  googleScholar: string;
  contacted: boolean;
  responded: boolean;
  responseType: SupervisorResponse;
  notes: string;
  createdAt: string;
}

export interface DeadlineItem {
  id: string;
  type: 'program' | 'scholarship';
  name: string;
  deadline: string;
  deadlineDate: string;
  status: ApplicationStatus | ScholarshipStatus;
  priority?: Priority;
}
