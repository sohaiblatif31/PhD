'use client';

import { useState, type FormEvent } from 'react';
import type { Program } from '@/lib/types';
import { APPLICATION_STATUSES, PROVINCES, PROVINCE_NAMES } from '@/lib/utils';
import { Field } from './ui';

export type ProgramDraft = Omit<Program, 'id' | 'supervisors' | 'documents' | 'createdAt' | 'updatedAt' | 'lastVerified'>;

export const emptyProgram = (): ProgramDraft => ({
  university: '', school: '', program: '', specialization: '', fit: 'Medium', funding: '', fundingAmount: '',
  deadline: '', deadlineDate: null, applyLink: '', eligibility: '', requirements: '', competitiveness: '', otherInfo: '',
  city: '', province: 'ON', language: 'English', gmatRequired: 'Yes', duration: '', status: 'Not Started', priority: 'Medium', notes: '',
});

const TEXTS: [keyof ProgramDraft, string, string?][] = [
  ['funding', 'Funding package'],
  ['eligibility', 'Eligibility'],
  ['requirements', 'Application requirements'],
  ['competitiveness', 'Competitiveness'],
  ['otherInfo', 'Other information'],
];

export default function ProgramForm({ initial, submitLabel, onSubmit, onCancel }: {
  initial: ProgramDraft; submitLabel: string; onSubmit: (d: ProgramDraft) => Promise<unknown> | void; onCancel?: () => void;
}) {
  const [d, setD] = useState(initial);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof ProgramDraft>(k: K, v: ProgramDraft[K]) => setD(prev => ({ ...prev, [k]: v }));
  const text = (k: keyof ProgramDraft) => ({ value: (d[k] as string) ?? '', onChange: (e: { target: { value: string } }) => set(k, e.target.value as never) });

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!d.university.trim() || !d.program.trim()) return setError('University and program name are required.');
    if (d.applyLink && !/^https?:\/\//i.test(d.applyLink)) return setError('The application link must start with https://');
    setError('');
    setBusy(true);
    // only the editable fields: the server rejects unknown or read-only keys
    const draft = Object.fromEntries(Object.keys(emptyProgram()).map(k => [k, d[k as keyof ProgramDraft]])) as ProgramDraft;
    await onSubmit({ ...draft, university: d.university.trim(), program: d.program.trim() });
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="University"><input className="field" required {...text('university')} autoComplete="off" /></Field>
        <Field label="School or faculty"><input className="field" {...text('school')} /></Field>
        <Field label="Program"><input className="field" required {...text('program')} /></Field>
        <Field label="Specialization"><input className="field" {...text('specialization')} /></Field>
        <Field label="City"><input className="field" {...text('city')} /></Field>
        <Field label="Province">
          <select className="field" value={d.province} onChange={e => set('province', e.target.value)}>
            {PROVINCES.map(p => <option key={p} value={p}>{PROVINCE_NAMES[p]}</option>)}
          </select>
        </Field>
        <Field label="Deadline date" hint="Leave empty for rolling admission.">
          <input className="field" type="date" value={d.deadlineDate ?? ''} onChange={e => set('deadlineDate', e.target.value || null)} />
        </Field>
        <Field label="Deadline details"><input className="field" placeholder="e.g. Jan 15 for Fall intake" {...text('deadline')} /></Field>
        <Field label="Application link"><input className="field" type="url" inputMode="url" placeholder="https://" {...text('applyLink')} /></Field>
        <Field label="Funding amount"><input className="field" placeholder="$30,000/yr" {...text('fundingAmount')} /></Field>
        <Field label="GMAT / GRE">
          <select className="field" value={d.gmatRequired} onChange={e => set('gmatRequired', e.target.value as ProgramDraft['gmatRequired'])}>
            <option value="Yes">Required</option><option value="Optional">Optional</option><option value="No">Not required</option>
          </select>
        </Field>
        <Field label="Language">
          <select className="field" value={d.language} onChange={e => set('language', e.target.value as ProgramDraft['language'])}>
            <option>English</option><option>French</option><option>Bilingual</option>
          </select>
        </Field>
        <Field label="Fit">
          <select className="field" value={d.fit} onChange={e => set('fit', e.target.value as ProgramDraft['fit'])}>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
        </Field>
        <Field label="Priority">
          <select className="field" value={d.priority} onChange={e => set('priority', e.target.value as ProgramDraft['priority'])}>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
        </Field>
        <Field label="Status">
          <select className="field" value={d.status} onChange={e => set('status', e.target.value as ProgramDraft['status'])}>
            {APPLICATION_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Duration"><input className="field" placeholder="4–5 years" {...text('duration')} /></Field>
      </div>
      {TEXTS.map(([k, label]) => (
        <Field key={k} label={label}><textarea className="field" rows={3} {...text(k)} /></Field>
      ))}
      <Field label="Notes"><textarea className="field" rows={4} {...text('notes')} /></Field>
      {error && <p className="text-sm text-red" role="alert">{error}</p>}
      <div className="sticky bottom-0 -mx-1 flex gap-2 bg-surface px-1 py-3">
        <button className="btn btn-primary flex-1 md:flex-none" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button>
        {onCancel && <button type="button" className="btn btn-quiet" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
