"use client";

import { useSession } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { AlertMessage } from "@/components/alert";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardPageSkeleton } from "@/components/dashboard-skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") return <DashboardPageSkeleton />;

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <AlertMessage variant="destructive" title="Usuario no autenticado" />
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" session={session} />
      <SidebarInset>
        <SiteHeader session={session} />
        <div className="flex flex-1 flex-col w-full">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <main className="flex flex-col gap-4 py-4 md:gap-6">
              {children}
              <Toaster position="bottom-right" richColors />
            </main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
