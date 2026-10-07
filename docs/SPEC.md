# SPEC de integração — Presidente Simulator

Contrato compartilhado entre os agents (engine, data, state, ui). Os tipos em `src/types/`
são a fonte de verdade; NÃO altere tipos existentes sem necessidade real — se precisar,
apenas ADICIONE campos opcionais e registre no relatório final.

Já existem (escritos pelo coordenador, não reescrever):
- `src/types/*` (+ barrel `src/types/index.ts`, importar via `import type { ... } from '@/types'`)
- `src/constants/metrics.ts` (INITIAL_METRICS, METRIC_KEYS, METRIC_BOUNDS, INDICATOR_INFO, PRIMARY_INDICATORS, SECONDARY_METRIC_GROUPS)
- `src/constants/sectors.ts` (SECTOR_INFO com pesos, SECTOR_KEYS, INITIAL_SECTOR_APPROVAL)
- `src/constants/game.ts` (GAME_MODES, calendário, contagens por turno, MINISTRY_INFO, EVENT_CATEGORY_INFO, storage keys)
- `src/constants/balance.ts` (DIFFICULTY_CONFIGS, DEFAULT_MODIFIERS, limiares do Congresso, pesos de eventos) — o agent engine PODE ESTENDER este arquivo.
- `src/utils/math.ts` (clamp, roundTo, sum, average, lerp, indexById), `src/utils/calendar.ts` (getTurnDate, getTurnFromDate, formatTurnShort/Axis/Long),
  `src/utils/format.ts` (formatNumber, formatSigned, formatIndicator, formatIndicatorDelta, formatChance, interpolate),
  `src/utils/impactHints.ts` (summarizeImpact, mergeImpacts), `src/utils/labels.ts`, `src/utils/debug.ts` (debugLog).
- Alias de import: `@/` → `src/`.

Turno 1 = Jan/2027. Um turno = um mês.

---------------------------------------------------------------------------------------------------
## 1. ENGINE (`src/engine/`) — funções puras, sem React/Zustand/DOM, sem importar `data/`

O engine recebe o conteúdo via `GameContent` (injetado pelas stores). Pode importar `@/types`,
`@/constants/*` e `@/utils/*`. Toda fórmula com comentário inline. Coeficientes em `constants/balance.ts`.

Aleatoriedade: PRNG determinístico (mulberry32). Funções granulares recebem `rng: Rng`;
funções compostas recebem o `SimulationState` (que tem `seed`) e devolvem estado com `seed` avançado.

### Módulos e API pública obrigatória (nomes/assinaturas exatos — stores dependem disso)

`engine/random.ts`
- `createRng(seed: number): Rng`
- `randomBetween(rng: Rng, min: number, max: number): number`
- `randomInt(rng: Rng, min: number, max: number): number` (inclusive)
- `pickWeighted<T>(rng: Rng, items: ReadonlyArray<{ item: T; weight: number }>): T | null`
- `shuffle<T>(rng: Rng, items: readonly T[]): T[]`

`engine/conditions.ts`
- `getIndicatorValue(state: SimulationState, key: IndicatorKey): number`
- `evaluateCondition(state: SimulationState, condition: Condition): boolean`
- `evaluateConditions(state: SimulationState, conditions: readonly Condition[] | undefined): boolean` (vazio/undefined = true)

`engine/impacts.ts`
- `applyImpact(state: SimulationState, impact: Impact, scaling?: ImpactScaling): SimulationState`
  (aplica deltas, clamp por METRIC_BOUNDS, setores 0–100, relações 0–100, base aliada 0–100, recalcula `approval`.
  `ImpactScaling = { positive: number; negative: number }` multiplica deltas benéficos/prejudiciais conforme polaridade
  de `INDICATOR_INFO[key].polarity`; para setores/relações/aprovação/base, positivo = benéfico.)
  → defina `ImpactScaling` em `src/types/` (adicionar ao `impact.ts`).
- `scheduleDelayedImpacts(state: SimulationState, sourceId: string, label: string, delayed: readonly DelayedImpact[] | undefined): SimulationState`
  (cria ActiveEffect com perTurn = impact/duration, startTurn = state.turn + 1 + delay, endTurn = startTurn + duration - 1)
