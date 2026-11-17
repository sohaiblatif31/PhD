import type { AppData, ApplicationStatus, Program, Priority, ScholarshipStatus } from './types.ts';
import { buildChecklist, checklistProgress } from './checklist.ts';
import { daysUntil } from './dates.ts';

/** Program stages where the application still has to be submitted. */
export const OPEN_PROGRAM: ApplicationStatus[] = ['Not Started', 'Researching', 'Writing'];
export const OPEN_SCHOLARSHIP: ScholarshipStatus[] = ['Not Started', 'Preparing'];
export const STALE_AFTER_DAYS = 60;
const AT_RISK_DAYS = 30;
const AT_RISK_PCT = 80;

export interface Deadline {
  kind: 'program' | 'scholarship';
  id: string;
  title: string;
  subtitle: string;
  date: string;
  days: number;
  href: string;
  priority?: Priority;
  pct?: number;
  nextItem?: string;
  atRisk: boolean;
}

export function programDeadline(p: Program, data: AppData, today: string): Deadline | null {
  const days = daysUntil(p.deadlineDate, today);
  if (days === null || !OPEN_PROGRAM.includes(p.status)) return null;
  const items = buildChecklist(p, data.referees);
  const { pct } = checklistProgress(items);
  return {
    kind: 'program',
    id: p.id,
    title: p.university,
    subtitle: p.program,
    date: p.deadlineDate!,
    days,
    href: `/programs/${p.id}`,
    priority: p.priority,
    pct,
    nextItem: items.find(i => !i.optional && i.status !== 'Done')?.name,
    atRisk: days >= 0 && days <= AT_RISK_DAYS && pct < AT_RISK_PCT,
  };
}

/** Open programs and scholarships with a fixed date, soonest first (overdue included). */
export function deadlines(data: AppData, today: string): Deadline[] {
  const out: Deadline[] = [];
  for (const p of data.programs) {
    const d = programDeadline(p, data, today);
    if (d) out.push(d);
  }
  for (const s of data.scholarships) {
    const days = daysUntil(s.deadlineDate, today);
    if (days === null || s.discontinued || !OPEN_SCHOLARSHIP.includes(s.status)) continue;
    out.push({ kind: 'scholarship', id: s.id, title: s.shortName || s.name, subtitle: s.value, date: s.deadlineDate!, days, href: '/scholarships', atRisk: false });
  }
  return out.sort((a, b) => a.days - b.days);
}

export interface StaleRecord {
  kind: 'program' | 'scholarship';
  id: string;
  title: string;
  href: string;
  lastVerified: string | null;
  age: number | null; // days since verified; null = never
}

/** Active records never verified, or verified more than STALE_AFTER_DAYS ago. */
export function staleRecords(data: AppData, today: string): StaleRecord[] {
  const out: StaleRecord[] = [];
  const check = (kind: StaleRecord['kind'], id: string, title: string, href: string, lastVerified: string | null) => {
    const since = daysUntil(lastVerified, today);
    const age = since === null ? null : -since;
    if (age === null || age > STALE_AFTER_DAYS) out.push({ kind, id, title, href, lastVerified, age });
  };
  for (const p of data.programs) {
    if (OPEN_PROGRAM.includes(p.status)) check('program', p.id, `${p.university} · ${p.program}`, `/programs/${p.id}`, p.lastVerified);
  }
  for (const s of data.scholarships) {
    if (!s.discontinued && OPEN_SCHOLARSHIP.includes(s.status)) check('scholarship', s.id, s.shortName || s.name, '/scholarships', s.lastVerified);
  }
  // never-verified first, then oldest
  return out.sort((a, b) => (b.age ?? Infinity) - (a.age ?? Infinity));
}

export type OutreachStage = 'To contact' | 'Follow up' | 'Waiting' | 'Replied';

export function outreachStage(s: { contacted: boolean; responded: boolean; followUpAt: string | null }, today: string): OutreachStage {
  if (s.responded) return 'Replied';
  if (!s.contacted) return 'To contact';
  const d = daysUntil(s.followUpAt, today);
  return d !== null && d <= 0 ? 'Follow up' : 'Waiting';
}

export interface LetterChase {
  refereeId: string;
  referee: string;
  programId: string;
  program: string;
  days: number | null;
}

/** Letters requested but not yet submitted, for programs still open, soonest deadline first. */
export function lettersOutstanding(data: AppData, today: string): LetterChase[] {
  const out: LetterChase[] = [];
  for (const r of data.referees) {
    for (const q of r.requests) {
      if (q.submittedAt) continue;
      const p = data.programs.find(x => x.id === q.programId);
      if (!p || !OPEN_PROGRAM.includes(p.status)) continue;
      out.push({ refereeId: r.id, referee: r.name, programId: p.id, program: p.university, days: daysUntil(p.deadlineDate, today) });
    }
  }
  return out.sort((a, b) => (a.days ?? Infinity) - (b.days ?? Infinity));
}

/** Scholarships that can fund a program: not discontinued, and either unrestricted or limited to its province. */
export function scholarshipsFor(p: Program, data: AppData) {
  return data.scholarships.filter(s => !s.discontinued && (!s.provinces?.length || s.provinces.includes(p.province)));
}
