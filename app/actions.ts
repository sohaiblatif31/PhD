'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { TableName } from '@/lib/types';
import { TABLES, deleteRow, insertRow, updateRow } from '@/lib/server/db';
import { firstIssue, schemas } from '@/lib/server/schemas';
import { checkPassword, requireUser, signIn, signOut } from '@/lib/server/session';

export type Result = { ok: true } | { ok: false; error: string };

const tableName = z.enum(TABLES as [TableName, ...TableName[]]);
const rowId = z.string().regex(/^[\w.-]{1,80}$/);

async function run(fn: () => Promise<void>): Promise<Result> {
  try {
    await fn();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: e instanceof z.ZodError ? firstIssue(e) : e instanceof Error ? e.message : 'Something went wrong' };
  }
}

export async function createRecord(table: TableName, row: unknown): Promise<Result> {
  await requireUser();
  return run(async () => {
    const t = tableName.parse(table);
    await insertRow(t, schemas[t].parse(row));
  });
}

export async function updateRecord(table: TableName, id: string, patch: unknown): Promise<Result> {
  await requireUser();
  return run(async () => {
    const t = tableName.parse(table);
    const clean = schemas[t].omit({ id: true }).partial().parse(patch);
    if (t === 'programs') clean.updatedAt = new Date().toISOString();
    await updateRow(t, rowId.parse(id), clean);
  });
}

export async function deleteRecord(table: TableName, id: string): Promise<Result> {
  await requireUser();
  return run(async () => deleteRow(tableName.parse(table), rowId.parse(id)));
}

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  const password = String(form.get('password') ?? '');
  if (!process.env.APP_PASSWORD || !process.env.SESSION_SECRET) return 'Login is not set up: APP_PASSWORD and SESSION_SECRET are missing on the server.';
  if (!checkPassword(password)) {
    await new Promise(r => setTimeout(r, 800)); // slow down guessing
    return 'That password is not right.';
  }
  await signIn();
  const next = String(form.get('next') ?? '/');
  redirect(next.startsWith('/') && !next.startsWith('//') ? next : '/');
}

export async function logout() {
  await signOut();
  redirect('/login');
}
