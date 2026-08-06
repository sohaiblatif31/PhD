'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store/useStore';
import {
  GraduationCap, DollarSign, Clock, TrendingUp, AlertCircle,
  CheckCircle, Target, Calendar, ExternalLink, ArrowRight,
} from 'lucide-react';
import { formatDate, getDaysUntil, getDeadlineColor, getStatusColor, getPriorityColor, getDocumentProgress } from '@/lib/utils';
import Link from 'next/link';

const STATUS_FUNNEL = [
  'Not Started', 'Researching', 'Writing', 'Submitted',
  'Interview', 'Offer Received', 'Accepted',
];

const STATUS_COLORS: Record<string, string> = {
  'Not Started': '#475569',
  'Researching': '#3b82f6',
  'Writing': '#f59e0b',
  'Submitted': '#8b5cf6',
  'Interview': '#06b6d4',
  'Offer Received': '#10b981',
  'Accepted': '#22c55e',
};

export default function Dashboard() {
  const { programs, scholarships, initializeData } = useStore();

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const totalPrograms = programs.length;
  const applied = programs.filter(p => ['Submitted', 'Interview', 'Offer Received', 'Accepted'].includes(p.status)).length;
  const highPriority = programs.filter(p => p.priority === 'High').length;

  // Upcoming deadlines (next 120 days, sorted)
  const upcomingDeadlines = [
    ...programs
      .filter(p => p.deadlineDate && p.status !== 'Accepted' && p.status !== 'Rejected')
      .map(p => ({ id: p.id, type: 'program' as const, name: p.university, program: p.program, deadlineDate: p.deadlineDate!, status: p.status, priority: p.priority })),
    ...scholarships
      .filter(s => s.deadlineDate && s.status !== 'Awarded' && s.status !== 'Not Awarded')
      .map(s => ({ id: s.id, type: 'scholarship' as const, name: s.shortName, program: s.name, deadlineDate: s.deadlineDate!, status: s.status, priority: undefined })),
  ]
    .sort((a, b) => new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime())
    .slice(0, 7);

  // Funnel data
  const funnelData = STATUS_FUNNEL.map(status => ({
    status,
    count: programs.filter(p => p.status === status).length,
    color: STATUS_COLORS[status],
  }));

  // Total potential funding
  const potentialFunding = scholarships.filter(s => s.eligibleForMe !== 'No').length;

  // Doc progress for in-progress programs
  const activePrograms = programs.filter(p => !['Not Started', 'Rejected'].includes(p.status));

  return (
    <div style={{ maxWidth: '1200px', animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>
            Good morning, Sohaib 👋
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
          Your PhD application dashboard — Fall 2027 intake
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard
          icon={<GraduationCap size={22} />}
          label="Programs Tracked"
          value={totalPrograms}
          sub={`${highPriority} high priority`}
          color="#7c3aed"
        />
        <StatCard
          icon={<CheckCircle size={22} />}
          label="Applications Sent"
          value={applied}
          sub={`of ${totalPrograms} programs`}
          color="#10b981"
        />
        <StatCard
          icon={<DollarSign size={22} />}
          label="Scholarships Eligible"
          value={potentialFunding}
          sub="including provincial"
          color="#f59e0b"
        />
        <StatCard
          icon={<Clock size={22} />}
          label="Next Deadline"
          value={upcomingDeadlines[0] ? getDaysUntil(upcomingDeadlines[0].deadlineDate) : '—'}
          sub={upcomingDeadlines[0]?.name ?? 'No deadlines set'}
          color="#f43f5e"
        />
      </div>

      {/* Main 2-col grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', marginBottom: '24px' }}>
        {/* Upcoming Deadlines */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#7c3aed" />
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Upcoming Deadlines</h2>
            </div>
            <Link href="/calendar" style={{ fontSize: '12px', color: '#8b5cf6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upcomingDeadlines.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No upcoming deadlines.</p>
            )}
            {upcomingDeadlines.map((item) => (
              <Link
                key={item.id}
                href={item.type === 'program' ? `/programs/${item.id}` : '/scholarships'}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: item.type === 'program' ? '#7c3aed' : '#f59e0b',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {formatDate(item.deadlineDate)}
                    </div>
                  </div>
                  <div>
                    <span className={`badge ${getDeadlineColor(item.deadlineDate)}`}>
                      {getDaysUntil(item.deadlineDate)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Application Funnel */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <TrendingUp size={18} color="#10b981" />
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Application Funnel</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {funnelData.map(({ status, count, color }) => (
              <div key={status}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{status}</span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color }}>
                    {count}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: totalPrograms > 0 ? `${(count / totalPrograms) * 100}%` : '0%',
                      background: color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '600', marginBottom: '2px' }}>
              🎯 TARGET
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Submit at least 5 applications by March 2027
            </div>
          </div>
        </div>
      </div>

      {/* Active Programs Row */}
      {activePrograms.length > 0 && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={18} color="#06b6d4" />
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>In-Progress Applications</h2>
            </div>
            <Link href="/programs" style={{ fontSize: '12px', color: '#8b5cf6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              All programs <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {activePrograms.map(p => {
              const progress = getDocumentProgress(p.documents);
              return (
                <Link key={p.id} href={`/programs/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    className="glass-card"
                    style={{ padding: '16px', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', flex: 1, marginRight: '8px' }}>
                        {p.university}
                      </span>
                      <span className={`badge ${getStatusColor(p.status)}`}>{p.status}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>{p.specialization}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Documents</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Links */}
      {activePrograms.length === 0 && (
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
          <AlertCircle size={40} color="#7c3aed" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Start your applications!
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
            You have {totalPrograms} programs tracked. Start researching and move them through the funnel.
          </p>
          <Link href="/programs">
            <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={16} /> View Programs
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  color: string;
}) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: `${color}20`,
            border: `1px solid ${color}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
          }}
        >
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '30px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '6px' }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  );
}
