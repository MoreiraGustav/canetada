# CLAUDE.md — Presidente Simulator

## Projeto

Simulador web de presidente do Brasil. React + TypeScript + Vite + Tailwind CSS + Zustand.
100% client-side, sem backend. Dados persistidos em localStorage.

Referência de design: `game-design-document.md` na raiz do projeto.

---

## Stack

- **Runtime:** Node 20+
- **Framework:** React 18+
- **Linguagem:** TypeScript (strict mode)
- **Estilos:** Tailwind CSS 3+
- **Estado global:** Zustand
- **Gráficos:** Recharts
- **Animações:** Framer Motion
- **Build:** Vite
- **Idioma do app:** PT-BR (código e variáveis em inglês)

---

## Estrutura de Pastas

```
src/
├── assets/              # Imagens, fontes, áudio
├── components/          # Componentes React reutilizáveis
│   ├── ui/              # Componentes base (Button, Card, Modal, etc.)
│   └── game/            # Componentes específicos do jogo (Dashboard, EventCard, etc.)
├── engine/              # Lógica pura do simulador (sem dependência de React)
│   ├── simulation.ts    # Motor de cálculo de métricas
│   ├── events.ts        # Sistema de eventos
│   ├── diplomacy.ts     # Relações internacionais
│   ├── congress.ts      # Mecânicas do Congresso
│   └── scoring.ts       # Cálculo de score/legado
├── data/                # Dados estáticos (JSON)
│   ├── candidates.ts    # Candidatos pré-definidos
│   ├── events/          # Banco de eventos por categoria
│   ├── decisions/       # Banco de decisões por ministério
│   └── countries.ts     # Países e relações iniciais
├── hooks/               # Custom hooks
├── screens/             # Telas/páginas completas
├── stores/              # Zustand stores
├── types/               # Tipos e interfaces globais
├── utils/               # Funções utilitárias puras
└── constants/           # Constantes e enums
```

---

## Regras de Código

### TypeScript

- `strict: true` obrigatório no `tsconfig.json`.
- Proibido `any`. Usar `unknown` + type guard quando necessário.
- Toda função exportada deve ter tipos explícitos de parâmetro e retorno.
- Interfaces para objetos de domínio. Types para unions e utilitários.
- Enums somente `const enum` ou preferir objetos `as const`.

### Componentes React

- Apenas functional components com arrow functions.
- Props tipadas com interface dedicada (`interface XxxProps`).
- Um componente por arquivo. Nome do arquivo = nome do componente em PascalCase.
- Componentes sem lógica de negócio — delegar para hooks ou engine.
- Evitar `useEffect` para lógica derivada; preferir `useMemo` / computações no render.
- Componentes de UI (`components/ui/`) devem ser genéricos e reutilizáveis, sem imports de stores ou engine.

### Estado (Zustand)

- Uma store por domínio: `useGameStore`, `useMetricsStore`, `useDiplomacyStore`, etc.
- Actions dentro da store (não fora).
- Selectors com `useShallow` para evitar re-renders desnecessários.
- Estado serializado deve ser compatível com `JSON.stringify` (sem classes, funções, ou Maps).
- Stores não importam componentes React.

### Engine (Lógica de Simulação)

- Funções puras. Input → Output. Sem side effects.
- Sem dependência de React, DOM ou Zustand.
- Testável isoladamente.
- Fórmulas de impacto documentadas com comentários inline.
- Constantes de balanceamento centralizadas em `constants/balance.ts`.

### Dados Estáticos

- Tipados com interfaces de `types/`.
- IDs únicos string (kebab-case): `"enchente-rs"`, `"acordo-mercosul-ue"`.
- Novos eventos/decisões adicionados sem alterar código existente (data-driven).

---

## Convenções de Nomenclatura

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Arquivos de componente | PascalCase | `Dashboard.tsx` |
| Arquivos de lógica | camelCase | `simulation.ts` |
| Arquivos de tipos | camelCase | `gameState.ts` |
| Interfaces | PascalCase, prefixo descritivo | `GameMetrics`, `EventOption` |
| Constantes | UPPER_SNAKE_CASE | `MAX_APPROVAL`, `TURNS_PER_YEAR` |
| Funções | camelCase, verbo primeiro | `calculateApproval()`, `applyDecision()` |
| Hooks | camelCase, prefixo `use` | `useGameLoop()`, `useTurnActions()` |
| Stores | camelCase, prefixo `use` + sufixo `Store` | `useGameStore` |
| Variáveis de estado | camelCase | `approvalRating`, `currentTurn` |
| Eventos/decisões (IDs) | kebab-case | `"crise-fiscal-2027"` |

---

## Escalabilidade

### Arquitetura Data-Driven

- Eventos, decisões e candidatos são **dados**, não código.
- Adicionar conteúdo novo = adicionar entrada em JSON/TS, sem modificar engine.
- Engine consome interfaces genéricas (`Event`, `Decision`), não implementações específicas.

### Separação Engine ↔ UI

```
[ Dados JSON ] → [ Engine (pura) ] → [ Stores (Zustand) ] → [ Componentes React ]
```

- Engine nunca importa de `components/`, `hooks/`, ou `stores/`.
- Componentes nunca importam de `engine/` diretamente — passam pelas stores.
- Isso permite trocar UI inteira sem tocar na simulação.

### Extensibilidade de Conteúdo

- Novo evento: criar arquivo em `data/events/`, registrar no index.
- Novo país: adicionar entrada em `data/countries.ts`.
- Nova decisão: adicionar entrada em `data/decisions/`.
- Novo candidato: adicionar entrada em `data/candidates.ts`.
- Nenhum `switch/case` gigante — usar maps e lookups por ID.

### Performance

- Cálculos pesados no engine são síncronos mas O(n) onde n = número de métricas (constante pequeno).
- Gráficos históricos limitados a 48 pontos máximo (turnos).
- Lazy load de telas com `React.lazy()` + `Suspense`.
- Imagens e áudio com lazy loading nativo.

---

## Padrões de Commit

```
feat: adiciona sistema de eventos climáticos
fix: corrige cálculo de aprovação por setor
data: adiciona 5 novos eventos de crise econômica
balance: ajusta impacto de decisões fiscais
ui: melhora responsividade do dashboard
refactor: extrai lógica de diplomacia para módulo próprio
```

---

## Regras de Qualidade

- Sem `console.log` em código commitado (usar utilitário de debug condicional).
- Sem magic numbers — extrair para `constants/`.
- Sem lógica duplicada — extrair para `utils/` ou `engine/`.
- Funções com mais de 40 linhas devem ser decompostas.
- Componentes com mais de 150 linhas devem ser decompostos.
- Imports organizados: React → libs externas → engine → stores → components → types → utils.
- Sem dependências circulares entre módulos.
- Todo arquivo novo deve seguir a estrutura de pastas definida.
