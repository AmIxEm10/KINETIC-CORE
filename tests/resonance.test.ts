import { describe, expect, it } from 'vitest';
import { angleDelta, computeHarmonics } from '@game/features/resonance';
import type { TowerInstance } from '@game/types';

const tower = (over: Partial<TowerInstance>): TowerInstance => ({
  id: 0,
  kind: 'laser',
  ring: 0,
  theta: 0,
  level: 1,
  cooldown: 0,
  harmonicBoost: 0,
  ...over
});

describe('angleDelta', () => {
  it('returns the shortest angle distance', () => {
    expect(angleDelta(0, Math.PI * 2)).toBeCloseTo(0);
    expect(angleDelta(0.1, 0.2)).toBeCloseTo(0.1, 5);
    expect(angleDelta(6.0, 0.1)).toBeLessThan(1);
  });
});

describe('computeHarmonics', () => {
  it('links adjacent-ring towers at matching angle', () => {
    const towers = [tower({ id: 1, ring: 0, theta: 1.0 }), tower({ id: 2, ring: 1, theta: 1.02 })];
    const { links, boosts } = computeHarmonics(towers);
    expect(links).toHaveLength(1);
    expect(boosts[1]).toBeGreaterThan(0);
    expect(boosts[2]).toBeGreaterThan(0);
  });

  it('does not link towers on non-adjacent rings', () => {
    const towers = [tower({ id: 1, ring: 0, theta: 0 }), tower({ id: 2, ring: 2, theta: 0 })];
    expect(computeHarmonics(towers).links).toHaveLength(0);
  });

  it('caps the stacking boost', () => {
    const towers = [
      tower({ id: 1, ring: 0, theta: 0 }),
      tower({ id: 2, ring: 1, theta: 0.01 }),
      tower({ id: 3, ring: 2, theta: -0.01 }),
      tower({ id: 4, ring: 3, theta: 0.015 })
    ];
    const { boosts } = computeHarmonics(towers);
    for (const v of Object.values(boosts)) {
      expect(v).toBeLessThanOrEqual(1.1);
    }
  });
});
