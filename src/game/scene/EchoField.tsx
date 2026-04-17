'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { enemyHandle } from './EnemyManager';

const MAX_ECHOES = 128;

/** Visual residue for Kinetic Echo — small orange rings that fade out. */
export function EchoField() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const m = meshRef.current;
    if (!m) return;
    const echoes = enemyHandle.echoes;
    const now = state.clock.elapsedTime;
    let i = 0;
    for (const echo of echoes) {
      if (i >= MAX_ECHOES) break;
      const remaining = echo.expiresAt - now;
      const scale = 0.3 + Math.max(0, remaining) * 0.1;
      dummy.position.set(echo.x, echo.y, 0.3);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      i++;
    }
    m.count = i;
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_ECHOES]} frustumCulled={false}>
      <ringGeometry args={[0.45, 0.55, 24]} />
      <meshBasicMaterial color="#FFB020" transparent opacity={0.5} />
    </instancedMesh>
  );
}
