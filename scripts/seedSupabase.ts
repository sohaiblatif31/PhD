export {};
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// We need to import the data. Since they are in TS and use ES modules, we will use a small trick
// or just re-read them if we compile this script with ts-node.
// We'll assume this script is run via `npx ts-node scripts/seedSupabase.ts`

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define defaultDocs locally to avoid TS imports issue if run directly
const defaultDocs = () => [
  { id: 'd1', name: 'Statement of Purpose', status: 'Not Started' },
  { id: 'd2', name: 'CV / Resume', status: 'Not Started' },
  { id: 'd3', name: 'Transcripts', status: 'Not Started' },
  { id: 'd4', name: 'Reference Letter 1', status: 'Not Started' },
  { id: 'd5', name: 'Reference Letter 2', status: 'Not Started' },
  { id: 'd6', name: 'Reference Letter 3', status: 'Not Started' },
  { id: 'd7', name: 'GMAT / GRE Score', status: 'Not Started' },
  { id: 'd8', name: 'English Proficiency', status: 'Not Started' },
  { id: 'd9', name: 'Research Proposal', status: 'Not Started' },
  { id: 'd10', name: 'Application Form + Fee', status: 'Not Started' },
];

async function seed() {
  console.log('Starting Supabase seed...');

  // Since we can't easily import the ES module files in a raw node script without ts-node,
  // we will import them dynamically if we use ts-node.
  
  // It's easier to dynamically import the ts files if this is executed via ts-node.
  try {
    const { seedPrograms } = require('../lib/data/programs');
    const { seedScholarships } = require('../lib/data/scholarships');

    console.log(`Found ${seedPrograms.length} programs and ${seedScholarships.length} scholarships to seed.`);

    // Upsert Programs
    const { data: programsData, error: programsError } = await supabase
      .from('programs')
      .upsert(seedPrograms);

    if (programsError) {
      console.error('Error inserting programs:', programsError);
    } else {
      console.log('Successfully inserted programs.');
    }

    // Upsert Scholarships
    const { data: scholarshipsData, error: scholarshipsError } = await supabase
      .from('scholarships')
      .upsert(seedScholarships);

    if (scholarshipsError) {
      console.error('Error inserting scholarships:', scholarshipsError);
    } else {
      console.log('Successfully inserted scholarships.');
    }

  } catch (err) {
    console.error('Error during seeding:', err);
  }
}

seed();
