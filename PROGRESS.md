# Progresso — Presidente Simulator

> Atualizado em **07/10/2026**. Para retomar, peça: *"continue o simulador a partir do PROGRESS.md"*.
> Contrato de APIs entre engine/data/stores/ui: **`docs/SPEC.md`**.

## Estado atual

O jogo está **completo e jogável** de ponta a ponta: menu → setup → candidato → campanha → eleição → metas → (turno → evento → resumo)* → reeleição → 2º mandato → resultado.

- `npm run typecheck`: limpo
- `npm test`: 192 testes em 16 arquivos, todos passando
  - engine com fixtures próprias em `src/engine/__fixtures__/`
  - integridade e simulação do conteúdo real em `src/data/content.test.ts`
- `npm run lint`: limpo
- `npm run build`: ok, todos os chunks abaixo de 500 kB (vendors separados em `vite.config.ts`)
- `npm run dev`: abre em `http://localhost:5173`

## Feito ✅

- **Scaffold, tipos, constantes, utils, dados de setup, stores** (sessão de 02/10).
- **Engine** (`src/engine/`), funções puras conforme `docs/SPEC.md` §1:
  - `random` (mulberry32), `conditions`, `impacts`, `approval`, `simulation` (macro mensal, social, setores), `decisions`
  - `congress` (votação logística, negociação, CPI, impeachment), `diplomacy`, `events` (programados + 40% aleatório / 60% condicional)
  - `promises` + `promiseScaling`, `goals`, `news`, `election`, `scoring`, `turn`, `difficulty` e o barrel `index.ts`
  - coeficientes em `constants/balance.ts`
- **Dados:**
  - 129 decisões: 9 ministérios + 27 exclusivas do 2º mandato (`data/decisions/secondTerm.ts`)
  - 70 eventos: 6 categorias + 7 programados + 16 exclusivos do 2º mandato (`data/events/secondTerm.ts`)
  - 30 templates de manchetes dinâmicas
- **UI completa:**
  - kit base em `components/ui/`
  - 11 telas em `screens/`, com lazy load por fase
  - componentes de domínio em `components/game/`
  - áudio sintetizado via Web Audio (`hooks/useAudio.ts` + `utils/audioSynth.ts`)
- **Playtest no navegador:** partida Blitz completa com dois mandatos (todas as telas, salvar/continuar e nova partida), sem erros de runtime.

## Calibração (48 turnos, conteúdo real, aprovação final)

| Estratégia | Fácil | Normal | Difícil |
|---|---|---|---|
| Passiva (não decide nada) | 39–45% | 34–42% | 28–39% |
| Aleatória | 47–55% | 37–44% | 20–34% |
| Populista gulosa (sempre a opção mais popular) | 64–70% | 55–60% | 46–52% |

O populista ganha a eleição, mas deixa inflação de 5–8%, déficit acima de 4% do PIB, dívida acima de 110% e dólar acima de R$ 9. Ele perde pontos de legado (economia) e sofre no 2º mandato. Reeleição no Normal exige 50%.

## Rodada de feedback (07/10) — "2º mandato repete" e "textos massivos"

- **Textos condensados:** todo o conteúdo foi reescrito em linguagem simples e sem siglas. Os limites são cobertos por testes em `content.test.ts`: contexto ≤ 150, opção ≤ 75, manchete ≤ 85 caracteres.
- **UI mais enxuta:**
  - a decisão escolhida recolhe em uma linha ("✓ opção · Alterar")
  - no máximo 3 dicas de impacto por opção
  - a capa do mês mostra 1 manchete principal e 4 secundárias ("ver mais")
  - o resumo mostra só os setores que mudaram ≥ 1 p.p.
  - o painel mostra 3 notícias
  - rótulos sem jargão ("Contas públicas", "Juros", "Desigualdade"…)
- **Menos leitura:** 3–4 decisões por mês, em vez de 3–5.
- **Variedade:**
  - nova condição `{ kind: 'term' }` para conteúdo exclusivo do 2º mandato (sucessão, legado, pato manco, desgaste)
  - o sorteio prioriza conteúdo inédito (`SEEN_DECISION_WEIGHT`, `SEEN_EVENT_WEIGHT`)
  - decisões recicladas só voltam após 20 meses
  - repetição do 1º mandato no 2º: Blitz 5–14%, Padrão 43–53%, Completo 61–72%

