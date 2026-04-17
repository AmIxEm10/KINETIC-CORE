'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useKineticStore } from '@game/store';

export function MainMenu() {
  const start = useKineticStore((s) => s.startGame);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-gradient-to-br from-core-bg via-core-bg to-black"
    >
      <div className="relative w-full max-w-xl rounded-xl border border-core-edge bg-core-panel/90 p-10 text-center shadow-glow backdrop-blur-md">
        <motion.div
          initial={{ letterSpacing: '0.4em', opacity: 0 }}
          animate={{ letterSpacing: '0.5em', opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-xs uppercase tracking-[0.5em] text-core-mute"
        >
          Classified // Kernel OS v0.9
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-2 font-display text-6xl font-bold text-core-accent"
          style={{ textShadow: '0 0 48px rgba(110, 240, 255, 0.45)' }}
        >
          KINETIC<span className="text-core-accent2">·</span>CORE
        </motion.h1>
        <p className="mt-3 text-sm text-core-mute">
          Une architecture défensive orbitale. Place des modules sur les anneaux, forme des harmoniques,
          déclenche le Phase Shift avant que le Noyau ne tombe.
        </p>

        <div className="mt-8 flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={start}
            className="rounded-md border border-core-accent bg-core-accent/10 px-8 py-3 font-display text-sm uppercase tracking-[0.3em] text-core-accent hover:bg-core-accent/20"
          >
            Initialize Core
          </motion.button>
          <Link
            href="/leaderboard"
            className="rounded-md border border-core-edge bg-core-panel px-8 py-3 font-display text-sm uppercase tracking-[0.3em] text-core-mute hover:text-core-accent"
          >
            Leaderboard
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2 text-left text-[11px] text-core-mute">
          <Hint title="Resonance Harmonics" body="Alignez des tours sur des anneaux adjacents pour créer des liens cyan." />
          <Hint title="Core Overclock" body="Meter charge via damage. Unleash Phase Shift for slow-mo + EMP pulse." />
          <Hint title="Kinetic Echo" body="Les kills laissent des échos orange qui détonnent en chaîne." />
        </div>
      </div>
    </motion.div>
  );
}

function Hint({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-core-edge/60 bg-core-bg/60 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-core-accent">{title}</div>
      <div className="mt-1 leading-tight">{body}</div>
    </div>
  );
}
