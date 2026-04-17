/**
 * Chaos-engineer auto-balance simulator.
 *
 * Runs a headless tick loop against the current constants and prints a
 * Markdown report of expected TTK, DPS per credit, and wave pressure. Used as
 * a sanity check during development — run with `npm run simulate`.
 */
import { ENEMY_STATS, TOWERS } from '../constants';
import { computeDamage, ttk } from './damage';
import { generateWave, sumWaveCount } from './waves';

function format(n: number, digits = 2) {
  if (!Number.isFinite(n)) return '∞';
  return n.toFixed(digits);
}

function run() {
  console.log('# KINETIC-CORE · Balance report\n');
  console.log('## TTK (seconds) per tower vs enemy type');
  console.log('| Tower \\ Enemy | Scout | Tank | Boss | Splinter |');
  console.log('|---|---|---|---|---|');

  for (const tower of Object.values(TOWERS)) {
    const dps = tower.damage * tower.fireRate;
    const row = (['scout', 'tank', 'boss', 'splinter'] as const).map((k) =>
      format(ttk(dps, ENEMY_STATS[k], tower.damageKind))
    );
    console.log(`| ${tower.displayName} | ${row.join(' | ')} |`);
  }

  console.log('\n## Wave pressure');
  console.log('| Wave | Enemies | Duration (s) | Spawn rate | HP total |');
  console.log('|---|---|---|---|---|');
  for (let i = 1; i <= 12; i++) {
    const wave = generateWave(i, 42);
    const enemies = sumWaveCount(wave);
    const hp = wave.composition.reduce(
      (acc, c) => acc + ENEMY_STATS[c.kind].hp * c.count * wave.scalar,
      0
    );
    console.log(`| ${i} | ${enemies} | ${format(wave.duration)} | ${format(wave.spawnRate)} | ${Math.round(hp)} |`);
  }

  console.log('\n## Sanity probe');
  const probe = computeDamage(
    { hp: 1000, shield: 100, armor: 12 },
    { base: 200, kind: 'plasma', crit: true, harmonicBoost: 0.4 }
  );
  console.log('plasma crit on armored target =>', probe);
}

run();