## Rodada de feedback (07/10) — "jogo mais solto, com corrupção"

Tipos em `src/types/freeplay.ts`; engine em `outcomes.ts`, `latentRisks.ts`, `newsBlips.ts`, `presidentialActions.ts`; testes em `engine/freeplay.test.ts`.

- **Esquemas de corrupção** (`data/events/corruption.ts` + `data/latentRisks.ts`): 8 esquemas (mesada a deputados, caixa 2, propina em obras, orçamento paralelo, publicidade inflada, estatal loteada, fundo de pensão, lobby de mineradora).
  - As propostas têm canal próprio, fora do sorteio geral: 30% de chance por mês a partir do mês 2 (`CORRUPTION_OFFER_CHANCE`). Isso dá 2–3 propostas no Blitz, 4–7 no Padrão e 7–8 no Completo.
  - Cada um tem: proposta reservada (categoria `corruption`) → risco latente que cresce mês a mês → evento de cerco da PF (abafar define `obstrucao-justica` e reduz a chance) → escândalo prioritário quando vem à tona.
  - Os graves definem `crime-de-responsabilidade`, que soma +15 aos limiares de impeachment.
  - O que nunca veio à tona pode ser revelado após o mandato (`resolvePostTermRisks`) e desconta pontos de legado (`ScoreBreakdown.integrityPenalty`, box "A conta chegou").
- **Desfechos incertos** (`risk` em 41 opções e em 8 ações da agenda): chance de sair do roteiro, mostrada no selo "⚠ X% de sair do roteiro". Algumas surpresas são positivas.
- **Fatos do mês** (`data/newsBlips.ts`, 50 itens): 0–2 notícias avulsas por mês, muitas condicionadas ao estado do país e a datas reais.
- **Agenda presidencial** (`data/presidentialActions.ts`, 14 ações): aba "Agenda" (padrão no painel), uma iniciativa livre por mês, cada uma com cooldown.
- **Eventos com `priority: true`** saem antes do sorteio (desdobramentos obrigatórios).
- **Calibração no Normal:** quem joga ao acaso aceita 2–5 esquemas e quase todos vêm à tona; no Difícil, corrupção + crise levou a impeachment em 3 de 4 partidas aleatórias.

## Rodada de feedback (07/10) — "quero ser 100% esquerda ou 100% direita"

- **Espectro político:** as métricas `ideologyEconomic` e `ideologySocial` (−100…100) começam na ideologia do candidato e mudam com as escolhas. As opções têm deltas ideológicos e a campanha também desloca. Aparece no painel "Espectro político" e nas dicas ("Esquerda ▲▲", "Conservador ▲").
- **Militância:** governos fora da zona moderada (raio > 50) ganham até +12 pontos de equilíbrio nos setores alinhados (`SECTOR_IDEOLOGY`, `militancyBonus`).
- **Agenda radical:** 18 decisões (2 por ministério) liberadas por condições de ideologia (≤ −40 ou ≥ 40). Exemplos: fortunas, Eletrobras, renda básica, aborto até 12 semanas / Petrobras, carteira verde e amarela, maioridade penal, saída do Acordo de Paris. Mais 12 eventos reativos (`data/events/ideology.ts`).
- **Driblar o Congresso** (agenda presidencial):
  - **Medida provisória** (`medida-provisoria`): no mês, leis ordinárias têm chance mínima de 60% e +15% (PECs não). Custo −1 de base, cooldown 2.
  - **Militância nas ruas:** +15% nas votações do mês.
  - Também: atacar o Congresso em rede nacional; governar por decreto.
- **Base aliada:** converge 8%/mês para f(aprovação), porque o centrão segue a popularidade.
- **Candidatos:** Extrema Esquerda (−85/−60) e Extrema Direita (+80/+85), com o novo partido `frente-patriotica-conservadora`.
- **Calibração (simulações 100% ideológicas, Mandato Completo):**
  - Extrema esquerda: chega a −100/−100 com aprovação ~50%; aprova 7–16 leis (o Congresso de centro-direita resiste mais).
  - Extrema direita: chega a +100/+100 com aprovação 36–51%; aprova 12–25 leis.
  - Em ambos, 11–15 decisões radicais por partida.

