'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { formatDate, getDaysUntil, getDeadlineColor } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Download } from 'lucide-react';
import Link from 'next/link';

interface CalEvent {
  id: string;
  type: 'program' | 'scholarship';
  name: string;
  date: string;
  href: string;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const { programs, scholarships, initializeData } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => { initializeData(); }, [initializeData]);

  // Gather all deadline events
  const events: CalEvent[] = [
    ...programs
      .filter(p => p.deadlineDate)
      .map(p => ({ id: p.id, type: 'program' as const, name: p.university, date: p.deadlineDate!, href: `/programs/${p.id}` })),
    ...scholarships
      .filter(s => s.deadlineDate)
      .map(s => ({ id: s.id, type: 'scholarship' as const, name: s.shortName, date: s.deadlineDate!, href: '/scholarships' })),
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  // Sorted upcoming
  const upcoming = events
    .filter(e => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleExportICS = () => {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PhD Tracker//EN',
      'CALSCALE:GREGORIAN',
    ];
    events.forEach(e => {
      const d = e.date.replace(/-/g, '');
      lines.push(
        'BEGIN:VEVENT',
        `UID:${e.id}@phd-tracker`,
        `DTSTART;VALUE=DATE:${d}`,
        `DTEND;VALUE=DATE:${d}`,
        `SUMMARY:DEADLINE: ${e.name} (${e.type})`,
        `DESCRIPTION:PhD Application Deadline`,
        'END:VEVENT',
      );
    });
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'phd-deadlines.ics';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>Deadline Calendar</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{events.length} deadlines tracked across programs and scholarships</p>
        </div>
        <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleExportICS}>
          <Download size={15} /> Export .ics
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>
        {/* Calendar */}
        <div className="glass-card" style={{ padding: '24px' }}>
          {/* Month navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button className="btn-ghost" style={{ padding: '8px' }} onClick={prevMonth}><ChevronLeft size={18} /></button>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {MONTH_NAMES[month]} {year}
            </h2>
            <button className="btn-ghost" style={{ padding: '8px' }} onClick={nextMonth}><ChevronRight size={18} /></button>
          </div>

          {/* Day names */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
            {DAY_NAMES.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {/* Empty cells for first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} style={{ minHeight: '64px' }} />
            ))}
            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              const isPast = new Date(year, month, day) < today;

              return (
                <div
                  key={day}
                  style={{
                    minHeight: '64px',
                    padding: '6px',
                    borderRadius: '8px',
                    background: isToday ? 'rgba(124,58,237,0.15)' : dayEvents.length > 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                    border: isToday ? '1px solid rgba(124,58,237,0.4)' : dayEvents.length > 0 ? '1px solid var(--border)' : '1px solid transparent',
                    opacity: isPast ? 0.5 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: isToday ? '800' : '500', color: isToday ? '#a78bfa' : 'var(--text-secondary)', marginBottom: '4px' }}>
                    {day}
                  </div>
                  {dayEvents.map(e => (
                    <Link key={e.id} href={e.href} style={{ textDecoration: 'none' }}>
                      <div style={{
                        fontSize: '9px',
                        fontWeight: '600',
                        padding: '2px 4px',
                        borderRadius: '4px',
                        marginBottom: '2px',
                        background: e.type === 'program' ? 'rgba(124,58,237,0.3)' : 'rgba(245,158,11,0.3)',
                        color: e.type === 'program' ? '#c4b5fd' : '#fcd34d',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        cursor: 'pointer',
                      }}>
                        {e.name}
                      </div>
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(124,58,237,0.4)' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PhD Program</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(245,158,11,0.4)' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scholarship</span>
            </div>
          </div>
        </div>

        {/* Upcoming sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CalIcon size={16} color="#7c3aed" />
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Upcoming Deadlines</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upcoming.slice(0, 10).map(e => (
                <Link key={e.id} href={e.href} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e2 => (e2.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                    onMouseLeave={e2 => (e2.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  >
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{e.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDate(e.date)}</span>
                      <span className={`badge ${getDeadlineColor(e.date)}`} style={{ fontSize: '10px' }}>
                        {getDaysUntil(e.date)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              {upcoming.length === 0 && (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No upcoming deadlines set.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
