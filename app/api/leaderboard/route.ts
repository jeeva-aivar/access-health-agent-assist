import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LeaderboardSchema } from '@/lib/api-contracts'

export async function GET(request: NextRequest) {
  const useAgent = process.env.NEXT_PUBLIC_DATA_MODE === 'agent' || request.nextUrl.searchParams.get('mode') === 'agent'
  if (useAgent) throw new Error('TODO: Phase 4 — wire Bedrock MIS_AGENT')

  const rmId = request.nextUrl.searchParams.get('rmId') || 'rm-priya-sharma-001'
  const period = request.nextUrl.searchParams.get('period') || 'THIS_WEEK'

  const [rm, rankings] = await Promise.all([
    prisma.rM.findUnique({ where: { id: rmId } }),
    prisma.leaderboard.findMany({
      where: { rmId, period },
      orderBy: { rank: 'asc' },
    }),
  ])

  if (!rm) return NextResponse.json({ error: 'RM not found' }, { status: 404 })

  const currentEntry = rankings.find(r => r.isCurrentUser)

  const payload = {
    meta: {
      cluster: rm.cluster,
      totalRMs: 28,
      period,
    },
    currentRM: {
      rank: currentEntry?.rank ?? rm.rank ?? 0,
      streakDays: currentEntry?.streakDays ?? rm.streakDays,
      points: currentEntry?.points ?? rm.weeklyPoints,
    },
    rankings: rankings.map(r => ({
      rank: r.rank,
      name: r.rmName,
      points: r.points,
      streakDays: r.streakDays,
      delta: r.delta,
      isCurrentUser: r.isCurrentUser,
    })),
  }

  const validated = LeaderboardSchema.parse(payload)
  return NextResponse.json(validated)
}
