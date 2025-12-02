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
}

export const createColumns = ({
  onEdit,
  onDelete,
  onRevokeSession,
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
          Usuario
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
              {user.name || "Sin nombre"}
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
          Rol
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const role = row.getValue("role") as Role;
      return getRoleBadge(role);
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
          Creación
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {formatDate(row.getValue("createdAt"))}
        </div>
      );
    },
  },
  {
    accessorKey: "country",
    header: "País",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {row.getValue("country") || "No especificado"}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Cuenta",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return isActive ? (
        <Badge variant="success">
          <CheckCircle2 className="size-3.5" />
          Activa
        </Badge>
      ) : (
        <Badge variant="destructive">
          <XCircle className="size-3.5" />
          Inactiva
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "authMethods",
    header: "Auth",
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
                  Zoho
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
          Últ. Login
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const lastLogin = row.getValue("lastLoginAt") as Date | null;
      return (
        <div className="text-sm text-muted-foreground">
          {lastLogin ? formatDate(lastLogin) : "Nunca"}
        </div>
      );
    },
  },
  {
    accessorKey: "zohoId",
    header: "Zoho ID",
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
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onEdit(user)}
                className="text-xs sm:text-sm cursor-pointer"
              >
                <PencilLine className="size-3.5" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(user)}
                variant="destructive"
                className="text-xs sm:text-sm cursor-pointer"
              >
                <Trash className="size-3.5" />
                Eliminar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onRevokeSession(user)}
                className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 cursor-pointer"
              >
                <ShieldOff className="size-3.5 text-orange-600 dark:text-orange-400" />
                Revocar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
