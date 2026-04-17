// KINETIC-CORE · Shared domain types.

export type EnemyKind = 'scout' | 'tank' | 'boss' | 'splinter';
export type TowerKind = 'laser' | 'flak' | 'slow';
export type DamageKind = 'kinetic' | 'plasma' | 'emp';

export interface Stats {
  hp: number;
  speed: number;
  armor: number;
  shield: number;
  bounty: number;
  radius: number;
}

export interface EnemyInstance {
  id: number;
  kind: EnemyKind;
  theta: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  armor: number;
  shield: number;
  alive: boolean;
  slowUntil: number;
  echoCharge: number;
}

export interface TowerSpec {
  kind: TowerKind;
  cost: number;
  damage: number;
  damageKind: DamageKind;
  range: number;
  fireRate: number;
  aoe: number;
  slow: number;
  color: string;
  displayName: string;
  description: string;
}

export interface TowerInstance {
  id: number;
  kind: TowerKind;
  ring: number;
  theta: number;
  level: number;
  cooldown: number;
  harmonicBoost: number;
}

export interface WaveSpec {
  index: number;
  duration: number;
  spawnRate: number;
  composition: { kind: EnemyKind; count: number }[];
  scalar: number;
  tension: number;
}

export interface DamageResult {
  raw: number;
  mitigated: number;
  final: number;
  shieldDrain: number;
  armorIgnored: number;
  crit: boolean;
}

export interface LeaderboardEntry {
  id: string;
  handle: string;
  score: number;
  wave: number;
  createdAt: number;
}
