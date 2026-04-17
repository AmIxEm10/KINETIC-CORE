import { describe, expect, it } from 'vitest';
import { generateWave, sumWaveCount } from '@game/balance/waves';

describe('generateWave', () => {
  it('is deterministic for a given seed', () => {
    const a = generateWave(3, 1234);
    const b = generateWave(3, 1234);
    expect(a).toEqual(b);
  });

  it('scales wave size with index', () => {
    const small = sumWaveCount(generateWave(1));
    const large = sumWaveCount(generateWave(10));
    expect(large).toBeGreaterThan(small);
  });

  it('caps total enemies to 320 at extreme waves', () => {
    const total = sumWaveCount(generateWave(999));
    expect(total).toBeLessThanOrEqual(330);
  });

  it('increases boss count on later waves', () => {
    const early = generateWave(1, 42).composition.find((c) => c.kind === 'boss')?.count ?? 0;
    const late = generateWave(20, 42).composition.find((c) => c.kind === 'boss')?.count ?? 0;
    expect(late).toBeGreaterThan(early);
  });

  it('tension grows monotonically', () => {
    const a = generateWave(1).tension;
    const b = generateWave(8).tension;
    expect(b).toBeGreaterThan(a);
  });
});
