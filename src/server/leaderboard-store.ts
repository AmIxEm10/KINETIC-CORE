import { randomUUID } from 'node:crypto';
import type { LeaderboardEntry } from '@game/types';

/**
 * Mock leaderboard store.
 *
 * Uses a process-scoped in-memory set seeded with a handful of bot entries so
 * the UI looks populated on first boot. Swap this file for a Postgres/Redis
 * client to wire up production persistence — the API contract stays identical.
 */

const g = globalThis as unknown as { __kineticLeaderboard?: LeaderboardEntry[] };

function seed(): LeaderboardEntry[] {
  const now = Date.now();
  return [
    { id: randomUUID(), handle: 'AEGIS-01', score: 48320, wave: 23, createdAt: now - 86_400_000 },
    { id: randomUUID(), handle: 'HYPERION', score: 39210, wave: 19, createdAt: now - 3_600_000 * 5 },
    { id: randomUUID(), handle: 'NYXA', score: 27180, wave: 15, createdAt: now - 3_600_000 * 2 },
    { id: randomUUID(), handle: 'PHAZE', score: 18440, wave: 12, createdAt: now - 1_800_000 },
    { id: randomUUID(), handle: 'KYRIA', score: 11230, wave: 9, createdAt: now - 600_000 }
  ];
}

function store(): LeaderboardEntry[] {
  if (!g.__kineticLeaderboard) g.__kineticLeaderboard = seed();
  return g.__kineticLeaderboard;
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const all = store().slice().sort((a, b) => b.score - a.score);
  return all.slice(0, limit);
}

export async function submitScore(input: {
  handle: string;
  score: number;
  wave: number;
}): Promise<LeaderboardEntry> {
  const entry: LeaderboardEntry = {
    id: randomUUID(),
    handle: input.handle,
    score: input.score,
    wave: input.wave,
    createdAt: Date.now()
  };
  store().push(entry);
  if (store().length > 250) {
    g.__kineticLeaderboard = store()
      .sort((a, b) => b.score - a.score)
      .slice(0, 200);
  }
  return entry;
}
