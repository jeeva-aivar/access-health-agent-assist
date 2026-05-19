'use client'
import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MOCK } from './mock-data'

const SCREEN_PATHS: Record<string, string> = {
  briefing:    '/morning-briefing',
  priority:    '/priority-stack',
  actions:     '/auto-actions',
  debrief:     '/daily-debrief',
  leaderboard: '/leaderboard',
}

interface AppState {
  priorities: typeof MOCK.priorities
  comms: typeof MOCK.comms
  sys: typeof MOCK.systemUpdates
  sessionPoints: number
  kapoorReassigned: boolean
  preparedIds: string[]
  focusPriority: string | null
}

interface AppCtxType {
  state: AppState
  setState: (fn: (s: AppState) => AppState) => void
  navigate: (screen: string) => void
  openPriority: (n: string) => void
  toast: (msg: string) => void
  toastMsg: string | null
  bumpPoints: (n: number) => void
  setKapoor: (val: boolean) => void
  markPrepared: (n: string) => void
}

const AppCtx = createContext<AppCtxType | null>(null)
export const useApp = () => useContext(AppCtx)!

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [state, setStateRaw] = useState<AppState>({
    priorities: MOCK.priorities,
    comms: MOCK.comms,
    sys: MOCK.systemUpdates,
    sessionPoints: 0,
    kapoorReassigned: false,
    preparedIds: [],
    focusPriority: null,
  })
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const setState = useCallback((fn: (s: AppState) => AppState) => {
    setStateRaw(fn)
  }, [])

  const navigate = useCallback((screen: string) => {
    const path = SCREEN_PATHS[screen]
    if (path) router.push(path)
  }, [router])

  const openPriority = useCallback((n: string) => {
    setStateRaw(s => ({ ...s, focusPriority: n }))
  }, [])

  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), 2500)
  }, [])

  const bumpPoints = useCallback((n: number) => {
    setStateRaw(s => ({ ...s, sessionPoints: s.sessionPoints + n }))
  }, [])

  const setKapoor = useCallback((val: boolean) => {
    setStateRaw(s => ({ ...s, kapoorReassigned: val }))
  }, [])

  const markPrepared = useCallback((n: string) => {
    setStateRaw(s => ({ ...s, preparedIds: [...s.preparedIds, n] }))
  }, [])

  return (
    <AppCtx.Provider value={{ state, setState, navigate, openPriority, toast, toastMsg, bumpPoints, setKapoor, markPrepared }}>
      {children}
    </AppCtx.Provider>
  )
}
