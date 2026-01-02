"use client";

import React from "react";
import { formatDate } from "@/lib/utils";
import { VisitStatus, VisitFormType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";

import {
  ColumnsConfig,
  Visit,
  VISIT_STATUS_ICONS,
  FORM_TYPE_ICONS,
  VISIT_STATUS_LABELS,
} from "@/interfaces/visits";

import {
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  PencilLine,
  MoreVertical,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ColumnsConfigWithI18n extends ColumnsConfig {
  t: (key: string) => string;
  locale: string;
}

export function createColumns(config: ColumnsConfigWithI18n): ColumnDef<Visit>[] {
  const { onView, onEdit, onDelete, t, locale } = config;

  const formTypeKeys: Record<VisitFormType, string> = {
    ANALISIS_CSS: "css",
    ANALISIS_INDUSTRIAL: "industrial",
    ANALISIS_LOGISTICA: "logistica",
    ANALISIS_STRADDLE_CARRIER: "straddleCarrier",
  };

  const statusKeys: Record<VisitStatus, string> = {
    BORRADOR: "draft",
    COMPLETADA: "completed",
  };

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
            {t("visits.formType")}
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
        const formType = row.getValue("formType") as VisitFormType;
        return (
          <div className="flex items-center gap-2">
            {FORM_TYPE_ICONS[formType] && (
              <span className="inline-flex size-4 items-center justify-center">
                {React.createElement(FORM_TYPE_ICONS[formType])}
              </span>
            )}
            <span className="text-xs sm:text-sm leading-relaxed text-primary">
              {t(`visits.formTypes.${formTypeKeys[formType]}`)}
            </span>
          </div>
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
            {t("visits.visitDate")}
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
            {formatDate(row.getValue("visitDate"), locale)}
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
            {t("visits.status")}
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
        };
        return (
          <Badge variant={variants[status]}>
            {VISIT_STATUS_ICONS[status] && (
              <span className="inline-flex">
                {React.createElement(VISIT_STATUS_ICONS[status], {
                  className: "size-3.5",
                })}
              </span>
            )}
            {t(`visits.statuses.${statusKeys[status]}`)}
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
            {t("visits.seller")}
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
      header: t("table.actions"),
      cell: ({ row }) => {
        const visit = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="size-8 p-0"
                aria-label={t("table.actions")}
              >
                <span className="sr-only">{t("table.actions")}</span>
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("table.actions")}</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {onEdit && (
                <DropdownMenuItem
                  onClick={() => onEdit(visit)}
                  className="cursor-pointer"
                >
                  <PencilLine className="size-4" />
                  {t("visits.editVisit")}
                </DropdownMenuItem>
              )}

              {onView && (
                <DropdownMenuItem
                  onClick={() => onView(visit)}
                  className="cursor-pointer"
                >
                  <ArrowUpRight className="size-4" />
                  {t("visits.viewDetails")}
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(visit)}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="size-4 text-destructive" />
                  {t("visits.deleteVisit")}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
