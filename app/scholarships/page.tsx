'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store/useStore';
import { Scholarship } from '@/lib/types';
import { ExternalLink, Clock, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getEligibilityColor, getDeadlineColor, getDaysUntil, formatDate, SCHOLARSHIP_STATUSES } from '@/lib/utils';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const CATEGORIES = ['All', 'Federal', 'Provincial', 'Industry', 'Foundation'];

export default function ScholarshipsPage() {
  const { scholarships, initializeData, updateScholarshipStatus, updateScholarshipEligibility, loading } = useStore();
  const [category, setCategory] = useState('All');
  const [showDiscontinued, setShowDiscontinued] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { initializeData(); }, [initializeData]);

  if (loading && scholarships.length === 0) {
    return <LoadingSpinner message="Loading scholarships..." />;
  }

  const active = scholarships.filter(s => !s.discontinued);
  const filtered = (showDiscontinued ? scholarships : active).filter(s => category === 'All' || s.category === category);

  const totalEligible = active.filter(s => s.eligibleForMe === 'Yes').length;
  const maxFunding = active
    .filter(s => s.eligibleForMe !== 'No')
    .reduce((sum, s) => {
      const match = s.valueAmount.match(/\$([\d,]+)/);
      if (match) return sum + parseInt(match[1].replace(/,/g, ''));
      return sum;
    }, 0);

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>Scholarships &amp; Funding</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          {totalEligible} active scholarships eligible · Up to ${maxFunding.toLocaleString()} CAD potential funding
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <MiniStat label="Eligible" value={totalEligible} color="#10b981" />
        <MiniStat label="Partially Eligible" value={active.filter(s => s.eligibleForMe === 'Partial').length} color="#f59e0b" />
        <MiniStat label="Applied / Awarded" value={active.filter(s => ['Applied', 'Awarded'].includes(s.status)).length} color="#7c3aed" />
      </div>

      {/* Category filter + discontinued toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{
              padding: '6px 14px',
              borderRadius: '999px',
              border: '1px solid',
              borderColor: category === c ? '#7c3aed' : 'var(--border)',
              background: category === c ? 'rgba(124,58,237,0.15)' : 'transparent',
              color: category === c ? '#a78bfa' : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {c}
          </button>
        ))}
        <button
          onClick={() => setShowDiscontinued(!showDiscontinued)}
          style={{
            padding: '6px 14px',
            borderRadius: '999px',
            border: '1px solid',
            borderColor: showDiscontinued ? '#ef4444' : 'var(--border)',
            background: showDiscontinued ? 'rgba(239,68,68,0.15)' : 'transparent',
            color: showDiscontinued ? '#fca5a5' : 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginLeft: 'auto',
          }}
        >
          {showDiscontinued ? '🚫 Hide Discontinued' : '🚫 Show Discontinued'}
        </button>
      </div>

      {/* Scholarship cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.map(s => (
          <ScholarshipCard
            key={s.id}
            scholarship={s}
            expanded={expanded === s.id}
            onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
            onStatusChange={(id, status) => updateScholarshipStatus(id, status as Scholarship['status'])}
            onEligibilityChange={(id, e) => updateScholarshipEligibility(id, e as Scholarship['eligibleForMe'])}
          />
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
      <div style={{ fontSize: '28px', fontWeight: '800', color, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

function ScholarshipCard({ scholarship: s, expanded, onToggle, onStatusChange, onEligibilityChange }: {
  scholarship: Scholarship;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, status: string) => void;
  onEligibilityChange: (id: string, e: string) => void;
}) {
  return (
    <div className="glass-card" style={{ padding: '20px', opacity: s.discontinued ? 0.75 : 1, border: s.discontinued ? '1px solid rgba(239,68,68,0.3)' : undefined }}>
      {/* Discontinued banner */}
      {s.discontinued && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '8px', padding: '10px 14px', marginBottom: '14px',
          color: '#fca5a5', fontSize: '13px', fontWeight: '600',
        }}>
          <AlertTriangle size={15} />
          <span>DISCONTINUED — This scholarship no longer exists. Apply to <strong>CGRS-D</strong> instead (schol-1 above).</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}>
              {s.category}
            </span>
            {s.internationalEligible && !s.discontinued && (
              <span className="badge" style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.2)' }}>
                International ✓
              </span>
            )}
            {/* Last verified badge */}
            {s.lastVerified ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#34d399', fontWeight: '600' }}>
                <ShieldCheck size={11} /> Verified {s.lastVerified}
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#f59e0b', fontWeight: '600' }}>
                <AlertTriangle size={11} /> Not Verified
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: s.discontinued ? '#fca5a5' : 'var(--text-primary)', lineHeight: '1.3', textDecoration: s.discontinued ? 'line-through' : 'none' }}>{s.name}</h3>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '20px', fontWeight: '800', color: s.discontinued ? '#6b7280' : '#10b981' }}>{s.valueAmount}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>per year</div>
        </div>
      </div>

      {!s.discontinued && (
        <>
          {/* Controls row */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '4px' }}>Eligible?</label>
              <select className="input-field" style={{ fontSize: '12px', padding: '5px 8px', cursor: 'pointer' }} value={s.eligibleForMe} onChange={e => onEligibilityChange(s.id, e.target.value)} aria-label="Eligibility">
                {['Yes', 'Partial', 'No'].map(v => <option key={v} value={v} style={{ background: '#111827' }}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '10px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '4px' }}>Status</label>
              <select className="input-field" style={{ fontSize: '12px', padding: '5px 8px', cursor: 'pointer' }} value={s.status} onChange={e => onStatusChange(s.id, e.target.value)} aria-label="Status">
                {SCHOLARSHIP_STATUSES.map(v => <option key={v} value={v} style={{ background: '#111827' }}>{v}</option>)}
              </select>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span className={`badge ${getEligibilityColor(s.eligibleForMe)}`}>{s.eligibleForMe === 'Yes' ? '✓ Eligible' : s.eligibleForMe === 'Partial' ? '⚠ Partial' : '✗ Not Eligible'}</span>
              <span className={`badge ${getDeadlineColor(s.deadlineDate)}`}><Clock size={10} style={{ marginRight: '3px' }} />{getDaysUntil(s.deadlineDate)}</span>
            </div>
          </div>

          {/* Deadline */}
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Deadline:</strong> {formatDate(s.deadlineDate)} — {s.deadline}
          </div>
        </>
      )}

      {/* Expand toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="btn-ghost"
          style={{ fontSize: '12px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
          onClick={onToggle}
        >
          <Info size={13} /> {expanded ? 'Hide Details' : 'Show Details'}
        </button>
        {!s.discontinued && (
          <a href={s.link} target="_blank" rel="noreferrer">
            <button className="btn-ghost" style={{ fontSize: '12px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ExternalLink size={13} /> Apply
            </button>
          </a>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: 'Eligibility', content: s.eligibility },
            { label: 'Requirements', content: s.requirements },
            { label: 'Competitiveness', content: s.competitiveness },
            { label: 'Notes', content: s.notes },
          ].map(({ label, content }) => (
            <div key={label}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px' }}>{label}</div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
