"use client";

import { formatDate } from "@/lib/utils";
import { VisitStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ColumnsConfig, Visit } from "@/interfaces/visits";
import { FORM_TYPE_LABELS, VISIT_STATUS_LABELS } from "@/interfaces/visits";

import {
  MoreHorizontal,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
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

export function createColumns(config?: ColumnsConfig): ColumnDef<Visit>[] {
  const { onView, onEdit, onDelete } = config || {};

  return [
    {
      accessorKey: "formType",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 h-8"
          >
            Tipo de Formulario
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="size-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="size-3" />
            ) : (
              <ArrowUpDown className="size-3" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const formType = row.getValue(
          "formType"
        ) as keyof typeof FORM_TYPE_LABELS;
        return (
          <span className="text-xs sm:text-sm leading-relaxed text-primary">
            {FORM_TYPE_LABELS[formType]}
          </span>
        );
      },
    },
    {
      accessorKey: "visitDate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 h-8"
          >
            Fecha
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="size-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="size-3" />
            ) : (
              <ArrowUpDown className="size-3" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <span className="text-xs sm:text-sm leading-relaxed text-primary">
            {formatDate(row.getValue("visitDate"))}
          </span>
        );
      },
    },

    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 h-8"
          >
            Estado
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="size-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="size-3" />
            ) : (
              <ArrowUpDown className="size-3" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as VisitStatus;
        const variants: Record<
          VisitStatus,
          "default" | "secondary" | "success" | "warning" | "destructive"
        > = {
          BORRADOR: "warning",
          COMPLETADA: "success",
          ENVIADA: "default",
          APROBADA: "success",
          RECHAZADA: "destructive",
        };
        return (
          <Badge variant={variants[status]}>
            {VISIT_STATUS_LABELS[status]}
          </Badge>
        );
      },
    },
    {
      accessorKey: "user",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 h-8"
          >
            Vendedor
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="size-3" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="size-3" />
            ) : (
              <ArrowUpDown className="size-3" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const user = row.original.user;
        return (
          <span className="text-xs sm:text-sm leading-relaxed text-primary">
            {user?.name || user?.email}
          </span>
        );
      },
      sortingFn: (rowA, rowB) => {
        const nameA =
          rowA.original.user?.name || rowA.original.user?.email || "";
        const nameB =
          rowB.original.user?.name || rowB.original.user?.email || "";
        return nameA.localeCompare(nameB);
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const visit = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="size-8 p-0"
                aria-label="Abrir menú"
              >
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {onEdit && (
                <DropdownMenuItem
                  onClick={() => onEdit(visit)}
                  className="cursor-pointer"
                >
                  <PencilLine className="size-4" />
                  Editar
                </DropdownMenuItem>
              )}

              {onView && (
                <DropdownMenuItem
                  onClick={() => onView(visit)}
                  className="cursor-pointer"
                >
                  <ArrowUpRight className="size-4" />
                  Detalles
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(visit)}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="size-4 text-destructive" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
