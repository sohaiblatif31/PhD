-- Run this in your Supabase SQL Editor

-- Programs Table
CREATE TABLE programs (
  id TEXT PRIMARY KEY,
  university TEXT NOT NULL,
  school TEXT NOT NULL,
  program TEXT NOT NULL,
  specialization TEXT NOT NULL,
  fit TEXT NOT NULL,
  funding TEXT NOT NULL,
  "fundingAmount" TEXT NOT NULL,
  deadline TEXT NOT NULL,
  "deadlineDate" DATE,
  "applyLink" TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  requirements TEXT NOT NULL,
  competitiveness TEXT NOT NULL,
  "otherInfo" TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  language TEXT NOT NULL,
  "gmatRequired" TEXT NOT NULL,
  duration TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  supervisors TEXT[] DEFAULT '{}',
  notes TEXT,
  documents JSONB NOT NULL DEFAULT '[]',
  "lastVerified" DATE,
  "createdAt" TIMESTAMPTZ NOT NULL,
  "updatedAt" TIMESTAMPTZ NOT NULL
);

-- Scholarships Table
CREATE TABLE scholarships (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "shortName" TEXT NOT NULL,
  value TEXT NOT NULL,
  "valueAmount" TEXT NOT NULL,
  deadline TEXT NOT NULL,
  "deadlineDate" DATE,
  link TEXT NOT NULL,
  eligibility TEXT NOT NULL,
  requirements TEXT NOT NULL,
  competitiveness TEXT NOT NULL,
  notes TEXT,
  "eligibleForMe" TEXT NOT NULL,
  status TEXT NOT NULL,
  "internationalEligible" BOOLEAN NOT NULL,
  category TEXT NOT NULL,
  "lastVerified" DATE,
  discontinued BOOLEAN NOT NULL DEFAULT false
);

-- Supervisors Table
CREATE TABLE supervisors (
  id TEXT PRIMARY KEY,
  university TEXT NOT NULL,
  name TEXT NOT NULL,
  "researchFocus" TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT NOT NULL,
  "googleScholar" TEXT NOT NULL,
  contacted BOOLEAN NOT NULL DEFAULT false,
  responded BOOLEAN NOT NULL DEFAULT false,
  "responseType" TEXT,
  notes TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL
);

-- Note: In a production app, you would enable Row Level Security (RLS) here.
-- Since this is a single-user project without auth for now, we will not enforce RLS.

-- Migration: run these if the tables already exist from a previous schema version
-- ALTER TABLE programs ADD COLUMN IF NOT EXISTS "lastVerified" DATE;
-- ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS "lastVerified" DATE;
-- ALTER TABLE scholarships ADD COLUMN IF NOT EXISTS discontinued BOOLEAN NOT NULL DEFAULT false;
