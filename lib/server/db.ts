import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AppData, TableName } from '@/lib/types';

export const TABLES: TableName[] = ['programs', 'scholarships', 'supervisors', 'referees'];
type Row = Record<string, unknown>;

let client: SupabaseClient | null = null;

/** Service-role client. The tables have RLS on and no policies, so only this server key can use them. */
function db(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    if (process.env.NODE_ENV === 'development') return null; // dev-only sample data, below
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }
  client ??= createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

export const usingSampleData = () => db() === null;

// Dev without credentials: an in-memory copy of the seed files, reset when the dev server restarts.
const g = globalThis as unknown as { __phdSample?: AppData };
async function sample(): Promise<AppData> {
  if (!g.__phdSample) {
    const [{ seedPrograms }, { seedScholarships }, { seedSupervisors }] = await Promise.all([
      import('@/lib/data/programs'), import('@/lib/data/scholarships'), import('@/lib/data/supervisors'),
    ]);
    g.__phdSample = structuredClone({ programs: seedPrograms, scholarships: seedScholarships, supervisors: seedSupervisors, referees: [] });
  }
  return g.__phdSample;
}

/** Defaults for columns added by later migrations, so older rows still render. */
function normalise(data: AppData): AppData {
  return {
    programs: data.programs.map(p => ({ ...p, notes: p.notes ?? '', documents: p.documents ?? [], supervisors: p.supervisors ?? [], lastVerified: p.lastVerified ?? null })),
    scholarships: data.scholarships.map(s => ({ ...s, notes: s.notes ?? '', provinces: s.provinces ?? [], discontinued: s.discontinued ?? false, lastVerified: s.lastVerified ?? null })),
    supervisors: data.supervisors.map(s => ({ ...s, notes: s.notes ?? '', contactedAt: s.contactedAt ?? null, followUpAt: s.followUpAt ?? null, respondedAt: s.respondedAt ?? null })),
    referees: data.referees.map(r => ({ ...r, requests: r.requests ?? [] })),
  };
}

export async function loadAll(): Promise<AppData> {
  const c = db();
  if (!c) return normalise(await sample());
  const results = await Promise.all(TABLES.map(t => c.from(t).select('*')));
  const out = {} as Record<TableName, unknown[]>;
  TABLES.forEach((t, i) => {
    const { data, error } = results[i];
    // The referees table arrives with a migration; until then show none instead of failing the whole app.
    if (error && t === 'referees' && (error.code === '42P01' || error.code === 'PGRST205')) out[t] = [];
    else if (error) throw new Error(`Could not load ${t}: ${error.message}`);
    else out[t] = data ?? [];
  });
  return normalise(out as unknown as AppData);
}

export async function insertRow(table: TableName, row: Row) {
  const c = db();
  if (!c) {
    const list = (await sample())[table] as unknown as Row[];
    if (list.some(r => r.id === row.id)) throw new Error('A record with this id already exists');
    list.push(row);
    return;
  }
  const { error } = await c.from(table).insert(row);
  if (error) throw new Error(error.message);
}

export async function updateRow(table: TableName, id: string, patch: Row) {
  const c = db();
  if (!c) {
    const r = ((await sample())[table] as unknown as Row[]).find(x => x.id === id);
    if (!r) throw new Error('Record not found');
    Object.assign(r, patch);
    return;
  }
  const { data, error } = await c.from(table).update(patch).eq('id', id).select('id');
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error('Record not found');
}

export async function deleteRow(table: TableName, id: string) {
  const c = db();
  if (!c) {
    const s = await sample();
    (s[table] as unknown as Row[]) = (s[table] as unknown as Row[]).filter(x => x.id !== id);
    return;
  }
  const { error } = await c.from(table).delete().eq('id', id);
  if (error) throw new Error(error.message);
}
