'use client';

import { BookOpen, CalendarDays, Columns3, Ellipsis, Landmark, PenLine, Sun, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useApp } from '@/lib/store';
import { Toaster } from './ui';

const NAV = [
  { href: '/', label: 'Today', icon: Sun, phone: true },
  { href: '/programs', label: 'Programs', icon: BookOpen, phone: true },
  { href: '/tracker', label: 'Board', icon: Columns3 },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/scholarships', label: 'Funding', icon: Landmark, phone: true },
  { href: '/supervisors', label: 'Supervisors', short: 'Faculty', icon: Users, phone: true },
  { href: '/referees', label: 'Referees', icon: PenLine },
  { href: '/more', label: 'More', icon: Ellipsis, phone: true },
];

const isActive = (path: string, href: string) => (href === '/' ? path === '/' : path.startsWith(href));

export default function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const sample = useApp(s => s.sample);
  // Remember the device time zone so the server counts days the same way the phone does.
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && !document.cookie.includes(`tz=${encodeURIComponent(tz)}`)) {
      document.cookie = `tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;
    }
  }, []);
  // On a phone, "More" also covers the pages that have no tab of their own.
  const phoneActive = (href: string) =>
    href === '/more' ? ['/more', '/tracker', '/calendar', '/referees'].some(h => path.startsWith(h)) : isActive(path, href);

  return (
    <div className="shell">
      <nav className="rail" aria-label="Main">
        <Link href="/" className="rail-brand" aria-label="PhD Tracker, today">
          <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full text-[14px] font-extrabold tracking-tight text-white shadow-[0_6px_16px_-8px_rgba(31,58,147,0.8)]" style={{ background: 'var(--hero)' }}>
            PhD<span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gold" aria-hidden />
          </span>
          <span className="brand-text ml-3 leading-tight">
            <span className="block text-[17px] font-extrabold tracking-tight">PhD Tracker</span>
            <span className="block text-[12px] text-ink-3">Fall 2027 applications</span>
          </span>
        </Link>
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`rail-link ${href === '/more' ? 'rail-foot' : ''}`} aria-current={isActive(path, href) ? 'page' : undefined}>
            <Icon size={20} strokeWidth={1.9} aria-hidden />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <main className="main">
        {sample && (
          <p className="mb-5 rounded-[10px] border border-dashed border-line px-3 py-2 text-[13px] text-ink-3">
            Sample data: Supabase keys are not set, so changes live only until the dev server restarts.
          </p>
        )}
        {children}
      </main>

      <nav className="tabbar" aria-label="Main">
        {NAV.filter(n => n.phone).map(({ href, label, short, icon: Icon }) => (
          <Link key={href} href={href} className="tab" aria-current={phoneActive(href) ? 'page' : undefined}>
            <Icon size={23} strokeWidth={phoneActive(href) ? 2.2 : 1.8} aria-hidden />
            {short ?? label}
          </Link>
        ))}
      </nav>
      <Toaster />
    </div>
  );
}