- `applyActiveEffects(state: SimulationState): SimulationState` (aplica efeitos com startTurn ≤ turn ≤ endTurn e remove os expirados)
- `scaleImpact(impact: Impact, factor: number): Impact`

`engine/simulation.ts` (motor macro mensal; GDD §3, §6.2)
- `stepEconomy(state: SimulationState, rng: Rng, difficulty: DifficultyConfig): SimulationState`
  Dinâmica mensal agregada, sugestão (calibrar/documentar):
  - juro real r = selic − inflação; neutro ≈ 5%.
  - inflação: ancoragem à meta 3% + efeito do juro real (defasado/gradual) + repasse cambial (Δcâmbio%) + hiato (gdpGrowth − potentialGrowth) + fiscal (primário negativo pressiona) + ruído.
  - gdpGrowth: reverte ao potentialGrowth (ex.: 8%/mês da distância) − efeito juro real acima do neutro + confiança (aprovação do mercado/empresários) + IDE + ruído.
  - gdp (real) *= (1 + gdpGrowth/100)^(1/12).
  - desemprego: Okun (Δu anual ≈ −0,4 × (g − g*)) /12 + leve atração a ~8%.
  - câmbio: % mensal ← diferencial de juros, risco fiscal (dívida > 80, primário negativo), confiança do mercado, ruído.
  - dívida: Δd mensal = [d × (i_ef − g_nominal)/100 − primário] / 12, com i_ef ≈ fração da Selic.
  - IDE: tende a f(relações médias ponderadas por economicWeight, mercado, câmbio).
  - balança comercial: tende a f(câmbio, relações com China/EUA/UE, commodities).
- `stepSocial(state: SimulationState, rng: Rng): SimulationState` — pobreza (desemprego, inflação), Gini (lento), IDH derivado (saúde, IDEB, PIB per capita), homicídios/confiança com leve inércia, desmatamento/emissões/reservas hídricas com sazonalidade leve (seca Ago–Nov) e inércia, prestígio tende a f(relações, desmatamento).
- `computeSectorEquilibrium(state: SimulationState): SectorApproval` — aprovação de equilíbrio de cada setor a partir das métricas (sensibilidades da tabela GDD §3.3) + `sectorAffinity` + `modifiers.economicConfidenceBonus` (mercado/empresários).
- `stepSectors(state: SimulationState, difficulty: DifficultyConfig): SimulationState` — setores se movem uma fração (~10–15%/mês) em direção ao equilíbrio, menos o desgaste `approvalDecayPerTurn × modifiers.approvalDecayMultiplier`; lua de mel nos primeiros meses do mandato; recalcula `approval`.
- `calculateApproval(sectors: SectorApproval): number` (média ponderada por SECTOR_INFO.weight)

`engine/decisions.ts`
- `selectTurnDecisions(state: SimulationState, decisions: readonly Decision[]): { state: SimulationState; decisionIds: string[] }`
  Sorteia entre MIN e MAX_DECISIONS_PER_TURN decisões elegíveis (conditions, minTurn, months, cooldown via decisionHistory, não-repetíveis só 1x),
  no máximo 1 por ministério, ponderado por `weight`. Atualiza `decisionHistory[id] = turn` para as sorteadas.
- `applyDecisionChoice(state: SimulationState, decision: Decision, option: DecisionOption, negotiate: boolean, rng: Rng, difficulty: DifficultyConfig): { state: SimulationState; news: NewsItem[]; vote: VoteRecord | null }`
  Se `option.legislative`: calcula chance (congress.ts), rola, aplica impacto+delayed+flags se aprovado, senão `failureImpact` + `failureHeadline`.
  Negociar: aplica custo `getNegotiationCost` e define a flag `negociacao-recente`. Atualiza stats (lawsApproved/Rejected, negotiations).

