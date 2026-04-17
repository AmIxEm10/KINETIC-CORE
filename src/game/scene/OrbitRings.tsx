'use client';

import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { TOWERS, WORLD } from '../constants';
import { ringFragment, ringVertex } from '../shaders/ring';
import { useKineticStore } from '../store';

interface RingProps {
  radius: number;
  index: number;
}

function Ring({ radius, index }: RingProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const selectedTower = useKineticStore((s) => s.selectedTower);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uColor: { value: new THREE.Color(selectedTower ? TOWERS[selectedTower].color : '#1B2435') }
    }),
    [selectedTower]
  );

  useFrame((_, dt) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += dt * (1 + index * 0.25);
      matRef.current.uniforms.uIntensity.value = selectedTower ? 0.75 : 0.15;
    }
    if (meshRef.current) {
      meshRef.current.rotation.z += dt * (0.08 + index * 0.04) * (index % 2 === 0 ? 1 : -1);
    }
  });

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    const { selectedTower: sel, hoverSlot } = useKineticStore.getState();
    if (!sel) return;
    const theta = Math.atan2(e.point.y, e.point.x);
    hoverSlot({ ring: index, theta });
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    const { selectedTower: sel, placeTower } = useKineticStore.getState();
    if (!sel) return;
    const theta = Math.atan2(e.point.y, e.point.x);
    placeTower(index, theta);
  };

  return (
    <mesh
      ref={meshRef}
      rotation={[Math.PI / 2, 0, 0]}
      onPointerMove={handlePointerMove}
      onPointerOut={() => useKineticStore.getState().hoverSlot(null)}
      onClick={handleClick}
    >
      <ringGeometry args={[radius - WORLD.ringThickness / 2, radius + WORLD.ringThickness / 2, 128, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={ringVertex}
        fragmentShader={ringFragment}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

export function OrbitRings() {
  return (
    <group>
      {WORLD.rings.map((r, i) => (
        <Ring key={r} radius={r} index={i} />
      ))}
    </group>
  );
}
