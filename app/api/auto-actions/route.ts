import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AutoActionsSchema } from '@/lib/api-contracts'

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

export async function GET(request: NextRequest) {
  const useAgent = process.env.NEXT_PUBLIC_DATA_MODE === 'agent' || request.nextUrl.searchParams.get('mode') === 'agent'
  if (useAgent) throw new Error('TODO: Phase 4 — wire Bedrock EMAIL_AGENT + KYC_AGENT')

  const rmId = request.nextUrl.searchParams.get('rmId') || 'rm-priya-sharma-001'

  const [autoActions, overnightStats] = await Promise.all([
    prisma.autoAction.findMany({
      where: { rmId },
      include: { customer: true },
      orderBy: { timestamp: 'asc' },
    }),
    prisma.overnightStats.findFirst({ where: { rmId }, orderBy: { date: 'desc' } }),
  ])

  const comms = autoActions.filter(a => a.column === 'COMMUNICATIONS')
  const sys = autoActions.filter(a => a.column === 'SYSTEM_UPDATES')

  const toItem = (a: typeof autoActions[0]) => ({
    id: a.id,
    timestamp: a.timestamp,
    title: a.title,
    detail: a.detail,
    status: a.status,
    category: a.category,
    agentSource: a.agentSource,
    customerName: a.customer?.name ?? null,
    actionable: a.actionable,
  })

  const payload = {
    summary: {
      totalActionsComplete: overnightStats?.actionsComplete ?? 0,
      totalAwaitingReview: overnightStats?.actionsAwaitingReview ?? 0,
      headline: `${overnightStats?.actionsComplete ?? 0} things Live assist handled overnight.`,
      subtext: 'Allow all, or review individually. Anything you reject becomes a rule.',
    },
    stats: {
      tier1RepliesSent: overnightStats?.tier1RepliesSent ?? 0,
      salesforceUpdated: overnightStats?.salesforceUpdated ?? 0,
      kycRemindersSent: overnightStats?.kycRemindersSent ?? 0,
      timeSavedDisplay: formatTime(overnightStats?.timeSavedMinutes ?? 0),
    },
    communications: comms.map(toItem),
    systemUpdates: sys.map(toItem),
  }

  const validated = AutoActionsSchema.parse(payload)
  return NextResponse.json(validated)
}
