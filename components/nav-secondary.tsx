"use client";

import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: Icon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname();

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => {
            const isActive = pathname.startsWith(item.url);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={cn(
                    "transition-all duration-300 h-9 px-3",
                    isActive
                      ? "bg-primary/8 dark:bg-primary/12 text-primary font-semibold"
                      : "hover:bg-accent/40",
                  )}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <item.icon
                      className={cn(
                        "size-[18px] transition-all duration-300",
                        isActive
                          ? "text-primary scale-110"
                          : "text-muted-foreground/70 group-hover:text-foreground group-hover:scale-110",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[13px] tracking-tight transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-foreground/80 group-hover:text-foreground",
                      )}
                    >
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
