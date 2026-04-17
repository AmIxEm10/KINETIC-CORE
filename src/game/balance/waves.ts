import type { EnemyKind, WaveSpec } from '../types';

const BASE_COMPOSITIONS: { kind: EnemyKind; weight: number }[] = [
  { kind: 'scout', weight: 0.58 },
  { kind: 'tank', weight: 0.28 },
  { kind: 'splinter', weight: 0.12 },
  { kind: 'boss', weight: 0.02 }
];

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function generateWave(index: number, seed = 0): WaveSpec {
  const scalar = 1 + Math.pow(index, 1.35) * 0.09;
  const duration = clamp(28 + index * 1.6, 28, 70);
  const spawnRate = clamp(0.9 + index * 0.11, 0.9, 6);
  const total = Math.floor(clamp(14 + index * 3.4, 14, 320));

  const rng = mulberry32(seed + index * 2654435761);

  // Draw jittered shares first, then normalise so the composition always
  // sums to `total`. Without normalisation every entry had its own jitter
  // and the totals could drift way above the cap.
  const rawShares = BASE_COMPOSITIONS.map((entry) => {
    const jitter = 0.85 + rng() * 0.3;
    const bias = entry.kind === 'boss' ? Math.max(0, index - 4) * 0.006 : 0;
    return Math.max(0, entry.weight * jitter + bias);
  });
  const shareSum = rawShares.reduce((a, b) => a + b, 0) || 1;

  const comp: { kind: EnemyKind; count: number }[] = BASE_COMPOSITIONS.map(
    (entry, i) => ({
      kind: entry.kind,
      count: Math.floor((total * rawShares[i]) / shareSum)
    })
  );
  const placed = comp.reduce((acc, c) => acc + c.count, 0);
  if (placed < total) {
    const scout = comp.find((c) => c.kind === 'scout')!;
    scout.count += total - placed;
  }

  const tension = clamp(0.2 + index * 0.04, 0.2, 1);

  return {
    index,
    duration,
    spawnRate,
    composition: comp.filter((c) => c.count > 0),
    scalar,
    tension
  };
}

export function sumWaveCount(wave: WaveSpec): number {
  return wave.composition.reduce((acc, w) => acc + w.count, 0);
}

// Deterministic RNG so tests and the chaos simulator are reproducible.
export function mulberry32(a: number) {
  return function rng() {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
