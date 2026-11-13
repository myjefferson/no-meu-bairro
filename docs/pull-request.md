# Pull request preparado

**Base:** `main`  
**Branch:** `feature/tests-ci`  
**Título sugerido:** `test: expand occurrence form coverage`

## Descrição

Amplia os testes do registro de ocorrência e da listagem, incluindo validação, sucesso, navegação, envio duplicado e erros.

## Como testar

```bash
npm ci
npm run lint
npm test
npm run build
```

## Checklist

- [x] Sem credenciais versionadas
- [x] Testes locais executados
- [ ] Pipeline verde no GitHub (depende de publicação)
- [ ] Fluxos reais com Supabase (depende de projeto configurado)
- [ ] Capturas de tela reais após integração

Para publicar: crie um repositório remoto, adicione `origin`, envie `main` e `feature/tests-ci`, e abra o PR da branch para `main`. O GitHub CLI não está instalado neste computador e ainda não existe remoto configurado.
