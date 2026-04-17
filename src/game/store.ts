'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { PLAYER, TOWERS } from './constants';
import { computeHarmonics } from './features/resonance';
import {
  activate as activateOverclock,
  addOverclockCharge,
  createOverclockState,
  isActive as overclockIsActive
} from './features/overclock';
import type { OverclockState } from './features/overclock';
import type { TowerInstance, TowerKind } from './types';

export type GamePhase = 'menu' | 'playing' | 'paused' | 'over';

export interface KineticStore {
  phase: GamePhase;
  time: number;
  wave: number;
  kills: number;
  score: number;
  credits: number;
  coreHp: number;
  coreShield: number;
  towers: TowerInstance[];
  selectedTower: TowerKind | null;
  hoveredSlot: { ring: number; theta: number } | null;
  harmonicBoosts: Record<number, number>;
  overclock: OverclockState;
  shakeSeed: number;

  /* actions */
  startGame: () => void;
  togglePause: () => void;
  endGame: () => void;
  tick: (dt: number) => void;
  registerKill: (bounty: number) => void;
  registerDamageDealt: (amount: number) => void;
  damageCore: (amount: number) => void;
  selectTower: (kind: TowerKind | null) => void;
  hoverSlot: (slot: { ring: number; theta: number } | null) => void;
  placeTower: (ring: number, theta: number) => boolean;
  upgradeTower: (id: number) => void;
  triggerOverclock: () => void;
  bumpShake: () => void;
}

let _towerId = 1;

export const useKineticStore = create<KineticStore>()(
  subscribeWithSelector((set, get) => ({
    phase: 'menu',
    time: 0,
    wave: 0,
    kills: 0,
    score: 0,
    credits: PLAYER.startCredits,
    coreHp: PLAYER.coreHp,
    coreShield: PLAYER.coreShield,
    towers: [],
    selectedTower: null,
    hoveredSlot: null,
    harmonicBoosts: {},
    overclock: createOverclockState(),
    shakeSeed: 0,

    startGame: () =>
      set({
        phase: 'playing',
        time: 0,
        wave: 1,
        kills: 0,
        score: 0,
        credits: PLAYER.startCredits,
        coreHp: PLAYER.coreHp,
        coreShield: PLAYER.coreShield,
        towers: [],
        selectedTower: null,
        hoveredSlot: null,
        harmonicBoosts: {},
        overclock: createOverclockState()
      }),

    togglePause: () =>
      set((s) => ({ phase: s.phase === 'paused' ? 'playing' : s.phase === 'playing' ? 'paused' : s.phase })),

    endGame: () => set({ phase: 'over' }),

    tick: (dt) =>
      set((s) => {
        if (s.phase !== 'playing') return {};
        return { time: s.time + dt };
      }),

    registerKill: (bounty) =>
      set((s) => ({ kills: s.kills + 1, credits: s.credits + bounty, score: s.score + bounty * 3 })),

    registerDamageDealt: (amount) =>
      set((s) => ({
        overclock: addOverclockCharge(s.overclock, amount),
        score: s.score + Math.round(amount * 0.5)
      })),

    damageCore: (amount) =>
      set((s) => {
        const shieldDrain = Math.min(s.coreShield, amount);
        const hpDrain = Math.max(0, amount - shieldDrain);
        const nextHp = Math.max(0, s.coreHp - hpDrain);
        return {
          coreShield: s.coreShield - shieldDrain,
          coreHp: nextHp,
          phase: nextHp <= 0 ? 'over' : s.phase,
          shakeSeed: s.shakeSeed + amount * 0.5
        };
      }),

    selectTower: (kind) => set({ selectedTower: kind }),
    hoverSlot: (slot) => set({ hoveredSlot: slot }),

    placeTower: (ring, theta) => {
      const { selectedTower, credits, towers } = get();
      if (!selectedTower) return false;
      const spec = TOWERS[selectedTower];
      if (credits < spec.cost) return false;

      const next: TowerInstance = {
        id: _towerId++,
        kind: selectedTower,
        ring,
        theta,
        level: 1,
        cooldown: 0,
        harmonicBoost: 0
      };

      const towersNext = [...towers, next];
      const { boosts } = computeHarmonics(towersNext);

      set({
        towers: towersNext,
        credits: credits - spec.cost,
        harmonicBoosts: boosts,
        selectedTower: null,
        hoveredSlot: null
      });
      return true;
    },

    upgradeTower: (id) =>
      set((s) => {
        const idx = s.towers.findIndex((t) => t.id === id);
        if (idx < 0) return {};
        const tower = s.towers[idx];
        const cost = 30 + tower.level * 40;
        if (s.credits < cost) return {};
        const next = [...s.towers];
        next[idx] = { ...tower, level: tower.level + 1 };
        return { towers: next, credits: s.credits - cost };
      }),

    triggerOverclock: () =>
      set((s) => ({ overclock: activateOverclock(s.overclock, s.time), shakeSeed: s.shakeSeed + 12 })),

    bumpShake: () => set((s) => ({ shakeSeed: s.shakeSeed + 1 }))
  }))
);

export const selectOverclockActive = (s: KineticStore) => overclockIsActive(s.overclock, s.time);
