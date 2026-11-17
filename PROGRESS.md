# Progresso — Presidente Simulator

> Atualizado em **17/11/2026**. Para retomar, peça: *"continue o simulador a partir do PROGRESS.md"*.
> Contrato de APIs entre engine/data/stores/ui: **`docs/SPEC.md`**.

## Estado atual

O jogo está **completo e jogável** de ponta a ponta: menu → setup (Brasil fictício ou real) → candidato → campanha → eleição (apuração no mapa) → metas → (turno → evento → resumo [→ sessão no Congresso])* → reeleição (apuração no mapa) → 2º mandato → resultado.

**Modo carreira:** menu → criação do personagem → filiação → (semestre: agenda + mandato → acontecimento → balanço | convenção → apuração)* → aposentadoria (legado) — ou, vencendo a Presidência, debate → noite da eleição → metas → jogo presidencial → resultado com a trajetória → de volta à carreira como ex-presidente. No fim, dá para passar o bastão a um(a) herdeiro(a).

- `npm run typecheck`: limpo
- `npm test`: 362 testes em 32 arquivos, todos passando
  - engine com fixtures próprias em `src/engine/__fixtures__/`
  - integridade e simulação do conteúdo real em `src/data/content.test.ts` e `src/data/careerContent.test.ts`
- `npm run lint`: limpo
- `npm run build`: ok, todos os chunks abaixo de 500 kB (vendors, mapa/estados, elenco, eventos, carreira e conteúdo separados em `vite.config.ts`; o maior, `charts`, tem ~365 kB; `content` ~329 kB e `career` ~318 kB, com os 5.571 municípios)
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

## Rodada de feedback (08/10) — "escolhi Infraestrutura e não consegui iniciar obras"

Diagnóstico, antes da correção, com um jogador 100% focado na meta: Infraestrutura no Blitz chegava a 24%. Moradia, Justiça Social e Pleno Emprego nunca eram cumpridas em modo nenhum, porque tudo dependia de decisões sorteadas.

- **Programas de governo** (`data/programs.ts`, 22 programas):
  - aba "🏗️ Programas", padrão do painel
  - um lançamento por mês, em vaga própria (separada da Agenda), cooldown de 6 meses
  - cada meta tem versões estatal e de mercado
  - custo imediato (contas, setores, ideologia); benefício gradual, com atraso de 0–2 meses
  - cada lançamento entrega ≈ 7–9% da variação exigida pela meta no Completo
  - a barra de avanço lembra quando o programa do mês não foi lançado
- **Pauta guiada** (`engine/alignment.ts`): decisões com opção que ajuda meta ou promessa pendente pesam ×2,5 (`ALIGNED_DECISION_WEIGHT`), e a 1ª decisão do mês sai sempre desse grupo.
- **Dicas legíveis:**
  - ✓ verde = ganho, ✗ vermelho = custo; a seta diz só se o indicador sobe ou cai
  - legenda no topo das decisões e dos programas
  - métricas das metas ganham 🎯 e sempre aparecem (até 4 dicas, na ordem ganhos → custos → neutras)
  - selos por opção em decisões, eventos, programas e agenda: "🎯 Ajuda sua meta", "🎯 Atrapalha sua meta", "📜 Ajuda a cumprir promessa", "📜 Contraria promessa"
- **Rebalanceamento:**
  - `goalScale`: Blitz 0,33 e Padrão 0,6 (vale também para as promessas)
  - alvos: Infraestrutura 8.000 km, IDEB 6,0, Potência Global 85, Segurança −30%
- **Resultado** (Normal, 8 sementes por célula):
  - ao acaso, quase nenhuma meta é cumprida
  - com foco numa meta: 5–8/8 no Blitz, 8/8 no Padrão e no Completo
  - com foco em 3 metas: no Blitz, de 1/8 a 8/8 por meta (a vaga mensal é disputada); no Padrão e no Completo, 7–8/8, com aprovação final de 41–50%
- **Conteúdo morto corrigido:** a crise hídrica nunca disparava, porque os reservatórios ficavam entre 60% e 70%. `waterSpeed` subiu de 0,15 para 0,5 e o evento passou a exigir < 55%. Agora ocorre em ~1 a cada 3 mandatos.
- **Testes novos:**
  - `engine/alignment.test.ts`
  - sorteio guiado (`decisions.test.ts`)
  - vaga de programas (`freeplay.test.ts`)
  - `content.test.ts`: toda meta precisa de ≥ 2 programas e ≥ 3 decisões que a ajudem

## Rodada de feedback (22/10) — "crises viram bola de neve", "quero controlar a dívida", "não vejo as votações", "quero visitar estados"

