-- Full schema for a fresh project. Existing projects: apply supabase/migrations/* in order instead.

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
  discontinued BOOLEAN NOT NULL DEFAULT false,
  provinces TEXT[] NOT NULL DEFAULT '{}'
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
  "contactedAt" DATE,
  "followUpAt" DATE,
  "respondedAt" DATE,
  "createdAt" TIMESTAMPTZ NOT NULL
);

-- Referees Table (reference letters; requests = [{ programId, requestedAt, submittedAt }])
CREATE TABLE referees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  affiliation TEXT NOT NULL DEFAULT '',
  relationship TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  requests JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only the server (service role key, after password login) may touch the data: RLS on, no policies.
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE referees ENABLE ROW LEVEL SECURITY;
