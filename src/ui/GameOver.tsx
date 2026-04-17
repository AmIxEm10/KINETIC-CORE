'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useKineticStore } from '@game/store';

export function GameOver() {
  const score = useKineticStore((s) => s.score);
  const wave = useKineticStore((s) => s.wave);
  const kills = useKineticStore((s) => s.kills);
  const start = useKineticStore((s) => s.startGame);

  const [handle, setHandle] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setHandle((prev) => prev || (typeof window !== 'undefined' ? localStorage.getItem('kc-handle') ?? '' : ''));
  }, []);

  const submit = async () => {
    if (!handle.trim() || submitting) return;
    setSubmitting(true);
    try {
      localStorage.setItem('kc-handle', handle.trim());
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: handle.trim(), score, wave })
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-core-bg/90 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-lg border border-core-danger/50 bg-core-panel p-8 text-center shadow-danger"
      >
        <div className="text-xs uppercase tracking-[0.5em] text-core-danger">Core breach</div>
        <h2 className="mt-2 font-display text-5xl font-bold text-core-danger" style={{ textShadow: '0 0 32px #FF2D55' }}>
          KERNEL LOST
        </h2>

        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          <Block label="Score" value={score.toLocaleString()} />
          <Block label="Wave" value={wave.toString()} />
          <Block label="Kills" value={kills.toString()} />
        </div>

        {!submitted ? (
          <div className="mt-6 space-y-3">
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              maxLength={16}
              placeholder="Pilot handle"
              className="w-full rounded-md border border-core-edge bg-core-bg px-4 py-2 text-center font-display text-sm text-core-accent placeholder:text-core-mute focus:border-core-accent focus:outline-none"
            />
            <button
              onClick={submit}
              disabled={!handle.trim() || submitting}
              className="w-full rounded-md border border-core-accent bg-core-accent/10 py-2 font-display text-sm uppercase tracking-widest text-core-accent transition hover:bg-core-accent/20 disabled:opacity-50"
            >
              {submitting ? 'Transmitting…' : 'Upload to Leaderboard'}
            </button>
          </div>
        ) : (
          <div className="mt-6 rounded-md border border-core-accent/40 bg-core-accent/10 px-4 py-3 text-sm text-core-accent">
            Transmission archived.
          </div>
        )}

        <button
          onClick={start}
          className="mt-6 w-full rounded-md border border-core-edge py-2 font-display text-sm uppercase tracking-widest text-core-mute hover:text-core-accent"
        >
          Re-initialize core
        </button>
      </motion.div>
    </motion.div>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-core-edge bg-core-bg/80 px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-core-mute">{label}</div>
      <div className="mt-1 text-xl font-semibold text-core-accent">{value}</div>
    </div>
  );
}
