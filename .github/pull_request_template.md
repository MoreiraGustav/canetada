## O que muda

<!-- Descreva em poucas linhas o que este PR faz e por quê. Se resolve uma issue, escreva "Closes #123". -->

## Tipo

- [ ] `feat` — nova funcionalidade
- [ ] `fix` — correção de bug
- [ ] `data` — novo conteúdo (decisões, eventos, fatos, manchetes…)
- [ ] `balance` — ajuste de balanceamento
- [ ] `ui` — interface
- [ ] `refactor` / `test` / `docs` / `chore`

## Checklist

- [ ] `npm run typecheck && npm run lint && npm test && npm run build` passam localmente
- [ ] Segue as regras do [`CLAUDE.md`](../CLAUDE.md) (engine puro, componentes sem `@/engine`/`@/data`, sem `any`, sem números mágicos)
- [ ] Conteúdo novo: textos curtos, linguagem simples, tom neutro, toda opção com trade-off ([guia](../CONTRIBUTING.md#adicionando-conteúdo))
- [ ] Regra nova de engine: testes adicionados em `src/engine/*.test.ts`
- [ ] Balanceamento: efeito esperado descrito abaixo

## Prints / efeito no jogo

<!-- Mudança de UI: print ou GIF (desktop e celular). Balanceamento: antes × depois. -->
