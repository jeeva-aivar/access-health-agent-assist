import { z } from 'zod'

export const MorningBriefingSchema = z.object({
  rm: z.object({
    name: z.string(),
    loginTime: z.string(),
    date: z.string(),
    cluster: z.string(),
    rank: z.number().nullable(),
    streakDays: z.number(),
    weeklyPoints: z.number(),
  }),
  overnightStats: z.object({
    tier1RepliesSent: z.number(),
    salesforceUpdated: z.number(),
    kycRemindersSent: z.number(),
    timeSavedDisplay: z.string(),
    actionsComplete: z.number(),
    actionsAwaitingReview: z.number(),
  }),
  topPriorities: z.array(z.object({
    id: z.string(),
    rank: z.number(),
    timeSlot: z.string(),
    customerName: z.string(),
    title: z.string(),
    urgencyBadge: z.string(),
    status: z.string(),
    priorityScore: z.number().nullable(),
  })),
  managerAlignment: z.object({
    managerName: z.string(),
    message: z.string(),
    alignedCount: z.number(),
    totalCount: z.number(),
  }),
  tomorrowPreview: z.string(),
})
export type MorningBriefing = z.infer<typeof MorningBriefingSchema>

export const PrepPackSchema = z.object({
  label: z.string(),
  detail: z.string(),
  badge: z.string(),
  completed: z.boolean(),
})

export const PriorityItemSchema = z.object({
  id: z.string(),
  rank: z.number(),
  timeSlot: z.string(),
  customerName: z.string(),
  title: z.string(),
  description: z.string(),
  whyNowLabel: z.string(),
  urgencyBadge: z.string(),
  status: z.string(),
  dealValue: z.number().nullable(),
  priorityScore: z.number().nullable(),
  managerAligned: z.boolean(),
  prepPacks: z.array(PrepPackSchema),
})

export const PriorityStackSchema = z.object({
  metadata: z.object({
    scoringMethod: z.string(),
    managerAligned: z.boolean(),
    alignedCount: z.number(),
  }),
  priorities: z.array(PriorityItemSchema),
})
export type PriorityStack = z.infer<typeof PriorityStackSchema>
export type PriorityItem = z.infer<typeof PriorityItemSchema>

export const ActionItemSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  title: z.string(),
  detail: z.string(),
  status: z.string(),
  category: z.string(),
  agentSource: z.string(),
  customerName: z.string().nullable(),
  actionable: z.boolean(),
})

export const AutoActionsSchema = z.object({
  summary: z.object({
    totalActionsComplete: z.number(),
    totalAwaitingReview: z.number(),
    headline: z.string(),
    subtext: z.string(),
  }),
  stats: z.object({
    tier1RepliesSent: z.number(),
    salesforceUpdated: z.number(),
    kycRemindersSent: z.number(),
    timeSavedDisplay: z.string(),
  }),
  communications: z.array(ActionItemSchema),
  systemUpdates: z.array(ActionItemSchema),
})
export type AutoActions = z.infer<typeof AutoActionsSchema>
export type ActionItem = z.infer<typeof ActionItemSchema>

export const DebriefEventSchema = z.object({
  id: z.string(),
  timeSlot: z.string(),
  title: z.string(),
  detail: z.string(),
  outcome: z.string(),
})

export const DebriefSchema = z.object({
  meta: z.object({
    date: z.string(),
    readTimeSeconds: z.number(),
  }),
  headline: z.string(),
  stats: z.object({
    customerTimeDisplay: z.string(),
    customerTimeMinutes: z.number(),
    autoActionsCount: z.number(),
    slaBreachers: z.number(),
    totalCalls: z.number(),
    dealsProgressed: z.number(),
  }),
  timeline: z.array(DebriefEventSchema),
  tomorrowPreview: z.string(),
})
export type Debrief = z.infer<typeof DebriefSchema>

export const LeaderboardEntrySchema = z.object({
  rank: z.number(),
  name: z.string(),
  points: z.number(),
  streakDays: z.number(),
  delta: z.number(),
  isCurrentUser: z.boolean(),
})

export const LeaderboardSchema = z.object({
  meta: z.object({
    cluster: z.string(),
    totalRMs: z.number(),
    period: z.string(),
  }),
  currentRM: z.object({
    rank: z.number(),
    streakDays: z.number(),
    points: z.number(),
  }),
  rankings: z.array(LeaderboardEntrySchema),
})
export type Leaderboard = z.infer<typeof LeaderboardSchema>
