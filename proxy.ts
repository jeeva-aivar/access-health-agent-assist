import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth is handled client-side via useSession in AppShell.
// Proxy is a pass-through — CloudFront strips cookies before they reach here.
export function proxy(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/morning-briefing',
    '/priority-stack',
    '/auto-actions',
    '/auto-actions/:id',
    '/daily-debrief',
    '/leaderboard',
    '/portfolio',
    '/portfolio/:id',
    '/consolidated-book',
  ],
}
