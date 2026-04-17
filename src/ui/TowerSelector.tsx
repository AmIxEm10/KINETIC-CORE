'use client';

import { motion } from 'framer-motion';
import { TOWERS } from '@game/constants';
import { useKineticStore } from '@game/store';
import type { TowerKind } from '@game/types';

export function TowerSelector() {
  const selected = useKineticStore((s) => s.selectedTower);
  const credits = useKineticStore((s) => s.credits);
  const select = useKineticStore((s) => s.selectTower);

  const kinds: TowerKind[] = ['laser', 'flak', 'slow'];

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3"
    >
      {kinds.map((kind) => {
        const spec = TOWERS[kind];
        const affordable = credits >= spec.cost;
        const active = selected === kind;
        return (
          <motion.button
            key={kind}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => select(active ? null : kind)}
            disabled={!affordable}
            className={`group relative w-48 rounded-md border px-4 py-3 text-left transition backdrop-blur-md ${
              active
                ? 'border-core-accent bg-core-accent/10 shadow-glow'
                : affordable
                  ? 'border-core-edge/70 bg-core-panel/80 hover:border-core-accent/70'
                  : 'border-core-edge/40 bg-core-panel/60 opacity-60'
            }`}
            style={active ? { boxShadow: `0 0 32px ${spec.color}66` } : undefined}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: spec.color }}>
                {spec.displayName}
              </span>
              <span className="text-[11px] text-core-mute">{spec.cost}¢</span>
            </div>
            <p className="mt-1 text-[11px] leading-tight text-core-mute">{spec.description}</p>
            <div className="mt-2 flex gap-3 text-[10px] uppercase tracking-widest text-core-mute">
              <span>DMG {spec.damage}</span>
              <span>RPS {spec.fireRate}</span>
              {spec.aoe > 0 && <span>AOE {spec.aoe}</span>}
              {spec.slow > 0 && <span>SLW {(spec.slow * 100).toFixed(0)}%</span>}
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
