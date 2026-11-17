// Seed script — run with: npx ts-node --esm scripts/seedSupabase.ts
// WARNING: upsert overwrites matching rows in the live database (statuses, notes, checklists). For a fresh project only.
// OR: npx tsx scripts/seedSupabase.ts
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env.local') });

// RLS blocks the anon key, so seeding uses the service role key (never expose it to the browser).
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('🌱 Starting Supabase seed...\n');

  try {
    const { seedPrograms } = await import('../lib/data/programs.js');
    const { seedScholarships } = await import('../lib/data/scholarships.js');
    const { seedSupervisors } = await import('../lib/data/supervisors.js');

    console.log(`Found: ${seedPrograms.length} programs, ${seedScholarships.length} scholarships, ${seedSupervisors.length} supervisors`);

    // Upsert Programs
    const { error: programsError } = await supabase
      .from('programs')
      .upsert(seedPrograms);

    if (programsError) {
      console.error('❌ Error inserting programs:', programsError.message);
    } else {
      console.log(`✅ Upserted ${seedPrograms.length} programs.`);
    }

    // Upsert Scholarships
    const { error: scholarshipsError } = await supabase
      .from('scholarships')
      .upsert(seedScholarships);

    if (scholarshipsError) {
      console.error('❌ Error inserting scholarships:', scholarshipsError.message);
    } else {
      console.log(`✅ Upserted ${seedScholarships.length} scholarships.`);
    }

    // Upsert Supervisors
    const { error: supervisorsError } = await supabase
      .from('supervisors')
      .upsert(seedSupervisors);

    if (supervisorsError) {
      console.error('❌ Error inserting supervisors:', supervisorsError.message);
    } else {
      console.log(`✅ Upserted ${seedSupervisors.length} supervisors.`);
    }

    console.log('\n🎉 Seeding complete!');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
  }
}

seed();