`engine/congress.ts`
- `calculateVoteChance(params: VoteChanceParams): number` — logística em torno do limiar (ORDINARY_LAW_THRESHOLD / PEC_THRESHOLD), + efeito da aprovação, + NEGOTIATION_SUPPORT_BONUS se negociar, + voteChanceBonus; clamp [MIN_VOTE_CHANCE, MAX_VOTE_CHANCE].
- `getNegotiationCost(modifiers: ModifierSet): Impact` — custo de cargos/emendas (dívida, classe média, aprovação), × negotiationCostMultiplier.
- `stepCongress(state: SimulationState, rng: Rng, difficulty: DifficultyConfig, cpiTopics: readonly CpiTopic[]): { state: SimulationState; news: NewsItem[] }`
  Base aliada deriva para f(aprovação); abre CPI (chance cresce abaixo de CPI_SUPPORT_THRESHOLD, flag `cpi-instalada`), CPI drena aprovação/base enquanto dura, encerra (cpisSurvived++);
  impeachment: se aprovação < impeachmentApprovalThreshold E base < impeachmentSupportThreshold → abre processo (prazo ~3 turnos, flag `impeachment-aberto`);
  arquiva se recuperar (impeachmentsSurvived++); no prazo, se condições persistirem → afastamento (sinalizar via estado: ver `isImpeached`).
- `isImpeached(state: SimulationState): boolean` — true se o processo chegou ao prazo com condições mantidas (defina como o engine marca isso; sugestão: flag `presidente-afastado`).
- `getPoliticalStatus(state: SimulationState): PoliticalStatus`

`engine/diplomacy.ts`
- `stepDiplomacy(state: SimulationState, countries: readonly Country[]): SimulationState` — leve deriva das relações à relação inicial; prestígio puxado por relações médias.
- `applyDiplomaticAction(state: SimulationState, action: DiplomaticAction, countryId: CountryId, countryName: string): { state: SimulationState; news: NewsItem }`
  (relationDelta × diplomacyMultiplier, impacto, decaimento temporário via ActiveEffect, marca lastDiplomaticActionTurn = turn, stats.diplomaticActions++)
- `canPerformDiplomaticAction(state: SimulationState): boolean`

`engine/events.ts` (sistema misto 40% aleatório / 60% condicional — GDD §9 item 9)
- `getEligibleEvents(state: SimulationState, events: readonly GameEvent[]): GameEvent[]`
- `selectEvent(state: SimulationState, events: readonly GameEvent[], difficulty: DifficultyConfig): { state: SimulationState; eventId: string | null }`
  Programados (`scheduled` = data do turno) têm prioridade. Senão rola RANDOM_EVENT_SHARE: aleatório puro (peso = EVENT_FREQUENCY_WEIGHTS × crisisWeightMultiplier p/ crises × scandalWeightMultiplier p/ escândalos) ou condicional (peso × produto dos multiplicadores dos triggers satisfeitos; só eventos com ≥1 trigger satisfeito; fallback para aleatório). Respeita requires/months/minTurn/oneTime/cooldown (DEFAULT_EVENT_COOLDOWN).
- `resolveEventOption(state: SimulationState, event: GameEvent, option: EventOption, difficulty: DifficultyConfig): { state: SimulationState; news: NewsItem[] }`
  Escala: dificuldade + `crisisImpactMultiplier` (só negativos de categorias isCrisis). Atualiza eventHistory, stats.eventsFaced/crisesFaced.

`engine/promises.ts`
- `createPromises(definitions: readonly PromiseDefinition[], termStartTurn: number, termLength: number): PlayerPromise[]`
- `stepPromises(state: SimulationState): { state: SimulationState; news: NewsItem[] }` — cumpre quando condições verdadeiras (bônus + notícia), após o prazo aplica `overduePenalty` por turno e notícia "Cadê a promessa de campanha?" ao vencer (e lembretes esparsos).

`engine/goals.ts`
- `createGoalProgress(goalIds: readonly string[], definitions: readonly GoalDefinition[], metrics: GameMetrics, mode: GameMode): GoalProgress[]` (escala pela `GAME_MODES[mode].goalScale`)
- `updateGoalProgress(goals: readonly GoalProgress[], definitions: readonly GoalDefinition[], metrics: GameMetrics): GoalProgress[]`

`engine/news.ts`
- `createNewsItem(turn: number, headline: string, tone: NewsTone, category: NewsCategory, key: string): NewsItem` (id determinístico)
- `generateIndicatorNews(before: SimulationState, after: SimulationState, templates: readonly HeadlineTemplate[], rng: Rng): NewsItem[]` (até ~3, ordenadas por |delta|/threshold; usa utils/format para `{value}`/`{delta}`)

`engine/election.ts` (mecânica de eleição e campanha — GDD §2.4)
- `buildPlayerCandidate(selection: CandidateSelection, content: GameContent): PlayerCandidate`
  Arquétipo: usa sectorAffinity/startingImpact do candidato + modifiers de background e habilidade.
  Custom: afinidade derivada da ideologia (`deriveIdeologyAffinity`) + afinidade/impacto do background + modifiers.
