'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { TOWERS, WORLD } from '../constants';
import { useKineticStore } from '../store';

/** Visual ghost shown where the tower will drop while the user hovers a ring. */
export function PlacementGhost() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const { selectedTower, hoveredSlot } = useKineticStore.getState();
    if (!ref.current) return;
    if (!selectedTower || !hoveredSlot) {
      ref.current.visible = false;
      return;
    }
    ref.current.visible = true;
    const r = WORLD.rings[hoveredSlot.ring];
    ref.current.position.set(Math.cos(hoveredSlot.theta) * r, Math.sin(hoveredSlot.theta) * r, 0.5);
    const spec = TOWERS[selectedTower];
    (ref.current.material as THREE.MeshBasicMaterial).color.set(spec.color);
  });

  return (
    <mesh ref={ref} visible={false}>
      <sphereGeometry args={[0.6, 16, 16]} />
      <meshBasicMaterial color="#6EF0FF" transparent opacity={0.35} />
    </mesh>
  );
}
