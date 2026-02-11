"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateShort, getInitials } from "@/lib/utils";
import { hasRole } from "@/lib/roles";
import { VisitStatus, VisitFormType, Role } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  FORM_TYPE_ICONS,
  Visit,
  VISIT_STATUS_ICONS,
} from "@/interfaces/visits";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  MoreVertical,
  Trash2,
  ArrowUpRight,
  Split,
  Copy,
  PencilLine,
  ClipboardList,
  Eye,
  BookmarkCheck,
} from "lucide-react";

const STATUS_VARIANTS: Record<
  VisitStatus,
  "default" | "secondary" | "success" | "warning" | "destructive" | "info"
> = {
  BORRADOR: "warning",
  EN_PROGRESO: "info",
  COMPLETADA: "success",
};

const STATUS_COLORS: Record<VisitStatus, string> = {
  BORRADOR: "border-l-amber-500",
  EN_PROGRESO: "border-l-blue-500",
  COMPLETADA: "border-l-green-500",
};

interface VisitCardProps {
  visit: Visit;
  onSelect: (selected: boolean) => void;
  isSelected: boolean;
  onView?: (visit: Visit) => void;
  onEdit?: (visit: Visit) => void;
  onDelete?: (visit: Visit) => void;
  onClone?: (visit: Visit) => void;
  onViewForm?: (visit: Visit) => void;
  onCreateVisit?: () => void;
  userRoles?: Role[];
  // Phase 4: Clone-specific handlers for unified row logic
  onViewClone?: (visit: Visit) => void;
  onEditClone?: (visit: Visit) => void;
  onDeleteClone?: (visit: Visit) => void;
  // Indicates if this is the dealer flow (DealersPage) vs normal flow (HistoryVisitsPage, TaskDetailPage)
  isDealerFlow?: boolean;
}

