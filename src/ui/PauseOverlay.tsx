'use client';

import { motion } from 'framer-motion';
import { useKineticStore } from '@game/store';

export function PauseOverlay() {
  const toggle = useKineticStore((s) => s.togglePause);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-core-bg/70 backdrop-blur-md"
    >
      <div className="rounded-md border border-core-edge bg-core-panel px-12 py-8 text-center shadow-glow">
        <div className="text-xs uppercase tracking-[0.5em] text-core-mute">System hold</div>
        <h2 className="mt-2 text-4xl font-bold text-core-accent">PAUSED</h2>
        <button
          onClick={toggle}
          className="mt-6 rounded-md border border-core-accent px-6 py-2 text-sm text-core-accent hover:bg-core-accent/10"
        >
          RESUME
        </button>
      </div>
    </motion.div>
  );
}
