"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { getRoleBadge } from "@/lib/utils";
import { Role, User } from "@prisma/client";
import { useI18n } from "@/lib/i18n/context";
import { getAllRoles, getPrimaryRole } from "@/lib/roles";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser({ user }: { user: User }) {
  const { isMobile } = useSidebar();
  const { t } = useI18n();

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const userImage = user.image || null;
  const userName = user.name || "Usuario";
  const userEmail = user.email || "email@example.com";
  const userRole = getPrimaryRole(user.roles) || Role.SELLER;
  const userCountry = user.country || "";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-accent/40 cursor-pointer hover:bg-accent/40 h-11 w-full transition-all duration-300 px-0">
              <Avatar className="size-8 rounded-lg border border-border/40 shadow-sm">
                <AvatarImage
                  src={userImage || undefined}
                  alt={userName}
                  className="object-cover object-center"
                />
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left text-sm leading-tight flex-1 min-w-0">
                <span className="truncate font-semibold text-sm">
                  {userName}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {userEmail}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={`${isMobile ? "w-full ml-2 mb-2" : "w-auto"} bg-popover p-0 rounded-lg shadow-lg`}
            side={isMobile ? "top" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 px-2 py-2 text-left text-sm">
                <Avatar className="h-9 w-9 rounded-lg border border-border/50">
                  <AvatarImage
                    src={userImage || undefined}
                    alt={userName}
                    className="object-cover object-center"
                  />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{userName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {userEmail}
                  </span>
                  {userCountry && (
                    <span className="text-muted-foreground truncate text-xs mt-0.5">
                      {userCountry}
                    </span>
                  )}
                  <div className="mt-1.5 flex items-center gap-1">
                    {getAllRoles(user.roles).map((role) => getRoleBadge(role))}
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer">
                  <IconUserCircle className="size-4" />
                  {t("profile.title")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <IconLogout className="size-4" />
              {t("common.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
