'use client';

import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import CalendarLinks from '@/components/CalendarLinks';
import { Chip, PageHeader } from '@/components/ui';
import { daysUntil } from '@/lib/dates';
import { useApp } from '@/lib/store';
import { OPEN_PROGRAM } from '@/lib/today';
import type { Tone } from '@/lib/utils';

interface Ev { id: string; date: string; title: string; detail: string; href: string; tone: Tone; kind: string }

export default function CalendarPage() {
  const s = useApp(st => ({ programs: st.programs, scholarships: st.scholarships, supervisors: st.supervisors, today: st.today }));
  const [month, setMonth] = useState(() => startOfMonth(parseISO(s.today)));

  const events = useMemo<Ev[]>(() => [
    ...s.programs.filter(p => p.deadlineDate).map(p => ({
      id: p.id, date: p.deadlineDate!, title: p.university, detail: p.program, href: `/programs/${p.id}`,
      tone: (OPEN_PROGRAM.includes(p.status) ? 'red' : 'neutral') as Tone, kind: OPEN_PROGRAM.includes(p.status) ? 'Program deadline' : `Program (${p.status})`,
    })),
    ...s.scholarships.filter(x => x.deadlineDate && !x.discontinued).map(x => ({
      id: x.id, date: x.deadlineDate!, title: x.shortName || x.name, detail: x.valueAmount, href: `/scholarships?q=${encodeURIComponent(x.shortName || x.name)}`, tone: 'moss' as Tone, kind: 'Funding deadline',
    })),
    ...s.supervisors.filter(x => x.followUpAt && x.contacted && !x.responded).map(x => ({
      id: x.id, date: x.followUpAt!, title: x.name, detail: x.university, href: `/supervisors?q=${encodeURIComponent(x.name)}`, tone: 'blue' as Tone, kind: 'Follow-up',
    })),
  ].sort((a, b) => a.date.localeCompare(b.date)), [s.programs, s.scholarships, s.supervisors]);

  const byDay = useMemo(() => Object.groupBy(events, e => e.date), [events]);
  const days = eachDayOfInterval({ start: startOfWeek(month, { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }) });
  const upcoming = events.filter(e => (daysUntil(e.date, s.today) ?? -1) >= 0);
  const agenda = Object.entries(Object.groupBy(upcoming, e => e.date.slice(0, 7)));

  return (
    <div>
      <PageHeader title="Calendar" lede="Deadlines and follow-ups. Subscribe once and they stay in sync with your iPhone, iPad and Mac calendars." actions={<CalendarLinks />} />

      <section className="panel mb-8 hidden p-4 md:block" aria-label="Month">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">{format(month, 'MMMM yyyy')}</h2>
          <div className="flex gap-1">
            <button className="icon-btn" aria-label="Previous month" onClick={() => setMonth(m => addMonths(m, -1))}><ChevronLeft size={20} /></button>
            <button className="btn btn-sm btn-quiet" onClick={() => setMonth(startOfMonth(parseISO(s.today)))}>Today</button>
            <button className="icon-btn" aria-label="Next month" onClick={() => setMonth(m => addMonths(m, 1))}><ChevronRight size={20} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 border-l border-t border-line text-[13px]">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <div key={d} className="border-b border-r border-line px-2 py-1.5 font-semibold text-ink-3">{d}</div>)}
          {days.map(d => {
            const iso = format(d, 'yyyy-MM-dd');
            const evs = byDay[iso] ?? [];
            return (
              <div key={iso} className={`min-h-24 border-b border-r border-line p-1.5 ${isSameMonth(d, month) ? '' : 'bg-surface-2/60 text-ink-3'}`}>
                <span className={`num mb-1 inline-grid h-6 min-w-6 place-items-center rounded-full px-1 text-[12px] ${iso === s.today ? 'bg-accent font-semibold text-[var(--accent-ink)]' : ''}`}>{format(d, 'd')}</span>
                {evs.map(e => (
                  <Link key={`${e.kind}-${e.id}`} href={e.href} title={`${e.kind}: ${e.title}`} className={`chip tone-${e.tone} mb-1 flex !min-h-6 w-full truncate !rounded-[6px] !px-1.5 text-[12px]`}>
                    <span className="truncate">{e.title}</span>
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="agenda">
        <h2 id="agenda" className="section-title mb-3">Coming up</h2>
        {agenda.length === 0 && <p className="text-ink-3">Nothing dated ahead.</p>}
        {agenda.map(([ym, evs]) => (
          <div key={ym} className="mb-6">
            <h3 className="mb-2 text-[14px] font-semibold text-ink-3">{format(parseISO(`${ym}-01`), 'MMMM yyyy')}</h3>
            <ul className="panel">
              {evs!.map(e => (
                <li key={`${e.kind}-${e.id}`} className="list-row !p-0">
                  <Link href={e.href} className="flex min-h-14 items-center gap-4 px-4 py-2.5">
                    <span className="w-10 shrink-0 text-center">
                      <span className="num block font-serif text-[24px] leading-none">{format(parseISO(e.date), 'd')}</span>
                      <span className="block text-[11px] text-ink-3">{format(parseISO(e.date), 'EEE')}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{e.title}</span>
                      <span className="block truncate text-[13px] text-ink-3">{e.detail}</span>
                    </span>
                    <Chip tone={e.tone} className="hidden sm:inline-flex">{e.kind}</Chip>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