Diagnóstico (24 partidas por estratégia, Mandato Completo): a economia em si não é explosiva — choques se dissipam em 1–2 anos —, mas com aprovação baixa **78% dos eventos sorteados eram crises** (contra 45% com aprovação alta). O sorteio condicional só considerava eventos com gatilho ativo, e com o país mal só sobravam crises. As perdas de aprovação também valiam 100% mesmo com o setor no chão.

- **Anti-bola de neve** (`engine/events.ts`, `engine/impacts.ts`):
  - gatilhos **inclinam** o sorteio condicional em vez de restringi-lo (eventos sem gatilho continuam com peso 1); produto dos multiplicadores limitado a `MAX_TRIGGER_MULTIPLIER` = 4
  - **trégua entre crises** (`CRISIS_RESPITE`): nos 2 meses após uma crise, outras crises pesam ×0,35
  - **núcleo fiel** (`APPROVAL_FLOOR`): perdas de um setor abaixo de 30% encolhem até ×0,35 (espelho dos retornos decrescentes dos ganhos)
  - resultado: com aprovação baixa, ~65% dos eventos são crises; no Normal ninguém (ao acaso ou prudente) cai abaixo de 25%
- **Gabinete de crise** (`data/crisisActions.ts`, 12 medidas, vaga própria `gabinete-de-crise`): aparece no topo do painel só quando um indicador entra no vermelho (condições com o novo `{ kind: 'any' }`), com o motivo ("⚠ Dólar acima de R$ 6,20"). Medidas mais fortes que decisões comuns, cada uma com custo: vender reservas, segurar combustíveis, frentes de trabalho, contingenciamento, reforma ministerial, pacto nacional, Força Nacional, defesa contra impeachment etc. No Difícil, jogadores ao acaso que usam o gabinete sofrem metade dos impeachments (11 → 5 em 24).
- **Termômetro da aprovação** (`engine/approvalOutlook.ts`): na lateral do painel, a aprovação de equilíbrio ("tendência: caindo para 44%") e os fatores que puxam para cima/baixo em pontos (inflação, emprego, lua de mel, desgaste...).
- **Contas públicas** (`engine/fiscal.ts`, aba "💰 Contas públicas"):
  - **custo em reais** de toda escolha (decisões, eventos, programas, agenda, gabinete, viagens): R$/ano no primário, R$ à vista na dívida e a diferença na dívida projetada em 4 anos (0,1% do PIB ≈ R$ 11 bi); o total das decisões do mês aparece na barra de avançar
  - dívida, primário, juros (R$ 667 bi/ano no início) e déficit nominal em reais; barras de "por que a dívida se move" (juros × crescimento × primário)
  - **política fiscal** (`data/fiscalStances.ts`, 5 posturas, troca a cada 6 meses, guardada como flag `politica-fiscal-*`): a neutra é a regra fiscal de antes; as demais puxam o primário para a própria meta (−2,5% a +2,5%) com multiplicador fiscal (`FISCAL.multiplier`) e custo contínuo nos setores
  - projeção determinística da dívida em 4 anos para cada postura (gráfico); bate com a simulação com erro < 1 p.p.
  - calibração (passivo, Normal, 48 meses): gastar para crescer = aprovação +1,3 no 6º mês e −1,5 no fim, dívida 84%; regra fiscal = dívida 77%; choque fiscal = −2,3 no 6º mês, −0,7 no fim, dívida 70%
- **Plenário** (`engine/plenary.ts`, `VoteSessionOverlay`): ao fim do mês com votações, a sessão abre sozinha — hemiciclo com 513 deputados acendendo voto a voto, placar, carimbo APROVADA/REJEITADA, "por que passou/caiu" (partida de 50% + base aliada, aprovação, negociação, habilidade, militância, MP, em p.p.) e o voto de cada bancada. O placar deriva da chance e do sorteio (votações apertadas saem por poucos votos), sem gastar o PRNG; os 9 partidos ganharam `seats` (somam 513). A decisão mostra o porquê da chance antes de votar, e o resumo tem "Rever no plenário".
- **Viagens pelo Brasil** (`engine/travel.ts`, aba "🗺️ Viagens", vaga própria `viagem`):
  - mapa das 27 UFs (malha do IBGE, `data/brazilMap.ts`) colorido pela popularidade estimada: aprovação nacional + afinidade ideológica do eleitorado (`lean`) + bônus de visita recente
  - `data/states.ts`: população (Censo 2022), bancadas (513), inclinação e 3 cidades por estado (81) com perfil; `data/visitKinds.ts`: 12 perfis de agenda (capital, periferia, agro, sertão, Amazônia, porto, festa, inovação, fronteira, mineração, romaria...)
  - a bancada vira base aliada (0,025 por deputado), a população amplia o efeito nos setores e um eleitorado hostil aumenta o risco de vaias; cada estado só pode ser revisitado após 6 meses

