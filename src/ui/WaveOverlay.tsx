'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useKineticStore } from '@game/store';

export function WaveOverlay() {
  const wave = useKineticStore((s) => s.wave);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const id = setTimeout(() => setVisible(false), 1800);
    return () => clearTimeout(id);
  }, [wave]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key={`wave-${wave}`}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="rounded-md border border-core-accent/40 bg-core-panel/70 px-16 py-6 text-center backdrop-blur-md shadow-glow">
            <div className="text-xs uppercase tracking-[0.5em] text-core-mute">Incoming</div>
            <div className="mt-1 font-display text-5xl font-bold text-core-accent" style={{ textShadow: '0 0 32px #6EF0FF' }}>
              WAVE {wave.toString().padStart(2, '0')}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
