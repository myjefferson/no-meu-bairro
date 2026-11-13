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
if (key.startsWith('sb_secret_') || key.startsWith('sb_service_role_')) {
  throw new Error('A chave Supabase fornecida é administrativa e não pode ser incluída no navegador.');
}
if (key.startsWith('eyJ')) {
  try {
    const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString('utf8'));
    if (payload.role !== 'anon') throw new Error('A chave JWT não possui o papel anon.');
  } catch (error) {
    throw new Error('Chave Supabase JWT inválida ou administrativa.', { cause: error });
  }
}
writeFileSync('src/environments/environment.ts',
  `export const environment = { supabaseUrl: ${JSON.stringify(url)}, supabasePublishableKey: ${JSON.stringify(key)} };\n`);
