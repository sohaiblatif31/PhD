'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Program, ApplicationStatus, Language, FitLevel, GmatRequired, Priority } from '@/lib/types';

const defaultDocs = () => [
  { id: 'd1', name: 'Statement of Purpose', status: 'Not Started' as const },
  { id: 'd2', name: 'CV / Resume', status: 'Not Started' as const },
  { id: 'd3', name: 'Transcripts', status: 'Not Started' as const },
  { id: 'd4', name: 'Reference Letter 1', status: 'Not Started' as const },
  { id: 'd5', name: 'Reference Letter 2', status: 'Not Started' as const },
  { id: 'd6', name: 'Reference Letter 3', status: 'Not Started' as const },
  { id: 'd7', name: 'GMAT / GRE Score', status: 'Not Started' as const },
  { id: 'd8', name: 'English Proficiency', status: 'Not Started' as const },
  { id: 'd9', name: 'Research Proposal', status: 'Not Started' as const },
  { id: 'd10', name: 'Application Form + Fee', status: 'Not Started' as const },
];

export default function NewProgramPage() {
  const router = useRouter();
  const { addProgram } = useStore();

  const [form, setForm] = useState({
    university: '',
    school: '',
    program: '',
    specialization: '',
    fit: 'Medium' as FitLevel,
    funding: '',
    fundingAmount: '',
    deadline: '',
    deadlineDate: '',
    applyLink: '',
    eligibility: '',
    requirements: '',
    competitiveness: '',
    otherInfo: '',
    city: '',
    province: '',
    language: 'English' as Language,
    gmatRequired: 'Yes' as GmatRequired,
    duration: '4-5 years',
    status: 'Not Started' as ApplicationStatus,
    priority: 'Medium' as Priority,
    notes: '',
  });

  const handleSubmit = () => {
    if (!form.university || !form.program) return;
    const now = new Date().toISOString();
    const newProgram: Program = {
      ...form,
      id: `prog-${Date.now()}`,
      supervisors: [],
      documents: defaultDocs(),
      createdAt: now,
      updatedAt: now,
      deadlineDate: form.deadlineDate || null,
      lastVerified: null,
    };
    addProgram(newProgram);
    router.push('/programs');
  };

  const Field = ({ label, name, type = 'text', placeholder = '', options }: {
    label: string; name: keyof typeof form; type?: string; placeholder?: string; options?: string[];
  }) => (
    <div>
      <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>
        {label}
      </label>
      {options ? (
        <select className="input-field" value={form[name] as string} onChange={e => setForm({ ...form, [name]: e.target.value })} style={{ cursor: 'pointer' }} aria-label={label}>
          {options.map(o => <option key={o} value={o} style={{ background: '#111827' }}>{o}</option>)}
        </select>
      ) : (
        <input className="input-field" type={type} placeholder={placeholder} value={form[name] as string} onChange={e => setForm({ ...form, [name]: e.target.value })} />
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '800px' }}>
      <Link href="/programs" style={{ textDecoration: 'none' }}>
        <button className="btn-ghost" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={14} /> Back to Programs
        </button>
      </Link>

      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>Add New Program</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Add a Canadian PhD program to track</p>
      </div>

      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ gridColumn: '1/-1' }}>
            <Field label="University Name *" name="university" placeholder="University of British Columbia" />
          </div>
          <Field label="School / Faculty *" name="school" placeholder="Sauder School of Business" />
          <Field label="Program Name *" name="program" placeholder="PhD in Business Administration" />
          <div style={{ gridColumn: '1/-1' }}>
            <Field label="Specialization" name="specialization" placeholder="Operations Management / Supply Chain" />
          </div>
          <Field label="Fit Level" name="fit" options={['High', 'Medium', 'Low']} />
          <Field label="Priority" name="priority" options={['High', 'Medium', 'Low']} />
          <Field label="Status" name="status" options={['Not Started', 'Researching', 'Writing', 'Submitted', 'Interview', 'Offer Received', 'Accepted', 'Rejected']} />
          <Field label="Language" name="language" options={['English', 'French', 'Bilingual']} />
          <Field label="GMAT/GRE Required" name="gmatRequired" options={['Yes', 'No', 'Optional']} />
          <Field label="Program Duration" name="duration" options={['4 years', '4-5 years', '5 years', 'Variable']} />
          <Field label="City" name="city" placeholder="Vancouver" />
          <Field label="Province" name="province" options={['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'ON', 'QC', 'SK']} />
          <Field label="Deadline Date (YYYY-MM-DD)" name="deadlineDate" type="date" />
          <Field label="Funding Amount (e.g. $120,000+)" name="fundingAmount" placeholder="$120,000+" />
          <div style={{ gridColumn: '1/-1' }}>
            <Field label="Apply Link" name="applyLink" placeholder="https://..." />
          </div>

          {[
            { label: 'Funding Package Details', name: 'funding' as const, placeholder: 'Full tuition + stipend details...' },
            { label: 'Eligibility Requirements', name: 'eligibility' as const, placeholder: "Master's degree with 3.5+ GPA..." },
            { label: 'Application Requirements', name: 'requirements' as const, placeholder: 'Transcripts, 3 references, GMAT...' },
            { label: 'Competitiveness', name: 'competitiveness' as const, placeholder: 'Small cohort, very selective...' },
            { label: 'Fit to Your Profile', name: 'otherInfo' as const, placeholder: 'Why this program fits your background...' },
          ].map(({ label, name, placeholder }) => (
            <div key={name} style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>{label}</label>
              <textarea className="input-field" style={{ minHeight: '70px', resize: 'vertical', fontFamily: 'inherit' }} value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })} placeholder={placeholder} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button className="btn-primary" onClick={handleSubmit}>Add Program</button>
          <Link href="/programs">
            <button className="btn-ghost">Cancel</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
