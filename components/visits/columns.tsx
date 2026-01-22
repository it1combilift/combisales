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
  onViewClone?: (visit: Visit) => void;
  onEditClone?: (visit: Visit) => void;
  onDeleteClone?: (visit: Visit) => void;
}

export function createColumns(
  config: ColumnsConfigWithI18n,
): ColumnDef<Visit>[] {
  const {
    onView,
    onEdit,
    onDelete,
    onClone,
    onViewForm,
    onViewClone,
    onEditClone,
    onDeleteClone,
    t,
    locale,
    userRole,
  } = config;

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
    EN_PROGRESO: "inProgress",
    COMPLETADA: "completed",
  };

  // ==================== COLUMN DEFINITIONS ====================

  // Form Type Column
  const formTypeColumn: ColumnDef<Visit> = {
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
  };

  // Visit Date Column
  const visitDateColumn: ColumnDef<Visit> = {
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
  };

  // Status Column
  // IMPORTANT: EN_PROGRESO status is ONLY meaningful in SELLER flow
  // For DEALER: EN_PROGRESO should be displayed as COMPLETADA (they submitted the visit)
  // This is because EN_PROGRESO indicates "pending work for seller", not a dealer state
  const statusColumn: ColumnDef<Visit> = {
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
      let status = row.getValue("status") as VisitStatus;

      // For DEALER: EN_PROGRESO should appear as COMPLETADA
      // EN_PROGRESO is only meaningful in the SELLER flow
      if (isDealer && status === VisitStatus.EN_PROGRESO) {
        status = VisitStatus.COMPLETADA;
      }

      const variants: Record<
        VisitStatus,
        "default" | "secondary" | "success" | "warning" | "destructive" | "info"
      > = {
        BORRADOR: "warning",
        EN_PROGRESO: "info",
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
  };

  // Clone Status Column (SELLER only) - Shows whether this original visit has been cloned
  const cloneStatusColumn: ColumnDef<Visit> = {
    id: "cloneStatus",
    header: t("visits.type"),
    cell: ({ row }) => {
      const visit = row.original;
      // Check if this original visit has any clones
      const hasClone = visit.clones && visit.clones.length > 0;
      return (
        <Badge
          variant={hasClone ? "outline-success" : "outline-info"}
          className="flex items-center gap-1"
        >
          {hasClone && <Split className="size-3.5" />}
          {hasClone
            ? t("dealerPage.seller.clonedBadge")
            : t("dealerPage.seller.originalBadge")}
        </Badge>
      );
    },
  };

  // Dealer Column (visible to SELLER and ADMIN)
  const dealerColumn: ColumnDef<Visit> = {
    id: "dealer",
    accessorKey: "user",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
    cell: ({ row }) => {
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
    sortingFn: (rowA, rowB) => {
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
  };

  // Company/Customer Column (visible to SELLER and DEALER)
  const companyColumn: ColumnDef<Visit> = {
    id: "company",
    accessorKey: "customer",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 h-8"
        >
          {t("dealerPage.columns.company")}
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
      const customer = row.original.customer;
      return (
        <span className="text-xs sm:text-sm leading-relaxed text-primary">
          {customer?.accountName || "-"}
        </span>
      );
    },
    sortingFn: (rowA, rowB) => {
      const nameA = rowA.original.customer?.accountName || "";
      const nameB = rowB.original.customer?.accountName || "";
      return nameA.localeCompare(nameB);
    },
  };

  // Assigned Seller / P. Manager Column (visible to DEALER and ADMIN)
  const assignedSellerColumn: ColumnDef<Visit> = {
    id: "assignedSeller",
    accessorKey: "assignedSeller",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
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
    cell: ({ row }) => {
      const assignedSeller = row.original.assignedSeller;
      return (
        <span className="text-xs sm:text-sm leading-relaxed text-primary">
          {assignedSeller?.name || assignedSeller?.email || "-"}
        </span>
      );
    },
    sortingFn: (rowA, rowB) => {
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
  };

  // Actions Column
  const actionsColumn: ColumnDef<Visit> = {
    id: "actions",
    header: t("table.actions"),
    cell: ({ row }) => {
      const visit = row.original;
      // Phase 4: Check if this original visit has a clone
      const hasClone = visit.clones && visit.clones.length > 0;
      const clone = hasClone ? visit.clones![0] : null;

      // For SELLER: unified row logic - they only see originals
      // Dropdown changes based on whether a clone exists
      const canClone = isSeller && !hasClone && onClone;
      const canEdit = !isSeller; // SELLER cannot edit original, but can edit clone via onEditClone
      const canDelete = !isSeller; // SELLER cannot delete original, but can delete clone via onDeleteClone

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

            {/* SELLER: Unified dropdown based on clone status */}
            {isSeller && (
              <>
                {!hasClone ? (
                  // NOT CLONED: Show "View form" and "Clone visit"
                  <>
                    {onViewForm && (
                      <DropdownMenuItem
                        onClick={() => onViewForm(visit)}
                        className="cursor-pointer"
                      >
                        <Eye className="size-4" />
                        {t("visits.viewForm")}
                      </DropdownMenuItem>
                    )}
                    {canClone && (
                      <DropdownMenuItem
                        onClick={() => onClone(visit)}
                        className="cursor-pointer"
                      >
                        <Split className="size-4" />
                        {t("dealerPage.seller.cloneAction")}
                      </DropdownMenuItem>
                    )}
                  </>
                ) : (
                  // CLONED: Show "View original form", "View/Edit cloned form", "Delete cloned visit"
                  <>
                    {onViewForm && (
                      <DropdownMenuItem
                        onClick={() => onViewForm(visit)}
                        className="cursor-pointer"
                      >
                        <Eye className="size-4" />
                        {t("dealerPage.seller.viewOriginalForm")}
                      </DropdownMenuItem>
                    )}
                    {onViewClone && clone && (
                      <DropdownMenuItem
                        onClick={() => onViewClone(visit)}
                        className="cursor-pointer"
                      >
                        <ArrowUpRight className="size-4" />
                        {t("dealerPage.seller.viewClonedForm")}
                      </DropdownMenuItem>
                    )}
                    {onEditClone && clone && (
                      <DropdownMenuItem
                        onClick={() => onEditClone(visit)}
                        className="cursor-pointer"
                      >
                        <PencilLine className="size-4" />
                        {t("dealerPage.seller.editClonedForm")}
                      </DropdownMenuItem>
                    )}
                    {onDeleteClone && clone && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteClone(visit)}
                          className="text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="size-4 text-destructive" />
                          {t("dealerPage.seller.deleteClonedVisit")}
                        </DropdownMenuItem>
                      </>
                    )}
                  </>
                )}
              </>
            )}

            {/* Non-SELLER: Standard dropdown */}
            {!isSeller && (
              <>
                {/* Edit action */}
                {onEdit && canEdit && (
                  <DropdownMenuItem
                    onClick={() => onEdit(visit)}
                    className="cursor-pointer"
                  >
                    <PencilLine className="size-4" />
                    {t("visits.editVisit")}
                  </DropdownMenuItem>
                )}

                {/* View details */}
                {onView && (
                  <DropdownMenuItem
                    onClick={() => onView(visit)}
                    className="cursor-pointer"
                  >
                    <ArrowUpRight className="size-4" />
                    {t("visits.viewDetails")}
                  </DropdownMenuItem>
                )}

                {/* Delete */}
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
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };

  // ==================== COLUMN ORDER BY ROLE ====================
  // Phase 6: Column Order & Visibility
  // SELLER view: Dealer (first), Company (second), then other columns
  // DEALER view: P.Manager (first), Company (second), then other columns
  // ADMIN view: Both Dealer and P.Manager columns

  if (isSeller) {
    // SELLER: Dealer first, Company second
    return [
      dealerColumn,
      companyColumn,
      formTypeColumn,
      visitDateColumn,
      statusColumn,
      cloneStatusColumn,
      actionsColumn,
    ];
  }

  if (isDealer) {
    // DEALER: P.Manager first, Company second
    return [
      assignedSellerColumn,
      companyColumn,
      formTypeColumn,
      visitDateColumn,
      statusColumn,
      actionsColumn,
    ];
  }

  if (isAdmin) {
    // ADMIN: Show all columns
    return [
      dealerColumn,
      assignedSellerColumn,
      companyColumn,
      formTypeColumn,
      visitDateColumn,
      statusColumn,
      actionsColumn,
    ];
  }

  // Default: basic columns
  return [formTypeColumn, visitDateColumn, statusColumn, actionsColumn];
}
