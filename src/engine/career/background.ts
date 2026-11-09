/**
 * Eleições "de fundo" ao fechar um semestre de eleição: o elenco disputa os próprios
 * cargos e os Executivos em disputa mudam de mãos (cidade, estado e país).
 */
import type { CareerCharacter, CareerContent, CareerElectionRecord, CareerGovernment, CareerLevel, CareerNews, CareerOffice, CareerPerson, CareerState, Rng } from '@/types';
import { getElectionAt } from '@/utils/careerCalendar';
import { createRng } from '../random';
import { officeDifficulty } from './candidacy';
import { characterChance, characterTarget, settleCharacterElection, shortName } from './characters';
import { findOffice, findParty, hasMunicipalElections } from './helpers';
import { createCareerNews } from './text';
import { createGovernment, electorateLean, pickGoverningParty, replaceGovernment } from './world';

const HEAD_OFFICES: Record<CareerLevel, CareerOffice['id']> = { municipal: 'prefeito', estadual: 'governador', federal: 'presidente' };
const SEMESTERS_PER_YEAR = 2;

const playerRecordFor = (state: CareerState, officeId: string): CareerElectionRecord | undefined =>
  state.elections.find((record) => record.turn === state.turn && record.officeId === officeId);

/**
 * Resultado do personagem quando disputa o mesmo cargo que o jogador. Majoritário: o partido tem um
 * só candidato, então o rival só concorre se tirou a vaga do jogador na prévia; proporcional: a lista
 * decide. O adversário vence se o jogador perdeu para ele. Null = rola a chance dele.
 */
const outcomeAgainstPlayer = (character: CareerCharacter, office: CareerOffice, record: CareerElectionRecord): boolean | 'skip' | null => {
  if (character.role === 'padrinho') return 'skip';
  if (character.role === 'rival') {
    if (office.system === 'majoritario') return record.primary && !record.primary.won ? null : 'skip';
    return record.partyList.find((entry) => entry.name === shortName(character.name))?.elected ?? null;
  }
  if (record.opponent?.name === character.name) return !record.won;
  return record.firstRound?.candidates.some((candidate) => candidate.name === character.name) ? false : null;
};

interface CastRace {
  character: CareerCharacter;
  office: CareerOffice;
  decided: boolean | null;
}

/** Quem do elenco disputa o quê; resultados já decididos na urna do jogador vêm antes dos sorteios. */
const castRaces = (state: CareerState, content: CareerContent): CastRace[] =>
  (state.cast ?? [])
    .filter((character) => character.active)
    .flatMap((character) => {
      const office = characterTarget(state, content, character, (entry) => officeDifficulty(state, content, entry));
      const record = office ? playerRecordFor(state, office.id) : undefined;
      const decided = office && record ? outcomeAgainstPlayer(character, office, record) : null;
      return office && decided !== 'skip' ? [{ character, office, decided }] : [];
    })
    .sort((a, b) => Number(b.decided === true) - Number(a.decided === true) || b.character.strength - a.character.strength);

/**
 * O elenco disputa os próprios cargos (resultado coerente com a disputa do jogador). Cargo
 * majoritário tem um só vencedor: quem chega primeiro (o jogador, quem o venceu, os mais fortes) leva.
 */
export const resolveCastElections = (state: CareerState, content: CareerContent, rng: Rng): { state: CareerState; news: CareerNews[] } => {
  const won = state.elections.filter((record) => record.turn === state.turn && record.won).map((record) => record.officeId as string);
  return castRaces(state, content).reduce<{ state: CareerState; news: CareerNews[]; taken: string[] }>(
    (acc, { character, office, decided }) => {
      const seatTaken = office.system === 'majoritario' && acc.taken.includes(office.id);
      const victory = !seatTaken && (decided ?? rng.next() < characterChance(character, officeDifficulty(acc.state, content, office)));
      const settled = settleCharacterElection(acc.state, content, character, office, victory);
      return {
        state: settled.state,
        news: settled.news ? [...acc.news, settled.news] : acc.news,
        taken: victory && office.system === 'majoritario' ? [...acc.taken, office.id] : acc.taken,
      };
    },
    { state, news: [], taken: won },
  );
};

const asGovernment = (person: CareerPerson): CareerGovernment => ({ partyId: person.partyId, leaderName: person.name, leaderSex: person.sex, isPlayer: false });

/** Quem assume cada Executivo em disputa: o jogador, o titular da chapa dele, quem o venceu ou alguém do elenco. */
const electedGovernment = (state: CareerState, content: CareerContent, level: CareerLevel, rng: Rng): CareerGovernment => {
  const head = HEAD_OFFICES[level];
  const record = state.elections.find((entry) => {
    const office = findOffice(content, entry.officeId);
    return entry.turn === state.turn && office?.level === level && (office.id === head || office.headOffice === head);
  });
  if (record?.won && record.officeId === head) {
    return { partyId: record.partyId, leaderName: state.profile.politicalName, leaderSex: state.profile.sex, isPlayer: true };
  }
  // Vice eleito: governa o cabeça da chapa; derrota na urna (não na prévia): governa quem venceu.
  if (record?.won && record.runningMate) return asGovernment(record.runningMate);
  const lostAtPolls = record !== undefined && !record.won && !(record.primary && !record.primary.won);
  if (lostAtPolls && record.opponent) return asGovernment(record.opponent);
  // Alguém do elenco acabou de se eleger para o cargo (ex.: o rival que venceu a prévia).
  const termYears = findOffice(content, head)?.termYears ?? 4;
  const elected = (state.cast ?? []).find(
    (character) => character.active && character.officeId === head && character.officeEndTurn === state.turn + termYears * SEMESTERS_PER_YEAR,
  );
  if (elected) return asGovernment(elected);
  return createGovernment(rng, content, pickGoverningParty(rng, content.parties, electorateLean(state, content, level)));
};

/** Ao fechar um semestre de eleição: o elenco disputa seus cargos e os Executivos em disputa mudam de mãos. */
export const resolveBackgroundElections = (state: CareerState, content: CareerContent): { state: CareerState; news: CareerNews[] } => {
  const cycle = getElectionAt(state.turn);
  if (cycle === null) return { state, news: [] };
  const rng = createRng(state.seed);
  const cast = resolveCastElections(state, content, rng);
  const levels: CareerLevel[] = cycle === 'municipal' ? (hasMunicipalElections(state, content) ? ['municipal'] : []) : ['estadual', 'federal'];
  const result = levels.reduce<{ state: CareerState; news: CareerNews[] }>(
    (acc, level) => {
      const government = electedGovernment(acc.state, content, level, rng);
      const replaced = replaceGovernment(acc.state, content, level, government);
      const party = findParty(content, government.partyId)?.acronym ?? '';
      const label = level === 'municipal' ? 'a prefeitura' : level === 'estadual' ? 'o governo do estado' : 'a Presidência';
      const headline = government.isPlayer ? null : `${shortName(government.leaderName)} (${party}) vence a disputa para ${label}`;
      return { state: replaced.state, news: [...acc.news, ...replaced.news, ...(headline ? [createCareerNews(state.turn, headline, 'neutral', `governo-${level}`)] : [])] };
    },
    { state: cast.state, news: cast.news },
  );
  return { state: { ...result.state, seed: rng.getSeed() }, news: result.news };
};
