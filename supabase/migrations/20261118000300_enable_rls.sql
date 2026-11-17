-- Lock the tables to the server. RLS on with no policies: the anon and authenticated keys can read and
-- write nothing; only the service role key (used server-side after password login) bypasses RLS.
-- Apply AFTER the new app version is deployed with SUPABASE_SERVICE_ROLE_KEY set, or the old build stops loading data.
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referees ENABLE ROW LEVEL SECURITY;

-- Remove any policies left from earlier experiments so nothing re-opens access.
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies
           WHERE schemaname = 'public' AND tablename IN ('programs', 'scholarships', 'supervisors', 'referees')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;
