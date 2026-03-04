'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { Map, Compass, LogOut, Plane } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

const navItems = [
  {
    label: 'Viaggi',
    href: '/trips',
    icon: Plane,
    matchPrefix: '/trips',
  },
  {
    label: 'Mappa',
    href: '/map',
    icon: Map,
    matchPrefix: '/map',
  },
]

function AppSidebarHeader() {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  return (
    <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
      <div className={cn('flex items-center gap-3 transition-all', isCollapsed && 'justify-center')}>
        <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
          <Compass className="w-4 h-4 text-primary" strokeWidth={1.5} />
        </div>
        {!isCollapsed && (
          <span className="font-display text-lg font-light tracking-wide text-foreground">
            GruppoViaggi
          </span>
        )}
      </div>
    </SidebarHeader>
  )
}

function AppSidebarFooter() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const initials = user?.display_name
    ? user.display_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (user?.username?.[0] ?? 'U').toUpperCase()

  function handleLogout() {
    logout()
    toast.success('Arrivederci!')
    router.replace('/login')
  }

  return (
    <SidebarFooter className="border-t border-sidebar-border px-3 py-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
              'hover:bg-sidebar-accent text-sidebar-foreground transition-colors text-left group',
              isCollapsed && 'justify-center px-0'
            )}
            aria-label="Menu utente"
          >
            <Avatar className="w-7 h-7 shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.display_name || user?.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  @{user?.username}
                </p>
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-48">
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-destructive focus:text-destructive gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Esci
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  )
}

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <AppSidebarHeader />

      <SidebarContent className="px-2 py-3">
        <SidebarMenu>
          {navItems.map(({ label, href, icon: Icon, matchPrefix }) => {
            const isActive = pathname.startsWith(matchPrefix)
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={label}
                >
                  <Link href={href} aria-current={isActive ? 'page' : undefined}>
                    <Icon
                      className={cn(
                        'shrink-0 transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <span>{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <AppSidebarFooter />
    </Sidebar>
  )
}

export function SidebarToggle({ className }: { className?: string }) {
  return (
    <SidebarTrigger
      className={cn('h-8 w-8', className)}
      aria-label="Apri/chiudi menu laterale"
    />
  )
}
