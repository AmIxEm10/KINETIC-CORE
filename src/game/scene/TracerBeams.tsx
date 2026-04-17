'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export interface Tracer {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  color: string;
  expiresAt: number;
}

interface Props {
  getTracers: () => Tracer[];
}

const MAX_TRACERS = 256;

export function TracerBeams({ getTracers }: Props) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const tracers = getTracers();
    const m = mesh.current;
    if (!m) return;
    for (let i = 0; i < tracers.length && i < MAX_TRACERS; i++) {
      const t = tracers[i];
      const dx = t.bx - t.ax;
      const dy = t.by - t.ay;
      const len = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      dummy.position.set((t.ax + t.bx) / 2, (t.ay + t.by) / 2, 0.6);
      dummy.rotation.set(0, 0, angle);
      dummy.scale.set(len, 0.06, 0.06);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      m.setColorAt(i, color.set(t.color));
    }
    m.count = Math.min(tracers.length, MAX_TRACERS);
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, MAX_TRACERS]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="white" transparent opacity={0.9} />
    </instancedMesh>
  );
}
