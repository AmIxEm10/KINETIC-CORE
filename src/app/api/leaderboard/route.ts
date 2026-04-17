import { NextResponse } from 'next/server';
import { getLeaderboard, submitScore } from '@/server/leaderboard-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const entries = await getLeaderboard();
  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (
      typeof body?.handle !== 'string' ||
      typeof body?.score !== 'number' ||
      typeof body?.wave !== 'number'
    ) {
      return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
    }
    const handle = body.handle.slice(0, 16).trim();
    if (!handle) return NextResponse.json({ error: 'handle required' }, { status: 400 });

    const entry = await submitScore({
      handle,
      score: Math.max(0, Math.floor(body.score)),
      wave: Math.max(0, Math.floor(body.wave))
    });
    return NextResponse.json({ entry });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
