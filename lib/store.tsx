'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { createStore, useStore, type StoreApi } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { createRecord, deleteRecord, updateRecord, type Result } from '@/app/actions';
import type { AppData, TableName } from '@/lib/types';

type RowOf<T extends TableName> = AppData[T][number];

export interface AppState extends AppData {
  today: string;
  sample: boolean;
  feedKey: string;
  toast: { id: number; message: string; error?: boolean } | null;
  notify: (message: string, error?: boolean) => void;
  clearToast: () => void;
  update: <T extends TableName>(table: T, id: string, patch: Partial<RowOf<T>>, done?: string) => Promise<boolean>;
  create: <T extends TableName>(table: T, row: RowOf<T>, done?: string) => Promise<boolean>;
  remove: <T extends TableName>(table: T, id: string, done?: string) => Promise<boolean>;
}

const Ctx = createContext<StoreApi<AppState> | null>(null);

function makeStore(initial: AppData, today: string, sample: boolean, feedKey: string) {
  return createStore<AppState>((set, get) => {
    const rows = <T extends TableName>(t: T) => get()[t] as RowOf<T>[];
    const setRows = <T extends TableName>(t: T, r: RowOf<T>[]) => set({ [t]: r } as unknown as Partial<AppState>);

    // Optimistic: change the screen first, restore the previous rows if the server refuses.
    async function commit<T extends TableName>(t: T, next: RowOf<T>[], call: () => Promise<Result>, done?: string) {
      const prev = rows(t);
      setRows(t, next);
      let res: Result;
      try {
        res = await call();
      } catch {
        res = { ok: false, error: 'No connection. Your change was not saved.' };
      }
      if (!res.ok) {
        setRows(t, prev);
        get().notify(res.error, true);
        return false;
      }
      if (done) get().notify(done);
      return true;
    }

    return {
      ...initial,
      today,
      sample,
      feedKey,
      toast: null,
      notify: (message, error) => set({ toast: { id: Date.now(), message, error } }),
      clearToast: () => set({ toast: null }),
      update: (t, id, patch, done) =>
        commit(t, rows(t).map(r => (r.id === id ? { ...r, ...patch } : r)), () => updateRecord(t, id, patch), done),
      create: (t, row, done) => commit(t, [...rows(t), row], () => createRecord(t, row), done),
      remove: (t, id, done) => commit(t, rows(t).filter(r => r.id !== id), () => deleteRecord(t, id), done),
    };
  });
}

export function StoreProvider({ initial, today, sample, feedKey, children }: { initial: AppData; today: string; sample: boolean; feedKey: string; children: ReactNode }) {
  const [store] = useState(() => makeStore(initial, today, sample, feedKey));
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useApp<U>(selector: (s: AppState) => U): U {
  const store = useContext(Ctx);
  if (!store) throw new Error('useApp must be used inside StoreProvider');
  return useStore(store, useShallow(selector));
}

/** The four tables, for the pure helpers in lib/today.ts. */
export const useData = () => useApp(s => ({ programs: s.programs, scholarships: s.scholarships, supervisors: s.supervisors, referees: s.referees }));

export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
