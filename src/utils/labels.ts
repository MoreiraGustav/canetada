import type { ApprovalDriverKey, CityKind, PoliticalStatus, RegionId, VoteFactorKey } from '@/types';

interface ThresholdLabel {
  min: number;
  label: string;
}

/** Faixas de rótulo para relações diplomáticas (0–100). */
const RELATION_LABELS: readonly ThresholdLabel[] = [
  { min: 80, label: 'Aliada' },
  { min: 65, label: 'Amigável' },
  { min: 45, label: 'Neutra' },
  { min: 30, label: 'Tensa' },
  { min: 0, label: 'Hostil' },
];

/** Faixas de rótulo para aprovação (0–100). */
const APPROVAL_LABELS: readonly ThresholdLabel[] = [
  { min: 60, label: 'Popularidade alta' },
  { min: 45, label: 'Aprovação sólida' },
  { min: 30, label: 'Aprovação frágil' },
  { min: 15, label: 'Rejeição elevada' },
  { min: 0, label: 'Colapso de popularidade' },
];

const findLabel = (value: number, labels: readonly ThresholdLabel[]): string =>
  (labels.find((entry) => value >= entry.min) ?? labels[labels.length - 1]).label;

export const getRelationLabel = (value: number): string => findLabel(value, RELATION_LABELS);

export const getApprovalLabel = (value: number): string => findLabel(value, APPROVAL_LABELS);

export const POLITICAL_STATUS_LABELS: Record<PoliticalStatus, { label: string; description: string }> = {
  stable: { label: 'Governo Estável', description: 'Aprovação e base aliada sob controle.' },
  crisis: { label: 'Crise Política', description: 'Aprovação ou base aliada em níveis preocupantes.' },
  cpi: { label: 'CPI em Andamento', description: 'O Congresso investiga o governo. A aprovação sofre a cada mês.' },
  impeachment: { label: 'Processo de Impeachment', description: 'Recupere aprovação ou base aliada antes da votação final.' },
};

/** Faixas do eixo econômico do governo (-100…100). */
const ECONOMIC_IDEOLOGY_LABELS: readonly ThresholdLabel[] = [
  { min: 60, label: 'Extrema direita' },
  { min: 25, label: 'Direita' },
  { min: -25, label: 'Centro' },
  { min: -60, label: 'Esquerda' },
  { min: -101, label: 'Extrema esquerda' },
];

/** Faixas do eixo de costumes do governo (-100…100). */
const SOCIAL_IDEOLOGY_LABELS: readonly ThresholdLabel[] = [
  { min: 60, label: 'Ultraconservador' },
  { min: 25, label: 'Conservador' },
  { min: -25, label: 'Moderado' },
  { min: -60, label: 'Progressista' },
  { min: -101, label: 'Progressista radical' },
];

export const getEconomicIdeologyLabel = (value: number): string => findLabel(value, ECONOMIC_IDEOLOGY_LABELS);

export const getSocialIdeologyLabel = (value: number): string => findLabel(value, SOCIAL_IDEOLOGY_LABELS);

/** O que empurrou a chance de aprovação de uma votação. */
export const VOTE_FACTOR_LABELS: Record<VoteFactorKey, string> = {
  support: 'Base aliada',
  approval: 'Aprovação popular',
  negotiation: 'Cargos e emendas negociados',
  ability: 'Habilidade do presidente',
  'street-pressure': 'Militância nas ruas',
  'provisional-measure': 'Medida provisória',
};

/** Rótulo e ícone de cada fator do termômetro da aprovação. */
export const APPROVAL_DRIVER_INFO: Record<ApprovalDriverKey, { label: string; icon: string }> = {
  inflation: { label: 'Inflação', icon: '🛒' },
  unemployment: { label: 'Emprego', icon: '👷' },
  growth: { label: 'Crescimento', icon: '📈' },
  strongCurrency: { label: 'Dólar', icon: '💵' },
  debt: { label: 'Dívida pública', icon: '🏦' },
  fiscal: { label: 'Contas públicas', icon: '🧾' },
  lowRates: { label: 'Juros', icon: '💳' },
  security: { label: 'Segurança', icon: '🚔' },
  environment: { label: 'Meio ambiente', icon: '🌳' },
  education: { label: 'Educação', icon: '📚' },
  health: { label: 'Saúde', icon: '🏥' },
  poverty: { label: 'Pobreza', icon: '🍲' },
  infrastructure: { label: 'Infraestrutura', icon: '🛣️' },
  prestige: { label: 'Prestígio lá fora', icon: '🌍' },
  affinity: { label: 'Imagem das suas decisões', icon: '🪞' },
  militancy: { label: 'Militância fiel', icon: '📣' },
  confidence: { label: 'Confiança na sua equipe', icon: '🤝' },
  honeymoon: { label: 'Lua de mel', icon: '💐' },
  wear: { label: 'Desgaste do mandato', icon: '⏳' },
};

export const REGION_LABELS: Record<RegionId, string> = {
  norte: 'Norte',
  nordeste: 'Nordeste',
  'centro-oeste': 'Centro-Oeste',
  sudeste: 'Sudeste',
  sul: 'Sul',
};

export const CITY_KIND_LABELS: Record<CityKind, string> = {
  capital: 'Capital',
  periferia: 'Periferia',
  industrial: 'Polo industrial',
  agro: 'Agronegócio',
  sertao: 'Semiárido',
  amazonia: 'Amazônia',
  porto: 'Porto',
  turismo: 'Festa e turismo',
  tecnologia: 'Ciência e inovação',
  fronteira: 'Fronteira',
  mineracao: 'Mineração',
  fe: 'Romaria',
};
