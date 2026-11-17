'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { countdown } from '@/lib/dates';
import { useApp } from '@/lib/store';
import { cn, type Tone } from '@/lib/utils';

export function PageHeader({ title, lede, actions }: { title: string; lede?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 md:mb-8">
      <div className="min-w-0 max-w-2xl">
        <h1 className="page-title">{title}</h1>
        {lede && <p className="mt-2 text-[15px] text-ink-2">{lede}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Chip({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn('chip', `tone-${tone}`, className)}>{children}</span>;
}

/** Native select (best picker on iPhone) styled as a coloured pill. */
export function PillSelect<T extends string>({ value, options, tone, onChange, label }: {
  value: T; options: readonly T[]; tone: (v: T) => Tone; onChange: (v: T) => void; label: string;
}) {
  return (
    <select aria-label={label} className={cn('pill-select', `tone-${tone(value)}`)} value={value}
      onClick={e => e.stopPropagation()} onChange={e => onChange(e.target.value as T)}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function Progress({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="bar" role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${pct}%`, background: pct === 100 ? 'var(--moss)' : undefined }} />
    </div>
  );
}

export function Countdown({ days, className }: { days: number | null; className?: string }) {
  const tone: Tone = days === null ? 'neutral' : days < 0 ? 'red' : days <= 14 ? 'red' : days <= 45 ? 'amber' : 'neutral';
  return <Chip tone={tone} className={cn('num', className)}>{countdown(days)}</Chip>;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[13px] text-ink-3">{hint}</span>}
    </label>
  );
}

export function Sheet({ open, onOpenChange, title, description, children }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay" />
        <Dialog.Content className="sheet">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="section-title">{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-1 text-sm text-ink-3">{description}</Dialog.Description> : <Dialog.Description className="sr-only">{title}</Dialog.Description>}
            </div>
            <Dialog.Close className="icon-btn -mr-2 -mt-2" aria-label="Close"><X size={20} /></Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="section-title">{title}</p>
      {children && <p className="mx-auto mt-2 max-w-sm text-sm text-ink-3">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Toaster() {
  const toast = useApp(s => s.toast);
  const clear = useApp(s => s.clearToast);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clear, toast.error ? 6000 : 2600);
    return () => clearTimeout(t);
  }, [toast, clear]);
  return (
    <div aria-live="polite" role="status">
      {toast && <div key={toast.id} className="toast" data-error={!!toast.error}>{toast.message}</div>}
    </div>
  );
}
