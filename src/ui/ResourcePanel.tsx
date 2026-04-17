'use client';

import { motion } from 'framer-motion';
import { useKineticStore } from '@game/store';

export function ResourcePanel() {
  const credits = useKineticStore((s) => s.credits);
  const kills = useKineticStore((s) => s.kills);
  const score = useKineticStore((s) => s.score);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="absolute right-6 top-6 flex gap-3 text-right"
    >
      <Stat label="Credits" value={credits} color="#6EF0FF" />
      <Stat label="Score" value={score} color="#FFB020" />
      <Stat label="Kills" value={kills} color="#FF5E3A" />
    </motion.div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="min-w-[92px] rounded-md border border-core-edge/70 bg-core-panel/80 px-3 py-2 backdrop-blur-md">
      <div className="text-[10px] uppercase tracking-widest text-core-mute">{label}</div>
      <div className="text-xl font-semibold" style={{ color, textShadow: `0 0 18px ${color}66` }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}
