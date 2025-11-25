"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { NavDocuments } from "@/components/nav-documents";
import { NavSecondary } from "@/components/nav-secondary";

import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconUserPlus,
} from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    // {
    //   title: "Ciclo de vida",
    //   url: "/dashboard/lifecycle",
    //   icon: IconListDetails,
    // },
    // {
    //   title: "Analítica",
    //   url: "/dashboard/analytics",
    //   icon: IconChartBar,
    // },
    {
      title: "Proyectos",
      url: "/dashboard/projects",
      icon: IconFolder,
    },
    // {
    //   title: "Equipo",
    //   url: "/dashboard/team",
    //   icon: IconUsers,
    // },
    {
      title: "Usuarios",
      url: "/dashboard/users",
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Configuración",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Obtener ayuda",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Buscar",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Documentos",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Informes",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Asistente",
      url: "#",
      icon: IconFileWord,
    },
  ],
};

export function AppSidebar({
  session,
  ...props
}: React.ComponentProps<typeof Sidebar> & { session?: any }) {
  const userData = session?.user || data.user;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[slot=sidebar-menu-button]:px-2.5 data-[slot=sidebar-menu-button]:py-3"
            >
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <div className="flex items-center justify-center rounded-lg bg-white dark:bg-neutral-900 p-2 shadow-sm border border-border/50 group-hover:shadow-md transition-shadow">
                  <Image
                    src="/combilift-logo.webp"
                    alt="Combilift"
                    width={80}
                    height={32}
                    className="object-contain h-6 w-auto rounded-lg"
                    priority
                  />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-bold text-base tracking-tight">
                    CombiSales
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground font-medium">
                    Combilift Company
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
