// Run with: node scripts/testConnection.ts  (reads .env.local; read-only)
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const { count, error } = await createClient(url, key, { auth: { persistSession: false } })
  .from('programs').select('id', { count: 'exact', head: true });
console.log(error ? `Connection failed: ${error.message}` : `Connected. ${count} programs.`);
