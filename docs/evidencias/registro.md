# Registro de evidências

Registrar apenas verificações executadas. Não incluir senhas, chaves ou dados pessoais de participantes.

| Data | Ambiente | Evidência real | Resultado | Link/arquivo |
|---|---|---|---|---|
| 14/11/2026 | Local | Lint, testes e build | Aprovados; 35 testes | Comandos `npm run lint`, `npm test`, `npm run build` |
| 14/11/2026 | Supabase | Migration, seed, RLS e Storage | Aplicados; cinco categorias, RLS nas quatro tabelas, bucket privado | Projeto `gxrfhusburxrenjcqqxi` |
| 14/11/2026 | Navegador local | Login, lista, registro sem foto, confirmação, detalhes, histórico, refresh e logout | Aprovados com conta temporária; dados removidos após o teste | Roteiro em `docs/validacao/teste-integrado.md` |
| 14/11/2026 | GitHub | Pipeline do commit `6c87962` | Aprovado | https://github.com/myjefferson/no-meu-bairro/actions/runs/43610643708 |
| 14/11/2026 | Produção privada | Deploy do commit `6c87962` e abertura da tela de login | Publicação concluída; cadastro encontrou limite de e-mails HTTP 429 do Supabase | https://no-meu-bairro-jcsje.friendlyrhea1.chatgpt.site |

Ainda faltam capturas reais das três telas, smoke test completo da versão publicada com uma conta confirmada, PR de ajustes e duas rodadas com participantes. Não marcar essas evidências como concluídas antes de executá-las.
