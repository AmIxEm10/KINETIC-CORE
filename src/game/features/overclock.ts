import { PLAYER } from '../constants';

/**
 * Core Overclock — Feature #2 (AI-designed).
 *
 * The Core accumulates charge proportional to inflicted damage. Once full the
 * player can trigger a Phase Shift: enemies are globally slowed, every tower
 * gets a damage multiplier, and an EMP pulse ripples from the Core dealing
 * area damage to anyone inside radius 8.
 */
export interface OverclockState {
  charge: number; // 0..1
  activeUntil: number; // absolute game time in seconds
  lastPulseAt: number;
}

export const createOverclockState = (): OverclockState => ({
  charge: 0,
  activeUntil: 0,
  lastPulseAt: -Infinity
});

export function addOverclockCharge(state: OverclockState, damageDealt: number): OverclockState {
  const gain = damageDealt / 4500; // ~4500 damage to fill the meter from empty.
  return { ...state, charge: Math.min(1, state.charge + gain) };
}

export function canActivate(state: OverclockState, now: number): boolean {
  return state.charge >= PLAYER.overclockThreshold && state.activeUntil <= now;
}

export function activate(state: OverclockState, now: number): OverclockState {
  if (!canActivate(state, now)) return state;
  return {
    charge: 0,
    activeUntil: now + PLAYER.overclockDuration,
    lastPulseAt: now
  };
}

export function isActive(state: OverclockState, now: number): boolean {
  return state.activeUntil >= now && state.activeUntil > 0;
}
