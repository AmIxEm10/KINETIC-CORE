'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

export function Background() {
  const stars = useMemo(() => {
    const count = 900;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 60 + Math.random() * 40;
      const t = Math.random() * Math.PI * 2;
      const p = (Math.random() - 0.5) * Math.PI;
      positions[i * 3] = Math.cos(t) * r * Math.cos(p);
      positions[i * 3 + 1] = Math.sin(t) * r * Math.cos(p);
      positions[i * 3 + 2] = Math.sin(p) * r;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  return (
    <group>
      <points geometry={stars}>
        <pointsMaterial size={0.08} color="#6EF0FF" transparent opacity={0.7} />
      </points>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.5]}>
        <ringGeometry args={[20, 60, 96, 1]} />
        <meshBasicMaterial color="#070B14" side={THREE.DoubleSide} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}
