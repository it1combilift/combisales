"use client";

import { formatDate } from "@/lib/utils";
import { Visit } from "@/interfaces/visits";
import { VisitStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { FORM_TYPE_LABELS, VISIT_STATUS_LABELS } from "@/interfaces/visits";

import {
  MoreHorizontal,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
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
  onView?: (visit: Visit) => void;
  onDelete?: (visit: Visit) => void;
}

export function createColumns(config?: ColumnsConfig): ColumnDef<Visit>[] {
  const { onView, onDelete } = config || {};

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
              <ArrowUp className="ml-2 size-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 size-4" />
            ) : (
              <ArrowUpDown className="ml-2 size-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const formType = row.getValue(
          "formType"
        ) as keyof typeof FORM_TYPE_LABELS;
        return (
          <Badge variant="info" className="font-normal">
            {FORM_TYPE_LABELS[formType]}
          </Badge>
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
              <ArrowUp className="ml-2 size-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 size-4" />
            ) : (
              <ArrowUpDown className="ml-2 size-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {formatDate(row.getValue("visitDate"))}
          </div>
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
              <ArrowUp className="ml-2 size-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 size-4" />
            ) : (
              <ArrowUpDown className="ml-2 size-4" />
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
              <ArrowUp className="ml-2 size-4" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 size-4" />
            ) : (
              <ArrowUpDown className="ml-2 size-4" />
            )}
          </Button>
        );
      },
      cell: ({ row }) => {
        const user = row.original.user;
        return <div className="text-sm">{user?.name || user?.email}</div>;
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
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {onView && (
                <DropdownMenuItem onClick={() => onView(visit)}>
                  <ArrowUpRight className="size-4" />
                  Detalle
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(visit)}
                  className="text-destructive focus:text-destructive"
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
