"use client"

import { getInitials } from '@/lib/utils'
import { ModeToggle } from './mode-toggle'
import { usePathname } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function SiteHeader({ session }: { session?: any }) {
  const pathname = usePathname()

  const getTitleFromPath = (path: string) => {
    if (path === '/dashboard') return 'Dashboard'
    if (path.includes('/lifecycle')) return 'Lifecycle'
    if (path.includes('/analytics')) return 'Analytics'
    if (path.includes('/projects')) return 'Projects'
    if (path.includes('/team')) return 'Team'
    if (path.includes('/profile')) return 'Cuenta'
    return 'Dashboard'
  }

  const userName = session?.user?.name || 'Usuario'
  const userEmail = session?.user?.email || ''

  return (
    <header className="flex shrink-0 items-center gap-2 rounded-t-2xl border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 py-1">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-semibold">{getTitleFromPath(pathname)}</h1>

        <div className="ml-auto flex items-center gap-3">
          {session?.user && (
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
              <Avatar className="h-7 w-7">
                <AvatarImage src={session.user.image || undefined} alt={userName} />
                <AvatarFallback className="text-xs font-medium">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium">{userName}</span>
                <span className="text-xs text-muted-foreground">{userEmail}</span>
              </div>
            </div>
          )}

          <Separator
            orientation="vertical"
            className="h-6 hidden md:block"
          />

          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
