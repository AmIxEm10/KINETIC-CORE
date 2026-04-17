'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { TOWERS, WORLD } from '../constants';
import { computeDamage } from '../balance/damage';
import { detonateEchoes } from '../features/echo';
import { computeHarmonics } from '../features/resonance';
import { selectOverclockActive, useKineticStore } from '../store';
import type { TowerInstance } from '../types';
import { enemyHandle } from './EnemyManager';
import { TracerBeams, type Tracer } from './TracerBeams';

const towerHeight = 0.5;

function towerPosition(tower: TowerInstance) {
  const r = WORLD.rings[tower.ring];
  return new THREE.Vector3(Math.cos(tower.theta) * r, Math.sin(tower.theta) * r, towerHeight);
}

function TowerMesh({ tower }: { tower: TowerInstance }) {
  const spec = TOWERS[tower.kind];
  const pos = useMemo(() => towerPosition(tower), [tower]);
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.8;
  });
  return (
    <group position={pos}>
      <group ref={ref}>
        <mesh>
          <cylinderGeometry args={[0.25, 0.45, 0.8, 16]} />
          <meshStandardMaterial color={spec.color} emissive={spec.color} emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[0.4, 0, 0]}>
          <boxGeometry args={[0.6, 0.12, 0.12]} />
          <meshStandardMaterial color="#10151F" emissive={spec.color} emissiveIntensity={0.3} />
        </mesh>
      </group>
      <mesh position={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.45, 0.45, 0.12, 20]} />
        <meshStandardMaterial color="#0F1522" />
      </mesh>
    </group>
  );
}

export function TowerField() {
  const towers = useKineticStore((s) => s.towers);
  const tracersRef = useRef<Tracer[]>([]);
  const cooldowns = useRef<Map<number, number>>(new Map());

  // Update harmonic boosts whenever the towers array changes.
  const harmonics = useMemo(() => computeHarmonics(towers), [towers]);

  useFrame((_, dt) => {
    const store = useKineticStore.getState();
    if (store.phase !== 'playing') return;
    const overclocked = selectOverclockActive(store);

    const now = store.time;
    const fresh: Tracer[] = [];

    for (const tower of towers) {
      const spec = TOWERS[tower.kind];
      const cd = (cooldowns.current.get(tower.id) ?? 0) - dt;
      if (cd > 0) {
        cooldowns.current.set(tower.id, cd);
        continue;
      }

      // Find closest enemy in range.
      const tx = Math.cos(tower.theta) * WORLD.rings[tower.ring];
      const ty = Math.sin(tower.theta) * WORLD.rings[tower.ring];

      let target: (typeof enemyHandle.enemies)[number] | null = null;
      let best = spec.range * spec.range;
      for (const e of enemyHandle.enemies) {
        if (!e.alive) continue;
        const ex = Math.cos(e.theta) * e.radius;
        const ey = Math.sin(e.theta) * e.radius;
        const dx = ex - tx;
        const dy = ey - ty;
        const d2 = dx * dx + dy * dy;
        if (d2 < best) {
          best = d2;
          target = e;
        }
      }
      if (!target) continue;

      const harmonicBoost = harmonics.boosts[tower.id] ?? 0;
      const damage = computeDamage(target, {
        base: spec.damage * tower.level,
        kind: spec.damageKind,
        overclock: overclocked,
        harmonicBoost,
        pierce: tower.kind === 'laser' ? 4 : 0
      });

      enemyHandle.damageEnemy(target.id, damage.final);

      // Slow towers mark the target.
      if (spec.slow > 0) {
        target.slowUntil = now + 1.5;
      }

      // AoE splash.
      if (spec.aoe > 0) {
        const aoe2 = spec.aoe * spec.aoe;
        const ex = Math.cos(target.theta) * target.radius;
        const ey = Math.sin(target.theta) * target.radius;
        for (const e of enemyHandle.enemies) {
          if (!e.alive || e.id === target.id) continue;
          const dx = Math.cos(e.theta) * e.radius - ex;
          const dy = Math.sin(e.theta) * e.radius - ey;
          if (dx * dx + dy * dy <= aoe2) {
            enemyHandle.damageEnemy(e.id, damage.final * 0.55);
          }
        }
      }

      // Kinetic Echo detonations.
      const ex = Math.cos(target.theta) * target.radius;
      const ey = Math.sin(target.theta) * target.radius;
      const echoRes = detonateEchoes(enemyHandle.echoes, { x: ex, y: ey }, enemyHandle.enemies);
      enemyHandle.echoes.length = 0;
      enemyHandle.echoes.push(...echoRes.remaining);
      for (const id of echoRes.damagedIds) {
        enemyHandle.damageEnemy(id, 35);
      }

      fresh.push({
        ax: tx,
        ay: ty,
        bx: ex,
        by: ey,
        color: spec.color,
        expiresAt: now + 0.12
      });

      cooldowns.current.set(tower.id, 1 / spec.fireRate);
    }

    if (fresh.length > 0) {
      tracersRef.current = [...tracersRef.current.filter((t) => t.expiresAt > now), ...fresh];
    } else {
      tracersRef.current = tracersRef.current.filter((t) => t.expiresAt > now);
    }
  });

  return (
    <group>
      {towers.map((t) => (
        <TowerMesh key={t.id} tower={t} />
      ))}
      <TracerBeams getTracers={() => tracersRef.current} />
      <HarmonicLinks towers={towers} links={harmonics.links} />
    </group>
  );
}

function HarmonicLinks({
  towers,
  links
}: {
  towers: TowerInstance[];
  links: ReturnType<typeof computeHarmonics>['links'];
}) {
  const byId = useMemo(() => new Map(towers.map((t) => [t.id, t])), [towers]);
  return (
    <group>
      {links.map((link) => {
        const a = byId.get(link.a);
        const b = byId.get(link.b);
        if (!a || !b) return null;
        const pa = towerPosition(a);
        const pb = towerPosition(b);
        const mid = pa.clone().add(pb).multiplyScalar(0.5);
        const dir = pb.clone().sub(pa);
        const len = dir.length();
        const angle = Math.atan2(dir.y, dir.x);
        return (
          <mesh key={`${link.a}-${link.b}`} position={mid} rotation={[0, 0, angle]}>
            <boxGeometry args={[len, 0.05, 0.05]} />
            <meshBasicMaterial color="#6EF0FF" transparent opacity={0.4 + link.strength * 0.4} />
          </mesh>
        );
      })}
    </group>
  );
}
