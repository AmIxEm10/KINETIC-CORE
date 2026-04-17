'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { LeaderboardEntry } from '@game/types';

export function LeaderboardView() {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(async (r) => {
        if (!r.ok) throw new Error(r.statusText);
        return (await r.json()) as { entries: LeaderboardEntry[] };
      })
      .then((data) => setEntries(data.entries))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto mt-24 w-full max-w-2xl rounded-xl border border-core-edge bg-core-panel/90 p-8 shadow-glow backdrop-blur-md"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.5em] text-core-mute">Global ladder</div>
          <h1 className="mt-1 font-display text-3xl font-bold text-core-accent">TOP PILOTS</h1>
        </div>
        <Link
          href="/"
          className="rounded-md border border-core-edge px-4 py-2 text-xs uppercase tracking-widest text-core-mute hover:text-core-accent"
        >
          ← Back
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-md border border-core-edge/60">
        <table className="w-full font-display text-sm">
          <thead className="bg-core-bg/60 text-[10px] uppercase tracking-widest text-core-mute">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Handle</th>
              <th className="px-4 py-2 text-right">Score</th>
              <th className="px-4 py-2 text-right">Wave</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-core-danger">
                  {error}
                </td>
              </tr>
            ) : entries === null ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-core-mute">
                  Loading…
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-core-mute">
                  No transmissions yet. Be the first.
                </td>
              </tr>
            ) : (
              entries.map((e, i) => (
                <tr key={e.id} className="border-t border-core-edge/40 text-core-accent/90">
                  <td className="px-4 py-2 text-core-mute">{(i + 1).toString().padStart(2, '0')}</td>
                  <td className="px-4 py-2">{e.handle}</td>
                  <td className="px-4 py-2 text-right" style={{ textShadow: '0 0 16px #6EF0FF55' }}>
                    {e.score.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right">{e.wave}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
