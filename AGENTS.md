# AGENTS.md — Presidente Simulator

## Visão Geral

Este projeto usa multi-agents. Cada agent tem escopo restrito, acessa apenas seus diretórios e segue as regras do `CLAUDE.md`.

---

## Agent: engine

**Descrição:** Motor de simulação do jogo. Lógica pura, sem React, sem DOM, sem side effects.

**Diretórios permitidos:**
- `src/engine/`
- `src/types/`
- `src/constants/`

**Responsabilidades:**
- Cálculo de métricas (aprovação, PIB, inflação, desemprego, etc.)
- Processamento de decisões e seus impactos
- Sistema de eventos (seleção, probabilidade condicional, resolução)
- Mecânicas do Congresso (base aliada, votação, CPI, impeachment)
- Diplomacia e relações internacionais
- Cálculo de score e legado
- Mecânica de eleição e campanha
- Sistema de dificuldade (calibração fácil/normal/difícil)

**Regras:**
- Funções puras: input → output, sem mutação de estado externo.
- Zero imports de React, Zustand, DOM ou qualquer lib de UI.
- Toda fórmula de impacto deve ter comentário explicando a lógica.
- Constantes de balanceamento em `src/constants/balance.ts`, nunca hardcoded.
- Interfaces de domínio em `src/types/`, nunca definidas inline.
- Exportar funções granulares e compostas separadamente.

---

## Agent: ui

**Descrição:** Interface visual do jogo. Componentes React, telas, estilo editorial/jornal.

**Diretórios permitidos:**
- `src/components/`
- `src/screens/`
- `src/hooks/`
- `src/assets/`

**Responsabilidades:**
- Componentes base reutilizáveis (`components/ui/`)
- Componentes de jogo (`components/game/`)
- Telas completas (menu, eleição, dashboard, evento, resultado)
- Custom hooks de UI (animações, responsividade, áudio)
- Estilo editorial/jornal com Tailwind + paleta própria
- Transições entre turnos com Framer Motion
- Gráficos de métricas com Recharts
- Responsividade mobile-first
- Sistema de áudio com controle de mute/volume

**Regras:**
- Sem lógica de simulação. Consumir dados prontos das stores.
- Componentes de `components/ui/` não importam stores nem engine.
- Um componente por arquivo, PascalCase.
- Props tipadas com `interface XxxProps` no topo do arquivo.
- Máximo 150 linhas por componente; decompor se exceder.
- Textos de interface em PT-BR direto no JSX (sem i18n).
- Imports de stores apenas em `screens/` e `components/game/`.

---

## Agent: data

**Descrição:** Conteúdo do jogo. Eventos, decisões, candidatos, países. Puramente declarativo.

**Diretórios permitidos:**
- `src/data/`
- `src/types/`

**Responsabilidades:**
- Banco de eventos por categoria (crise, desastre, oportunidade, etc.)
- Banco de decisões por ministério
- Candidatos pré-definidos (arquétipos) e partidos
- Países e blocos com relações iniciais
- Perguntas de campanha eleitoral
- Metas disponíveis para seleção
- Notícias/manchetes template

**Regras:**
- Dados são objetos tipados, nunca classes.
- Todo item tem `id` único em kebab-case.
- Seguir interfaces definidas em `src/types/` rigorosamente.
- Sem lógica, sem cálculos, sem imports de engine ou stores.
- Impactos expressos como objetos declarativos (`{ approval: -5, gdp: +0.2 }`), nunca como funções.
- Novos conteúdos não devem exigir alteração em nenhum outro arquivo além do index de registro.
- Dados devem ser realistas e calibrados com fontes reais do Brasil (IBGE, BCB, INPE, etc.).

---

## Agent: state

**Descrição:** Gerenciamento de estado com Zustand. Ponte entre engine e UI.

**Diretórios permitidos:**
- `src/stores/`
- `src/types/`
- `src/constants/`

**Responsabilidades:**
- `useGameStore` — estado geral (turno, modo, fase, dificuldade)
- `useMetricsStore` — métricas de governo (aprovação, PIB, etc.)
- `useDiplomacyStore` — relações internacionais
- `useCongressStore` — base aliada, votações
- `usePlayerStore` — candidato escolhido, promessas, score
- Persistência em localStorage (save/load)
- Orquestração do turno (chamar engine, atualizar estado, registrar histórico)

**Regras:**
- Uma store por domínio, nunca uma store monolítica.
- Actions definidas dentro da store.
- Stores podem importar de `engine/` e `data/` para processar ações.
- Stores nunca importam de `components/`, `screens/` ou `hooks/`.
- Estado deve ser serializável (`JSON.stringify` compatível).
- Histórico de métricas armazenado como array de snapshots por turno.
- Expor selectors granulares para evitar re-renders.
