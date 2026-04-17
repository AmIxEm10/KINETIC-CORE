'use client';

import { AnimatePresence } from 'framer-motion';
import { CoreStatus } from './CoreStatus';
import { GameOver } from './GameOver';
import { OverclockButton } from './OverclockButton';
import { ResourcePanel } from './ResourcePanel';
import { TowerSelector } from './TowerSelector';
import { WaveOverlay } from './WaveOverlay';
import { useKineticStore } from '@game/store';
import { PauseOverlay } from './PauseOverlay';

export function HUD() {
  const phase = useKineticStore((s) => s.phase);
  return (
    <div className="pointer-events-none absolute inset-0 select-none font-display text-core-accent">
      <div className="pointer-events-auto">
        <CoreStatus />
        <ResourcePanel />
        <TowerSelector />
        <OverclockButton />
      </div>
      <AnimatePresence>{phase === 'playing' ? <WaveOverlay key="wave" /> : null}</AnimatePresence>
      <AnimatePresence>{phase === 'paused' ? <PauseOverlay key="pause" /> : null}</AnimatePresence>
      <AnimatePresence>{phase === 'over' ? <GameOver key="over" /> : null}</AnimatePresence>
    </div>
  );
}
