import { create } from 'zustand';
import { Program, Scholarship, Supervisor, ApplicationStatus, DocumentStatus } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface AppState {
  programs: Program[];
  scholarships: Scholarship[];
  supervisors: Supervisor[];
  initialized: boolean;
  loading: boolean;
  error: string | null;

  // Fetch actions
  initializeData: () => Promise<void>;

  // Program actions
  updateProgramStatus: (id: string, status: ApplicationStatus) => Promise<void>;
  updateProgramPriority: (id: string, priority: Program['priority']) => Promise<void>;
  updateProgramNotes: (id: string, notes: string) => Promise<void>;
  updateDocumentStatus: (programId: string, docId: string, status: DocumentStatus) => Promise<void>;
  addProgram: (program: Program) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
  updateProgram: (id: string, updates: Partial<Program>) => Promise<void>;

  // Scholarship actions
  updateScholarshipStatus: (id: string, status: Scholarship['status']) => Promise<void>;
  updateScholarshipEligibility: (id: string, eligible: Scholarship['eligibleForMe']) => Promise<void>;
  addScholarship: (scholarship: Scholarship) => Promise<void>;

  // Supervisor actions
  addSupervisor: (supervisor: Supervisor) => Promise<void>;
  updateSupervisor: (id: string, updates: Partial<Supervisor>) => Promise<void>;
  deleteSupervisor: (id: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  programs: [],
  scholarships: [],
  supervisors: [],
  initialized: false,
  loading: false,
  error: null,

  initializeData: async () => {
    if (get().initialized) return;
    set({ loading: true, error: null });
    try {
      const [programsRes, scholarshipsRes, supervisorsRes] = await Promise.all([
        supabase.from('programs').select('*'),
        supabase.from('scholarships').select('*'),
        supabase.from('supervisors').select('*'),
      ]);

      if (programsRes.error) throw programsRes.error;
      if (scholarshipsRes.error) throw scholarshipsRes.error;
      if (supervisorsRes.error) throw supervisorsRes.error;

      set({
        programs: programsRes.data as Program[],
        scholarships: scholarshipsRes.data as Scholarship[],
        supervisors: supervisorsRes.data as Supervisor[],
        initialized: true,
        loading: false,
      });
    } catch (err: any) {
      console.error('Error fetching data from Supabase:', err);
      set({ error: err.message, loading: false });
    }
  },

  updateProgramStatus: async (id, status) => {
    const prev = get().programs;
    set(state => ({ programs: state.programs.map(p => p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p) }));
    const { error } = await supabase.from('programs').update({ status, updatedAt: new Date().toISOString() }).eq('id', id);
    if (error) set({ programs: prev, error: error.message });
  },

  updateProgramPriority: async (id, priority) => {
    const prev = get().programs;
    set(state => ({ programs: state.programs.map(p => p.id === id ? { ...p, priority, updatedAt: new Date().toISOString() } : p) }));
    const { error } = await supabase.from('programs').update({ priority, updatedAt: new Date().toISOString() }).eq('id', id);
    if (error) set({ programs: prev, error: error.message });
  },

  updateProgramNotes: async (id, notes) => {
    const prev = get().programs;
    set(state => ({ programs: state.programs.map(p => p.id === id ? { ...p, notes, updatedAt: new Date().toISOString() } : p) }));
    const { error } = await supabase.from('programs').update({ notes, updatedAt: new Date().toISOString() }).eq('id', id);
    if (error) set({ programs: prev, error: error.message });
  },

  updateDocumentStatus: async (programId, docId, status) => {
    const prev = get().programs;
    const program = get().programs.find(p => p.id === programId);
    if (!program) return;
    
    const updatedDocs = program.documents.map(d => (d.id === docId ? { ...d, status } : d));
    set(state => ({
      programs: state.programs.map(p => p.id === programId ? { ...p, documents: updatedDocs, updatedAt: new Date().toISOString() } : p)
    }));
    
    const { error } = await supabase.from('programs').update({ documents: updatedDocs, updatedAt: new Date().toISOString() }).eq('id', programId);
    if (error) set({ programs: prev, error: error.message });
  },

  addProgram: async (program) => {
    set(state => ({ programs: [...state.programs, program] }));
    const { error } = await supabase.from('programs').insert(program);
    if (error) set(state => ({ programs: state.programs.filter(p => p.id !== program.id), error: error.message }));
  },

  deleteProgram: async (id) => {
    const prev = get().programs;
    set(state => ({ programs: state.programs.filter(p => p.id !== id) }));
    const { error } = await supabase.from('programs').delete().eq('id', id);
    if (error) set({ programs: prev, error: error.message });
  },

  updateProgram: async (id, updates) => {
    const prev = get().programs;
    set(state => ({ programs: state.programs.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p) }));
    const { error } = await supabase.from('programs').update({ ...updates, updatedAt: new Date().toISOString() }).eq('id', id);
    if (error) set({ programs: prev, error: error.message });
  },

  updateScholarshipStatus: async (id, status) => {
    const prev = get().scholarships;
    set(state => ({ scholarships: state.scholarships.map(s => s.id === id ? { ...s, status } : s) }));
    const { error } = await supabase.from('scholarships').update({ status }).eq('id', id);
    if (error) set({ scholarships: prev, error: error.message });
  },

  updateScholarshipEligibility: async (id, eligibleForMe) => {
    const prev = get().scholarships;
    set(state => ({ scholarships: state.scholarships.map(s => s.id === id ? { ...s, eligibleForMe } : s) }));
    const { error } = await supabase.from('scholarships').update({ eligibleForMe }).eq('id', id);
    if (error) set({ scholarships: prev, error: error.message });
  },

  addScholarship: async (scholarship) => {
    set(state => ({ scholarships: [...state.scholarships, scholarship] }));
    const { error } = await supabase.from('scholarships').insert(scholarship);
    if (error) set(state => ({ scholarships: state.scholarships.filter(s => s.id !== scholarship.id), error: error.message }));
  },

  addSupervisor: async (supervisor) => {
    set(state => ({ supervisors: [...state.supervisors, supervisor] }));
    const { error } = await supabase.from('supervisors').insert(supervisor);
    if (error) set(state => ({ supervisors: state.supervisors.filter(s => s.id !== supervisor.id), error: error.message }));
  },

  updateSupervisor: async (id, updates) => {
    const prev = get().supervisors;
    set(state => ({ supervisors: state.supervisors.map(s => s.id === id ? { ...s, ...updates } : s) }));
    const { error } = await supabase.from('supervisors').update(updates).eq('id', id);
    if (error) set({ supervisors: prev, error: error.message });
  },

  deleteSupervisor: async (id) => {
    const prev = get().supervisors;
    set(state => ({ supervisors: state.supervisors.filter(s => s.id !== id) }));
    const { error } = await supabase.from('supervisors').delete().eq('id', id);
    if (error) set({ supervisors: prev, error: error.message });
  },
}));
