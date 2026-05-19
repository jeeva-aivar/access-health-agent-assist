import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DebriefSchema } from '@/lib/api-contracts'

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
}

export async function GET(request: NextRequest) {
  const useAgent = process.env.NEXT_PUBLIC_DATA_MODE === 'agent' || request.nextUrl.searchParams.get('mode') === 'agent'
  if (useAgent) throw new Error('TODO: Phase 4 — wire Bedrock DAILY_BRIEF_AGENT')

  const rmId = request.nextUrl.searchParams.get('rmId') || 'rm-priya-sharma-001'

  const debrief = await prisma.dailyDebrief.findFirst({
    where: { rmId },
    include: { timeline: { orderBy: { timeSlot: 'asc' } } },
    orderBy: { date: 'desc' },
  })

  if (!debrief) return NextResponse.json({ error: 'No debrief found' }, { status: 404 })

  const payload = {
    meta: {
      date: formatDate(debrief.date),
      readTimeSeconds: 90,
    },
    headline: debrief.headline,
    stats: {
      customerTimeDisplay: formatTime(debrief.customerTimeMin),
      customerTimeMinutes: debrief.customerTimeMin,
      autoActionsCount: debrief.autoActionsCount,
      slaBreachers: debrief.slaBreachers,
      totalCalls: debrief.totalCalls,
      dealsProgressed: debrief.dealsProgressed,
    },
    timeline: debrief.timeline.map(e => ({
      id: e.id,
      timeSlot: e.timeSlot,
      title: e.title,
      detail: e.detail,
      outcome: e.outcome,
    })),
    tomorrowPreview: debrief.tomorrowPreview,
  }

  const validated = DebriefSchema.parse(payload)
  return NextResponse.json(validated)
}
