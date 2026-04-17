'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { useKineticStore } from '../store';

/**
 * Subtle cinematic camera: gentle idle drift plus reactive screen-shake when
 * the Core takes damage or Overclock fires. Decays exponentially so the
 * feedback is tactile without becoming nauseating.
 */
export function CameraRig() {
  const { camera } = useThree();
  const shake = useRef(0);
  const lastSeed = useRef(0);

  camera.position.set(0, -1.5, 28);
  camera.lookAt(0, 0, 0);

  useFrame((state, dt) => {
    const seed = useKineticStore.getState().shakeSeed;
    if (seed > lastSeed.current) {
      shake.current = Math.min(1, shake.current + (seed - lastSeed.current) * 0.04);
      lastSeed.current = seed;
    }
    shake.current = Math.max(0, shake.current - dt * 1.6);

    const t = state.clock.elapsedTime;
    const drift = {
      x: Math.sin(t * 0.2) * 0.4,
      y: Math.cos(t * 0.15) * 0.25
    };
    const s = shake.current;
    camera.position.x = drift.x + (Math.random() - 0.5) * s * 0.9;
    camera.position.y = drift.y + (Math.random() - 0.5) * s * 0.9;
    camera.position.z = 28 + Math.sin(t * 0.4) * 0.5;
    camera.lookAt(0, 0, 0);
  });

  return null;
}
