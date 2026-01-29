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
import { NavSecondary } from "@/components/nav-secondary";

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
  const userRole = session?.user?.role || Role.SELLER;

  // Filter navigation items based on user role
  // ADMIN: All routes
  // SELLER: Tasks, Clients, Equipment, Dealers (for assigned visits)
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

    // SELLER can access Tasks, Clients, Equipment, and Dealers (for assigned visits)
    if (userRole === Role.SELLER) {
      return (
        item.url === "/dashboard/tasks" ||
        item.url === "/dashboard/clients" ||
        item.url === "/dashboard/equipment" ||
        item.url === "/dashboard/dealers"
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
              <Link
                href="/dashboard"
                className="flex items-center gap-2 group outline-none"
              >
                <div className="flex items-center justify-center rounded-lg bg-white dark:bg-neutral-900 p-1.5 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] dark:shadow-none border border-border/50 group-hover:border-primary/30 transition-all duration-300">
                  <Image
                    src="/combilift-logo.webp"
                    alt="Combilift"
                    width={56}
                    height={22}
                    className="object-contain h-4.5 w-auto"
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
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2 py-3">
        <NavMain items={filteredNavMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="border-t border-border/40 bg-background/30 dark:bg-background/20 px-3 py-3">
        <NavUser user={userData as User} />
      </SidebarFooter>
    </Sidebar>
  );
}
