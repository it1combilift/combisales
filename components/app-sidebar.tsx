"use client";

import Link from "next/link";
import Image from "next/image";
import * as React from "react";
import { Session } from "next-auth";
import { Role, User } from "@prisma/client";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { Forklift, ListTodo } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { NavDocuments } from "@/components/nav-documents";
import { NavSecondary } from "@/components/nav-secondary";

import {
  IconCamera,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconHelp,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconFileWord,
  IconBuildings,
  IconTruckDelivery,
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

export function AppSidebar({
  session,
  ...props
}: React.ComponentProps<typeof Sidebar> & { session?: Session }) {
  const { t } = useTranslation();

  const data = {
    user: {
      name: session?.user?.name || "Unknown User",
      email: session?.user?.email || "unknown@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: t("navigation.tasks"),
        url: "/dashboard/tasks",
        icon: ListTodo,
      },
      {
        title: t("navigation.clients"),
        url: "/dashboard/clients",
        icon: IconBuildings,
      },
      {
        title: t("navigation.equipment"),
        url: "/dashboard/equipment",
        icon: Forklift,
      },
      {
        title: t("navigation.dealers"),
        url: "/dashboard/dealers",
        icon: IconTruckDelivery,
      },
      {
        title: t("navigation.users"),
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
        title: t("common.settings"),
        url: "#",
        icon: IconSettings,
      },
      {
        title: t("common.help"),
        url: "#",
        icon: IconHelp,
      },
      {
        title: t("common.search"),
        url: "#",
        icon: IconSearch,
      },
    ],
    documents: [
      {
        name: t("navigation.documents"),
        url: "#",
        icon: IconDatabase,
      },
      {
        name: t("navigation.reports"),
        url: "#",
        icon: IconReport,
      },
      {
        name: t("navigation.assistant"),
        url: "#",
        icon: IconFileWord,
      },
    ],
  };

  const userData = session?.user || data.user;
  const userRole = session?.user?.role || Role.SELLER;

  // Filter navigation items based on user role
  // ADMIN: All routes
  // SELLER: Tasks, Clients, Equipment
  // DEALER: Only Dealers
  const filteredNavMain = data.navMain.filter((item) => {
    // ADMIN can access everything
    if (userRole === Role.ADMIN) {
      return true;
    }

    // DEALER can only access /dashboard/dealers
    if (userRole === Role.DEALER) {
      return item.url === "/dashboard/dealers";
    }

    // SELLER can access Tasks, Clients, Equipment (not Users, not Dealers)
    if (userRole === Role.SELLER) {
      return (
        item.url === "/dashboard/tasks" ||
        item.url === "/dashboard/clients" ||
        item.url === "/dashboard/equipment"
      );
    }

    return false;
  });

  return (
    <Sidebar collapsible="offcanvas" {...props} variant="sidebar">
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
                    {t("common.appName")}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground font-medium">
                    {t("common.shortDescription")}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData as User} />
      </SidebarFooter>
    </Sidebar>
  );
}
