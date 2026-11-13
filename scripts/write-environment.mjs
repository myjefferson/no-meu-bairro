import { readFileSync, writeFileSync } from 'node:fs';

let local = {};
try {
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match) local[match[1]] = match[2].trim();
  }
} catch { /* .env.local é opcional */ }
const url = process.env.SUPABASE_URL ?? local.SUPABASE_URL ?? '';
const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? local.SUPABASE_PUBLISHABLE_KEY ?? '';
writeFileSync('src/environments/environment.ts',
  `export const environment = { supabaseUrl: ${JSON.stringify(url)}, supabasePublishableKey: ${JSON.stringify(key)} };\n`);
