"use client";

import { useSession } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { AlertMessage } from "@/components/alert";
import { Spinner } from "@/components/ui/spinner";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <AlertMessage variant="destructive" title="No autenticado" />
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <main className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
              <Toaster position="bottom-right" richColors />
            </main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
