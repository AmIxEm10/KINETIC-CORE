'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { HUD } from '@ui/HUD';
import { MainMenu } from '@ui/MainMenu';
import { useKineticStore } from '@game/store';

const GameCanvas = dynamic(() => import('@game/scene/GameCanvas').then((m) => m.GameCanvas), {
  ssr: false,
  loading: () => <div className="flex h-screen w-screen items-center justify-center text-core-mute">Booting reactor…</div>
});

export default function HomePage() {
  const phase = useKineticStore((s) => s.phase);
  const togglePause = useKineticStore((s) => s.togglePause);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') togglePause();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePause]);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <GameCanvas />
      {phase === 'menu' ? <MainMenu /> : <HUD />}
    </main>
  );
}
