# Canetada 🇧🇷

**Simulador presidencial do Brasil.** Você venceu a eleição: agora tem um mandato para governar o país, negociar com o Congresso, enfrentar crises e escândalos — e decidir até onde vai para se manter no poder.

> Jogo web, 100% no navegador, em português. Sem cadastro, sem instalação. O progresso fica salvo no próprio navegador.

## O que dá para fazer

- **Escolher ou criar seu candidato** — do centro aos extremos — e fazer campanha num debate na TV.
- **Governar mês a mês:** 3–4 decisões por mês em nove ministérios, cada uma com trade-offs reais.
- **Lidar com o Congresso:** leis ordinárias e PECs, negociação de cargos e emendas, medidas provisórias, CPIs e impeachment.
- **Enfrentar o imprevisto:** enchentes, crises econômicas, escândalos, pandemias, Copa do Mundo e eleições municipais.
- **Escolher seu lado:** o governo se move no espectro político; posições radicais destravam pautas radicais e uma militância fiel.
- **Ceder (ou não) à corrupção:** propostas reservadas trazem ganhos imediatos — e riscos que crescem até virarem escândalo, inclusive depois do mandato.
- **Deixar um legado:** metas de governo, reeleição e uma pontuação final com título histórico.

A economia é simulada mês a mês (PIB, inflação, Selic, câmbio, dívida, desemprego), calibrada com dados públicos de IBGE, Banco Central, Tesouro, INPE e IPEA.

## Modos

| Modo | Duração | Partida |
|---|---|---|
| ⚡ Blitz | 1 ano (12 meses) | ~20–30 min |
| 🎯 Padrão | 2 anos (24 meses) | ~45–60 min |
| 🏛️ Mandato Completo | 4 anos (48 meses) | ~90–120 min |

Três níveis de dificuldade e reeleição para um segundo mandato.

## Rodando localmente

Requer Node 20+.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # testes (vitest)
npm run build      # build de produção em dist/
```

## Stack

React 18 · TypeScript (strict) · Vite · Tailwind CSS · Zustand · Recharts · Framer Motion. Todo o motor da simulação (`src/engine/`) é feito de funções puras e testadas; o conteúdo (`src/data/`) é data-driven — novas decisões e eventos entram sem mexer no motor.

Documentação de design: [`game-design-document.md`](game-design-document.md) · contrato técnico: [`docs/SPEC.md`](docs/SPEC.md) · estado do projeto: [`PROGRESS.md`](PROGRESS.md).

---

Candidatos, partidos, empresas e eventos são fictícios, inspirados na realidade política brasileira.