- `deriveIdeologyAffinity(economicIdeology: number, socialIdeology: number): SectorAffinity`
- `selectCampaignQuestions(questions: readonly CampaignQuestion[], seed: number): { questionIds: string[]; seed: number }` (CAMPAIGN_QUESTION_COUNT, obrigatórias primeiro)
- `calculateElectionResult(candidate: PlayerCandidate, options: readonly CampaignOption[], content: GameContent, seed: number): ElectionResult`
  (jogador SEMPRE vence; voteShare em ~50,3–62; margem → base aliada inicial; partido.congressBase; adversário = arquétipo ideologicamente oposto)
- `createInitialState(params: NewGameParams, content: GameContent): SimulationState`
  (métricas iniciais, setores = INITIAL + afinidade, aplica startingImpact + impactos das opções de campanha, base = election.initialCongressSupport,
  relações iniciais, promessas, metas, modificadores, stats zerados, turn=1, totalTurns=termLength=GAME_MODES[mode].turns)
- `calculateReelection(state: SimulationState): ReelectionResult` (aprovação ≥ reelectionThreshold → reeleito)
- `startSecondTerm(state: SimulationState): SimulationState` (termNumber 2, termStartTurn = turn + 1, totalTurns += termLength, pequena lua de mel)

`engine/scoring.ts` (GDD §4.5)
- `calculateScore(state: SimulationState, ending: GameEnding, legacyTiers: readonly LegacyTier[]): ScoreBreakdown`
  metas 40% (400), aprovação final 25% (250), economia 20% (200: crescimento, inflação perto da meta, desemprego, dívida), eventos 15% (150: crises bem conduzidas, CPIs/impeachments sobrevividos). × dificuldade × final.

`engine/turn.ts` (composição do turno)
- `processTurn(input: TurnInput): TurnResult` — ordem: decisões → evento → efeitos ativos → economia → social → diplomacia → setores/aprovação → Congresso → promessas → metas → stats (peak/lowest, crisesHandled) → notícias de indicadores → desfecho (`impeached` | `term-ended` quando turn === termStartTurn + termLength − 1 | `continue`). NÃO incrementa o turno.
- `advanceTurn(state: SimulationState): SimulationState` (turn + 1)
- `prepareTurn(state: SimulationState, content: GameContent): { state: SimulationState; decisionIds: string[] }` (= selectTurnDecisions)
- `drawEvent(state: SimulationState, content: GameContent): { state: SimulationState; eventId: string | null }`

`engine/difficulty.ts`
- `getDifficultyConfig(difficulty: Difficulty): DifficultyConfig`

`engine/index.ts` — barrel reexportando a API pública.

### Flags definidas pelo engine (dados podem usar em conditions)
`negociacao-recente` (negociou no Congresso), `cpi-instalada`, `impeachment-aberto`, `presidente-afastado`.

### Testes (vitest, `src/engine/*.test.ts`)
Fixtures mínimas próprias em `src/engine/__fixtures__/content.ts`. Cobrir: determinismo do RNG, condições, applyImpact + clamp,
efeitos graduais, voto, seleção de eventos (scheduled, 40/60, cooldown), metas, score, e uma simulação de 48 turnos
com escolhas aleatórias mantendo métricas dentro de faixas plausíveis (ex.: inflação 0–20, desemprego 3–18, dívida 50–120 no normal).

---------------------------------------------------------------------------------------------------
## 2. DATA (`src/data/`) — objetos tipados, sem lógica

Arquivos e exports (nomes exatos):
- `data/decisions/{fazenda,saude,educacao,defesa,meioAmbiente,infraestrutura,relacoesExteriores,desenvolvimentoSocial,justica}.ts`
  → cada um exporta `XXX_DECISIONS: Decision[]` (ex.: `FAZENDA_DECISIONS`); `data/decisions/index.ts` exporta `DECISIONS: Decision[]`.
- `data/events/{economicCrisis,naturalDisaster,politicalScandal,opportunity,international,social,scheduled}.ts`
  → `XXX_EVENTS: GameEvent[]`; `data/events/index.ts` exporta `EVENTS: GameEvent[]`.
