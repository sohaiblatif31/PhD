import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countdown, daysUntil, todayIn, addDaysISO } from '../lib/dates.ts';
import { buildChecklist, checklistProgress, withDocStatus, LETTERS_ID } from '../lib/checklist.ts';
import { deadlines, staleRecords, outreachStage, scholarshipsFor } from '../lib/today.ts';
import { buildICS } from '../lib/ics.ts';
import { toCSV } from '../lib/csv.ts';
import type { AppData, Program, Referee, Scholarship } from '../lib/types.ts';

const prog = (o: Partial<Program> = {}): Program => ({
  id: 'p1', university: 'Uni', school: 'S', program: 'PhD', specialization: '', fit: 'High', funding: '', fundingAmount: '',
  deadline: '', deadlineDate: '2027-01-15', applyLink: '', eligibility: '', requirements: '', competitiveness: '', otherInfo: '',
  city: '', province: 'ON', language: 'English', gmatRequired: 'Yes', duration: '', status: 'Writing', priority: 'High',
  supervisors: [], notes: '', documents: [], lastVerified: null, createdAt: '', updatedAt: '', ...o,
});
const schol = (o: Partial<Scholarship> = {}): Scholarship => ({
  id: 's1', name: 'Award', shortName: 'A', value: '', valueAmount: '', deadline: '', deadlineDate: null, link: '', eligibility: '',
  requirements: '', competitiveness: '', notes: '', eligibleForMe: 'Yes', status: 'Not Started', internationalEligible: true,
  category: 'Federal', lastVerified: null, discontinued: false, provinces: [], ...o,
});
const data = (o: Partial<AppData> = {}): AppData => ({ programs: [], scholarships: [], supervisors: [], referees: [], ...o });

test('daysUntil counts calendar days, ignoring time and time zone', () => {
  assert.equal(daysUntil('2027-01-05', '2027-01-05'), 0);
  assert.equal(daysUntil('2027-01-05', '2026-12-31'), 5);
  assert.equal(daysUntil('2026-12-30', '2027-01-01'), -2);
  assert.equal(daysUntil('2027-01-05T00:00:00+00:00', '2027-01-04'), 1);
  assert.equal(daysUntil(null, '2027-01-01'), null);
});

test('countdown labels', () => {
  assert.equal(countdown(null), 'Rolling');
  assert.equal(countdown(-3), '3d overdue');
  assert.equal(countdown(0), 'Today');
  assert.equal(countdown(1), 'Tomorrow');
  assert.equal(countdown(12), '12 days');
});

test('todayIn uses the given time zone', () => {
  const t = new Date('2026-11-18T03:00:00Z');
  assert.equal(todayIn('America/Toronto', t), '2026-11-17');
  assert.equal(todayIn('Asia/Karachi', t), '2026-11-18');
  assert.equal(addDaysISO('2026-12-28', 7), '2027-01-04');
});

test('checklist skips GMAT when not required and marks it optional when optional', () => {
  const names = (p: Program) => buildChecklist(p, []).map(i => i.id);
  assert.ok(names(prog({ gmatRequired: 'Yes' })).includes('d7'));
  assert.ok(!names(prog({ gmatRequired: 'No' })).includes('d7'));
  const opt = buildChecklist(prog({ gmatRequired: 'Optional' }), []).find(i => i.id === 'd7');
  assert.equal(opt?.optional, true);
});

test('checklist progress ignores optional items and keeps stored status and custom rows', () => {
  const p = prog({ gmatRequired: 'Optional', documents: [{ id: 'd1', name: 'SOP', status: 'Done' }, { id: 'c-1', name: 'Writing sample', status: 'Done' }, { id: 'd4', name: 'Reference Letter 1', status: 'Done' }] });
  const items = buildChecklist(p, []);
  assert.ok(items.some(i => i.custom && i.name === 'Writing sample'));
  assert.ok(!items.some(i => i.id === 'd4'), 'old manual letter rows are replaced by the derived row');
  const { done, total } = checklistProgress(items);
  assert.equal(done, 2);
  assert.equal(total, 8); // 6 template rows without GMAT + letters + custom
});

