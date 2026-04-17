import { describe, expect, it } from 'vitest';
import { applyDamage, computeDamage, ttk } from '@game/balance/damage';
import type { EnemyInstance } from '@game/types';

const enemy = (over: Partial<EnemyInstance> = {}): EnemyInstance => ({
  id: 1,
  kind: 'scout',
  theta: 0,
  radius: 10,
  hp: 100,
  maxHp: 100,
  speed: 1,
  armor: 0,
  shield: 0,
  alive: true,
  slowUntil: 0,
  echoCharge: 0,
  ...over
});

describe('computeDamage', () => {
  it('returns raw damage for unarmored, unshielded targets', () => {
    const r = computeDamage(enemy(), { base: 50, kind: 'kinetic' });
    expect(r.raw).toBe(50);
    expect(r.final).toBe(50);
    expect(r.shieldDrain).toBe(0);
  });

  it('reduces damage against armored targets', () => {
    const r = computeDamage(enemy({ armor: 60 }), { base: 100, kind: 'kinetic' });
    expect(r.final).toBeLessThan(60);
    expect(r.final).toBeGreaterThan(0);
  });

  it('applies plasma bonus that halves armor effectiveness', () => {
    const kinetic = computeDamage(enemy({ armor: 60 }), { base: 100, kind: 'kinetic' });
    const plasma = computeDamage(enemy({ armor: 60 }), { base: 100, kind: 'plasma' });
    expect(plasma.final).toBeGreaterThan(kinetic.final);
  });

  it('drains shields before hp and applies EMP double drain', () => {
    const kinetic = computeDamage(enemy({ shield: 500 }), { base: 80, kind: 'kinetic' });
    const emp = computeDamage(enemy({ shield: 500 }), { base: 80, kind: 'emp' });
    expect(emp.shieldDrain).toBeGreaterThan(kinetic.shieldDrain);
  });

  it('applies harmonic boost multiplicatively', () => {
    const base = computeDamage(enemy(), { base: 50, kind: 'plasma' });
    const boosted = computeDamage(enemy(), { base: 50, kind: 'plasma', harmonicBoost: 0.5 });
    expect(boosted.final).toBeCloseTo(base.final * 1.5, 2);
  });

  it('applies overclock and crit stacks multiplicatively', () => {
    const clean = computeDamage(enemy({ hp: 10_000 }), { base: 100, kind: 'plasma' });
    const hot = computeDamage(enemy({ hp: 10_000 }), {
      base: 100,
      kind: 'plasma',
      crit: true,
      overclock: true
    });
    expect(hot.final).toBeCloseTo(clean.final * 1.35 * 1.8, 2);
  });

  it('never exceeds target hp', () => {
    const r = computeDamage(enemy({ hp: 12 }), { base: 5000, kind: 'plasma' });
    expect(r.final).toBeLessThanOrEqual(12);
  });
});

describe('applyDamage', () => {
  it('kills an enemy when hp drops to zero', () => {
    const r = computeDamage(enemy({ hp: 10 }), { base: 500, kind: 'plasma' });
    const after = applyDamage(enemy({ hp: 10 }), r);
    expect(after.hp).toBe(0);
    expect(after.alive).toBe(false);
  });
});

describe('ttk', () => {
  it('returns Infinity when damage is fully absorbed', () => {
    const value = ttk(0, { hp: 100, shield: 0, armor: 9999 }, 'kinetic');
    expect(value).toBeGreaterThan(50);
  });
  it('shrinks with higher DPS', () => {
    const low = ttk(10, { hp: 100, shield: 0, armor: 0 }, 'kinetic');
    const high = ttk(50, { hp: 100, shield: 0, armor: 0 }, 'kinetic');
    expect(high).toBeLessThan(low);
  });
});
