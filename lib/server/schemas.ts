import 'server-only';
import { z } from 'zod';
import type { TableName } from '@/lib/types';

const text = z.string().max(20000);
const short = z.string().max(500);
const id = z.string().regex(/^[\w.-]{1,80}$/);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable();
const stamp = z.string().max(40);
const url = z.string().max(2000).refine(v => v === '' || /^https?:\/\//i.test(v), 'Links must start with http:// or https://');
const email = z.string().max(320);

const program = z.object({
  id, university: short.min(1), school: short, program: short.min(1), specialization: short,
  fit: z.enum(['High', 'Medium', 'Low']), funding: text, fundingAmount: short, deadline: text, deadlineDate: date,
  applyLink: url, eligibility: text, requirements: text, competitiveness: text, otherInfo: text, city: short,
  province: z.string().max(4), language: z.enum(['English', 'French', 'Bilingual']), gmatRequired: z.enum(['Yes', 'No', 'Optional']),
  duration: short,
  status: z.enum(['Not Started', 'Researching', 'Writing', 'Submitted', 'Interview', 'Offer Received', 'Accepted', 'Rejected']),
  priority: z.enum(['High', 'Medium', 'Low']), supervisors: z.array(id).max(200), notes: text,
  documents: z.array(z.object({ id, name: short.min(1), status: z.enum(['Not Started', 'In Progress', 'Done']) }).strict()).max(100),
  lastVerified: date, createdAt: stamp, updatedAt: stamp,
}).strict();

const scholarship = z.object({
  id, name: short.min(1), shortName: short, value: text, valueAmount: short, deadline: text, deadlineDate: date, link: url,
  eligibility: text, requirements: text, competitiveness: text, notes: text, eligibleForMe: z.enum(['Yes', 'Partial', 'No']),
  status: z.enum(['Not Started', 'Preparing', 'Applied', 'Awarded', 'Not Awarded']), internationalEligible: z.boolean(),
  category: z.enum(['Federal', 'Provincial', 'Industry', 'Foundation']), lastVerified: date, discontinued: z.boolean(),
  provinces: z.array(z.string().max(4)).max(13),
}).strict();

const supervisor = z.object({
  id, university: short.min(1), name: short.min(1), researchFocus: text, email, website: url, googleScholar: url,
  contacted: z.boolean(), responded: z.boolean(), responseType: z.enum(['Positive', 'Negative', 'Awaiting']).nullable(), notes: text,
  contactedAt: date, followUpAt: date, respondedAt: date, createdAt: stamp,
}).strict();

const referee = z.object({
  id, name: short.min(1), email, affiliation: short, relationship: short, notes: text,
  requests: z.array(z.object({ programId: id, requestedAt: date, submittedAt: date }).strict()).max(100),
  createdAt: stamp,
}).strict();

export const schemas: Record<TableName, z.ZodObject> = { programs: program, scholarships: scholarship, supervisors: supervisor, referees: referee };

export function firstIssue(e: z.ZodError): string {
  const i = e.issues[0];
  return i ? `${i.path.join('.') || 'record'}: ${i.message}` : 'Invalid data';
}
