'use client';

import { Copy, ExternalLink, Mail, Pencil, Plus, Search, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { use, useMemo, useState } from 'react';
import { Chip, Empty, Field, PageHeader, Sheet } from '@/components/ui';
import { addDaysISO, daysUntil, formatDate } from '@/lib/dates';
import { newId, useApp } from '@/lib/store';
import { outreachStage, type OutreachStage } from '@/lib/today';
import type { Supervisor } from '@/lib/types';
import { matches, sameUniversity } from '@/lib/utils';

const FOLLOW_UP_DAYS = 10;
const STAGES: (OutreachStage | 'All')[] = ['All', 'To contact', 'Follow up', 'Waiting', 'Replied'];
const STAGE_TONE = { 'To contact': 'neutral', 'Follow up': 'red', Waiting: 'amber', Replied: 'moss' } as const;
const REPLY_TONE = { Positive: 'moss', Negative: 'red', Awaiting: 'amber' } as const;

type Draft = Pick<Supervisor, 'name' | 'university' | 'researchFocus' | 'email' | 'website' | 'googleScholar' | 'notes'>;
const emptyDraft = (): Draft => ({ name: '', university: '', researchFocus: '', email: '', website: '', googleScholar: '', notes: '' });

const surname = (name: string) => name.replace(/^(dr|prof)\.?\s+/i, '').trim().split(/\s+/).pop() ?? name;
const emailBody = (s: Supervisor) => `Dear Dr. ${surname(s.name)},

I hope this message finds you well. I am writing to express my interest in pursuing doctoral research under your supervision at ${s.university}.

My background is in Mechanical Engineering (NUST, Pakistan) and I have hands-on experience in full-stack development, supply chain digitization, and AI-driven operations, areas closely aligned with your research in ${s.researchFocus || '[your research area]'}.

I am applying for a PhD for Fall 2027 intake and believe your work presents an exciting opportunity for impactful, interdisciplinary research. I would greatly appreciate the chance to discuss potential research directions and whether you have funding available for doctoral students.

I have attached my CV and a brief research statement for your review.

Thank you for your time and consideration.

Best regards,
Sohaib Latif`;

export default function SupervisorsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = use(searchParams);
  const supervisors = useApp(s => s.supervisors);
  const programs = useApp(s => s.programs);
  const today = useApp(s => s.today);
  const { update, create, remove, notify } = useApp(s => ({ update: s.update, create: s.create, remove: s.remove, notify: s.notify }));
  const [q, setQ] = useState(params.q ?? '');
  const [stage, setStage] = useState<OutreachStage | 'All'>('All');
  const [uni, setUni] = useState('');
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null);
  const [emailFor, setEmailFor] = useState<Supervisor | null>(null);
  const [body, setBody] = useState('');

  const withStage = useMemo(() => supervisors.map(s => ({ s, stage: outreachStage(s, today) })), [supervisors, today]);
  const counts = Object.fromEntries(STAGES.map(st => [st, st === 'All' ? withStage.length : withStage.filter(x => x.stage === st).length]));
  const universities = [...new Set(supervisors.map(s => s.university))].sort();
  const order: Record<OutreachStage, number> = { 'Follow up': 0, 'To contact': 1, Waiting: 2, Replied: 3 };
  const shown = withStage
    .filter(x => (stage === 'All' || x.stage === stage) && (!uni || x.s.university === uni) && matches(q, x.s.name, x.s.university, x.s.researchFocus, x.s.notes))
    .sort((a, b) => order[a.stage] - order[b.stage] || a.s.university.localeCompare(b.s.university));

  const markEmailed = (s: Supervisor) =>
    update('supervisors', s.id, { contacted: true, contactedAt: s.contactedAt ?? today, followUpAt: addDaysISO(today, FOLLOW_UP_DAYS) }, `Logged. Follow up on ${formatDate(addDaysISO(today, FOLLOW_UP_DAYS), false)}`);
  const reply = (s: Supervisor, responseType: Supervisor['responseType']) =>
    update('supervisors', s.id, responseType ? { responded: true, responseType, respondedAt: s.respondedAt ?? today } : { responded: false, responseType: null, respondedAt: null }, responseType ? 'Reply recorded' : 'Reply cleared');

  async function saveDraft() {
    if (!editing) return;
    const d = editing.draft;
    if (!d.name.trim() || !d.university.trim()) return notify('Name and university are required', true);
    for (const link of [d.website, d.googleScholar]) if (link && !/^https?:\/\//i.test(link)) return notify('Links must start with https://', true);
    const ok = editing.id
      ? await update('supervisors', editing.id, d, 'Saved')
      : await create('supervisors', { ...d, id: newId('sup'), contacted: false, responded: false, responseType: null, contactedAt: null, followUpAt: null, respondedAt: null, createdAt: new Date().toISOString() }, 'Supervisor added');
    if (ok) setEditing(null);
  }

  return (
    <div>
      <PageHeader title="Supervisors" lede="Who to email, who to chase, who replied. Logging an email sets a follow-up 10 days out."
        actions={<button className="btn btn-primary" onClick={() => setEditing({ id: null, draft: emptyDraft() })}><Plus size={18} aria-hidden /> Add supervisor</button>} />

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search supervisors</span>
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
          <input className="field pl-10" type="search" placeholder="Name, university or research area" value={q} onChange={e => setQ(e.target.value)} />
        </label>
        <select className="field md:w-72" aria-label="University" value={uni} onChange={e => setUni(e.target.value)}>
          <option value="">All universities</option>
          {universities.map(u => <option key={u}>{u}</option>)}
        </select>
      </div>
      <div className="scroll-x mb-5" role="group" aria-label="Outreach stage">
        {STAGES.map(st => (
          <button key={st} className="filter-chip" aria-pressed={stage === st} onClick={() => setStage(st)}>
            {st} <span className="num opacity-70">{counts[st]}</span>
          </button>
        ))}
      </div>

      <div className="panel overflow-hidden">
        {shown.length === 0 && <Empty title="No one here">Change the filter or add a supervisor.</Empty>}
        <ul>
          {shown.map(({ s, stage: st }) => {
            const progs = programs.filter(p => sameUniversity(p.university, s.university));
            const due = daysUntil(s.followUpAt, today);
            return (
              <li key={s.id} className="list-row md:grid md:grid-cols-[minmax(0,1fr)_auto] md:gap-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-serif text-[19px] font-semibold leading-snug">{s.name}</h2>
                    <Chip tone={STAGE_TONE[st]}>{st === 'Replied' && s.responseType ? `Replied: ${s.responseType.toLowerCase()}` : st}</Chip>
                  </div>
                  <p className="text-[14px] text-ink-2">{s.university}</p>
                  {s.researchFocus && <p className="mt-1 line-clamp-2 max-w-[70ch] text-[14px] text-ink-3">{s.researchFocus}</p>}
                  <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
                    {s.email && <a href={`mailto:${s.email}`} className="break-all font-medium text-accent">{s.email}</a>}
                    {s.contactedAt && <span className="text-ink-3">Emailed {formatDate(s.contactedAt, false)}</span>}
                    {st !== 'Replied' && s.followUpAt && <span className={due !== null && due <= 0 ? 'font-semibold text-red' : 'text-ink-3'}>Follow up {due === 0 ? 'today' : due !== null && due < 0 ? `${-due}d ago` : formatDate(s.followUpAt, false)}</span>}
                    {progs.map(p => <Link key={p.id} href={`/programs/${p.id}`} className="text-ink-2 underline decoration-line underline-offset-2">{p.program}</Link>)}
                  </p>
                  {s.notes && <p className="mt-1.5 line-clamp-2 max-w-[70ch] text-[13px] italic text-ink-3">{s.notes}</p>}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 md:mt-0 md:max-w-[340px] md:justify-end">
                  {st === 'To contact' && <>
                    <button className="btn btn-sm btn-primary" onClick={() => { setEmailFor(s); setBody(emailBody(s)); }}><Mail size={16} aria-hidden /> Draft email</button>
                    <button className="btn btn-sm" onClick={() => markEmailed(s)}><Send size={15} aria-hidden /> I emailed them</button>
                  </>}
                  {(st === 'Follow up' || st === 'Waiting') && <>
                    <button className={`btn btn-sm ${st === 'Follow up' ? 'btn-primary' : ''}`} onClick={() => markEmailed(s)}>Followed up</button>
                    <select className="pill-select tone-neutral" aria-label={`Reply from ${s.name}`} value="" onChange={e => reply(s, e.target.value as Supervisor['responseType'])}>
                      <option value="">Got a reply…</option><option value="Positive">Positive</option><option value="Negative">Negative</option><option value="Awaiting">Wants more info</option>
                    </select>
                  </>}
                  {st === 'Replied' && (
                    <select className={`pill-select tone-${REPLY_TONE[s.responseType ?? 'Awaiting']}`} aria-label={`Reply from ${s.name}`} value={s.responseType ?? 'Awaiting'} onChange={e => reply(s, (e.target.value || null) as Supervisor['responseType'])}>
                      <option value="Positive">Positive</option><option value="Negative">Negative</option><option value="Awaiting">Wants more info</option><option value="">Undo reply</option>
                    </select>
                  )}
                  {s.website && <a className="icon-btn" href={s.website} target="_blank" rel="noreferrer" aria-label={`${s.name} website`}><ExternalLink size={18} /></a>}
                  <button className="icon-btn" aria-label={`Edit ${s.name}`} onClick={() => setEditing({ id: s.id, draft: { name: s.name, university: s.university, researchFocus: s.researchFocus, email: s.email, website: s.website, googleScholar: s.googleScholar, notes: s.notes } })}><Pencil size={18} /></button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <Sheet open={!!editing} onOpenChange={o => !o && setEditing(null)} title={editing?.id ? 'Edit supervisor' : 'Add supervisor'}>
        {editing && (
          <form className="grid gap-4" onSubmit={e => { e.preventDefault(); saveDraft(); }}>
            {([['name', 'Name'], ['university', 'University'], ['researchFocus', 'Research focus'], ['email', 'Email'], ['website', 'Faculty page'], ['googleScholar', 'Google Scholar']] as const).map(([k, label]) => (
              <Field key={k} label={label}>
                <input className="field" type={k === 'email' ? 'email' : k === 'website' || k === 'googleScholar' ? 'url' : 'text'} list={k === 'university' ? 'unis' : undefined}
                  value={editing.draft[k]} onChange={e => setEditing({ ...editing, draft: { ...editing.draft, [k]: e.target.value } })} />
              </Field>
            ))}
            <datalist id="unis">{universities.map(u => <option key={u} value={u} />)}</datalist>
            <Field label="Notes"><textarea className="field" rows={3} value={editing.draft.notes} onChange={e => setEditing({ ...editing, draft: { ...editing.draft, notes: e.target.value } })} /></Field>
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary flex-1 md:flex-none">{editing.id ? 'Save' : 'Add supervisor'}</button>
              {editing.id && <button type="button" className="btn btn-danger" onClick={async () => {
                if (confirm('Delete this supervisor?') && await remove('supervisors', editing.id!, 'Supervisor deleted')) setEditing(null);
              }}><Trash2 size={16} aria-hidden /> Delete</button>}
            </div>
          </form>
        )}
      </Sheet>

      <Sheet open={!!emailFor} onOpenChange={o => !o && setEmailFor(null)} title={`Email ${emailFor?.name ?? ''}`} description="Edit the draft, then copy it or open it in Mail.">
        {emailFor && (
          <div className="grid gap-3">
            <textarea className="field font-[inherit]" rows={14} value={body} onChange={e => setBody(e.target.value)} aria-label="Email draft" />
            <div className="flex flex-wrap gap-2">
              {emailFor.email && (
                <a className="btn btn-primary" href={`mailto:${emailFor.email}?subject=${encodeURIComponent(`Prospective PhD student, Fall 2027: ${emailFor.researchFocus.split(',')[0] || 'research inquiry'}`)}&body=${encodeURIComponent(body)}`}>
                  <Mail size={17} aria-hidden /> Open in Mail
                </a>
              )}
              <button className="btn" onClick={async () => { try { await navigator.clipboard.writeText(body); notify('Draft copied'); } catch { notify('Could not copy', true); } }}><Copy size={16} aria-hidden /> Copy</button>
              <button className="btn btn-quiet" onClick={() => { markEmailed(emailFor); setEmailFor(null); }}>I sent it</button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
