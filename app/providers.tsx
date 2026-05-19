'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'
import { AppProvider } from '@/lib/app-context'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }))
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          {children}
        </AppProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
