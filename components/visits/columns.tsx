"use client";

import React from "react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { VisitStatus, VisitFormType, Role } from "@prisma/client";

import {
  ColumnsConfig,
  Visit,
  VISIT_STATUS_ICONS,
  FORM_TYPE_ICONS,
} from "@/interfaces/visits";

import {
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  PencilLine,
  MoreVertical,
  Split,
  Eye,
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
  userRole?: Role | null;
  onClone?: (visit: Visit) => void;
  onViewForm?: (visit: Visit) => void;
}

export function createColumns(
  config: ColumnsConfigWithI18n,
): ColumnDef<Visit>[] {
  const { onView, onEdit, onDelete, onClone, onViewForm, t, locale, userRole } =
    config;

  const isSeller = userRole === Role.SELLER;
  const isDealer = userRole === Role.DEALER;
  const isAdmin = userRole === Role.ADMIN;

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
    // Show clone status column only for SELLER
    ...(isSeller
      ? [
          {
            id: "cloneStatus",
            header: t("visits.type"),
            cell: ({ row }: { row: { original: Visit } }) => {
              const visit = row.original;
              const isClone = !!visit.clonedFromId;
              return (
                <Badge
                  variant={isClone ? "outline-success" : "outline-info"}
                  className="flex items-center gap-1"
                >
                  {isClone && <Split className="size-3.5" />}
                  {isClone
                    ? t("dealerPage.seller.clonedBadge")
                    : t("dealerPage.seller.originalBadge")}
                </Badge>
              );
            },
          } as ColumnDef<Visit>,
        ]
      : []),
    // Dynamic columns based on user role:
    // - SELLER: Shows the Dealer who created/assigned the visit
    // - DEALER: Shows the Assigned Seller (P. Manager)
    // - ADMIN: Shows both Dealer and Assigned Seller

    // Column: Dealer (visible to SELLER and ADMIN)
    // For cloned visits, show the original dealer (from clonedFrom.user)
    ...(isSeller || isAdmin
      ? [
          {
            id: "dealer",
            accessorKey: "user",
            header: ({
              column,
            }: {
              column: {
                toggleSorting: (desc: boolean) => void;
                getIsSorted: () => "asc" | "desc" | false;
              };
            }) => {
              return (
                <Button
                  variant="ghost"
                  onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                  }
                  className="-ml-4 h-8"
                >
                  {t("dealerPage.columns.dealer")}
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
            cell: ({ row }: { row: { original: Visit } }) => {
              const visit = row.original;
              // For cloned visits, show the original dealer from clonedFrom.user
              // For original visits, show the visit.user (dealer)
              const dealer =
                visit.clonedFromId && visit.clonedFrom?.user
                  ? visit.clonedFrom.user
                  : visit.user;
              return (
                <span className="text-xs sm:text-sm leading-relaxed text-primary">
                  {dealer?.name || dealer?.email || "-"}
                </span>
              );
            },
            sortingFn: (
              rowA: { original: Visit },
              rowB: { original: Visit },
            ) => {
              const getDealerName = (visit: Visit) => {
                const dealer =
                  visit.clonedFromId && visit.clonedFrom?.user
                    ? visit.clonedFrom.user
                    : visit.user;
                return dealer?.name || dealer?.email || "";
              };
              return getDealerName(rowA.original).localeCompare(
                getDealerName(rowB.original),
              );
            },
          } as ColumnDef<Visit>,
        ]
      : []),
    // Column: Assigned Seller / P. Manager (visible to DEALER and ADMIN)
    ...(isDealer || isAdmin
      ? [
          {
            id: "assignedSeller",
            accessorKey: "assignedSeller",
            header: ({
              column,
            }: {
              column: {
                toggleSorting: (desc: boolean) => void;
                getIsSorted: () => "asc" | "desc" | false;
              };
            }) => {
              return (
                <Button
                  variant="ghost"
                  onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                  }
                  className="-ml-4 h-8"
                >
                  {t("dealerPage.columns.assignedSeller")}
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
            cell: ({ row }: { row: { original: Visit } }) => {
              const assignedSeller = row.original.assignedSeller;
              return (
                <span className="text-xs sm:text-sm leading-relaxed text-primary">
                  {assignedSeller?.name || assignedSeller?.email || "-"}
                </span>
              );
            },
            sortingFn: (
              rowA: { original: Visit },
              rowB: { original: Visit },
            ) => {
              const nameA =
                rowA.original.assignedSeller?.name ||
                rowA.original.assignedSeller?.email ||
                "";
              const nameB =
                rowB.original.assignedSeller?.name ||
                rowB.original.assignedSeller?.email ||
                "";
              return nameA.localeCompare(nameB);
            },
          } as ColumnDef<Visit>,
        ]
      : []),
    {
      id: "actions",
      header: t("table.actions"),
      cell: ({ row }) => {
        const visit = row.original;
        const isClone = !!visit.clonedFromId;
        // SELLER can only edit/delete their own clones
        const canEdit = !isSeller || isClone;
        const canDelete = !isSeller || isClone;
        // SELLER can only clone original visits (not clones)
        const canClone = isSeller && !isClone && onClone;

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

              {/* Clone action for SELLER (only for original visits) */}
              {canClone && (
                <DropdownMenuItem
                  onClick={() => onClone(visit)}
                  className="cursor-pointer"
                >
                  <Split className="size-4" />
                  {t("dealerPage.seller.cloneAction")}
                </DropdownMenuItem>
              )}

              {/* View form (read-only) for SELLER on original visits */}
              {isSeller && !isClone && onViewForm && (
                <DropdownMenuItem
                  onClick={() => onViewForm(visit)}
                  className="cursor-pointer"
                >
                  <Eye className="size-4" />
                  {t("visits.viewForm")}
                </DropdownMenuItem>
              )}

              {/* Edit action - only for editable visits */}
              {onEdit && canEdit && (
                <DropdownMenuItem
                  onClick={() => onEdit(visit)}
                  className="cursor-pointer"
                >
                  <PencilLine className="size-4" />
                  {t("visits.editVisit")}
                </DropdownMenuItem>
              )}

              {/* View details - always available */}
              {onView && (
                <DropdownMenuItem
                  onClick={() => onView(visit)}
                  className="cursor-pointer"
                >
                  <ArrowUpRight className="size-4" />
                  {t("visits.viewDetails")}
                </DropdownMenuItem>
              )}

              {/* Delete - only for deletable visits */}
              {onDelete && canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(visit)}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Trash2 className="size-4 text-destructive" />
                    {t("visits.deleteVisit")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
