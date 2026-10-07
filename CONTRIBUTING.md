# Contribuindo com o Canetada

Valeu pelo interesse! 🇧🇷 Contribuições são muito bem-vindas — de correções de digitação a novos sistemas de jogo. Este guia explica como o projeto é organizado e o que esperamos de um PR.

## Formas de contribuir

- **Conteúdo** (a forma mais fácil e mais valiosa): novas decisões, eventos, fatos do mês, manchetes, candidatos. Não exige mexer no motor.
- **Balanceamento:** achou algo impossível ou fácil demais? Abra uma issue de *Feedback de balanceamento* com o que você fez e o resultado.
- **Bugs:** abra uma issue com o passo a passo para reproduzir.
- **Código:** engine, interface, acessibilidade, performance, testes.

Para mudanças grandes (novo sistema, mudança de regra do jogo), **abra uma issue antes** para alinhar a ideia — evita retrabalho.

## Rodando o projeto

Requer **Node 22+** (Vite 8).

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # testes (vitest)
npm run typecheck  # TypeScript strict
npm run lint       # ESLint
npm run build      # build de produção
```

Antes de abrir o PR, rode `npm run typecheck && npm run lint && npm test && npm run build` — o CI roda exatamente isso.

## Como o código é organizado

```
[ src/data (conteúdo) ] → [ src/engine (funções puras) ] → [ src/stores (Zustand) ] → [ src/screens + src/components ]
```

- **`src/engine/`** — o motor da simulação. Funções puras (entrada → saída), sem React, DOM ou Zustand. Determinístico (PRNG com semente). Coeficientes de balanceamento ficam em `src/constants/balance.ts`, nunca soltos no código.
- **`src/data/`** — todo o conteúdo do jogo, tipado. **Adicionar conteúdo não deve exigir mudar o engine.**
- **`src/stores/`** — estado (Zustand) e selectors que montam as views para a UI.
- **`src/screens/` e `src/components/`** — interface. Componentes **nunca** importam `@/engine` ou `@/data` diretamente: passam pelas stores. `components/ui/` são genéricos (sem stores).
- **`src/types/`** — contrato de domínio (fonte de verdade).

As regras completas estão em [`CLAUDE.md`](CLAUDE.md) (convenções, limites de tamanho, nomenclatura) e o contrato técnico em [`docs/SPEC.md`](docs/SPEC.md). O estado do projeto e as decisões de design estão em [`PROGRESS.md`](PROGRESS.md).

## Adicionando conteúdo

| Quero adicionar… | Arquivo |
|---|---|
| Decisão de ministério | `src/data/decisions/<ministério>.ts` |
| Decisão exclusiva do 2º mandato | `src/data/decisions/secondTerm.ts` |
| Evento | `src/data/events/<categoria>.ts` |
| Esquema de corrupção | `src/data/events/corruption.ts` + `src/data/latentRisks.ts` |
| Fato do mês | `src/data/newsBlips.ts` |
| Ação da agenda presidencial | `src/data/presidentialActions.ts` |
| Manchete dinâmica de indicador | `src/data/headlines.ts` |
| Candidato / partido | `src/data/candidates.ts` / `src/data/parties.ts` |

Regras de conteúdo (verificadas por `src/data/content.test.ts`):

- **IDs únicos** em kebab-case (`"enchente-rs"`, `"reforma-tributaria"`).
- **Textos curtos e diretos** (jogadores pediram menos leitura): contexto da decisão ≤ 150 caracteres, descrição do evento ≤ 160, rótulo da opção ≤ 45, descrição da opção ≤ 75, manchete ≤ 85.
- **Linguagem simples**, sem siglas não explicadas. Tom sério e jornalístico — sem deboche de nenhum lado político.
- **Toda opção tem trade-off.** Nada de ação "grátis". Populismo: ganho agora, custo depois (`delayed`). Medida técnica: custo agora, ganho gradual.
- **Magnitudes realistas:** use a tabela de calibração em `docs/SPEC.md` §2. Nunca use a chave `gdp`.
- **Flags:** só leia (em `conditions`/`requires`/`triggers`) flags que algum conteúdo define. O teste acusa flags órfãs.
- **Referências ao presidente em gênero neutro** ("o Planalto", "o governo", "a Presidência") — o jogador pode ser qualquer pessoa.
- **Nada de nomes reais** de pessoas ou empresas em contextos negativos; candidatos e partidos são fictícios.
- Se a opção move o governo no espectro político, adicione `ideologyEconomic` / `ideologySocial` ao `impact` (±2–3 leve, ±4–6 moderado, ±10–15 radical).

## Balanceamento

Mudou um coeficiente em `src/constants/balance.ts` ou um impacto forte? Descreva no PR o efeito esperado. Referências de calibração (modo Normal, 48 meses) estão em `PROGRESS.md` — por exemplo, jogo passivo termina perto de 35–40% de aprovação e jogo aleatório perto de 40–45%. Se puder, inclua uma simulação (o `src/engine/__fixtures__/simulate.ts` ajuda).

## Commits e PRs

- **Branch** a partir de `main`: `feat/agenda-climatica`, `fix/votacao-pec`, `data/eventos-seca`.
- **Commits** no padrão do projeto (em português):

  ```
  feat: adiciona sistema de eventos climáticos
  fix: corrige cálculo de aprovação por setor
  data: adiciona 5 novos eventos de crise econômica
  balance: ajusta impacto de decisões fiscais
  ui: melhora responsividade do dashboard
  refactor: extrai lógica de diplomacia para módulo próprio
  test: cobre votação de PEC com medida provisória
  docs: explica como adicionar fatos do mês
  ```

- **PRs pequenos e focados** são revisados mais rápido. Preencha o template do PR.
- Mudanças de UI: inclua um print ou GIF (desktop e celular, se possível).
- Novas regras de engine: inclua testes em `src/engine/*.test.ts`.

## Dúvidas

Abra uma issue ou uma discussão. Ao participar, você concorda com o [Código de Conduta](CODE_OF_CONDUCT.md).
