# No Meu Bairro

MVP web para registrar e acompanhar ocorrências urbanas do próprio usuário. Usa Angular 21, Angular Material, Supabase Auth, PostgreSQL e Storage.

## Requisitos

- Node.js 24 e npm 11
- Projeto Supabase próprio, com Auth por e-mail habilitado
- Conta GitHub para publicar e executar o CI

## Instalação e configuração

```bash
npm ci
```

Copie `.env.example` para `.env.local` e preencha `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`. Use apenas a chave pública **publishable**. O script `scripts/write-environment.mjs` cria `src/environments/environment.ts`, que está ignorado pelo Git. Em CI ou na hospedagem, configure as mesmas duas variáveis no ambiente de build. A chave pública fica no bundle do navegador; a proteção dos dados depende das policies RLS. Nunca use `service_role` ou `sb_secret` no frontend.

No SQL Editor do Supabase, execute `supabase/migrations/202611130001_mvp.sql` e depois `supabase/seed.sql`. O banco cria automaticamente o perfil no cadastro e o primeiro registro do histórico ao criar a ocorrência. O bucket `occurrence-photos` é privado, com limite de 5 MB e tipos JPEG, PNG e WebP. O cliente recebe uma URL assinada temporária para mostrar a foto.

Em **Authentication → URL Configuration**, configure a URL do site e adicione as URLs de desenvolvimento e produção permitidas. Se a confirmação de e-mail estiver ativa, o cadastro exige confirmar a mensagem antes do login.

## Execução

```bash
npm start
```

Acesse `http://localhost:4200`. Sem variáveis Supabase, a interface compila e mostra um erro de configuração ao tentar entrar; os fluxos conectados exigem um projeto real.

## Testes, lint e build

```bash
npm run lint
npm test
npm run build
```

O build de produção sai em `dist/client`. O workflow `.github/workflows/ci.yml` executa os mesmos comandos em push e pull request, começando com `npm ci`.

## Estrutura

- `src/app/core`: sessão, guardas de rota e cliente Supabase.
- `src/app/features/auth`: cadastro e login.
- `src/app/features/occurrences`: lista, registro, detalhes e acesso aos dados.
- `src/app/models` e `shared`: tipos, status e mensagens.
- `supabase/migrations` e `supabase/seed.sql`: esquema, RLS, Storage e categorias.
- `docs/evidencias`: roteiro de capturas reais.
- `docs/validacao`: duas rodadas de validação, ainda sem resultados.

## Segurança e limites

Cada pessoa autenticada vê apenas suas ocorrências e seu histórico. O cliente não possui política de alteração de status; uma evolução futura deve usar operação administrativa segura. A inserção da ocorrência e do primeiro histórico é transacional no banco. Se o banco falhar após o upload, o aplicativo tenta remover a foto enviada. Essa compensação depende da conexão e não substitui uma rotina de limpeza de arquivos órfãos em produção.

Os campos são validados no formulário e por constraints e policies no banco. Texto do usuário é exibido por interpolação Angular, sem HTML bruto. O filtro RF04 foi deixado fora desta versão para priorizar RF01–RF03.

## Publicação

O projeto inclui `netlify.toml` e `public/_redirects` para o fallback de rotas da SPA. Conecte o repositório a um site Netlify, configure as duas variáveis públicas no build e publique. Depois ajuste as URLs permitidas no Supabase e execute o smoke test de cadastro/login, registro, lista, detalhes e logout. Sem conta de hospedagem e credenciais públicas do Supabase, essa validação externa permanece pendente.
