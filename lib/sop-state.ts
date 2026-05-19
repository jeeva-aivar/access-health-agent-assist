// Client-side fallback for SOP step state.
// Used only if the backend doesn't emit a sop_state event.
// Walks the transcript turns in order and advances `currentStepIndex` each
// time a step's completionCue matches an agent or customer turn.

import type { SopWorkflow } from './sop-rcm'

export interface SopState {
  currentStepIndex: number
  completedStepIds: string[]
}

export function inferSopState(
  workflow: SopWorkflow,
  turnTexts: string[],
): SopState {
  let idx = 0
  const completed: string[] = []
  for (const text of turnTexts) {
    while (idx < workflow.steps.length && workflow.steps[idx].completionCue.test(text)) {
      completed.push(workflow.steps[idx].id)
      idx += 1
    }
    if (idx >= workflow.steps.length) break
  }
  return {
    currentStepIndex: Math.min(idx, workflow.steps.length - 1),
    completedStepIds: completed,
  }
}

export function stepStatus(
  workflow: SopWorkflow,
  state: SopState,
  stepIndex: number,
): 'done' | 'current' | 'pending' {
  if (state.completedStepIds.includes(workflow.steps[stepIndex].id)) return 'done'
  if (stepIndex === state.currentStepIndex) return 'current'
  return 'pending'
}
