"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
import { Role, UserListItem } from "@/interfaces/user";
import { getInitials, formatDate, getRoleBadge } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  ArrowUpDown,
  MoreHorizontal,
  Trash,
  CheckCircle2,
  XCircle,
  PencilLine,
  ShieldOff,
  KeyRound,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ColumnsConfig {
  onEdit: (user: UserListItem) => void;
  onDelete: (user: UserListItem) => void;
  onRevokeSession: (user: UserListItem) => void;
  t: (key: string) => string;
  locale: string;
}

export const createColumns = ({
  onEdit,
  onDelete,
  onRevokeSession,
  t,
  locale,
}: ColumnsConfig): ColumnDef<UserListItem>[] => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 h-auto py-2"
          >
            {t("users.table.user")}
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-10 rounded-lg">
              <AvatarImage src={user.image || undefined} alt={user.name || ""} />
              <AvatarFallback className="text-sm font-semibold rounded-lg bg-linear-to-br from-primary/20 to-primary/5">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <p className="font-medium text-sm text-foreground">
                {user.name || t("users.card.noName")}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 h-auto py-2"
          >
            {t("users.table.role")}
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const role = row.getValue("role") as Role;
        return getRoleBadge(role, t(`users.roles.${role.toLowerCase()}`));
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 h-auto py-2"
          >
            {t("users.table.created")}
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="text-sm text-muted-foreground">
            {formatDate(row.getValue("createdAt"), locale)}
          </div>
        );
      },
    },
    {
      accessorKey: "country",
      header: t("users.table.country"),
      cell: ({ row }) => {
        return (
          <div className="text-sm text-muted-foreground">
            {row.getValue("country") || t("users.card.unspecified")}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: t("users.table.account"),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return isActive ? (
          <Badge variant="success">
            <CheckCircle2 className="size-3.5" />
            {t("users.card.active")}
          </Badge>
        ) : (
          <Badge variant="destructive">
            <XCircle className="size-3.5" />
            {t("users.card.inactive")}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "authMethods",
      header: t("users.table.provider"),
      cell: ({ row }) => {
        const methods = row.getValue("authMethods") as string[];
        if (!methods || methods.length === 0) {
          return <span className="text-xs text-muted-foreground">-</span>;
        }

        return (
          <div className="flex flex-wrap gap-1">
            {methods.map((method) => (
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
                    Email
                  </>
                )}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "lastLoginAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 h-auto py-2"
          >
            {t("users.table.lastLogin")}
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const lastLogin = row.getValue("lastLoginAt") as Date | null;
        return (
          <div className="text-sm text-muted-foreground">
            {lastLogin ? formatDate(lastLogin, locale) : t("users.card.never")}
          </div>
        );
      },
    },
    {
      accessorKey: "zohoId",
      header: t("users.table.zohoId"),
      cell: ({ row }) => {
        const zohoId = row.getValue("zohoId") as string | null;
        return (
          <div className="text-xs font-mono max-w-[120px] truncate bg-muted px-2 py-1 rounded w-fit">
            {zohoId || "-"}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-8 p-0">
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("users.table.actions")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onEdit(user)}
                  className="text-xs sm:text-sm cursor-pointer"
                >
                  <PencilLine className="size-3.5" />
                  {t("users.actions.edit")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(user)}
                  variant="destructive"
                  className="text-xs sm:text-sm cursor-pointer"
                >
                  <Trash className="size-3.5" />
                  {t("users.actions.delete")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onRevokeSession(user)}
                  className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 cursor-pointer"
                >
                  <ShieldOff className="size-3.5 text-orange-600 dark:text-orange-400" />
                  {t("users.actions.revokeSession")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