export const VisitCard = ({
  visit,
  onView,
  onEdit,
  onDelete,
  onClone,
  onViewForm,
  // onCreateVisit,
  userRoles,
  onViewClone,
  onEditClone,
  onDeleteClone,
  isDealerFlow = false,
}: VisitCardProps) => {
  const { t, locale } = useI18n();
  const rawStatus = visit.status as VisitStatus;
  const formType = visit.formType as VisitFormType;

  const roles = userRoles || [];
  const isSeller = hasRole(roles, Role.SELLER);
  const isDealer = hasRole(roles, Role.DEALER);
  const isAdmin = hasRole(roles, Role.ADMIN);

  // Phase 4: Unified row logic - check if original has a clone
  const hasClone = visit.clones && visit.clones.length > 0;
  const clone = hasClone ? visit.clones![0] : null;

  // STATUS DISPLAY LOGIC:
  // Only applies special status mapping in DEALER FLOW (DealersPage)
  // - DEALER: EN_PROGRESO → displays as COMPLETADA (from dealer's perspective, they finished)
  // - SELLER/ADMIN viewing DEALER's original visit (COMPLETADA + no clone OR COMPLETADA + clone not completed):
  //   → displays as EN_PROGRESO (work is pending for seller)
  // - SELLER/ADMIN viewing a visit where the clone is COMPLETADA:
  //   → displays as COMPLETADA (work is done)
  // In NORMAL FLOW (HistoryVisitsPage, TaskDetailPage): status is displayed as-is
  let status = rawStatus;

  if (isDealerFlow) {
    // DEALER FLOW: Apply special status mapping logic
    if (isDealer && rawStatus === VisitStatus.EN_PROGRESO) {
      // For DEALER only: EN_PROGRESO should appear as COMPLETADA
      // From dealer's perspective, they finished their part
      status = VisitStatus.COMPLETADA;
    } else if ((isSeller || isAdmin) && !visit.clonedFromId) {
      // For SELLER and ADMIN: Determine effective status based on clone status
      // ADMIN behaves exactly like SELLER for status display
      // Original COMPLETADA visits show as EN_PROGRESO unless clone is COMPLETADA
      if (
        rawStatus === VisitStatus.COMPLETADA ||
        rawStatus === VisitStatus.EN_PROGRESO
      ) {
        // Check if clone exists and is completed
        if (clone && clone.status === VisitStatus.COMPLETADA) {
          status = VisitStatus.COMPLETADA;
        } else {
          // No clone, or clone is not completed → show as EN_PROGRESO
          status = VisitStatus.EN_PROGRESO;
        }
      }
    }
  }
  // NORMAL FLOW: status remains as rawStatus (no mapping)

  // SELLER/ADMIN: can clone if no clone exists
  const canClone = (isSeller || isAdmin) && !hasClone && onClone;
  // Permission logic
  const canEdit = isDealer; // Only DEALER can edit original
  const canDelete = isDealer || isAdmin; // DEALER can delete own, ADMIN can delete any

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

  return (
    <Card
      className={`overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4 ${STATUS_COLORS[status]}`}
      onClick={() => onView && onView(visit)}
    >
      <div className="p-4 pt-0 space-y-4">
        {/* Header: Form Type and Actions */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {FORM_TYPE_ICONS[formType] &&
                React.createElement(FORM_TYPE_ICONS[formType], {
                  className: "size-5 text-primary",
                })}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">
                {t(`visits.formTypes.${formTypeKeys[formType]}` as any)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDateShort(visit.visitDate, locale)}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent shrink-0"
                aria-label={t("common.actions")}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>

              {/* ============================================== */}
              {/* DEALER FLOW (DealersPage): SELLER/ADMIN actions */}
              {/* ============================================== */}
              {isDealerFlow && (isSeller || isAdmin) && (
                <>
                  {!hasClone ? (
                    // NOT CLONED: Show "View form" and "Clone visit"
                    <>
                      {onViewForm && (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewForm(visit);
                          }}
                        >
                          <Eye className="size-4" />
                          {t("visits.viewForm")}
                        </DropdownMenuItem>
                      )}
                      {canClone && (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClone!(visit);
                          }}
                        >
                          <Split className="size-4" />
                          {t("dealerPage.seller.cloneAction")}
                        </DropdownMenuItem>
                      )}
                      {/* ADMIN: Delete original without clone */}
                      {isAdmin && onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(visit);
                            }}
                          >
                            <Trash2 className="size-4 text-destructive" />
                            {t("visits.deleteVisit")}
                          </DropdownMenuItem>
                        </>
                      )}
                    </>
                  ) : (
                    // CLONED: Show "View original form", "View/Edit cloned form", "Delete cloned visit"
                    <>
                      {onViewForm && (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewForm(visit);
                          }}
                        >
                          <BookmarkCheck className="size-4" />
                          {t("dealerPage.seller.viewOriginalForm")}
                        </DropdownMenuItem>
                      )}
                      {onViewClone && clone && (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewClone(visit);
                          }}
                        >
                          <ArrowUpRight className="size-4" />
                          {t("dealerPage.seller.viewClonedForm")}
                        </DropdownMenuItem>
                      )}
                      {onEditClone && clone && (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditClone(visit);
                          }}
                        >
                          <PencilLine className="size-4" />
                          {t("dealerPage.seller.editClonedForm")}
                        </DropdownMenuItem>
                      )}
                      {/* SELLER: Delete clone only */}
                      {isSeller && onDeleteClone && clone && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteClone(visit);
                            }}
                            className={`${clone.status === VisitStatus.COMPLETADA ? "cursor-not-allowed opacity-50 text-destructive focus:text-destructive" : "cursor-pointer text-destructive focus:text-destructive"}`}
                            disabled={clone.status === VisitStatus.COMPLETADA}
                          >
                            <Trash2 className="size-4 text-destructive" />
                            {t("dealerPage.seller.deleteClonedVisit")}
                          </DropdownMenuItem>
                        </>
                      )}
                      {/* ADMIN: Delete original with clone (cascade) */}
                      {isAdmin && onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(visit);
                            }}
                          >
                            <Trash2 className="size-4 text-destructive" />
                            {t("dealerPage.admin.deleteWithClone")}
                          </DropdownMenuItem>
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {/* ============================================== */}
              {/* NORMAL FLOW (HistoryVisitsPage, TaskDetailPage): SELLER/ADMIN actions */}
              {/* Standard view/edit/delete without clone-specific logic */}
              {/* When !isDealerFlow: show standard actions unless user is DEALER */}
              {/* ============================================== */}
              {!isDealerFlow && !isDealer && (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(visit.id);
                    }}
                  >
                    <Copy className="size-4" />
                    {t("visits.copy")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {onView && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(visit);
                      }}
                    >
                      <ArrowUpRight className="size-4" />
                      {t("visits.viewDetails")}
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(visit);
                      }}
                    >
                      <PencilLine className="size-4" />
                      {t("common.edit")}
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(visit);
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" />
                        {t("visits.deleteVisit")}
                      </DropdownMenuItem>
                    </>
                  )}
                </>
              )}

              {/* DEALER only: Standard dropdown */}
              {isDealer && (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(visit.id);
                    }}
                  >
                    <Copy className="size-4" />
                    {t("visits.copy")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {onEdit && canEdit && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(visit);
                      }}
                    >
                      <PencilLine className="size-4" />
                      {t("common.edit")}
                    </DropdownMenuItem>
                  )}
                  {onView && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(visit);
                      }}
                    >
                      <ArrowUpRight className="size-4" />
                      {t("visits.viewDetails")}
                    </DropdownMenuItem>
                  )}
                  {onDelete && canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={visit.status === VisitStatus.COMPLETADA}
                        className={`${visit.status === VisitStatus.COMPLETADA ? "cursor-not-allowed opacity-50 text-destructive focus:text-destructive" : "cursor-pointer text-destructive focus:text-destructive"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(visit);
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" />
                        {t("common.delete")}
                      </DropdownMenuItem>
                    </>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Company/Client Info - Always visible and prominent */}
        <div className="flex items-center gap-2.5 p-3 bg-muted/50 rounded-lg">
          <div className="size-8 rounded-full bg-background flex items-center justify-center shrink-0">
            <ClipboardList className="size-4 text-primary" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {t("dealerPage.columns.company")}
            </span>
            <span className="text-sm font-semibold truncate">
              {visit.customer?.accountName ||
                visit.formularioCSSAnalisis?.razonSocial ||
                visit.formularioIndustrialAnalisis?.razonSocial ||
                visit.formularioLogisticaAnalisis?.razonSocial ||
                visit.formularioStraddleCarrierAnalisis?.razonSocial ||
                "-"}
            </span>
          </div>
        </div>

        {/* Status Section: Original and Clone (when applicable) */}
        {(isSeller || isAdmin) && hasClone && clone ? (
          // DUAL STATUS VIEW for SELLER and ADMIN with clone
          // Both see the same dual representation
          <div className="flex flex-col overflow-hidden space-y-2">
            {/* Original Record Status */}
            <div className="flex items-center justify-between p-2.5 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-dashed border-blue-200 dark:border-blue-900 border-b relative">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 shrink-0 border-2 border-blue-200 dark:border-blue-800">
                  <AvatarImage
                    src={visit.user?.image || undefined}
                    alt={visit.user?.name || visit.user?.email || "Dealer"}
                    className="object-center object-cover"
                  />
                  <AvatarFallback className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                    {visit.user?.name
                      ? getInitials(visit.user.name)
                      : visit.user?.email
                        ? getInitials(visit.user.email)
                        : "D"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {t("dealerPage.seller.originalBadge")}
                  </span>
                  <span className="text-xs text-blue-900 dark:text-blue-200 font-medium truncate">
                    {visit.user?.name || t("users.card.noName")}
                  </span>
                </div>
              </div>
              <Badge
                variant={STATUS_VARIANTS[status]}
                className="shrink-0 text-[10px] h-5 px-2 font-medium"
              >
                {t(`visits.statuses.${statusKeys[status]}` as any)}
              </Badge>
            </div>

            {/* Clone Record Status */}
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-dashed border-emerald-200 dark:border-emerald-900">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 shrink-0 border-2 border-emerald-200 dark:border-emerald-800">
                  <AvatarImage
                    src={clone.user?.image || undefined}
                    alt={clone.user?.name || clone.user?.email || "Seller"}
                    className="object-center object-cover"
                  />
                  <AvatarFallback className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                    {clone.user?.name
                      ? getInitials(clone.user.name)
                      : clone.user?.email
                        ? getInitials(clone.user.email)
                        : "S"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {t("dealerPage.seller.clonedBadge")}
                  </span>
                  <span className="text-xs text-emerald-900 dark:text-emerald-200 font-medium truncate">
                    {clone.user?.name || t("users.card.noName")}
                  </span>
                </div>
              </div>
              <Badge
                variant={STATUS_VARIANTS[clone.status]}
                className="shrink-0 text-[10px] h-5 px-2 font-medium"
              >
                {t(`visits.statuses.${statusKeys[clone.status]}` as any)}
              </Badge>
            </div>
          </div>
        ) : (
          // SINGLE STATUS VIEW (default for non-cloned or DEALER view)
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="size-8 rounded-full bg-background flex items-center justify-center shrink-0">
                {VISIT_STATUS_ICONS[status] &&
                  React.createElement(VISIT_STATUS_ICONS[status], {
                    className: "size-4 text-primary",
                  })}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  {t("visits.status")}
                </span>
                <span className="text-sm font-semibold">
                  {t(`visits.statuses.${statusKeys[status]}` as any)}
                </span>
              </div>
            </div>
            <Badge
              variant={STATUS_VARIANTS[status]}
              className="shrink-0 text-[10px] h-5 px-2 font-medium"
            >
              {t(`visits.statuses.${statusKeys[status]}` as any)}
            </Badge>
          </div>
        )}

        {/* Additional Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t">
          {/* Dealer Info (for SELLER/ADMIN when no clone - with clone the DUAL view shows this) */}
          {(isSeller || isAdmin) && !hasClone && (
            <div className="flex items-center gap-3">
              <Avatar className="size-10 shrink-0 border-2 border-blue-200 dark:border-blue-800">
                <AvatarImage
                  src={visit.user?.image || undefined}
                  alt={visit.user?.name || visit.user?.email || "Dealer"}
                  className="object-center object-cover"
                />
                <AvatarFallback className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                  {visit.user?.name
                    ? getInitials(visit.user.name)
                    : visit.user?.email
                      ? getInitials(visit.user.email)
                      : "D"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {t("dealerPage.columns.dealer")}
                </span>
                <span className="text-xs text-blue-900 dark:text-blue-200 font-medium truncate">
                  {visit.user?.name || t("users.card.noName")}
                </span>
              </div>
            </div>
          )}

          {/* Assigned Seller Info (for DEALER or when exists) */}
          {visit.assignedSeller && (
            <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <Avatar className="size-10 shrink-0">
                <AvatarImage
                  src={visit.assignedSeller.image || undefined}
                  alt={
                    visit.assignedSeller.name ||
                    visit.assignedSeller.email ||
                    "Seller"
                  }
                  className="object-center object-cover"
                />
                <AvatarFallback className="text-[10px]">
                  {visit.assignedSeller.name
                    ? getInitials(visit.assignedSeller.name)
                    : visit.assignedSeller.email
                      ? getInitials(visit.assignedSeller.email)
                      : "S"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {t("dealerPage.columns.assignedSeller")}
                </span>
                <span className="text-xs font-medium truncate">
                  {visit.assignedSeller.name || t("users.card.noName")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions Footer */}
        <div className="flex gap-2 pt-2">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onView(visit);
              }}
            >
              {t("visits.viewDetails")}
              <ArrowUpRight className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
