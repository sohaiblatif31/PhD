import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';

/** Today's date (YYYY-MM-DD) in an IANA time zone, so server and browser agree. */
export function todayIn(timeZone: string, now = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  } catch {
    return format(now, 'yyyy-MM-dd');
  }
}

/** Calendar days from `today` to `date` (both YYYY-MM-DD); negative means past. */
export function daysUntil(date: string | null | undefined, today: string): number | null {
  if (!date) return null;
  return differenceInCalendarDays(parseISO(date.slice(0, 10)), parseISO(today));
}

export function countdown(days: number | null): string {
  if (days === null) return 'Rolling';
  if (days < 0) return `${-days}d overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} days`;
}

export function addDaysISO(date: string, n: number): string {
  return format(addDays(parseISO(date), n), 'yyyy-MM-dd');
}

export function formatDate(date: string | null | undefined, withYear = true): string {
  if (!date) return 'Rolling';
  return format(parseISO(date.slice(0, 10)), withYear ? 'MMM d, yyyy' : 'MMM d');
}
