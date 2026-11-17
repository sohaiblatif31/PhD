import type { AppDocument, DocumentStatus, Program, Referee } from './types.ts';

interface Rule {
  id: string;
  name: string;
  applies?: (p: Program) => boolean;
  optional?: (p: Program) => boolean;
}

export const CHECKLIST_TEMPLATE: Rule[] = [
  { id: 'd1', name: 'Statement of purpose' },
  { id: 'd2', name: 'CV' },
  { id: 'd3', name: 'Transcripts' },
  { id: 'd9', name: 'Research proposal' },
  { id: 'd7', name: 'GMAT / GRE score', applies: p => p.gmatRequired !== 'No', optional: p => p.gmatRequired === 'Optional' },
  { id: 'd8', name: 'English proficiency (IELTS / TOEFL)' },
  { id: 'd10', name: 'Application form and fee' },
];

// shortcut: three letters, as in the original template; make it a per-program field if a program asks for a different number.
export const LETTERS_NEEDED = 3;
const LETTER_DOC_IDS = ['d4', 'd5', 'd6']; // old manual letter rows, now derived from the referee tracker
export const LETTERS_ID = 'letters';

export interface ChecklistItem {
  id: string;
  name: string;
  status: DocumentStatus;
  optional: boolean;
  derived?: boolean; // computed from the referee tracker, not toggled by hand
  custom?: boolean;
}

export function letterCounts(programId: string, referees: Referee[]) {
  const reqs = referees.flatMap(r => r.requests.filter(q => q.programId === programId));
  return { requested: reqs.length, submitted: reqs.filter(q => q.submittedAt).length };
}

export function buildChecklist(p: Program, referees: Referee[]): ChecklistItem[] {
  const stored = new Map((p.documents ?? []).map(d => [d.id, d]));
  const items: ChecklistItem[] = CHECKLIST_TEMPLATE
    .filter(r => !r.applies || r.applies(p))
    .map(r => ({ id: r.id, name: r.name, status: stored.get(r.id)?.status ?? 'Not Started', optional: r.optional?.(p) ?? false }));

  const { requested, submitted } = letterCounts(p.id, referees);
  items.push({
    id: LETTERS_ID,
    name: `Reference letters (${submitted} of ${LETTERS_NEEDED} submitted)`,
    status: submitted >= LETTERS_NEEDED ? 'Done' : requested > 0 ? 'In Progress' : 'Not Started',
    optional: false,
    derived: true,
  });

  const known = new Set([...CHECKLIST_TEMPLATE.map(r => r.id), ...LETTER_DOC_IDS]);
  for (const d of p.documents ?? []) {
    if (!known.has(d.id)) items.push({ id: d.id, name: d.name, status: d.status, optional: false, custom: true });
  }
  return items;
}

export function checklistProgress(items: ChecklistItem[]) {
  const required = items.filter(i => !i.optional);
  const done = required.filter(i => i.status === 'Done').length;
  return { done, total: required.length, pct: required.length ? Math.round((done / required.length) * 100) : 0 };
}

/** New `documents` array with one item's status set; adds the row if it was never stored. */
export function withDocStatus(p: Program, id: string, status: DocumentStatus): AppDocument[] {
  const docs = p.documents ?? [];
  if (docs.some(d => d.id === id)) return docs.map(d => (d.id === id ? { ...d, status } : d));
  const name = CHECKLIST_TEMPLATE.find(r => r.id === id)?.name ?? id;
  return [...docs, { id, name, status }];
}

export const NEXT_STATUS: Record<DocumentStatus, DocumentStatus> = {
  'Not Started': 'In Progress',
  'In Progress': 'Done',
  Done: 'Not Started',
};
