import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PriorityStackSchema } from '@/lib/api-contracts'

export async function GET(request: NextRequest) {
  const useAgent = process.env.NEXT_PUBLIC_DATA_MODE === 'agent' || request.nextUrl.searchParams.get('mode') === 'agent'
  if (useAgent) throw new Error('TODO: Phase 4 — wire Bedrock DAILY_BRIEF_AGENT + NBA_SIGNAL_AGENT')

  const rmId = request.nextUrl.searchParams.get('rmId') || 'rm-priya-sharma-001'

  const [priorities, managerAlignment] = await Promise.all([
    prisma.priority.findMany({
      where: { rmId },
      include: { customer: true, prepPacks: true },
      orderBy: { rank: 'asc' },
    }),
    prisma.managerAlignment.findFirst({ where: { rmId }, orderBy: { date: 'desc' } }),
  ])

  const payload = {
    metadata: {
      scoringMethod: 'deal_value × urgency × sentiment_risk',
      managerAligned: true,
      alignedCount: managerAlignment?.alignedCount ?? 0,
    },
    priorities: priorities.map(p => ({
      id: p.id,
      rank: p.rank,
      timeSlot: p.timeSlot,
      customerName: p.customer.name,
      title: p.title,
      description: p.description,
      whyNowLabel: p.whyNow,
      urgencyBadge: p.urgencyBadge,
      status: p.status,
      dealValue: p.dealValue ? Number(p.dealValue) : null,
      priorityScore: p.priorityScore,
      managerAligned: p.managerAligned,
      prepPacks: p.prepPacks.map(pp => ({
        label: pp.label,
        detail: pp.detail,
        badge: pp.badge,
        completed: pp.completed,
      })),
    })),
  }

  const validated = PriorityStackSchema.parse(payload)
  return NextResponse.json(validated)
}
