import { type NextRequest } from 'next/server';
import { toCSV } from '@/lib/csv';
import { TABLES, loadAll } from '@/lib/server/db';
import { isSignedIn } from '@/lib/server/session';
import type { TableName } from '@/lib/types';

export async function GET(request: NextRequest) {
  if (!(await isSignedIn())) return Response.json({ error: 'Sign in required' }, { status: 401 });
  const format = request.nextUrl.searchParams.get('format');
  const table = request.nextUrl.searchParams.get('table') as TableName | null;
  const data = await loadAll();
  const date = new Date().toISOString().slice(0, 10);
  const headers = (type: string, name: string) => ({
    'Content-Type': type,
    'Content-Disposition': `attachment; filename="${name}"`,
    'Cache-Control': 'private, no-store',
  });

  if (format === 'csv' && table && TABLES.includes(table)) {
    return new Response(toCSV(data[table] as unknown as Record<string, unknown>[]), { headers: headers('text/csv; charset=utf-8', `phd-${table}-${date}.csv`) });
  }
  if (format === 'json') {
    return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), ...data }, null, 2), { headers: headers('application/json', `phd-tracker-${date}.json`) });
  }
  return Response.json({ error: 'Use ?format=json or ?format=csv&table=programs|scholarships|supervisors|referees' }, { status: 400 });
}
