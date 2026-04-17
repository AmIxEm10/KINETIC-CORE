import { describe, expect, it } from 'vitest';
import {
  activate,
  addOverclockCharge,
  canActivate,
  createOverclockState,
  isActive
} from '@game/features/overclock';

describe('overclock', () => {
  it('charges up from damage', () => {
    let s = createOverclockState();
    s = addOverclockCharge(s, 2250);
    expect(s.charge).toBeCloseTo(0.5, 1);
  });

  it('cannot activate when charge is below threshold', () => {
    const s = addOverclockCharge(createOverclockState(), 500);
    expect(canActivate(s, 0)).toBe(false);
  });

  it('activates and stays active for overclockDuration', () => {
    let s = addOverclockCharge(createOverclockState(), 10_000);
    s = activate(s, 5);
    expect(isActive(s, 5)).toBe(true);
    expect(isActive(s, 10.5)).toBe(true);
    expect(isActive(s, 11)).toBe(false);
  });

  it('resets charge after activation', () => {
    let s = addOverclockCharge(createOverclockState(), 10_000);
    s = activate(s, 0);
    expect(s.charge).toBe(0);
  });
});
