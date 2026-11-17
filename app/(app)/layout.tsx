import { cookies } from 'next/headers';
import Shell from '@/components/Shell';
import { todayIn } from '@/lib/dates';
import { loadAll, usingSampleData } from '@/lib/server/db';
import { requireUser } from '@/lib/server/session';
import { feedKey, sessionSecret } from '@/lib/server/token';
import { StoreProvider } from '@/lib/store';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  const tz = decodeURIComponent((await cookies()).get('tz')?.value ?? 'America/Toronto');
  const data = await loadAll();
  return (
    <StoreProvider initial={data} today={todayIn(tz)} sample={usingSampleData()} feedKey={feedKey(sessionSecret()!)}>
      <Shell>{children}</Shell>
    </StoreProvider>
  );
}
