'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store/useStore';
import { ApplicationStatus } from '@/lib/types';
import { getStatusColor, getPriorityColor, getDeadlineColor, getDaysUntil, formatDate, getDocumentProgress } from '@/lib/utils';
import Link from 'next/link';
import { GraduationCap, ExternalLink } from 'lucide-react';

const COLUMNS: { status: ApplicationStatus; emoji: string; color: string }[] = [
  { status: 'Not Started', emoji: '📋', color: '#475569' },
  { status: 'Researching', emoji: '🔍', color: '#3b82f6' },
  { status: 'Writing', emoji: '✍️', color: '#f59e0b' },
  { status: 'Submitted', emoji: '📤', color: '#8b5cf6' },
  { status: 'Interview', emoji: '🎤', color: '#06b6d4' },
  { status: 'Offer Received', emoji: '🎉', color: '#10b981' },
  { status: 'Accepted', emoji: '✅', color: '#22c55e' },
  { status: 'Rejected', emoji: '❌', color: '#f43f5e' },
];

export default function TrackerPage() {
  const { programs, initializeData, updateProgramStatus } = useStore();

  useEffect(() => { initializeData(); }, [initializeData]);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>Application Tracker</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Drag programs through stages as you progress</p>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {COLUMNS.map(col => {
          const count = programs.filter(p => p.status === col.status).length;
          return (
            <div key={col.status} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '14px' }}>{col.emoji}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{col.status}</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: col.color }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '24px', minHeight: '500px' }}>
        {COLUMNS.map(col => {
          const colPrograms = programs.filter(p => p.status === col.status);
          return (
            <div
              key={col.status}
              className="kanban-col"
              style={{ minWidth: '220px', maxWidth: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}
            >
              {/* Column header */}
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '16px' }}>{col.emoji}</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{col.status}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: col.color, background: `${col.color}20`, padding: '2px 8px', borderRadius: '999px' }}>
                  {colPrograms.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {colPrograms.map(p => (
                  <KanbanCard key={p.id} program={p} columns={COLUMNS} onMove={updateProgramStatus} />
                ))}
                {colPrograms.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', opacity: 0.5 }}>
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanCard({ program: p, columns, onMove }: {
  program: import('@/lib/types').Program;
  columns: typeof COLUMNS;
  onMove: (id: string, status: ApplicationStatus) => void;
}) {
  const progress = getDocumentProgress(p.documents);

  return (
    <div
      className="glass-card"
      style={{ padding: '12px', cursor: 'pointer' }}
    >
      <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px', lineHeight: '1.3' }}>
        {p.university}
      </div>
      <div style={{ fontSize: '10px', color: '#a78bfa', marginBottom: '8px' }}>{p.specialization}</div>

      {/* Priority + Deadline */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <span className={`badge ${getPriorityColor(p.priority)}`} style={{ fontSize: '10px', padding: '1px 7px' }}>{p.priority}</span>
        <span className={`badge ${getDeadlineColor(p.deadlineDate)}`} style={{ fontSize: '10px', padding: '1px 7px' }}>{getDaysUntil(p.deadlineDate)}</span>
      </div>

      {/* Doc progress */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Docs</span>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>{progress}%</span>
        </div>
        <div className="progress-bar" style={{ height: '3px' }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Move + Detail */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <select
          className="input-field"
          style={{ fontSize: '10px', padding: '3px 6px', flex: 1, cursor: 'pointer' }}
          value={p.status}
          onChange={e => onMove(p.id, e.target.value as ApplicationStatus)}
          aria-label="Move to status"
        >
          {columns.map(c => <option key={c.status} value={c.status} style={{ background: '#111827' }}>{c.emoji} {c.status}</option>)}
        </select>
        <Link href={`/programs/${p.id}`}>
          <button className="btn-ghost" style={{ padding: '3px 6px', fontSize: '10px' }} title="View details">
            <GraduationCap size={12} />
          </button>
        </Link>
      </div>
    </div>
  );
}
