'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ENEMY_STATS, WORLD } from '../constants';
import { Echo, pruneEchoes, spawnEcho } from '../features/echo';
import { generateWave } from '../balance/waves';
import { selectOverclockActive, useKineticStore } from '../store';
import type { EnemyInstance, EnemyKind } from '../types';

const MAX_ENEMIES = 5000;
const KIND_COLORS: Record<EnemyKind, THREE.Color> = {
  scout: new THREE.Color('#FF2D55'),
  tank: new THREE.Color('#FF5E3A'),
  boss: new THREE.Color('#FFB020'),
  splinter: new THREE.Color('#FF7BD9')
};

interface EnemyHandle {
  enemies: EnemyInstance[];
  echoes: Echo[];
  damageEnemy: (id: number, dmg: number) => boolean;
}

// Module-scope handle so towers can query/apply damage without prop drilling.
export const enemyHandle: EnemyHandle = {
  enemies: [],
  echoes: [],
  damageEnemy: () => false
};

let _eId = 1;

export function EnemyManager() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pool = useRef<EnemyInstance[]>([]);
  const echoes = useRef<Echo[]>([]);
  const spawnAccum = useRef(0);
  const waveAccum = useRef(0);
  const currentWaveRef = useRef(useKineticStore.getState().wave || 1);

  useEffect(() => {
    enemyHandle.enemies = pool.current;
    enemyHandle.echoes = echoes.current;
    enemyHandle.damageEnemy = (id, dmg) => {
      const target = pool.current.find((e) => e.id === id && e.alive);
      if (!target) return false;
      target.hp -= dmg;
      if (target.hp <= 0) {
        target.alive = false;
        const cx = Math.cos(target.theta) * target.radius;
        const cy = Math.sin(target.theta) * target.radius;
        echoes.current.push(spawnEcho({ x: cx, y: cy }, useKineticStore.getState().time));
        useKineticStore.getState().registerKill(ENEMY_STATS[target.kind].bounty);
      }
      useKineticStore.getState().registerDamageDealt(dmg);
      return true;
    };
  }, []);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const store = useKineticStore.getState();
    if (store.phase !== 'playing') return;

    const overclocked = selectOverclockActive(store);
    const slowFactor = overclocked ? 0.55 : 1;

    // --- Spawn loop ---
    spawnAccum.current += dt;
    waveAccum.current += dt;
    const wave = generateWave(currentWaveRef.current, 42);

    if (waveAccum.current > wave.duration) {
      waveAccum.current = 0;
      currentWaveRef.current += 1;
      useKineticStore.setState({ wave: currentWaveRef.current, credits: store.credits + 60 });
    }

    const spawnInterval = 1 / wave.spawnRate;
    while (spawnAccum.current >= spawnInterval && pool.current.length < MAX_ENEMIES) {
      spawnAccum.current -= spawnInterval;

      // Pick a kind weighted by wave composition.
      const roll = Math.random();
      let acc = 0;
      const total = wave.composition.reduce((a, c) => a + c.count, 0);
      let picked: EnemyKind = 'scout';
      for (const slot of wave.composition) {
        acc += slot.count / total;
        if (roll <= acc) {
          picked = slot.kind;
          break;
        }
      }

      const stats = ENEMY_STATS[picked];
      const hp = stats.hp * wave.scalar;
      pool.current.push({
        id: _eId++,
        kind: picked,
        theta: Math.random() * Math.PI * 2,
        radius: WORLD.spawnRadius + Math.random() * 2,
        hp,
        maxHp: hp,
        speed: stats.speed,
        armor: stats.armor,
        shield: stats.shield,
        alive: true,
        slowUntil: 0,
        echoCharge: 0
      });
    }

    // --- Update loop ---
    const mesh = meshRef.current;
    if (!mesh) return;

    const killRadius = WORLD.killRadius;
    let visibleCount = 0;

    for (let i = 0; i < pool.current.length; i++) {
      const e = pool.current[i];
      if (!e.alive) continue;
      const slow = e.slowUntil > store.time ? 0.4 : 1;
      e.radius -= e.speed * dt * slow * slowFactor;
      if (e.radius <= killRadius) {
        e.alive = false;
        useKineticStore.getState().damageCore(e.maxHp * 0.05);
        continue;
      }

      const x = Math.cos(e.theta) * e.radius;
      const y = Math.sin(e.theta) * e.radius;
      const stats = ENEMY_STATS[e.kind];
      dummy.position.set(x, y, 0);
      dummy.scale.setScalar(stats.radius * 2);
      dummy.updateMatrix();
      mesh.setMatrixAt(visibleCount, dummy.matrix);
      mesh.setColorAt(visibleCount, KIND_COLORS[e.kind]);
      visibleCount++;
    }

    mesh.count = visibleCount;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    // Prune dead enemies & expired echoes occasionally to keep the pool lean.
    if (pool.current.length > 400 || (Math.random() < 0.1 && pool.current.length > 0)) {
      pool.current = pool.current.filter((e) => e.alive);
      enemyHandle.enemies = pool.current;
    }
    echoes.current = pruneEchoes(echoes.current, store.time);
    enemyHandle.echoes = echoes.current;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_ENEMIES]} frustumCulled={false}>
      <sphereGeometry args={[0.25, 10, 10]} />
      <meshStandardMaterial emissive="#FF2D55" emissiveIntensity={1.6} color="#2a0510" />
    </instancedMesh>
  );
}
