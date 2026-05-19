import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MorningBriefingSchema } from '@/lib/api-contracts'

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

export async function GET(request: NextRequest) {
  const useAgent = process.env.NEXT_PUBLIC_DATA_MODE === 'agent' || request.nextUrl.searchParams.get('mode') === 'agent'
  if (useAgent) throw new Error('TODO: Phase 4 — wire Bedrock DAILY_BRIEF_AGENT')

  const rmId = request.nextUrl.searchParams.get('rmId') || 'rm-priya-sharma-001'

  const [rm, overnightStats, priorities, managerAlignment] = await Promise.all([
    prisma.rM.findUnique({ where: { id: rmId } }),
    prisma.overnightStats.findFirst({ where: { rmId }, orderBy: { date: 'desc' } }),
    prisma.priority.findMany({
      where: { rmId },
      include: { customer: true },
      orderBy: { rank: 'asc' },
      take: 4,
    }),
    prisma.managerAlignment.findFirst({ where: { rmId }, orderBy: { date: 'desc' } }),
  ])

  if (!rm || !overnightStats) return NextResponse.json({ error: 'RM not found' }, { status: 404 })

  const payload = {
    rm: {
      name: rm.name,
      loginTime: '06:30',
      date: 'Wednesday, 8 May 2026',
      cluster: rm.cluster,
      rank: rm.rank,
      streakDays: rm.streakDays,
      weeklyPoints: rm.weeklyPoints,
    },
    overnightStats: {
      tier1RepliesSent: overnightStats.tier1RepliesSent,
      salesforceUpdated: overnightStats.salesforceUpdated,
      kycRemindersSent: overnightStats.kycRemindersSent,
      timeSavedDisplay: formatTime(overnightStats.timeSavedMinutes),
      actionsComplete: overnightStats.actionsComplete,
      actionsAwaitingReview: overnightStats.actionsAwaitingReview,
    },
    topPriorities: priorities.map(p => ({
      id: p.id,
      rank: p.rank,
      timeSlot: p.timeSlot,
      customerName: p.customer.name,
      title: p.title,
      urgencyBadge: p.urgencyBadge,
      status: p.status,
      priorityScore: p.priorityScore,
    })),
    managerAlignment: {
      managerName: managerAlignment?.managerName ?? 'Michael Reed',
      message: managerAlignment?.message ?? '',
      alignedCount: managerAlignment?.alignedCount ?? 0,
      totalCount: managerAlignment?.totalCount ?? 0,
    },
    tomorrowPreview: '3 customer calls before lunch · Patel renewal docs land overnight · Diwali greetings ready for your review at 09:15.',
  }

  const validated = MorningBriefingSchema.parse(payload)
  return NextResponse.json(validated)
}
