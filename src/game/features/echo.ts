import { ECHO } from '../constants';
import type { EnemyInstance } from '../types';

/**
 * Kinetic Echo — Feature #3 (AI-designed).
 *
 * When an enemy dies it drops a Kinetic Echo: a short-lived phantom at its
 * last coordinates. Any tower shot that passes near an Echo detonates it and
 * deals splash damage to nearby enemies, rewarding combo play.
 */
export interface Echo {
  id: number;
  x: number;
  y: number;
  expiresAt: number;
  charge: number;
}

let _echoId = 1;

export function spawnEcho(at: { x: number; y: number }, now: number): Echo {
  return {
    id: _echoId++,
    x: at.x,
    y: at.y,
    expiresAt: now + 3.2,
    charge: ECHO.chargeGain
  };
}

export function pruneEchoes(echoes: Echo[], now: number): Echo[] {
  return echoes.filter((e) => e.expiresAt > now);
}

export function detonateEchoes(
  echoes: Echo[],
  impact: { x: number; y: number },
  enemies: EnemyInstance[]
): { remaining: Echo[]; damagedIds: number[]; totalDamage: number } {
  const remaining: Echo[] = [];
  const damagedIds = new Set<number>();
  let totalDamage = 0;

  for (const echo of echoes) {
    const dx = echo.x - impact.x;
    const dy = echo.y - impact.y;
    const d2 = dx * dx + dy * dy;
    if (d2 > 4) {
      // Keep echoes that are outside detonation trigger radius.
      remaining.push(echo);
      continue;
    }

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const ex = Math.cos(enemy.theta) * enemy.radius;
      const ey = Math.sin(enemy.theta) * enemy.radius;
      const ddx = ex - echo.x;
      const ddy = ey - echo.y;
      if (ddx * ddx + ddy * ddy <= ECHO.detonationRadius * ECHO.detonationRadius) {
        damagedIds.add(enemy.id);
        totalDamage += ECHO.detonationDamage;
      }
    }
  }

  return { remaining, damagedIds: [...damagedIds], totalDamage };
}
