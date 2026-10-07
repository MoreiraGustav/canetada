import { describe, expect, it } from 'vitest';
import { MAX_INDICATOR_NEWS } from '@/constants/balance';
import type { HeadlineTemplate, SimulationState } from '@/types';
import { createFixtureState, FIXTURE_CONTENT, withApproval } from './__fixtures__/content';
import { createNewsItem, generateIndicatorNews } from './news';
import { createRng } from './random';

const template = (id: string, indicator: HeadlineTemplate['indicator'], direction: 'up' | 'down', threshold: number): HeadlineTemplate => ({
  id,
  indicator,
  direction,
  threshold,
  tone: 'neutral',
  category: 'economy',
  templates: [`${id}: {value} ({delta})`],
});

describe('createNewsItem', () => {
  it('gera ID determinístico a partir do turno e da chave', () => {
    expect(createNewsItem(4, 'Manchete', 'positive', 'decision', 'decision:x')).toEqual({
      id: '4:decision:x',
      turn: 4,
      headline: 'Manchete',
      tone: 'positive',
      category: 'decision',
    });
  });
});

describe('generateIndicatorNews', () => {
  const before = withApproval(createFixtureState(), 50);
  const after: SimulationState = {
    ...withApproval(before, 45),
    metrics: { ...before.metrics, inflation: before.metrics.inflation + 1, unemployment: before.metrics.unemployment - 0.5, debt: before.metrics.debt + 3 },
  };

  it('só noticia variações acima do limiar e na direção do template', () => {
    const news = generateIndicatorNews(before, after, FIXTURE_CONTENT.headlines, createRng(1));
    expect(news.map((item) => item.id).sort()).toEqual(['1:indicator:fx-aprovacao-cai', '1:indicator:fx-desemprego-cai', '1:indicator:fx-inflacao-sobe']);
    expect(generateIndicatorNews(before, before, FIXTURE_CONTENT.headlines, createRng(1))).toEqual([]);
  });

  it('no máximo MAX_INDICATOR_NEWS, uma por indicador, as mais fortes primeiro', () => {
    const templates = [
      template('inf-fraca', 'inflation', 'up', 0.9),
      template('inf-forte', 'inflation', 'up', 0.1),
      template('desemprego', 'unemployment', 'down', 0.4),
      template('divida', 'debt', 'up', 0.5),
      template('aprovacao', 'approval', 'down', 4),
    ];
    const news = generateIndicatorNews(before, after, templates, createRng(1));
    expect(news).toHaveLength(MAX_INDICATOR_NEWS);
    expect(news[0].id).toBe('1:indicator:inf-forte');
    expect(news.some((item) => item.id.endsWith('inf-fraca'))).toBe(false);
  });
});
