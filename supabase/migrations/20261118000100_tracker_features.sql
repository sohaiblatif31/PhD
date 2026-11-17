-- New columns and the referees table for the outreach CRM, funding cross-links and reference letters.
-- Additive only: existing rows keep their data and get empty defaults.
BEGIN;

ALTER TABLE public.supervisors
  ADD COLUMN IF NOT EXISTS "contactedAt" DATE,
  ADD COLUMN IF NOT EXISTS "followUpAt" DATE,
  ADD COLUMN IF NOT EXISTS "respondedAt" DATE;

-- Province codes an award is limited to; empty means any province.
ALTER TABLE public.scholarships
  ADD COLUMN IF NOT EXISTS provinces TEXT[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.referees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  affiliation TEXT NOT NULL DEFAULT '',
  relationship TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  -- [{ "programId": "prog-4", "requestedAt": "2026-11-01", "submittedAt": null }]
  requests JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
