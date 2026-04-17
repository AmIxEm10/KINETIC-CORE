import type { EnemyKind, Stats, TowerSpec } from './types';

// World geometry — everything is expressed in world units (1u ≈ 1m).
export const WORLD = {
  coreRadius: 2.6,
  spawnRadius: 28,
  rings: [6, 9, 12, 15] as const,
  ringThickness: 0.9,
  killRadius: 2.9
};

export const TICK = {
  enemyUpdateHz: 60,
  towerUpdateHz: 30,
  simulationStep: 1 / 60
};

export const ENEMY_STATS: Record<EnemyKind, Stats> = {
  scout: { hp: 18, speed: 2.6, armor: 0, shield: 0, bounty: 4, radius: 0.28 },
  tank: { hp: 120, speed: 0.9, armor: 8, shield: 0, bounty: 12, radius: 0.55 },
  boss: { hp: 900, speed: 0.6, armor: 14, shield: 120, bounty: 80, radius: 1.1 },
  splinter: { hp: 36, speed: 1.9, armor: 2, shield: 10, bounty: 6, radius: 0.32 }
};

export const TOWERS: Record<string, TowerSpec> = {
  laser: {
    kind: 'laser',
    cost: 50,
    damage: 22,
    damageKind: 'plasma',
    range: 12,
    fireRate: 2.2,
    aoe: 0,
    slow: 0,
    color: '#6EF0FF',
    displayName: 'Lancet-Laser',
    description: 'Mono-cible, dégâts plasma qui ignorent 50% de l\'armure.'
  },
  flak: {
    kind: 'flak',
    cost: 80,
    damage: 14,
    damageKind: 'kinetic',
    range: 9,
    fireRate: 1.1,
    aoe: 1.8,
    slow: 0,
    color: '#FF5E3A',
    displayName: 'Flak-Disperseur',
    description: 'Explosion cinétique AoE. Fragmente les boucliers.'
  },
  slow: {
    kind: 'slow',
    cost: 40,
    damage: 4,
    damageKind: 'emp',
    range: 8,
    fireRate: 1.6,
    aoe: 2.6,
    slow: 0.55,
    color: '#FFB020',
    displayName: 'Champ EMP',
    description: 'Ralentit massivement les ennemis et draine les boucliers.'
  }
};

export const PLAYER = {
  startCredits: 220,
  coreHp: 100,
  coreShield: 50,
  overclockThreshold: 1,
  overclockDuration: 5.5,
  overclockSlow: 0.35
};

export const RESONANCE = {
  angleTolerance: 0.28, // radians, ~16°
  boostPerLink: 0.22,
  maxBoost: 1.1
};

export const ECHO = {
  chargeGain: 0.35,
  detonationRadius: 2.2,
  detonationDamage: 35
};
