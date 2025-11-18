"use client"

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { DashboardProvider, useDashboard } from '@/components/dashboard-context'
import { DashboardSection } from '@/components/dashboard-sections/dashboard-section'
import { LifecycleSection } from '@/components/dashboard-sections/lifecycle-section'
import { AnalyticsSection } from '@/components/dashboard-sections/analytics-section'
import { ProjectsSection } from '@/components/dashboard-sections/projects-section'
import { TeamSection } from '@/components/dashboard-sections/team-section'

function DashboardContent() {
  const { activeSection } = useDashboard()

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {activeSection === 'dashboard' && <DashboardSection />}
          {activeSection === 'lifecycle' && <LifecycleSection />}
          {activeSection === 'analytics' && <AnalyticsSection />}
          {activeSection === 'projects' && <ProjectsSection />}
          {activeSection === 'team' && <TeamSection />}
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <DashboardProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <DashboardContent />
        </SidebarInset>
      </SidebarProvider>
    </DashboardProvider>
  )
}