test('reference letters row is derived from the referee tracker', () => {
  const ref = (n: number, submitted: boolean): Referee => ({ id: `r${n}`, name: '', email: '', affiliation: '', relationship: '', notes: '', createdAt: '', requests: [{ programId: 'p1', requestedAt: '2026-10-01', submittedAt: submitted ? '2026-11-01' : null }] });
  const row = (refs: Referee[]) => buildChecklist(prog(), refs).find(i => i.id === LETTERS_ID)!;
  assert.equal(row([]).status, 'Not Started');
  assert.equal(row([ref(1, false)]).status, 'In Progress');
  assert.equal(row([ref(1, true), ref(2, true), ref(3, true)]).status, 'Done');
});

test('withDocStatus updates or appends', () => {
  const p = prog({ documents: [{ id: 'd1', name: 'SOP', status: 'Not Started' }] });
  assert.equal(withDocStatus(p, 'd1', 'Done')[0].status, 'Done');
  assert.deepEqual(withDocStatus(p, 'd2', 'In Progress')[1], { id: 'd2', name: 'CV', status: 'In Progress' });
});

test('deadlines lists open items soonest first and flags at-risk programs', () => {
  const d = deadlines(data({
    programs: [prog({ id: 'a', deadlineDate: '2026-12-01' }), prog({ id: 'b', deadlineDate: '2026-11-20' }), prog({ id: 'c', status: 'Submitted' }), prog({ id: 'd', deadlineDate: null })],
    scholarships: [schol({ deadlineDate: '2026-11-25' }), schol({ id: 'gone', deadlineDate: '2026-11-19', discontinued: true })],
  }), '2026-11-18');
  assert.deepEqual(d.map(x => x.id), ['b', 's1', 'a']);
  assert.equal(d[0].days, 2);
  assert.equal(d[0].atRisk, true);
  assert.equal(d[0].nextItem, 'Statement of purpose');
});

test('staleRecords flags missing and old verification dates only', () => {
  const s = staleRecords(data({ programs: [prog({ id: 'never' }), prog({ id: 'old', lastVerified: '2026-08-01' }), prog({ id: 'fresh', lastVerified: '2026-11-01' })] }), '2026-11-18');
  assert.deepEqual(s.map(x => x.id), ['never', 'old']);
  assert.equal(s[1].age, 109);
});

test('outreach stage', () => {
  assert.equal(outreachStage({ contacted: false, responded: false, followUpAt: null }, '2026-11-18'), 'To contact');
  assert.equal(outreachStage({ contacted: true, responded: false, followUpAt: '2026-11-25' }, '2026-11-18'), 'Waiting');
  assert.equal(outreachStage({ contacted: true, responded: false, followUpAt: '2026-11-18' }, '2026-11-18'), 'Follow up');
  assert.equal(outreachStage({ contacted: true, responded: true, followUpAt: '2026-11-01' }, '2026-11-18'), 'Replied');
});

test('scholarshipsFor respects province limits', () => {
  const d = data({ scholarships: [schol({ id: 'any' }), schol({ id: 'on', provinces: ['ON'] }), schol({ id: 'qc', provinces: ['QC'] }), schol({ id: 'old', discontinued: true })] });
  assert.deepEqual(scholarshipsFor(prog({ province: 'ON' }), d).map(s => s.id), ['any', 'on']);
});

test('buildICS writes all-day events with escaping, alarms and folding', () => {
  const ics = buildICS([{ uid: 'prog-1@phd', date: '2026-12-31', title: 'Deadline: UBC, Sauder; PhD', description: 'x'.repeat(120) }], new Date('2026-11-18T10:00:00Z'));
  assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
  assert.ok(ics.includes('DTSTART;VALUE=DATE:20261231\r\nDTEND;VALUE=DATE:20270101'));
  assert.ok(ics.includes('SUMMARY:Deadline: UBC\\, Sauder\; PhD'));
  assert.ok(ics.includes('DTSTAMP:20261118T100000Z'));
  assert.ok(ics.includes('TRIGGER:-P7D'));
  assert.ok(ics.split('\r\n').every(l => new TextEncoder().encode(l).length <= 75));
  assert.ok(ics.includes('\r\n x'), 'long lines continue with a leading space');
});

test('toCSV quotes and serialises', () => {
  assert.equal(toCSV([{ a: 'x,y', b: ['1'], c: null, d: 'say "hi"' }]), 'a,b,c,d\r\n"x,y","[""1""]",,"say ""hi"""\r\n');
});