- `data/headlines.ts` → `HEADLINE_TEMPLATES: HeadlineTemplate[]`
- `data/candidates.ts` → `CANDIDATES: Candidate[]` (5 arquétipos do GDD §2.4)
- `data/parties.ts` → `PARTIES: Party[]` (8 fictícios)
- `data/backgrounds.ts` → `BACKGROUNDS: BackgroundDefinition[]` (5)
- `data/abilities.ts` → `ABILITIES: Ability[]` (7, um por AbilityId)
- `data/campaign.ts` → `CAMPAIGN_QUESTIONS: CampaignQuestion[]` (6+, 1 obrigatória de economia — o exemplo do GDD)
- `data/goals.ts` → `GOALS: GoalDefinition[]` (10 do GDD §4.5)
- `data/countries.ts` → `COUNTRIES: Country[]` (7), `BLOCS: Bloc[]` (BRICS, Mercosul)
- `data/diplomaticActions.ts` → `DIPLOMATIC_ACTIONS: DiplomaticAction[]` (2–3)
- `data/cpiTopics.ts` → `CPI_TOPICS: CpiTopic[]` (6+)
- `data/legacy.ts` → `LEGACY_TIERS: LegacyTier[]` (6–8, de "Impedido"/"Pato Manco" a "Estadista")
- `data/index.ts` → `GAME_CONTENT: GameContent` (já escrito pelo coordenador)

Regras: IDs kebab-case únicos; tom sério e institucional (sem humor); PT-BR; manchetes estilo Folha/G1;
números realistas (IBGE, BCB, INPE, IPEA); toda decisão com trade-off (sem ação "grátis");
populismo → ganho curto + custo depois (use `delayed`); técnicas/impopulares → custo agora + ganho gradual.

### Guia de calibração de impactos (magnitudes típicas por decisão/evento)
| chave | leve | moderado | forte |
|---|---|---|---|
| approval | ±1 | ±3 | ±6 (máx ±8) |
| sectors.* | ±2 | ±5 | ±10 (máx ±14) |
| congressSupport | ±1 | ±4 | ±8 |
| gdpGrowth (choque, reverte) | ±0.1 | ±0.4 | ±1.0 |
| potentialGrowth (estrutural; preferir delayed) | ±0.03 | ±0.1 | ±0.25 |
| inflation | ±0.1 | ±0.4 | ±1.0 |
| unemployment | ±0.1 | ±0.3 | ±0.7 |
| exchangeRate | ±0.05 | ±0.2 | ±0.5 |
| debt (one-off, p.p. PIB; R$ 11 bi ≈ 0,1) | ±0.1 | ±0.5 | ±1.5 |
| primaryBalance (persistente; R$ 11 bi/ano ≈ 0,1) | ±0.05 | ±0.2 | ±0.5 |
| selic (Copom) | ±0.25 | ±0.5 | ±1.0 |
| relations.* | ±2 | ±5 | ±10 |
| prestige | ±1 | ±3 | ±6 |
| deforestation (km²/ano; preferir delayed) | ±200 | ±600 | ±1500 |
| co2Emissions (Mt) | ±10 | ±40 | ±100 |
| healthCoverage / sanitation (p.p.; delayed) | ±0.5 | ±2 | ±4 |
| ideb (delayed) | ±0.03 | ±0.1 | ±0.3 |
| homicideRate | ±0.2 | ±0.8 | ±2 |
| securityTrust | ±2 | ±5 | ±10 |
| housingDeficit (mi; delayed) | ±0.05 | ±0.2 | ±0.5 |
| infrastructureKm (delayed) | 100 | 500 | 1500 |
| poverty | ±0.2 | ±0.8 | ±2 |
| gini | ±0.002 | ±0.005 | ±0.01 |
| foreignInvestment / tradeBalance (US$ bi) | ±1 | ±4 | ±10 |
| waterReserves | ±2 | ±6 | ±15 |

