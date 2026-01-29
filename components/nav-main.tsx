"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: any;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col">
        <SidebarMenu className="gap-0.5">
          {items.map((item) => {
            const isActive =
              item.url === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.url);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className={cn(
                    "transition-all duration-300 group relative h-9 px-3",
                    isActive
                      ? "bg-primary/8 dark:bg-primary/12 text-primary font-semibold shadow-sm"
                      : "dark:hover:bg-accent/40 hover:bg-gray-200/50",
                  )}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    {isActive && (
                      <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-primary rounded-r-full shadow-[0_0_8px_rgba(var(--primary),0.4)]" />
                    )}
                    {item.icon && (
                      <item.icon
                        className={cn(
                          "size-[18px] transition-all duration-300",
                          isActive
                            ? "text-primary scale-110"
                            : "group-hover:text-foreground group-hover:scale-110",
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "transition-colors text-[13px] tracking-tight",
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