## Rodada de feedback (22/10, parte 2) — "momentos animados" e "personagens com rosto", com políticos reais

- **Brasil real** (opcional no setup; o fictício segue como padrão):
  - `data/real/parties.ts`: 18 partidos com as bancadas eleitas para a Câmara em 4/10/2026 (somam 513; PV 7 e Rede 1 deduzidos por subtração)
  - `data/real/candidates.ts`: 7 candidatos da eleição de 2026 (1º turno: Flávio Bolsonaro 47,03%, Lula 45,16%; 2º turno em 25/10/2026), com fotos oficiais de licença livre em `public/portraits/` (créditos em `CREDITS.md` e na UI)
  - Jair Bolsonaro entra como cenário hipotético (`note`), porque é inelegível e cumpre pena; ele nunca é escolhido como adversário se houver outro
  - **regras de segurança:** pessoas reais só têm cargos e propostas públicas. A oposição real aparece nas manchetes como "Oposição liderada pelo PL", nunca com falas. Ministros e governadores são sempre fictícios. No Brasil real, as propostas de corrupção (que fariam o próprio presidente cometer crime) ficam de fora (`getWorldContent`)
  - o conteúdo de cada mundo é filtrado nas stores (`stores/content.ts`, `world` em partidos e candidatos); o engine recebe só o mundo da partida
- **Elenco político** (`engine/cast.ts`, tipos em `types/cast.ts`, estado em `SimulationState.cast`):
  - **ministros:** 9, sempre fictícios, gerados pela semente (`data/names.ts`). Técnicos dão +15% nos ganhos da pasta. Políticos (dos 4 partidos mais próximos) deslocam a base aliada e o risco de escândalo em relação à composição padrão (4 políticos), então a calibração não muda. Aba "👥 Ministério" com troca (custo de aprovação e espera de 6 meses por pasta). A decisão mostra quem leva a pauta. Escândalos políticos geram "Oposição pede a saída de [ministro]"
  - **oposição:** o adversário do 2º turno. Cartão na lateral, com foto quando é pessoa real, e reações nas manchetes (`data/oppositionLines.ts`, uma por mês no máximo)
  - **governadores:** fictícios, derivados da semente. O partido segue o eleitorado do estado, a relação segue o espectro do governo. Aliado reduz o risco da visita e traz base; oposição aumenta o risco
  - **rostos:** `PortraitImage` mostra a foto livre ou o retrato ilustrado em SVG (`IllustratedFace` + `utils/illustratedFace.ts`, determinístico; usa `utils/prng.ts`, que agora também é a base do PRNG do engine)
- **Momentos animados:**
  - **noite da eleição** (`engine/electionMap.ts`, `ElectionNight`): na posse e na reeleição, os estados divulgam a apuração aos poucos, com a parcial nacional e o carimbo no fim. Quem vence vê primeiro os estados onde vai pior (virada). O resultado da tela só aparece depois da contagem
  - **Senado:** PECs passam pela Câmara (308) e pelo Senado (49). Se uma PEC é rejeitada, ela cai em uma das duas Casas. Bancadas do Senado proporcionais às da Câmara (`senateParties`)
  - **impeachment no plenário:** a Câmara autoriza com 342 votos e o Senado julga com 54. As sessões entram nas votações do mês, com "por que avançou/caiu" (aprovação e base diante dos limites). A folga do impeachment tem teto realista
  - **Copom:** cartão no resumo quando a Selic muda, com os 9 diretores votando
  - `engine/voteChance.ts` saiu de `congress.ts`, para o plenário usar a chance sem dependência circular
- **Calibração** (Normal, Completo, 24 partidas): passiva 38%, ao acaso 44%, populista 63% (cerca de 2 pontos acima, pelo bônus dos ministros técnicos)

## Rodada de feedback (09/11) — "modo carreira"

Pedido: montar um político do zero (nome, nome de urna, idade, profissão, perfil, cidade), filiar-se, trabalhar em gabinetes e secretarias, crescer no partido e disputar de vereador a presidente conforme idade e indicadores; a gestão pesa menos, mas ajuda na reeleição.

