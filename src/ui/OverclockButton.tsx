'use client';

import { motion } from 'framer-motion';
import { selectOverclockActive, useKineticStore } from '@game/store';

export function OverclockButton() {
  const charge = useKineticStore((s) => s.overclock.charge);
  const active = useKineticStore(selectOverclockActive);
  const trigger = useKineticStore((s) => s.triggerOverclock);
  const ready = charge >= 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="absolute bottom-6 right-6"
    >
      <motion.button
        onClick={() => ready && trigger()}
        whileHover={ready ? { scale: 1.03 } : undefined}
        whileTap={ready ? { scale: 0.97 } : undefined}
        className={`relative h-24 w-24 overflow-hidden rounded-full border-2 font-display uppercase tracking-widest text-[10px] ${
          active
            ? 'border-core-accent bg-core-accent/20 text-core-accent shadow-glowStrong'
            : ready
              ? 'border-core-accent bg-core-panel text-core-accent shadow-glow'
              : 'border-core-edge/70 bg-core-panel/80 text-core-mute'
        }`}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from -90deg, #6EF0FF ${charge * 360}deg, transparent ${charge * 360}deg)`,
            opacity: 0.35
          }}
          animate={{ rotate: active ? 360 : 0 }}
          transition={{ duration: 2, repeat: active ? Infinity : 0, ease: 'linear' }}
        />
        <span className="relative z-10 block text-center text-xs font-semibold">
          {active ? 'PHASE SHIFT' : ready ? 'OVERCLOCK' : `${Math.round(charge * 100)}%`}
        </span>
      </motion.button>
    </motion.div>
  );
}
