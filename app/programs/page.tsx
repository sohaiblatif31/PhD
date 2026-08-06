'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store/useStore';
import { Program, ApplicationStatus, Priority } from '@/lib/types';
import {
  Search, Filter, Plus, MapPin, Globe, BookOpen,
  ExternalLink, ChevronDown, Star, Clock,
} from 'lucide-react';
import Link from 'next/link';
import {
  cn, getStatusColor, getPriorityColor, getFitColor,
  getDeadlineColor, getDaysUntil, formatDate, APPLICATION_STATUSES
} from '@/lib/utils';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const PROVINCES = ['All', 'AB', 'BC', 'MB', 'NS', 'ON', 'QC'];
const LANGUAGES = ['All', 'English', 'French', 'Bilingual'];
const FITS = ['All', 'High', 'Medium', 'Low'];
const PRIORITIES = ['All', 'High', 'Medium', 'Low'];
const STATUSES = ['All', ...APPLICATION_STATUSES];

export default function ProgramsPage() {
  const { programs, initializeData, updateProgramStatus, updateProgramPriority, loading } = useStore();
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('All');
  const [language, setLanguage] = useState('All');
  const [fit, setFit] = useState('All');
  const [priority, setPriority] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState<'deadline' | 'funding' | 'fit' | 'priority'>('deadline');

  useEffect(() => { initializeData(); }, [initializeData]);

  if (loading && programs.length === 0) {
    return <LoadingSpinner message="Loading programs..." />;
  }

  const filtered = programs
    .filter(p => {
      const q = search.toLowerCase();
      if (q && !p.university.toLowerCase().includes(q) && !p.program.toLowerCase().includes(q) && !p.specialization.toLowerCase().includes(q) && !p.city.toLowerCase().includes(q)) return false;
      if (province !== 'All' && p.province !== province) return false;
      if (language !== 'All' && p.language !== language) return false;
      if (fit !== 'All' && p.fit !== fit) return false;
      if (priority !== 'All' && p.priority !== priority) return false;
      if (status !== 'All' && p.status !== status) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'deadline') {
        if (!a.deadlineDate) return 1;
        if (!b.deadlineDate) return -1;
        return new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime();
      }
      if (sort === 'priority') {
        const order = { High: 0, Medium: 1, Low: 2 };
        return order[a.priority] - order[b.priority];
      }
      if (sort === 'fit') {
        const order = { High: 0, Medium: 1, Low: 2 };
        return order[a.fit] - order[b.fit];
      }
      return 0;
    });

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
            PhD Programs
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {filtered.length} of {programs.length} programs shown
          </p>
        </div>
        <Link href="/programs/new">
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} /> Add Program
          </button>
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="glass-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              className="input-field"
              style={{ paddingLeft: '36px' }}
              placeholder="Search university, program, city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <FilterSelect label="Province" value={province} onChange={setProvince} options={PROVINCES} />
          <FilterSelect label="Language" value={language} onChange={setLanguage} options={LANGUAGES} />
          <FilterSelect label="Fit" value={fit} onChange={setFit} options={FITS} />
          <FilterSelect label="Priority" value={priority} onChange={setPriority} options={PRIORITIES} />
          <FilterSelect label="Status" value={status} onChange={setStatus} options={STATUSES} />
          <FilterSelect label="Sort by" value={sort} onChange={v => setSort(v as typeof sort)} options={['deadline', 'priority', 'fit', 'funding']} />
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {filtered.map(p => (
          <ProgramCard
            key={p.id}
            program={p}
            onStatusChange={(id, s) => updateProgramStatus(id, s)}
            onPriorityChange={(id, pr) => updateProgramPriority(id, pr)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No programs match your filters.
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        className="input-field select"
        style={{ paddingRight: '32px', minWidth: '110px', cursor: 'pointer' }}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={label}
      >
        {options.map(o => (
          <option key={o} value={o} style={{ background: '#111827' }}>{o}</option>
        ))}
      </select>
      <ChevronDown size={13} color="var(--text-muted)" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
    </div>
  );
}

function ProgramCard({ program: p, onStatusChange, onPriorityChange }: {
  program: Program;
  onStatusChange: (id: string, s: ApplicationStatus) => void;
  onPriorityChange: (id: string, pr: Priority) => void;
}) {
  return (
    <div
      className="glass-card"
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px', lineHeight: '1.3' }}>
            {p.university}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.school}</div>
        </div>
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <span className={`badge ${getPriorityColor(p.priority)}`}>{p.priority}</span>
        </div>
      </div>

      {/* Specialization */}
      <div style={{ fontSize: '13px', color: '#a78bfa', fontWeight: '500' }}>{p.specialization}</div>

      {/* Fit + Location */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Star size={12} className={getFitColor(p.fit)} style={{ color: p.fit === 'High' ? '#10b981' : p.fit === 'Medium' ? '#f59e0b' : '#64748b' }} />
          <span style={{ fontSize: '12px', fontWeight: '600', color: p.fit === 'High' ? '#10b981' : p.fit === 'Medium' ? '#f59e0b' : '#64748b' }}>
            {p.fit} Fit
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={12} color="var(--text-muted)" />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.city}, {p.province}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Globe size={12} color="var(--text-muted)" />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.language}</span>
        </div>
      </div>

      {/* Funding */}
      <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
        <div style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: '600', marginBottom: '2px' }}>FUNDING</div>
        <div style={{ fontSize: '13px', color: '#10b981', fontWeight: '700' }}>{p.fundingAmount}</div>
      </div>

      {/* Deadline */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={13} color="var(--text-muted)" />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(p.deadlineDate)}</span>
        </div>
        <span className={`badge ${getDeadlineColor(p.deadlineDate)}`}>
          {getDaysUntil(p.deadlineDate)}
        </span>
      </div>

      {/* Status selector */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <select
          className="input-field"
          style={{ flex: 1, fontSize: '12px', padding: '6px 10px', cursor: 'pointer' }}
          value={p.status}
          onChange={e => onStatusChange(p.id, e.target.value as ApplicationStatus)}
          aria-label="Application status"
        >
          {APPLICATION_STATUSES.map(s => (
            <option key={s} value={s} style={{ background: '#111827' }}>{s}</option>
          ))}
        </select>
        <Link href={`/programs/${p.id}`}>
          <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BookOpen size={13} /> Details
          </button>
        </Link>
        <a href={p.applyLink} target="_blank" rel="noreferrer">
          <button className="btn-ghost" style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ExternalLink size={13} />
          </button>
        </a>
      </div>
    </div>
  );
}
