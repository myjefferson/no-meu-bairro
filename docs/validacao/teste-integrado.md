# Teste integrado após configurar o Supabase

Pré-condições: migration e seed aplicados; URL e chave pública configuradas em `.env.local`; confirmação de e-mail e URLs permitidas configuradas no painel Supabase. Use duas contas de teste distintas, A e B, e dados fictícios.

| Passo | Resultado esperado | Resultado real |
|---|---|---|
| Cadastrar A e confirmar e-mail, se exigido | Perfil criado, login possível | |
| Entrar como A e atualizar a página | Sessão recuperada e lista exibida | |
| Tentar senha incorreta | Mensagem clara, sem login | |
| Registrar ocorrência sem foto | Confirmação, detalhes, status Registrada e histórico inicial | |
| Registrar ocorrência com foto JPG/PNG/WebP | Foto exibida nos detalhes por URL assinada | |
| Tentar arquivo maior que 5 MB ou tipo diferente | Formulário recusa | |
| Sair e entrar como B | Lista de A não aparece | |
| Abrir URL de detalhes da ocorrência de A como B | Ocorrência não encontrada/sem acesso | |
| Consultar dados de A com cliente B diretamente | RLS retorna vazio ou nega operação | |
| Sair de B e atualizar a página | Rota protegida redireciona para Entrar | |

Registre data, commit, projeto Supabase de teste (sem chave), resultados reais e capturas em `docs/evidencias`. Não marque esta etapa como concluída antes de executar todos os passos.

## Execução parcial real — 14/11/2026

No projeto Supabase `gxrfhusburxrenjcqqxi`, o cadastro de A criou um perfil. A confirmação por e-mail do alias temporário foi feita diretamente no banco apenas para o teste; o link recebido por e-mail não foi verificado. Login, recuperação da sessão após refresh, lista, registro sem foto pela interface, detalhes, histórico inicial e logout passaram no navegador local. Um teste conectado ao backend também verificou upload privado, URL assinada e criação de ocorrência com foto. Os dados de teste foram removidos.

O acesso de outro usuário foi bloqueado em uma transação SQL com papéis JWT distintos, revertida ao final. Não houve segundo cadastro real: o provedor retornou `over_email_send_rate_limit`. A versão publicada abriu a tela de login, mas o cadastro de teste também recebeu HTTP 429. Portanto, a confirmação por e-mail, o fluxo completo publicado com conta autenticada e o teste com dois usuários reais permanecem pendentes. Não há resultados de participantes das rodadas 1 e 2.