- **Turno = semestre** desde o 1º semestre de 2027; municipais em 2028/2032…, gerais em 2030/2034… Aposentadoria aos 85 ou quando o jogador quiser.
- **Personagem:** 11 profissões (pontos iniciais, uma ação própria e a trajetória no Planalto), rosto ilustrado (sexo + sorteio), ideologia e base eleitoral em qualquer um dos 5.571 municípios (busca só pelo nome, em todo o país, com resultados "Cidade - UF"; a sigla no fim filtra o estado, como em "São José SC"; `utils/citySearch.ts`). Brasília e Fernando de Noronha não têm Câmara Municipal: sem prefeito nem vereador.
- **Indicadores (0–100):** influência partidária, popularidade local, reconhecimento nacional, base eleitoral, reputação. Ganhos com retornos decrescentes (`CAREER.saturation`), deriva e custo de manutenção acima de 40, reputação ruim se recupera devagar. Influência cresce mais rápido em partido pequeno e afinado com a ideologia.
- **Partidos reais ou fictícios** (escolha na criação; padrão: reais): os 28 partidos que disputaram a Câmara em 2026, com número de urna e bancada conferidos nos dados abertos do TSE (513 eleitos; o antigo "Outros" virou PRD 5, Solidariedade 2 e Rede 1; o PMB agora é Democrata). O número do candidato segue a Lei 9.504/97: partido (2 dígitos) para Executivo, 3 para senador, 4 para deputado federal e 5 para estadual e vereador. Pessoas continuam sempre inventadas, e nenhum texto de escândalo cita a legenda.
- **Partido:** filiação obrigatória; troca custa 60% da influência e reputação. Com mandato proporcional, só na janela partidária. Posição no partido é um rótulo pela influência (filiado → cacique).
- **Cargos de nomeação** (assessor, coordenador, chefe de gabinete, secretário municipal/estadual, ministro): exigem influência, idade e governo do próprio partido ou aliado. Perde-se o cargo quando o governo vira oposição ou ao disputar eleição.
- **Eleições:** 10 cargos (idades da CF; vereador no registro), legenda pela influência, filiação 6 meses antes, Ficha Limpa e limite de reeleição do Executivo. Quem tem cargo e disputa outro se **licencia** na campanha: perdendo, volta ao cargo (prefeito que tenta o governo continua prefeito); vencendo, deixa o cargo na posse e o vice (fictício) assume o Executivo. Na lei real, chefes do Executivo renunciam 6 meses antes; aqui vale a regra pedida pelo jogador. Chance logística com o porquê em pontos (indicadores ponderados, tamanho do partido, afinidade com o eleitorado do estado, reeleição/aprovação da gestão, partido no poder, rejeição por reputação baixa). Estratégia de campanha mostra a chance com cada uma. Votos válidos = eleitorado apto (TSE 2026) × 72,1% (proporção real de 2026). Proporcional com vagas reais (vereadores do TSE 2024 por município; CF art. 27 para as Assembleias: SP 70 federais, 94 estaduais, 55 vereadores na capital), lista do partido, linha de corte e suplência (pode ser chamado depois). Vice entra na chapa de um titular fictício e pode suceder.
- **Mundo:** prefeitura, governo do estado e governo federal mudam a cada eleição (bancada × afinidade com o eleitorado); define aliado/oposição para secretarias e verbas.
- **Gestão (prefeito e governador):** aprovação + saúde, educação, obras, segurança e contas; um programa por semestre (16 programas); a popularidade local converge para a aprovação; contas no vermelho derrubam tudo.
- **Conteúdo:** 38 ações, 16 programas, 50 eventos (convites, brigas no partido, escândalos em cadeia com cassação e inelegibilidade, sucessão do titular), 5 estratégias de campanha.
- **Presidência:** a candidatura vai ao debate do jogo presidencial; a força da carreira define o 2º turno (pode perder). Vencendo, a noite da eleição no mapa e o governo começam no janeiro certo (`startTurn`, `firstTurn`, `getGameTurn`). Influência vira base aliada, reputação vira aprovação, o indicador mais forte vira a habilidade. O resultado mostra o legado da trajetória.
- **Calibração** (simulações de 30 anos começando aos 25): primeira candidatura a vereador com ~35–55% de chance; carreira focada chega a deputado federal/senador por volta dos 40 e a governador perto dos 50; a chance no Planalto passa de 50% entre os 52 e os 70 anos para quem acumula reconhecimento nacional e influência ≥ 70. Ficar parado não elege.
- **Testes:** `engine/career.test.ts` e `engine/careerPresidency.test.ts` (fixtures em `engine/__fixtures__/career.ts`), `data/careerContent.test.ts` (integridade e calibração curta).
- **Playtest no navegador:** criação → filiação → semestres → convenção → apuração proporcional (suplente) → candidatura presidencial → debate → noite da eleição → posse em jan/2031 → fim do mandato → resultado com a trajetória; gestão de prefeita conferida com save editado.

## Rodada de feedback (09/11, parte 2) — "elenco persistente" e "campanha de verdade"

Pedido: itens 1 e 2 das recomendações. Personagens que acompanham a carreira inteira e uma campanha com pesquisas, decisões e 2º turno.

