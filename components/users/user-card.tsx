"use client";

import { useI18n } from "@/lib/i18n/context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserListItem } from "@/interfaces/user";
import { Checkbox } from "@/components/ui/checkbox";
import { getAllRoles, getPrimaryRole } from "@/lib/roles";
import { getInitials, getRoleBadge, formatDateShort } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Trash,
  PencilLine,
  ShieldOff,
  KeyRound,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserCardProps {
  user: UserListItem;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: (user: UserListItem) => void;
  onDelete: (user: UserListItem) => void;
  onRevokeSession: (user: UserListItem) => void;
}

export function UserCard({
  user,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onRevokeSession,
}: UserCardProps) {
  const { t, locale } = useI18n();
  return (
    <Card className="relative">
      <CardHeader className="p-0 px-3 border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              aria-label={t("users.selectUser", {
                name: user.name || user.email,
              })}
              className="mt-1 hidden md:inline-flex"
            />
            <Avatar className="size-16 rounded-lg shrink-0">
              <AvatarImage
                src={user.image || undefined}
                alt={user.name || ""}
                className="object-cover object-center"
              />
              <AvatarFallback className="text-sm font-semibold rounded-lg bg-linear-to-br from-primary/20 to-primary/5">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col max-w-xs overflow-hidden">
              <CardTitle className="text-base truncate font-semibold">
                {user.name || t("users.card.noName")}
              </CardTitle>
              <CardDescription className="truncate">
                {user.email}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0 shrink-0">
                <span className="sr-only">{t("users.openMenu")}</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("users.actions.title")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onEdit(user)}
                className="text-xs sm:text-sm"
              >
                <PencilLine className="size-3.5" />
                {t("users.actions.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onRevokeSession(user)}
                className="text-xs sm:text-sm text-orange-600 dark:text-orange-400"
              >
                <ShieldOff className="size-3.5" />
                {t("users.actions.revokeSession")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(user)}
                variant="destructive"
                className="text-xs sm:text-sm"
              >
                <Trash className="size-3.5" />
                {t("users.actions.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-0 px-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("users.card.role")}
            </p>
            {(() => {
              const allRoles = getAllRoles(user.roles) || "Unknown";
              return (
                <div className="flex flex-wrap gap-1">
                  {allRoles.map((role) => getRoleBadge(role))}
                </div>
              );
            })()}
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("users.card.status")}
            </p>
            {user.isActive ? (
              <Badge
                variant="outline"
                className="gap-1.5 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/50 font-medium"
              >
                <CheckCircle2 className="size-3" />
                {t("users.card.active")}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1.5 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 font-medium"
              >
                <XCircle className="size-3" />
                {t("users.card.inactive")}
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("users.card.auth")}
            </p>
            <div className="flex flex-wrap gap-1">
              {user.authMethods && user.authMethods.length > 0 ? (
                user.authMethods.map((method) => (
                  <Badge
                    key={method}
                    variant="secondary"
                    className="text-xs capitalize"
                  >
                    {method === "zoho" ? (
                      <>
                        <KeyRound className="size-3 mr-1" />
                        {t("users.providers.zoho")}
                      </>
                    ) : (
                      <>
                        <ShieldOff className="size-3 mr-1" />
                        {t("users.providers.email")}
                      </>
                    )}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground italic">
                  {t("users.providers.noAuthMethods")}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("users.card.lastLogin")}
            </p>
            <p className="text-sm font-medium">
              {user.lastLoginAt
                ? formatDateShort(user.lastLoginAt, locale)
                : t("users.card.never")}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("users.card.country")}
            </p>
            <p className="text-sm font-medium">
              {user.country || t("users.card.unspecified")}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("users.card.created")}
            </p>
            <p className="text-sm font-medium">
              {formatDateShort(user.createdAt, locale)}
            </p>
          </div>
          {user.zohoId && (
            <div className="space-y-1 col-span-2">
              <p className="text-xs text-muted-foreground">
                {t("users.card.zohoId")}
              </p>
              <p className="text-xs font-mono bg-muted px-2 py-1 rounded w-fit">
                {user.zohoId}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
