import type { DamageKind, DamageResult, EnemyInstance } from '../types';

export interface DamageContext {
  base: number;
  kind: DamageKind;
  crit?: boolean;
  pierce?: number;
  harmonicBoost?: number;
  overclock?: boolean;
}

const ARMOR_CURVE = (armor: number) => armor / (armor + 60);

export function computeDamage(
  enemy: Pick<EnemyInstance, 'armor' | 'shield' | 'hp'>,
  ctx: DamageContext
): DamageResult {
  const boost = 1 + (ctx.harmonicBoost ?? 0);
  const overclock = ctx.overclock ? 1.35 : 1;
  const critMul = ctx.crit ? 1.8 : 1;
  const raw = Math.max(0, ctx.base) * boost * overclock * critMul;

  let shieldDrain = 0;
  let remaining = raw;

  if (enemy.shield > 0) {
    // EMP drains double against shields; kinetic is halved.
    const shieldMul = ctx.kind === 'emp' ? 2 : ctx.kind === 'kinetic' ? 0.5 : 1;
    const toShield = Math.min(enemy.shield, remaining * shieldMul);
    shieldDrain = toShield;
    remaining = Math.max(0, remaining - toShield / shieldMul);
  }

  const armorReduction = ARMOR_CURVE(Math.max(0, enemy.armor - (ctx.pierce ?? 0)));
  const armorMul = ctx.kind === 'plasma' ? 1 - armorReduction * 0.5 : 1 - armorReduction;
  const mitigated = remaining * armorMul;

  const final = Math.max(0, Math.min(enemy.hp, mitigated));

  return {
    raw,
    mitigated,
    final,
    shieldDrain,
    armorIgnored: ctx.pierce ?? 0,
    crit: Boolean(ctx.crit)
  };
}

export function applyDamage(enemy: EnemyInstance, result: DamageResult): EnemyInstance {
  const shieldAfter = Math.max(0, enemy.shield - result.shieldDrain);
  const hpAfter = Math.max(0, enemy.hp - result.final);
  return {
    ...enemy,
    shield: shieldAfter,
    hp: hpAfter,
    alive: hpAfter > 0
  };
}

/**
 * Expected time-to-kill (seconds) for a single tower against a target.
 * Used by `chaos-engineer` simulations and UI tooltips.
 */
export function ttk(
  dps: number,
  target: Pick<EnemyInstance, 'hp' | 'armor' | 'shield'>,
  kind: DamageKind
): number {
  const mock = computeDamage(target, { base: dps, kind });
  return mock.final <= 0 ? Infinity : target.hp / mock.final;
}
