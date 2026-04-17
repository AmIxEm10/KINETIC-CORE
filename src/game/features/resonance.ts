import { RESONANCE } from '../constants';
import type { TowerInstance } from '../types';

/**
 * Resonance Harmonics — Feature #1 (AI-designed).
 *
 * When two or more towers are placed on *adjacent* orbital rings at nearly the
 * same angle, they form a harmonic link. Every participating tower gets a
 * stacking damage boost, and visually a cyan beam snaps between them.
 *
 * This is a pure function to keep it testable; visual effects are wired up
 * in the scene layer.
 */
export interface HarmonicLink {
  a: number; // tower id
  b: number; // tower id
  strength: number; // 0..1
}

export function computeHarmonics(towers: TowerInstance[]): {
  links: HarmonicLink[];
  boosts: Record<number, number>;
} {
  const links: HarmonicLink[] = [];
  const boosts: Record<number, number> = {};

  for (let i = 0; i < towers.length; i++) {
    for (let j = i + 1; j < towers.length; j++) {
      const a = towers[i];
      const b = towers[j];
      if (Math.abs(a.ring - b.ring) !== 1) continue;

      const delta = Math.abs(angleDelta(a.theta, b.theta));
      if (delta > RESONANCE.angleTolerance) continue;

      const strength = 1 - delta / RESONANCE.angleTolerance;
      links.push({ a: a.id, b: b.id, strength });

      const bonus = Math.min(RESONANCE.maxBoost, RESONANCE.boostPerLink * strength);
      boosts[a.id] = Math.min(RESONANCE.maxBoost, (boosts[a.id] ?? 0) + bonus);
      boosts[b.id] = Math.min(RESONANCE.maxBoost, (boosts[b.id] ?? 0) + bonus);
    }
  }

  return { links, boosts };
}

export function angleDelta(a: number, b: number): number {
  const d = Math.abs(a - b) % (Math.PI * 2);
  return d > Math.PI ? Math.PI * 2 - d : d;
}
