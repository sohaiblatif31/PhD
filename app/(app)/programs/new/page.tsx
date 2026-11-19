'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProgramForm, { emptyProgram } from '@/components/ProgramForm';
import { PageHeader } from '@/components/ui';
import { newId, useApp } from '@/lib/store';

export default function NewProgramPage() {
  const router = useRouter();
  const create = useApp(s => s.create);
  return (
    <div className="max-w-3xl">
      <Link href="/programs" className="-ml-2 mb-3 inline-flex min-h-11 items-center gap-1 rounded-full px-3 hover:bg-surface-2 text-[15px] font-medium text-ink-2 hover:text-ink">
        <ArrowLeft size={18} aria-hidden /> Programs
      </Link>
      <PageHeader title="Add a program" lede="The checklist builds itself from the GMAT/GRE setting. You can add items later." />
      <div className="panel p-4 md:p-6">
        <ProgramForm initial={emptyProgram()} submitLabel="Add program" onSubmit={async d => {
          const now = new Date().toISOString();
          const id = newId('prog');
          if (await create('programs', { ...d, id, supervisors: [], documents: [], lastVerified: null, createdAt: now, updatedAt: now }, 'Program added')) {
            router.push(`/programs/${id}`);
          }
        }} />
      </div>
    </div>
  );
}