- **Elenco** (`engine/career/characters.ts`): três personagens inventados, com rosto, partido, idade, cargo, **força** (0–100), **relação** (−100 a 100, com rótulo de "Inimigo" a "Aliado fiel") e **memória** dos episódios marcantes.
  - **Padrinho:** cacique do seu partido. Com boa relação, acelera a influência (até +20%), pesa na prévia e aumenta o fundo partidário. Pode se aposentar e deixar o grupo político para você.
  - **Rival:** do seu partido e com influência parecida. Disputa a **prévia** quando mira o mesmo cargo (o titular que tenta a reeleição tem a legenda garantida; uma trégua acertada num evento evita a prévia). Aparece ao seu lado na lista proporcional.
  - **Adversário:** de outro partido (o prefeito da sua cidade, se for de oposição). Vira o seu oponente na urna quando mira o mesmo cargo: forte, tira força; fraco, dá.
  - Os três disputam as eleições de fundo pelo cargo mais alto ao alcance (o mais forte primeiro; uma vaga majoritária por vez), ganham força com mandato e perdem fora dele. A relação esfria devagar.
  - Trocar de partido deixa padrinho e rival para trás (−25 de relação) e traz outros. Entrar no partido do adversário encerra a rivalidade.
  - Saves antigos ganham o elenco na carga.
- **Conteúdo do elenco:** 12 eventos (`data/career/castEvents.ts`: lealdade, portas em Brasília, padrinho investigado, sucessão, dossiê do rival, trégua, pedido de apoio, rival porta-voz, ataques, desafio para debate, trégua improvável e denúncia contra o adversário). Ações e eventos antigos passaram a mexer nas relações (ex.: aproximar-se do cacique agrada o padrinho e irrita o rival; liderar CPI irrita o adversário). Marcadores `{padrinho}`, `{rival}` e `{adversario}` usam o nome curto.
- **Pré-campanha** (`polls.ts`): até dois semestres antes da eleição, o painel deixa lançar uma pré-candidatura. Sai uma pesquisa no lançamento e outra no fim de cada semestre. No majoritário, mostra você contra o oponente provável; no proporcional, a projeção de votos contra o quociente.
- **Campanha** (`campaign.ts`, nova tela entre a convenção e a apuração): chance total ao vivo (prévia × urna) e o porquê em pontos.
  - **Chapa** (majoritário): vice do partido, de um aliado grande, popular de fora da política (risco) ou o próprio rival.
  - **Dobradinha** (proporcional): com o padrinho, solo ou com o rival.
  - **Dinheiro:** 30%, 65% ou 100% do teto. O teto segue a ordem de grandeza da resolução do TSE de 2024 (por eleitor no município e no estado, com piso). O dinheiro disponível é o fundo do partido (pelo tamanho, pela influência e pelo padrinho) mais as doações (base + popularidade). Gastar além disso pode levar a **contas rejeitadas**.
  - **Debate na TV / sabatina na rádio:** propostas, ataque (com risco de gafe) ou ausência.
  - **Tom:** as estratégias de antes.
- **2º turno** (`rounds.ts`, um candidato por partido no 1º turno): prefeito só em municípios com mais de 200 mil eleitores (101 cidades); governador sempre; senador nunca (a Presidência segue com o 2º turno do jogo presidencial).
  - O 1º turno mostra todos os candidatos.
  - Entre os turnos, você escolhe: apoio do 3º colocado, frente ampla, manter o discurso ou ofensiva final. A tela mostra a chance de cada escolha, com a vantagem do 1º turno contando.
  - Calibração (20 mil sorteios por faixa): a chance mostrada é a da eleição inteira (50% → 50%, 80% → 79%, 93% → 88%). Há 2º turno em 60–80% das disputas, e quem lidera o 1º turno vence o 2º em ~81% dos casos.
  - A apuração mostra a prévia perdida, o 1º turno e o 2º turno.
- **Testes:** `engine/careerCast.test.ts` (elenco, troca de partido, prévia, trégua, 2º turno, dinheiro e pesquisas); integridade das decisões de campanha em `data/careerContent.test.ts`.

## Rodada de feedback (10/11) — mandato ativo, gestão concreta, conquistas, pós-Presidência e herdeiro

Pedido: itens 5, 6, 7 e 8 das recomendações para a carreira. Tipos em `types/careerMandate.ts` e `types/achievements.ts`; testes em `engine/careerMandate.test.ts` e `engine/careerDynasty.test.ts`.

