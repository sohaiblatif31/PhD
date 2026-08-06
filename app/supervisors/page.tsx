'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store/useStore';
import { Supervisor } from '@/lib/types';
import { Plus, Mail, Globe, Trash2, Edit3, Check, X, Copy, CheckCheck } from 'lucide-react';

const emptyForm = (): Omit<Supervisor, 'id' | 'createdAt'> => ({
  university: '',
  name: '',
  researchFocus: '',
  email: '',
  website: '',
  googleScholar: '',
  contacted: false,
  responded: false,
  responseType: null,
  notes: '',
});

export default function SupervisorsPage() {
  const { supervisors, programs, addSupervisor, updateSupervisor, deleteSupervisor, initializeData } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editId, setEditId] = useState<string | null>(null);
  const [emailModal, setEmailModal] = useState<Supervisor | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { initializeData(); }, [initializeData]);

  const handleSubmit = () => {
    if (!form.name || !form.university) return;
    if (editId) {
      updateSupervisor(editId, form);
      setEditId(null);
    } else {
      addSupervisor({ ...form, id: `sup-${Date.now()}`, createdAt: new Date().toISOString() });
    }
    setForm(emptyForm());
    setShowForm(false);
  };

  const handleEdit = (sup: Supervisor) => {
    setForm({ university: sup.university, name: sup.name, researchFocus: sup.researchFocus, email: sup.email, website: sup.website, googleScholar: sup.googleScholar, contacted: sup.contacted, responded: sup.responded, responseType: sup.responseType, notes: sup.notes });
    setEditId(sup.id);
    setShowForm(true);
  };

  const generateEmail = (sup: Supervisor) => `Dear Dr. ${sup.name.split(' ').pop()},

I hope this message finds you well. I am writing to express my interest in pursuing doctoral research under your supervision at ${sup.university}.

My background is in Mechanical Engineering (NUST, Pakistan) and I have hands-on experience in full-stack development, supply chain digitization, and AI-driven operations — areas closely aligned with your research in ${sup.researchFocus || '[your research area]'}.

I am applying for a PhD for Fall 2027 intake and believe your work presents an exciting opportunity for impactful, interdisciplinary research. I would greatly appreciate the chance to discuss potential research directions and whether you have funding available for doctoral students.

I have attached my CV and a brief research statement for your review.

Thank you for your time and consideration.

Best regards,
Sohaib Latif
sohaib.latif@[your email]
LinkedIn: [your LinkedIn]`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const contacted = supervisors.filter(s => s.contacted).length;
  const responded = supervisors.filter(s => s.responded).length;
  const positive = supervisors.filter(s => s.responseType === 'Positive').length;

  return (
    <div style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>Supervisor Research</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {supervisors.length} supervisors tracked · {contacted} contacted · {responded} responded · {positive} positive
          </p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm()); }}>
          <Plus size={16} /> Add Supervisor
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total', value: supervisors.length, color: '#7c3aed' },
          { label: 'Contacted', value: contacted, color: '#06b6d4' },
          { label: 'Responded', value: responded, color: '#f59e0b' },
          { label: 'Positive', value: positive, color: '#10b981' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color, marginBottom: '2px' }}>{value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
            {editId ? 'Edit Supervisor' : 'Add Supervisor'}
          </h3>
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {([
              { key: 'name', label: 'Full Name *', placeholder: 'Dr. Jane Smith' },
              { key: 'university', label: 'University *', placeholder: 'University of Waterloo' },
              { key: 'email', label: 'Email', placeholder: 'jane.smith@uwaterloo.ca' },
              { key: 'website', label: 'Website', placeholder: 'https://uwaterloo.ca/...' },
              { key: 'googleScholar', label: 'Google Scholar URL', placeholder: 'https://scholar.google.com/...' },
              { key: 'researchFocus', label: 'Research Focus', placeholder: 'Supply chain optimization, AI in logistics' },
            ] as const).map(({ key, label, placeholder }) => (
              <div key={key}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>{label}</label>
                <input className="input-field" placeholder={placeholder} value={(form as unknown as Record<string, string>)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
              </div>
            ))}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: '6px' }}>Notes</label>
              <textarea className="input-field" style={{ minHeight: '60px', resize: 'vertical' }} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Research alignment, funding availability notes..." />
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {[
                { key: 'contacted', label: 'Contacted' },
                { key: 'responded', label: 'Responded' },
              ].map(({ key, label }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={(form as unknown as Record<string, boolean>)[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
                </label>
              ))}
              {form.responded && (
                <select className="input-field" style={{ fontSize: '12px', padding: '5px 8px', cursor: 'pointer' }} value={form.responseType ?? ''} onChange={e => setForm({ ...form, responseType: e.target.value as Supervisor['responseType'] })} aria-label="Response type">
                  <option value="">Response type</option>
                  <option value="Positive">Positive</option>
                  <option value="Negative">Negative</option>
                  <option value="Awaiting">Awaiting</option>
                </select>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button className="btn-primary" onClick={handleSubmit}>{editId ? 'Save Changes' : 'Add Supervisor'}</button>
            <button className="btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm()); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Supervisor Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {supervisors.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Mail size={40} color="#7c3aed" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>No supervisors yet</p>
            <p style={{ fontSize: '13px' }}>Add potential supervisors to track your outreach and responses.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name & University</th>
                <th>Research Focus</th>
                <th>Contacted</th>
                <th>Response</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {supervisors.map(sup => (
                <tr key={sup.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px' }}>{sup.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sup.university}</div>
                    {sup.notes && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>{sup.notes.slice(0, 60)}...</div>}
                  </td>
                  <td style={{ fontSize: '12px', maxWidth: '200px' }}>{sup.researchFocus || '—'}</td>
                  <td>
                    <button
                      onClick={() => updateSupervisor(sup.id, { contacted: !sup.contacted })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {sup.contacted ? <Check size={16} color="#10b981" /> : <X size={16} color="#64748b" />}
                      <span style={{ fontSize: '12px', color: sup.contacted ? '#10b981' : '#64748b' }}>
                        {sup.contacted ? 'Yes' : 'No'}
                      </span>
                    </button>
                  </td>
                  <td>
                    {!sup.responded ? (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>
                    ) : (
                      <span className="badge" style={{
                        background: sup.responseType === 'Positive' ? 'rgba(16,185,129,0.15)' : sup.responseType === 'Negative' ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)',
                        color: sup.responseType === 'Positive' ? '#10b981' : sup.responseType === 'Negative' ? '#f43f5e' : '#f59e0b',
                        border: '1px solid transparent',
                      }}>
                        {sup.responseType ?? 'Awaiting'}
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }} onClick={() => setEmailModal(sup)}>
                        <Mail size={12} /> Email
                      </button>
                      {sup.website && (
                        <a href={sup.website} target="_blank" rel="noreferrer">
                          <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: '11px' }} title="Website">
                            <Globe size={12} />
                          </button>
                        </a>
                      )}
                      <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => handleEdit(sup)} title="Edit">
                        <Edit3 size={12} />
                      </button>
                      <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => deleteSupervisor(sup.id)} title="Delete">
                        <Trash2 size={12} color="#f43f5e" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Email Template Modal */}
      {emailModal && (
        <div className="modal-overlay" onClick={() => setEmailModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Email Template — {emailModal.name}
              </h3>
              <button className="btn-ghost" style={{ padding: '6px 10px' }} onClick={() => setEmailModal(null)}>✕</button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
                {generateEmail(emailModal)}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => handleCopy(generateEmail(emailModal))}
              >
                {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              {emailModal.email && (
                <a href={`mailto:${emailModal.email}?subject=PhD Research Inquiry — Sohaib Latif&body=${encodeURIComponent(generateEmail(emailModal))}`}>
                  <button className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} /> Open in Mail
                  </button>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
