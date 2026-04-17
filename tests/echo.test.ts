import { describe, expect, it } from 'vitest';
import { detonateEchoes, pruneEchoes, spawnEcho } from '@game/features/echo';
import type { EnemyInstance } from '@game/types';

const enemy = (id: number, theta: number, radius: number): EnemyInstance => ({
  id,
  kind: 'scout',
  theta,
  radius,
  hp: 100,
  maxHp: 100,
  speed: 1,
  armor: 0,
  shield: 0,
  alive: true,
  slowUntil: 0,
  echoCharge: 0
});

describe('kinetic echo', () => {
  it('prunes expired echoes', () => {
    const echo = spawnEcho({ x: 0, y: 0 }, 0);
    expect(pruneEchoes([echo], 10)).toHaveLength(0);
    expect(pruneEchoes([echo], 1)).toHaveLength(1);
  });

  it('detonates when a shot lands nearby and damages enemies', () => {
    const e = spawnEcho({ x: 2, y: 0 }, 0);
    const enemies = [enemy(1, 0, 2.1), enemy(2, Math.PI, 20)];
    const res = detonateEchoes([e], { x: 2, y: 0 }, enemies);
    expect(res.damagedIds).toContain(1);
    expect(res.damagedIds).not.toContain(2);
    expect(res.remaining).toHaveLength(0);
  });

  it('keeps echoes that are far from the impact', () => {
    const e = spawnEcho({ x: 10, y: 10 }, 0);
    const res = detonateEchoes([e], { x: 0, y: 0 }, []);
    expect(res.remaining).toHaveLength(1);
  });
});
