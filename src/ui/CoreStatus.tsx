'use client';

import { motion } from 'framer-motion';
import { useKineticStore } from '@game/store';
import { PLAYER } from '@game/constants';

export function CoreStatus() {
  const coreHp = useKineticStore((s) => s.coreHp);
  const coreShield = useKineticStore((s) => s.coreShield);
  const wave = useKineticStore((s) => s.wave);

  const hpPct = Math.max(0, coreHp / PLAYER.coreHp);
  const shieldPct = Math.max(0, coreShield / PLAYER.coreShield);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute left-6 top-6 w-80 rounded-md border border-core-edge/70 bg-core-panel/80 p-4 backdrop-blur-md shadow-glow"
    >
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-core-mute">
        <span>Core status</span>
        <span className="text-core-accent">Wave {wave.toString().padStart(2, '0')}</span>
      </div>

      <div className="mt-3 space-y-2">
        <Meter label="Integrity" pct={hpPct} color="#FF2D55" />
        <Meter label="Shield" pct={shieldPct} color="#6EF0FF" />
      </div>
    </motion.div>
  );
}

function Meter({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] text-core-mute uppercase tracking-widest">
        <span>{label}</span>
        <span>{Math.round(pct * 100)}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-core-grid">
        <motion.div
          className="h-full"
          style={{ background: color, width: `${pct * 100}%`, boxShadow: `0 0 18px ${color}` }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.25 }}
        />
      </div>
    </div>
  );
}
