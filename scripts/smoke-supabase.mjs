// Executar apenas em projeto de teste. Usa duas contas temporárias fornecidas por variáveis de ambiente.
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const local = Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/)
  .filter(line => line.includes('=')).map(line => {
    const at = line.indexOf('='); return [line.slice(0, at), line.slice(at + 1).trim()];
  }));
const url = process.env.SUPABASE_URL ?? local.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? local.SUPABASE_PUBLISHABLE_KEY;
const accounts = [
  { email: process.env.SMOKE_A_EMAIL, password: process.env.SMOKE_A_PASSWORD, name: 'Teste A' },
  { email: process.env.SMOKE_B_EMAIL, password: process.env.SMOKE_B_PASSWORD, name: 'Teste B' },
];
if (!url || !key) throw new Error('Configure .env.local com URL e chave pública.');
const client = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const check = (condition, message) => { if (!condition) throw new Error(message); };
const mode = process.argv[2];
if (!['anon', 'anonymous_auth'].includes(mode) && accounts.some((account, index) =>
  (mode !== 'verify_single' || index === 0) && (!account.email || !account.password))) {
  throw new Error('Configure as quatro variáveis SMOKE_A/B_EMAIL/PASSWORD.');
}

if (mode === 'anon') {
  const guest = client();
  for (const table of ['categories', 'occurrences', 'occurrence_status_history', 'profiles']) {
    const { data, error } = await guest.from(table).select('*');
    check(Boolean(error) || data?.length === 0, `Acesso anônimo indevido à tabela ${table}.`);
  }
  console.log(JSON.stringify({ mode, result: 'ok', anonymousRead: 'blocked' }));
} else if (mode === 'anonymous_auth') {
  const { data, error } = await client().auth.signInAnonymously();
  console.log(JSON.stringify({ mode, available: !error, code: error?.code ?? null, userId: data.user?.id ?? null }));
} else if (mode === 'signup') {
  const ids = [];
  for (const account of accounts) {
    const { data, error } = await client().auth.signUp({
      email: account.email, password: account.password, options: { data: { nome: account.name } },
    });
    if (error) throw error;
    check(data.user?.id, 'Cadastro sem usuário retornado.');
    ids.push(data.user.id);
  }
  console.log(JSON.stringify({ mode, ids, confirmationRequired: true }));
} else if (mode === 'verify' || mode === 'verify_single') {
  const twoUsers = mode === 'verify';
  const [a, b] = [client(), client()];
  for (const [index, instance] of (twoUsers ? [a, b] : [a]).entries()) {
    const { error } = await instance.auth.signInWithPassword(accounts[index]);
    if (error) throw error;
  }
  const { data: categories, error: categoryError } = await a.from('categories').select('id,nome').eq('ativo', true);
  if (categoryError) throw categoryError;
  check(categories?.length === 5, 'Categorias iniciais indisponíveis.');
  const { data: aUser } = await a.auth.getUser();
  const path = `${aUser.user.id}/${crypto.randomUUID()}.png`;
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==', 'base64');
  try {
    const { error: uploadError } = await a.storage.from('occurrence-photos').upload(path, png, { contentType: 'image/png', upsert: false });
    if (uploadError) throw uploadError;
    const records = [
      { user_id: aUser.user.id, category_id: categories[0].id, descricao: 'Ocorrência de teste com foto', endereco: 'Rua de teste, 10', photo_url: path },
      { user_id: aUser.user.id, category_id: categories[0].id, descricao: 'Ocorrência de teste sem foto', endereco: 'Rua de teste, 20' },
    ];
    for (const record of records) {
      const { data, error } = await a.from('occurrences').insert(record).select('id,status').single();
      if (error) throw error;
      check(data.status === 'registrada', 'Status inicial incorreto.');
      const { data: history, error: historyError } = await a.from('occurrence_status_history').select('status').eq('occurrence_id', data.id);
      if (historyError) throw historyError;
      check(history.length === 1 && history[0].status === 'registrada', 'Histórico inicial incorreto.');
      if (twoUsers) {
        const { data: forbidden, error: forbiddenError } = await b.from('occurrences').select('id').eq('id', data.id).maybeSingle();
        if (forbiddenError) throw forbiddenError;
        check(forbidden === null, 'RLS permitiu leitura entre usuários.');
      }
    }
    const { data: own, error: ownError } = await a.from('occurrences').select('id');
    if (ownError) throw ownError;
    check(own.length === 2, 'Lista do autor não contém as duas ocorrências.');
    if (twoUsers) {
      const { data: other, error: otherError } = await b.from('occurrences').select('id');
      if (otherError) throw otherError;
      check(other.length === 0, 'Lista de outro usuário vazou ocorrências.');
    }
    const { error: signedError } = await a.storage.from('occurrence-photos').createSignedUrl(path, 60);
    if (signedError) throw signedError;
    if (twoUsers) {
      const { data: unauthorizedPhoto } = await b.storage.from('occurrence-photos').createSignedUrl(path, 60);
      check(!unauthorizedPhoto?.signedUrl, 'Outro usuário obteve URL da foto.');
    }
    const { error: removeError } = await a.storage.from('occurrence-photos').remove([path]);
    if (removeError) throw removeError;
    await a.auth.signOut();
    const { data: session } = await a.auth.getSession();
    check(session.session === null, 'Logout não encerrou a sessão.');
    console.log(JSON.stringify({ mode, result: 'ok', categories: categories.length, occurrences: records.length,
      rls: twoUsers ? 'isolated' : 'checked-in-sql', photo: 'private', logout: 'ok' }));
  } finally {
    await a.storage.from('occurrence-photos').remove([path]);
    if (twoUsers) await b.auth.signOut();
  }
} else {
  throw new Error('Use signup ou verify.');
}