### Flags canônicas (use exatamente estes nomes quando aplicável)
Definidas por decisões: `reforma-tributaria-aprovada`, `reforma-administrativa-aprovada`, `arcabouco-fiscal-rompido`, `bolsa-familia-ampliado`,
`salario-minimo-ganho-real`, `fiscalizacao-amazonia-reforcada`, `flexibilizacao-ambiental`, `acordo-mercosul-ue-assinado`, `glo-decretada`,
`privatizacao-aprovada`, `novo-pac-lancado`, `pec-seguranca-aprovada`, `alinhamento-eua`, `alinhamento-china`, `mais-medicos-ampliado`,
`ensino-integral-ampliado`, `minha-casa-ampliado`, `corte-de-gastos`, `aumento-de-impostos`.
Definidas por eventos: `escandalo-ministerial`, `vazamento-audio`, `crise-hidrica`, `tarifaco-eua`, `greve-geral`, `pandemia`, `boom-commodities`.
Definidas pelo engine: `negociacao-recente`, `cpi-instalada`, `impeachment-aberto`, `presidente-afastado`.
Lidas pelo engine (definidas por dados): `crime-de-responsabilidade` (afrouxa os limiares de impeachment), `escandalo-ministerial`/`vazamento-audio` (bônus de CPI).
Corrupção: `obstrucao-justica` (abafar investigação), `esquema-<nome>-aceito` / `esquema-<nome>-exposto` (um par por esquema, ligado a um `LatentRisk`).

### Jogo livre (tipos em `src/types/freeplay.ts`)
- `OutcomeRisk` (`risk?` em opções de decisão/evento e em ações presidenciais): chance de um desfecho diferente do planejado.
- `LatentRisk` (`data/latentRisks.ts`): risco que pode vir à tona a cada mês, com chance crescente; revelações depois do mandato custam pontos de legado.
- `NewsBlip` (`data/newsBlips.ts`): fatos do mês, sorteados sem decisão do jogador.
- `PresidentialAction` (`data/presidentialActions.ts`): agenda presidencial livre, uma por mês, com cooldown.
- Eventos `category: 'corruption'` são propostas reservadas; `priority: true` faz um evento elegível sair antes do sorteio.

IDs de países: `eua`, `china`, `uniao-europeia`, `argentina`, `russia`, `india`, `africa`.
IDs de ministérios: `fazenda`, `saude`, `educacao`, `defesa`, `meio-ambiente`, `infraestrutura`, `relacoes-exteriores`, `desenvolvimento-social`, `justica`.

---------------------------------------------------------------------------------------------------
## 3. STATE (`src/stores/`) — escrito pelo coordenador

Stores (Zustand 5, `useShallow` de `zustand/react/shallow`):
- `useGameStore` (orquestração): phase, mode, difficulty, turn, totalTurns, termNumber, termStartTurn, termLength, seed, flags,
  decisionHistory, eventHistory, lastDiplomaticActionTurn, stats, turnDecisionIds, choices (Record<decisionId, DecisionChoice>),
  currentEventId, lastReport (TurnReport | null), newsArchive (NewsItem[]), reelection (ReelectionResult | null), ending, score.
  Actions: `goToSetup()`, `goToMenu()`, `startNewGame(mode, difficulty)`, `chooseCandidate(selection)`, `answerCampaign(questionId, optionId)`,
  `finishCampaign()`, `confirmElection()`, `confirmGoals(goalIds)`, `chooseDecisionOption(decisionId, optionId)`, `toggleNegotiation(decisionId)`,
  `confirmDecisions()`, `resolveEvent(optionId)`, `advance()`, `continueToSecondTerm()`, `retire()`,
  `performDiplomaticAction(actionId, countryId)`, `continueSavedGame(): boolean`, `abandonGame()`.
- `useMetricsStore`: metrics, sectors, sectorAffinity, approval, activeEffects, history (MetricsSnapshot[]).
- `useCongressStore`: support, cpi, impeachment, votes, cpisOpened, cpisSurvived, impeachmentsOpened, impeachmentsSurvived.
- `useDiplomacyStore`: relations.
- `usePlayerStore`: candidate, campaignQuestionIds, campaignAnswers, election, goals (GoalProgress[]), promises.
- `useSettingsStore` (persist): volume (0–1), muted, musicEnabled, sfxEnabled + setters `setVolume`, `toggleMute`, `toggleMusic`, `toggleSfx`.
- `stores/selectors.ts`: hooks de leitura derivada para a UI (ver arquivo).
- `stores/content.ts`: catálogos estáticos e lookups para a UI (ver arquivo).
- `stores/persistence.ts`: save/load em localStorage.

---------------------------------------------------------------------------------------------------
## 4. UI — ver seção própria no prompt do agent ui.
