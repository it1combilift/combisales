"use client";

import { Badge } from "@/components/ui/badge";
import { Role, User } from "@/interfaces/user";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
import { getInitials, formatDate, getRoleBadge } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  ArrowUpDown,
  MoreHorizontal,
  Trash,
  CheckCircle2,
  XCircle,
  PencilLine,
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
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const createColumns = ({
  onEdit,
  onDelete,
}: ColumnsConfig): ColumnDef<User>[] => [
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
          Fecha de creación
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-sm">{formatDate(row.getValue("createdAt"))}</div>
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
        <Badge
          variant="outline"
          className="gap-1.5 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/50 font-medium"
        >
          <CheckCircle2 className="size-3.5" />
          Activa
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="gap-1.5 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 font-medium"
        >
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
                className="text-xs sm:text-sm"
              >
                <PencilLine className="size-3.5" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(user)}
                variant="destructive"
                className="text-xs sm:text-sm"
              >
                <Trash className="size-3.5" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