- **Mandato legislativo** (vereador, deputados, senador; painel "📜 Mandato"):
  - **Votação do semestre** (`legislature.ts`, `data/career/floorVotes.ts`, 18 votações): sorteada no início do semestre (`openCareerSemester`). O partido orienta pela relação com o governo (nas propostas dele) e pela ideologia; a tela mostra a orientação, a opinião pública e a coerência de cada voto. Sem escolha, vota com o partido. Contrariar o partido custa influência e relação com o padrinho; acompanhar a rua rende popularidade (no Congresso, parte vira reconhecimento nacional). Placar com as cadeiras reais (Câmara Municipal do TSE, Assembleia pela CF, 513, 81). Propostas do governo só entram em pauta quando combinam com quem governa.
  - **Projetos de lei** (`bills.ts`, `data/career/bills.ts`, 22 temas): uma iniciativa por semestre (apresentar ou articular), até 2 em tramitação. Comissão (chance por articulação, influência, governo e polêmica; engavetado depois de 4 semestres) → plenário (apoio com ruído) → sanção (o Executivo de oposição veta 35% das vezes). Lei aprovada entra na trajetória e pesa na reeleição (+1 por lei, até +2). O fim do mandato arquiva o que estava tramitando (`closePosition`).
  - **Emendas** (`amendments.ts`, 6 destinos): um destino por semestre, com valor em reais (R$ 38 mi/ano por deputado federal e R$ 70 mi por senador, LOA 2025; Assembleias 0,5% e Câmaras Municipais 1,2% da receita, divididos pelas cadeiras). Governo de oposição segura o pagamento (efeito ×0,6). ONG e emenda Pix têm risco e marcam `emendas-suspeitas`.
  - Saíram da agenda "Apresentar projeto de lei" e "Destinar emendas", e dos eventos "Votação que divide a sua base" e "Seu projeto entra na pauta" (viraram mecânica).
- **Gestão concreta** (prefeito e governador):
  - **Orçamento em reais** (`budget.ts`): receita por eleitor (R$ 6 mil no município, com piso de R$ 25 mi; R$ 8 mil no estado). 1 ponto de contas = 0,5% da receita, então todo programa mostra o custo ("Custa R$ 258 mi", "Repõe R$ 515 mi no caixa") e o caixa aparece como superávit ou déficit.
  - **Obras com prazo** (`works.ts`, `data/career/works.ts`, 10 municipais e 8 estaduais): uma por semestre, até 3 ao mesmo tempo. A margem de investimento cobre 4 pontos de parcelas por semestre; o resto sai do caixa. Obras atrasam (chuva, licitação), param sem dinheiro (contas < 30), custam aprovação quando passam do prazo e são inauguradas com risco de auditoria. Metrô e corredor de ônibus exigem eleitorado mínimo. Obras inauguradas no mandato contam na reeleição (+0,75 cada, até +3; atrasadas −1,5). Quem sai do cargo deixa as obras inacabadas para o sucessor. As obras grandes da lista de programas viraram obras.
- **Conquistas** (`achievements.ts`, `data/career/achievements.ts`, 34 em bronze, prata e ouro, algumas secretas): critérios por cargo (com idade), contadores derivados da carreira (`careerStats`), indicadores, relação, aprovação da gestão, "invicto" e combinações. São conferidas no fim do semestre, na posse e na saída do Planalto, e viram notícia e destaque no balanço. Aba "🏆 Conquistas" no painel e galeria no menu, persistida fora do save (`useAchievementsStore`, chave `presidente-simulator:achievements:v1`).
- **Pós-Presidência** (`postPresidency.ts`): o fim do jogo presidencial chama `leavePresidency` (meses jogados na escala de 4 anos por mandato; dois mandatos = 16 semestres). O ex-presidente fica com reconhecimento nacional 95, reputação pela aprovação final e pelos escândalos revelados, e influência de líder do partido (aprovação ≥ 45) ou em queda. Impeachment = inelegível por 8 anos (CF, art. 52). O governo federal passa ao vice, à oposição ou a um sucessor (chance pela aprovação); prefeitura e estado são sorteados de novo. O resultado presidencial ganhou "Voltar à carreira", e a agenda ganhou 4 ações e 3 eventos de ex-presidente. O legado conta cada passagem pelo Planalto pela aprovação final (impeachment desconta).
- **Herdeiro(a)** (`heir.ts`, tela `CareerHeirScreen`): no fim da carreira (ou depois do Planalto), "Passar o bastão". Filho(a) herda o sobrenome (popularidade, base, parte da reputação); afilhado(a), a rede no partido. Começa no semestre seguinte, na mesma cidade e partido, já filiado(a). Quem passou o bastão vira o padrinho (não disputa mais eleições) e o adversário da família continua em cena. A família (`CareerState.dynasty`) aparece na ficha ("2ª geração · filha de…") e no resultado, com o legado somado.
- **Saves antigos** ganham os campos novos na carga (`withCareerDefaults`) e, no meio do semestre, a votação do semestre.
- **Calibração** (90 carreiras de 45 anos com um jogador guloso, comparadas ao código anterior com o mesmo jogador): a maior parte da diferença veio de a agenda perder "projeto de lei" e "emendas" (o jogador guloso passa a escolher ações de influência). Ajustes: votar com o partido rende pouco (+0,5 de influência, +1 com o padrinho), emendas e leis moderadas, obras pequenas custam mais que a margem. Resultado: deputado federal por volta dos 37 anos, senador dos 49 e governador dos 61 (33% chegam a governador até os 60); 34% chegam a 50% de chance no Planalto, por volta dos 52–56 anos. A reeleição de prefeito e governador ficou com a mesma aprovação mediana (~51%) e a mesma chance mostrada (~73%) de antes.
- **Playtest no navegador:** vereadora (votação, projeto, emendas, balanço com placar), prefeita (orçamento, obras, inauguração, conquista), aposentadoria → herdeira, fim de governo → volta como ex-presidenta, galeria do menu e um save antigo de senador abrindo com o painel novo. O save do usuário foi guardado antes e restaurado depois.

