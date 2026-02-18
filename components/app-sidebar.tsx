"use client";

import Image from "next/image";
import * as React from "react";
import { Session } from "next-auth";
import { hasRole } from "@/lib/roles";
import { Role, User } from "@prisma/client";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { useTranslation } from "@/lib/i18n/context";
import { NavSecondary } from "@/components/nav-secondary";
import { Forklift, ListTodo, Wrench, ClipboardCheck } from "lucide-react";

import {
  IconHelp,
  IconUsers,
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
      {
        title: t("navigation.inspections"),
        url: "/dashboard/inspections",
        icon: ClipboardCheck,
      },
    ],
    navSecondary: [
      {
        title: t("common.help"),
        url: "/dashboard/help",
        icon: IconHelp,
      },
    ],
  };

  const userData = session?.user || data.user;
  const userRoles = session?.user?.roles || [Role.SELLER];

  // Filter navigation items based on user role
  // ADMIN: All routes
  // SELLER: Tasks, Clients, Equipment, Dealers (for assigned visits)
  // INSPECTOR: Tasks, Inspections
  // DEALER: Only Dealers
  const filteredNavMain = data.navMain.filter((item) => {
    // ADMIN can access everything
    if (hasRole(userRoles, Role.ADMIN)) {
      return true;
    }

    // DEALER can only access /dashboard/dealers (unless also has SELLER role)
    if (hasRole(userRoles, Role.DEALER) && !hasRole(userRoles, Role.SELLER)) {
      return item.url === "/dashboard/dealers";
    }

    // SELLER can access Tasks, Clients, Equipment, and Dealers (for assigned visits)
    if (hasRole(userRoles, Role.SELLER)) {
      return (
        item.url === "/dashboard/tasks" ||
        item.url === "/dashboard/clients" ||
        item.url === "/dashboard/equipment" ||
        item.url === "/dashboard/dealers"
      );
    }

    // INSPECTOR can access Tasks and Inspections
    if (hasRole(userRoles, Role.INSPECTOR)) {
      return (
        item.url === "/dashboard/tasks" || item.url === "/dashboard/inspections"
      );
    }

    return false;
  });

  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
      variant="sidebar"
      className="border-r border-border/40"
    >
      <SidebarHeader className="border-b border-border/40 bg-background/30 dark:bg-background/20 px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[slot=sidebar-menu-button]:px-0 data-[slot=sidebar-menu-button]:py-0 hover:bg-transparent"
            >
              <div className="flex items-center gap-2 group outline-none">
                <div className="flex items-center justify-center dark:invert">
                  <Image
                    src="https://res.cloudinary.com/dwjxcpfrf/image/upload/v1768957949/Untitled_design__1_-removebg-preview_t8oji9.png"
                    alt="Combilift"
                    width={100}
                    height={100}
                    className="object-contain object-center"
                    priority
                  />
                </div>
                <div className="grid flex-1 text-left leading-none">
                  <span className="truncate font-bold text-[13px] tracking-tight text-foreground/90">
                    {t("common.appName")}
                  </span>
                  <span className="truncate text-[9px] text-muted-foreground/80 font-medium uppercase tracking-wider mt-0.5">
                    {t("common.shortDescription")}
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <NavMain items={filteredNavMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="border-t border-border/40 bg-background/30 dark:bg-background/20 px-3 py-3">
        <NavUser user={userData as User} />
      </SidebarFooter>
    </Sidebar>
  );
}
