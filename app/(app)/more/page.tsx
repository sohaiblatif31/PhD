'use client';

import { CalendarDays, ChevronRight, Columns3, FileJson, FileSpreadsheet, LogOut, PenLine } from 'lucide-react';
import Link from 'next/link';
import { useState, useSyncExternalStore } from 'react';
import { logout } from '@/app/actions';
import CalendarLinks from '@/components/CalendarLinks';
import { PageHeader } from '@/components/ui';

const LINKS = [
  { href: '/tracker', label: 'Board', note: 'Every program by stage', icon: Columns3 },
  { href: '/calendar', label: 'Calendar', note: 'Month view and what is coming up', icon: CalendarDays },
  { href: '/referees', label: 'Referees', note: 'Letters requested and received', icon: PenLine },
];
const THEMES = [['system', 'Match device'], ['light', 'Light'], ['dark', 'Dark']] as const;
const readTheme = () => { try { return localStorage.getItem('theme') ?? 'system'; } catch { return 'system'; } };

export default function MorePage() {
  const stored = useSyncExternalStore(() => () => {}, readTheme, () => 'system');
  const [theme, setTheme] = useState<string | null>(null);
  const current = theme ?? stored;
  const choose = (t: string) => {
    setTheme(t);
    try { if (t === 'system') localStorage.removeItem('theme'); else localStorage.setItem('theme', t); } catch {}
    if (t === 'system') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="More" />

      <ul className="panel mb-8 md:hidden">
        {LINKS.map(({ href, label, note, icon: Icon }) => (
          <li key={href} className="border-t border-line first:border-0">
            <Link href={href} className="flex min-h-16 items-center gap-4 px-4 py-3">
              <Icon size={22} className="text-accent" aria-hidden />
              <span className="flex-1"><span className="block font-semibold">{label}</span><span className="block text-[13px] text-ink-3">{note}</span></span>
              <ChevronRight size={18} className="text-ink-3" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>

      <section className="mb-8" aria-labelledby="cal">
        <h2 id="cal" className="section-title">Deadlines in your calendar</h2>
        <p className="mb-3 mt-1 max-w-prose text-[14px] text-ink-2">Subscribe once on iPhone, iPad or Mac and new deadlines appear by themselves, with alerts a week and a day before. The link contains a private key: share it with no one.</p>
        <CalendarLinks />
      </section>

      <section className="mb-8" aria-labelledby="exp">
        <h2 id="exp" className="section-title">Export your data</h2>
        <p className="mb-3 mt-1 text-[14px] text-ink-2">A full copy for safekeeping, or spreadsheets to open in Numbers or Excel.</p>
        <div className="flex flex-wrap gap-2">
          <a className="btn" href="/api/export?format=json" download><FileJson size={18} aria-hidden /> Everything (JSON)</a>
          {(['programs', 'scholarships', 'supervisors', 'referees'] as const).map(t => (
            <a key={t} className="btn" href={`/api/export?format=csv&table=${t}`} download><FileSpreadsheet size={18} aria-hidden /> {t[0].toUpperCase() + t.slice(1)} (CSV)</a>
          ))}
        </div>
      </section>

      <section className="mb-8" aria-labelledby="look">
        <h2 id="look" className="section-title mb-3">Appearance</h2>
        <div className="inline-flex rounded-[12px] border border-line bg-surface p-1" role="radiogroup" aria-label="Theme">
          {THEMES.map(([v, label]) => (
            <button key={v} role="radio" aria-checked={current === v} onClick={() => choose(v)}
              className={`min-h-10 rounded-[9px] px-4 text-[14px] font-semibold ${current === v ? 'bg-ink text-paper' : 'text-ink-2'}`}>{label}</button>
          ))}
        </div>
      </section>

      <form action={logout}>
        <button className="btn btn-danger"><LogOut size={18} aria-hidden /> Sign out</button>
      </form>
    </div>
  );
}