## Decisões de design tomadas no engine

- **Aprovação:** cada setor converge 20%/mês para um equilíbrio formado por:
  - base 45
  - sinais das métricas relativos aos valores iniciais × sensibilidades (GDD §3.3)
  - afinidade (ideologia + memória política: 5% de cada delta setorial vira permanente)
  - bônus de confiança
  - lua de mel de 6 meses
  - desgaste acumulado do mandato
- **Retornos decrescentes** (`APPROVAL_SATURATION`): ganhos de aprovação de um setor encolhem conforme ele já está alto (fator 1 em 45%, 0,5 em 65%, 0,1 em 85%). As perdas valem integralmente. Popularidade sustentada precisa vir dos indicadores.
- **Copom autônomo:** move a Selic em 0,5 p.p. quando ela se afasta mais de 0,75 p.p. da regra de Taylor.
- **Dívida pública:**
  - O juro efetivo é 0,6 × Selic + 0,8, mais um prêmio de risco acima de 80% do PIB, menos um desconto de credibilidade de 0,4 p.p. por p.p. de superávit. A regra de Taylor do Copom usa neutro real de 5%.
  - Regra fiscal: com ela em vigor (sem a flag `arcabouco-fiscal-rompido`), déficits convergem à meta de +0,5% do PIB a 35%/ano. Superávits conquistados não são puxados para baixo.
  - Gastos pontuais (`debt` em impactos) entram com fator `DEBT_IMPACT_SCALE` = 0,5, porque parte é compensada no orçamento.
  - A dívida é um estoque lento: no 1º ano sobe quase sempre (Selic inicial de 12%). Em 4 anos o austero chega a 66–72%, o equilibrado a 80–85% e o populista a ~90%.
  - Por isso a meta "Controle Fiscal" mede o **superávit primário** (alvo de +1,2% do PIB no Completo, escalado pelo modo: ≈ +0,2% no Blitz e +0,7% no Padrão), que responde às decisões em meses.
- **Câmbio:** estável com contas equilibradas. Deprecia com déficit acima de 0,5% do PIB, dívida acima de 80% e juro real baixo.
- **Decisões não-repetíveis** voltam à pauta após 20 turnos se nenhuma flag das suas opções estiver ativa.
- **Promessas:** prazo e alvos numéricos escalam com o modo (`goalScale`: Blitz 0,4, Padrão 0,65). O alvo ajustado é anexado ao texto da promessa.
- **Impeachment:** abre quando aprovação e base estão abaixo dos limiares da dificuldade e é arquivado se qualquer um se recuperar +5. No prazo de 3 turnos, com as condições mantidas, grava a flag `presidente-afastado`.
- **Reeleição:** determinística (aprovação ≥ `reelectionThreshold`). O 2º mandato reinicia a lua de mel e zera o desgaste.
- **Score:** aprovação final pontua de 20% (0) a 75% (máximo).

## Pendências e ideias

- **Animações em aba oculta:** com a aba do navegador oculta, o Framer Motion pausa e as transições de tela só completam quando a aba volta a ficar visível. Comportamento normal do navegador, sem impacto para quem está jogando.
- **Repetição no Mandato Completo:** o 2º mandato do modo Completo ainda repete ~2/3 das decisões (são ~170 vagas de decisão). Mais conteúdo, sobretudo repetível com variações, reduziria isso.
- **Placar do populista:** a estratégia gulosa ainda pontua mais que a aleatória no legado. Se quiser punir mais o populismo, aumentar o peso de eventos de crise fiscal (gatilhos por dívida/déficit) ou o componente econômico do score.
- **Cores do Recharts** em `constants/theme.ts` espelham `tailwind.config.js` à mão.
- **Git:** o projeto ainda não é um repositório (o CLAUDE.md define os padrões de commit). Rodar `git init` quando quiser versionar.