## Rodada de feedback (10/11, parte 2) — "fui condenado do nada", "recorri e não vi o resultado" e "cargos de nomeação sem ação"

- **Casos na Justiça** (`data/career/cases.ts`, `engine/career/justice.ts`): as cadeias de escândalo (propina, caixa 2, emendas, rachadinha, laranja) têm etapas com explicação. Cada flag guarda o que a marcou (`CareerState.flagNotes`: "Você escolheu…", "Arrecadar doações saiu do roteiro: …"), e os eventos de escândalo mostram "📎 Como chegamos aqui", com data, explicação e a escolha que levou a cada etapa. A ficha mostra "⚖️ Réu: …" enquanto a acusação está aberta. Diagnóstico: a condenação era o fim de uma cadeia (às vezes iniciada por um risco de ação comum, como "Arrecadar doações para o partido") e a tela não dizia qual era o caso.
- **Recurso de verdade** (efeito `appeal`): pela Ficha Limpa, a inelegibilidade vale já, mas o tribunal superior julga o recurso 3 semestres depois. A chance de anular vem do caso (25% propina, 35% caixa 2, 30% emendas) mais a influência no partido (10–60%). O resultado vira notícia, entra na trajetória e no balanço ("Recurso aceito…" ou "Recurso negado…"); anulada, a inelegibilidade cai. A ficha mostra o recurso pendente com a data e a chance. Saves antigos condenados ganham o julgamento (`migrateLegacyConviction`). Antes, "Recorrer" só aplicava os 8 anos.
- **Cargo de confiança** (`data/career/missions.ts`, 16 missões; `engine/career/post.ts`; painel "🗂️ Cargo de confiança"): a cada semestre, quem tem cargo de nomeação recebe uma missão do chefe (audiência pública, licitação travada, votos para o deputado, meta da pasta, greve, convocação no Congresso…), com 2–3 jeitos de cumprir. Cada jeito mexe na carreira e na **confiança do chefe** (0–100). Com 70 ou mais, o chefe indica você (cargos de nomeação exigem 10 de influência a menos) e o cargo rende 50% a mais; abaixo de 25, há 40% de chance de exoneração por semestre. Ignorar a missão custa 5 de confiança. Conquista nova: "Braço direito" (8 missões diferentes). Calibração: com as missões, chegar ao Senado ou ao governo até os 60 fica ~5 p.p. mais provável para o jogador guloso.

## Rodada de feedback (11/11) — "os cargos de vice estão sem ação"

Diagnóstico: o vice tinha só 3 ações genéricas na agenda e 3 eventos; sem painel próprio, não havia o que decidir no semestre. O vice passou a usar o mesmo mecanismo do cargo de confiança, com regras próprias.

- **Painel "🤝 Vice no governo"** (`CareerPostPanel`, view em `stores/careerPostSelectors.ts`): mostra o titular (o cabeça da chapa, que governa o nível do cargo), a linha sucessória ("se o titular sair, você assume como prefeita…"), a **confiança do titular** (0–100) e o **pedido do titular** do semestre.
- **Pedidos do titular** (`data/career/vice.ts`, 15, cinco por vice; `CareerMission.appointments` virou `posts`, que aceita cargos de vice):
  - vice-prefeito: prefeito(a) em exercício nas férias, Defesa Civil na chuva, votos na Câmara, mutirão nos bairros e uma secretaria sem secretário;
  - vice-governador: governador(a) em exercício, ronda pelos municípios, fábrica disputada com o estado vizinho, rebelião no presídio e base na Assembleia;
  - vice-presidente: presidente em exercício, missão ao exterior, conselho de governo, ponte com o Congresso e um ministério sem ministro.
  - A interinidade é o pedido que mais divide: "só despachar" agrada o titular, e assinar o decreto parado ou aparecer na TV rende votos e custa confiança.
