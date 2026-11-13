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
