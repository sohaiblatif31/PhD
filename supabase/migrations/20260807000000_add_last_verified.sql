-- PhD Tracker Migration — Add lastVerified and discontinued columns
-- Safe to re-run (IF NOT EXISTS). Apply first if these columns are missing.

-- 1. Add lastVerified column to programs table
ALTER TABLE public.programs 
  ADD COLUMN IF NOT EXISTS "lastVerified" DATE;

-- 2. Add lastVerified column to scholarships table
ALTER TABLE public.scholarships 
  ADD COLUMN IF NOT EXISTS "lastVerified" DATE;

-- 3. Add discontinued column to scholarships table
ALTER TABLE public.scholarships 
  ADD COLUMN IF NOT EXISTS discontinued BOOLEAN NOT NULL DEFAULT false;

-- Verify the columns were added (optional check)
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name IN ('programs', 'scholarships') 
--   AND column_name IN ('lastVerified', 'discontinued')
-- ORDER BY table_name, column_name;
