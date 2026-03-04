'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AppSidebar, SidebarToggle } from '@/components/layout/Sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex items-center gap-3" aria-label="Caricamento in corso" role="status">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4 md:hidden">
          <SidebarToggle />
          <span className="font-display text-base font-light text-foreground">GruppoViaggi</span>
        </header>
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
