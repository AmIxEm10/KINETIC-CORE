'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Background } from './Background';
import { CameraRig } from './CameraRig';
import { Core } from './Core';
import { EchoField } from './EchoField';
import { EnemyManager } from './EnemyManager';
import { OrbitRings } from './OrbitRings';
import { PlacementGhost } from './PlacementGhost';
import { TowerField } from './TowerField';
import { useKineticStore } from '../store';

function Ticker() {
  useFrame((_, dt) => {
    const { tick } = useKineticStore.getState();
    tick(dt);
  });
  return null;
}

export function GameCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 28], fov: 45, near: 0.1, far: 200 }}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#05070C']} />
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 0, 6]} intensity={1.4} color="#6EF0FF" distance={40} decay={1.4} />
      <pointLight position={[10, -8, 6]} intensity={0.6} color="#FF5E3A" distance={30} />
      <Suspense fallback={null}>
        <Background />
        <Core />
        <OrbitRings />
        <EnemyManager />
        <TowerField />
        <EchoField />
        <PlacementGhost />
        <CameraRig />
        <Ticker />
      </Suspense>
    </Canvas>
  );
}