- **Regras do vice** (`engine/career/post.ts`, `CAREER.post`):
  - não há exoneração, porque o mandato é da chapa;
  - com confiança ≥ 70, o cargo rende +50%, e na disputa pela cadeira do titular (vice-prefeito → prefeito…) entra o fator "Apoio de Fulano (titular)", com +3 de força;
  - abaixo de 25, há 40% de chance por semestre de o titular **esvaziar** o vice (−3 de influência, −1 de popularidade), e na disputa o titular "apoia outro nome" (−3);
  - o vice reeleito entra na chapa de outro titular, e a confiança recomeça.
- **Confiança como impacto e condição:** `CareerImpact.trust` e a condição `trust` valem para o vice e para o cargo de nomeação.
  - As 3 ações de vice passaram a mexer na confiança: representar +4, articular a sucessão −6 (−10 se der errado) e agenda própria −4 (−8). As dicas mostram "Confiança".
  - "O titular deixa você de lado" só aparece com confiança abaixo de 50 e mexe nela.
  - Dois eventos novos: "O titular aponta você como sucessor" (≥ 70) e "O titular rompe com você" (< 25, com reconciliação, oposição interna ou silêncio).
  - Marcador novo: `{titular}`.
- **Testes:** `engine/careerVice.test.ts` (pedido do semestre, confiança, esvaziamento sem exoneração, perks, apoio/veto na candidatura, impacto/condição e reeleição) e a integridade das missões de vice em `data/careerContent.test.ts`. 362 testes passando.
- **Playtest no navegador**, com save editado para vice-prefeita em São Paulo:
  - painel com titular, linha sucessória e pedido;
  - lembrete na barra;
  - dicas de confiança nas ações;
  - balanço com a manchete do pedido;
  - confiança somando certo (50 + 4 − 6 + 4 = 52);
  - estado de confiança baixa com o aviso;
  - interinidade "Prefeito(a) em exercício".
  - O teste usou a porta 5199, com o save dela guardado antes e restaurado depois.

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

- **Vice-presidente que assume** vai direto às metas, sem uma tela própria de posse; o mandato é a fração restante na escala do modo escolhido.
- **Carreira no Brasil real:** usa os partidos reais, mas as pessoas (inclusive padrinho, rival e adversário) são sempre inventadas: pessoas reais não podem virar personagens de escândalo nem rivais.
- **Próximas recomendações para a carreira** (feitas: 1, 2, 5, 6, 7 e 8): (3) força real dos partidos por cidade/estado e federações; (4) mapa de votos por município na apuração; (9) gráfico da trajetória dos indicadores.
- **Mandato e obras:** a orientação do partido nas votações é derivada (relação com o governo + ideologia); não há bancadas por partido nas Câmaras e Assembleias. O orçamento é estimado por eleitor (não usa a receita real de cada município).
- **Conquistas:** a galeria fica neste navegador; o jogo presidencial avulso não tem conquistas (só o modo carreira).
- **Dados eleitorais:** `data/career/cities.ts` é gerado dos dados abertos do TSE (detalhe da votação 2026 e consulta de vagas 2024, só eleição ordinária) e da API de localidades do IBGE. Atualizar depois das eleições municipais de 2028 (vagas) e das próximas gerais (eleitorado).

- **Animações em aba oculta:** com a aba do navegador oculta, o Framer Motion pausa e as transições de tela só completam quando a aba volta a ficar visível. Comportamento normal do navegador, sem impacto para quem está jogando.
- **Repetição no Mandato Completo:** o 2º mandato do modo Completo ainda repete ~2/3 das decisões (são ~170 vagas de decisão). Mais conteúdo, sobretudo repetível com variações, reduziria isso.
- **Placar do populista:** a estratégia gulosa ainda pontua mais que a aleatória no legado. Se quiser punir mais o populismo, aumentar o peso de eventos de crise fiscal (gatilhos por dívida/déficit) ou o componente econômico do score.
- **Cores do Recharts** em `constants/theme.ts` espelham `tailwind.config.js` à mão (agora também usadas no mapa e no plenário).
- **Chunks grandes:** `charts` (~365 kB), `content` (~329 kB) e `career` (~318 kB). Novos dados grandes devem ir para um grupo próprio em `vite.config.ts` (como `brazil`).
- **Viagens e eventos regionais:** desastres naturais ainda não têm estado; ligar eventos a UFs permitiria "visita de solidariedade" com bônus extra.
- **Brasil real desatualiza:** bancadas, candidatos e fotos refletem 22/10/2026 (antes do 2º turno de 25/10). Revisar quando a política real mudar.
- **Popularidade por estado:** é estimada a cada mês (não persiste); se quiser estados com memória própria, guardar um humor por UF no estado da simulação.
