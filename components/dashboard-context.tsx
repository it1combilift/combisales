"use client"

import * as React from "react"

type DashboardSection = "dashboard" | "lifecycle" | "analytics" | "projects" | "team"

interface DashboardContextType {
  activeSection: DashboardSection
  setActiveSection: (section: DashboardSection) => void
}

const DashboardContext = React.createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = React.useState<DashboardSection>("dashboard")

  return (
    <DashboardContext.Provider value={{ activeSection, setActiveSection }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = React.useContext(DashboardContext)
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}
