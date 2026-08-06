'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import {
  ArrowLeft, ExternalLink, MapPin, Globe, Clock, DollarSign,
  CheckCircle, Circle, MinusCircle, BookOpen, Star, Save, Trash2, Edit3,
} from 'lucide-react';
import Link from 'next/link';
import { ApplicationStatus, DocumentStatus, Priority } from '@/lib/types';
import {
  getStatusColor, getPriorityColor, getDeadlineColor,
  getDaysUntil, formatDate, APPLICATION_STATUSES, getDocumentProgress,
} from '@/lib/utils';

const DOC_STATUS_ICONS: Record<DocumentStatus, React.ReactNode> = {
  'Not Started': <Circle size={16} color="#64748b" />,
  'In Progress': <MinusCircle size={16} color="#f59e0b" />,
  'Done': <CheckCircle size={16} color="#10b981" />,
};

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { programs, updateProgram, updateDocumentStatus, updateProgramNotes, updateProgramStatus, updateProgramPriority, deleteProgram } = useStore();
  const program = programs.find(p => p.id === id);
  const [notes, setNotes] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (program) setNotes(program.notes);
  }, [program]);

  if (!program) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <p>Program not found.</p>
        <Link href="/programs"><button className="btn-ghost" style={{ marginTop: '16px' }}>← Back</button></Link>
      </div>
    );
  }

  const progress = getDocumentProgress(program.documents);

  const handleSaveNotes = () => {
    updateProgramNotes(program.id, notes);
    setEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Delete this program?')) {
      deleteProgram(program.id);
      router.push('/programs');
    }
  };

  return (
    <div style={{ maxWidth: '900px', animation: 'fadeIn 0.3s ease' }}>
      {/* Back */}
      <Link href="/programs" style={{ textDecoration: 'none' }}>
        <button className="btn-ghost" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={14} /> Back to Programs
        </button>
      </Link>

      {/* Header card */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
              {program.university}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{program.school}</p>
            <p style={{ fontSize: '13px', color: '#a78bfa', fontWeight: '500' }}>{program.program} — {program.specialization}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-ghost" style={{ padding: '8px', display: 'flex', alignItems: 'center' }} onClick={handleDelete} title="Delete program">
              <Trash2 size={15} color="#f43f5e" />
            </button>
            <a href={program.applyLink} target="_blank" rel="noreferrer">
              <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ExternalLink size={14} /> Apply Now
              </button>
            </a>
          </div>
        </div>

        {/* Badges row */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <span className={`badge ${getStatusColor(program.status)}`}>{program.status}</span>
          <span className={`badge ${getPriorityColor(program.priority)}`}>Priority: {program.priority}</span>
          <span className={`badge ${getDeadlineColor(program.deadlineDate)}`}>
            <Clock size={10} style={{ marginRight: '4px' }} />{getDaysUntil(program.deadlineDate)}
          </span>
          <span className="badge" style={{ background: program.fit === 'High' ? 'rgba(16,185,129,0.15)' : program.fit === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(100,116,139,0.15)', color: program.fit === 'High' ? '#10b981' : program.fit === 'Medium' ? '#f59e0b' : '#94a3b8', border: '1px solid transparent' }}>
            <Star size={10} style={{ marginRight: '4px' }} />{program.fit} Fit
          </span>
        </div>

        {/* Status + Priority controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Status</label>
            <select className="input-field" style={{ cursor: 'pointer' }} value={program.status} onChange={e => updateProgramStatus(program.id, e.target.value as ApplicationStatus)} aria-label="Status">
              {APPLICATION_STATUSES.map(s => <option key={s} value={s} style={{ background: '#111827' }}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Priority</label>
            <select className="input-field" style={{ cursor: 'pointer' }} value={program.priority} onChange={e => updateProgramPriority(program.id, e.target.value as Priority)} aria-label="Priority">
              {['High', 'Medium', 'Low'].map(s => <option key={s} value={s} style={{ background: '#111827' }}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Deadline</label>
            <div className="input-field" style={{ color: 'var(--text-secondary)', cursor: 'default' }}>{formatDate(program.deadlineDate)}</div>
          </div>
        </div>
      </div>

      {/* Main 2-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Info sections */}
          {[
            { label: 'Fit to Your Profile', icon: <Star size={14} color="#10b981" />, content: program.fit + ': ' + (program.otherInfo || 'See specialization details above') },
            { label: 'Funding Package', icon: <DollarSign size={14} color="#10b981" />, content: program.funding },
            { label: 'Eligibility', icon: <CheckCircle size={14} color="#06b6d4" />, content: program.eligibility },
            { label: 'Application Requirements', icon: <BookOpen size={14} color="#8b5cf6" />, content: program.requirements },
            { label: 'Competitiveness', icon: <Star size={14} color="#f59e0b" />, content: program.competitiveness },
            { label: 'Other Info', icon: <Globe size={14} color="#94a3b8" />, content: program.otherInfo },
          ].map(({ label, icon, content }) => (
            <div key={label} className="glass-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                {icon}
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{content}</p>
            </div>
          ))}

          {/* Notes */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Edit3 size={14} color="#8b5cf6" />
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Personal Notes</span>
              </div>
              {editing ? (
                <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={handleSaveNotes}>
                  <Save size={12} /> Save
                </button>
              ) : (
                <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setEditing(true)}>Edit</button>
              )}
            </div>
            <textarea
              className="input-field"
              style={{ minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.6', fontSize: '13px' }}
              value={notes}
              onChange={e => { setNotes(e.target.value); setEditing(true); }}
              placeholder="Add your personal notes, supervisor names, research ideas..."
            />
          </div>
        </div>

        {/* Right — Documents + Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Meta */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' }}>Details</h3>
            {[
              { label: 'Location', value: `${program.city}, ${program.province}` },
              { label: 'Language', value: program.language },
              { label: 'GMAT/GRE', value: program.gmatRequired },
              { label: 'Duration', value: program.duration },
              { label: 'Funding', value: program.fundingAmount },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Document Checklist */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Documents</h3>
              <span style={{ fontSize: '12px', fontWeight: '700', color: progress === 100 ? '#10b981' : 'var(--text-secondary)' }}>{progress}%</span>
            </div>
            <div className="progress-bar" style={{ marginBottom: '12px' }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {program.documents.map(doc => (
                <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                    onClick={() => {
                      const next: DocumentStatus = doc.status === 'Not Started' ? 'In Progress' : doc.status === 'In Progress' ? 'Done' : 'Not Started';
                      updateDocumentStatus(program.id, doc.id, next);
                    }}
                    title="Click to cycle status"
                  >
                    {DOC_STATUS_ICONS[doc.status]}
                  </button>
                  <span style={{ fontSize: '12px', color: doc.status === 'Done' ? '#10b981' : 'var(--text-secondary)', textDecoration: doc.status === 'Done' ? 'line-through' : 'none', flex: 1 }}>
                    {doc.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
