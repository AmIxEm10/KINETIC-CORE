'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { WORLD } from '../constants';
import { coreFragment, coreVertex } from '../shaders/core';
import { selectOverclockActive, useKineticStore } from '../store';

const tensionFromStore = (s: ReturnType<typeof useKineticStore.getState>) => {
  const waveTension = Math.min(1, s.wave / 12);
  const hpTension = 1 - s.coreHp / 100;
  return Math.max(waveTension, hpTension);
};

export function Core() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTension: { value: 0 },
      uOverclock: { value: 0 },
      uColorA: { value: new THREE.Color('#0C1A2E') },
      uColorB: { value: new THREE.Color('#6EF0FF') }
    }),
    []
  );

  useFrame((_, dt) => {
    const state = useKineticStore.getState();
    const active = selectOverclockActive(state);
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += dt;
      matRef.current.uniforms.uTension.value = tensionFromStore(state);
      matRef.current.uniforms.uOverclock.value = active ? 1 : 0;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += dt * 0.2;
      meshRef.current.rotation.x += dt * 0.05;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[WORLD.coreRadius, 5]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={coreVertex}
          fragmentShader={coreFragment}
          uniforms={uniforms}
        />
      </mesh>

      {/* Soft outer halo */}
      <mesh>
        <sphereGeometry args={[WORLD.coreRadius * 1.35, 48, 48]} />
        <meshBasicMaterial color="#6EF0FF" transparent opacity={0.06} depthWrite={false} />
      </mesh>
    </group>
  );
}
