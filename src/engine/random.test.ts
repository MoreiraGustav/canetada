import { describe, expect, it } from 'vitest';
import type { Rng } from '@/types';
import { createRng, pickWeighted, randomBetween, randomInt, shuffle } from './random';

const take = (rng: Rng, count: number): number[] => Array.from({ length: count }, () => rng.next());

describe('createRng', () => {
  it('produz a mesma sequência para a mesma semente', () => {
    expect(take(createRng(42), 20)).toEqual(take(createRng(42), 20));
  });

  it('produz sequências diferentes para sementes diferentes', () => {
    expect(take(createRng(1), 5)).not.toEqual(take(createRng(2), 5));
  });

  it('gera valores em [0, 1)', () => {
    const values = take(createRng(7), 5000);
    expect(values.every((value) => value >= 0 && value < 1)).toBe(true);
  });

  it('getSeed permite retomar a sequência exatamente de onde parou', () => {
    const original = createRng(99);
    take(original, 13);
    const resumed = createRng(original.getSeed());
    expect(take(resumed, 10)).toEqual(take(original, 10));
  });
});

describe('randomBetween / randomInt', () => {
  it('randomBetween respeita [min, max)', () => {
    const rng = createRng(3);
    const values = Array.from({ length: 1000 }, () => randomBetween(rng, -2, 5));
    expect(values.every((value) => value >= -2 && value < 5)).toBe(true);
  });

  it('randomInt é inclusivo nos dois extremos e só gera inteiros', () => {
    const rng = createRng(5);
    const values = new Set(Array.from({ length: 2000 }, () => randomInt(rng, 1, 4)));
    expect([...values].sort()).toEqual([1, 2, 3, 4]);
  });
});

describe('pickWeighted', () => {
  it('ignora itens com peso ≤ 0', () => {
    const rng = createRng(11);
    const items = [
      { item: 'zero', weight: 0 },
      { item: 'negativo', weight: -5 },
      { item: 'valido', weight: 1 },
    ];
    const picks = new Set(Array.from({ length: 500 }, () => pickWeighted(rng, items)));
    expect([...picks]).toEqual(['valido']);
  });

  it('retorna null quando não há nada sorteável', () => {
    const rng = createRng(1);
    expect(pickWeighted(rng, [])).toBeNull();
    expect(pickWeighted(rng, [{ item: 'a', weight: 0 }, { item: 'b', weight: -1 }])).toBeNull();
  });

  it('respeita aproximadamente as proporções dos pesos', () => {
    const rng = createRng(2024);
    const draws = 10000;
    const heavy = Array.from({ length: draws }, () => pickWeighted(rng, [{ item: 'a', weight: 3 }, { item: 'b', weight: 1 }])).filter(
      (item) => item === 'a',
    ).length;
    expect(heavy / draws).toBeGreaterThan(0.72);
    expect(heavy / draws).toBeLessThan(0.78);
  });
});

describe('shuffle', () => {
  it('devolve uma permutação sem alterar a lista original', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const copy = [...items];
    const shuffled = shuffle(createRng(8), items);
    expect(items).toEqual(copy);
    expect(shuffled).toHaveLength(items.length);
    expect([...shuffled].sort((a, b) => a - b)).toEqual(items);
  });

  it('é determinístico para a mesma semente', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f'];
    expect(shuffle(createRng(17), items)).toEqual(shuffle(createRng(17), items));
  });
});
