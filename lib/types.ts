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
  lastVerified: string | null; // ISO date — when deadline/requirements were last checked against source
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
  lastVerified: string | null; // ISO date — when this scholarship was last checked against official source
  discontinued: boolean; // true if scholarship no longer exists / has been merged
  provinces: string[]; // province codes the award is limited to; empty = any province
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
  contactedAt: string | null; // ISO date of first outreach
  followUpAt: string | null; // ISO date a follow-up is due
  respondedAt: string | null;
  createdAt: string;
}

export interface LetterRequest {
  programId: string;
  requestedAt: string | null;
  submittedAt: string | null;
}

export interface Referee {
  id: string;
  name: string;
  email: string;
  affiliation: string;
  relationship: string;
  notes: string;
  requests: LetterRequest[];
  createdAt: string;
}

export interface AppData {
  programs: Program[];
  scholarships: Scholarship[];
  supervisors: Supervisor[];
  referees: Referee[];
}

export type TableName = keyof AppData;
