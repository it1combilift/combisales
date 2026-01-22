"use client";

import React from "react";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VisitStatus, VisitFormType, Role } from "@prisma/client";

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
  Calendar,
  MoreVertical,
  Trash2,
  ArrowUpRight,
  User,
  Plus,
  Copy,
  PencilLine,
  ClipboardList,
  Eye,
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
  userRole?: Role | null;
  // Phase 4: Clone-specific handlers for unified row logic
  onViewClone?: (visit: Visit) => void;
  onEditClone?: (visit: Visit) => void;
  onDeleteClone?: (visit: Visit) => void;
}

export const VisitCard = ({
  visit,
  onView,
  onEdit,
  onDelete,
  onClone,
  onViewForm,
  onCreateVisit,
  userRole,
  onViewClone,
  onEditClone,
  onDeleteClone,
}: VisitCardProps) => {
  const { t, locale } = useI18n();
  const rawStatus = visit.status as VisitStatus;
  const formType = visit.formType as VisitFormType;

  const isSeller = userRole === Role.SELLER;
  const isDealer = userRole === Role.DEALER;
  const isAdmin = userRole === Role.ADMIN;

  // For DEALER: EN_PROGRESO should appear as COMPLETADA
  // EN_PROGRESO is only meaningful in the SELLER flow
  const status =
    isDealer && rawStatus === VisitStatus.EN_PROGRESO
      ? VisitStatus.COMPLETADA
      : rawStatus;

  // Phase 4: Unified row logic - check if original has a clone
  const hasClone = visit.clones && visit.clones.length > 0;
  const clone = hasClone ? visit.clones![0] : null;

  // SELLER: can only clone if no clone exists
  const canClone = isSeller && !hasClone && onClone;
  // Non-SELLER permissions
  const canEdit = !isSeller;
  const canDelete = !isSeller;

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
      className={`p-4 hover:shadow-lg transition-all duration-200 active:scale-[0.98] border-l-4 ${STATUS_COLORS[status]}`}
      onClick={() => onView && onView(visit)}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex justify-start w-full items-start flex-wrap gap-1">
              <Badge variant="info" className="text-xs">
                {FORM_TYPE_ICONS[formType] && (
                  <span className="inline-flex size-3 items-center justify-center">
                    {React.createElement(FORM_TYPE_ICONS[formType])}
                  </span>
                )}
                {t(`visits.formTypes.${formTypeKeys[formType]}` as any)}
              </Badge>

              <Badge variant={STATUS_VARIANTS[status]} className="text-xs">
                {VISIT_STATUS_ICONS[status] && (
                  <span>
                    {React.createElement(VISIT_STATUS_ICONS[status], {
                      className: "size-3",
                    })}
                  </span>
                )}
                {t(`visits.statuses.${statusKeys[status]}` as any)}
              </Badge>

              {/* Show clone status badge for SELLER */}
              {isSeller && (
                <Badge
                  variant={hasClone ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {hasClone
                    ? t("dealerPage.seller.clonedBadge")
                    : t("dealerPage.seller.originalBadge")}
                </Badge>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 w-9 p-0 hover:bg-accent"
                aria-label={t("common.actions")}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>

              {/* SELLER: Unified dropdown based on clone status */}
              {isSeller && (
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
                          <Copy className="size-4" />
                          {t("dealerPage.seller.cloneAction")}
                        </DropdownMenuItem>
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
                          <Eye className="size-4" />
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
                      {onDeleteClone && clone && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteClone(visit);
                            }}
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
                        className="text-destructive cursor-pointer hover:bg-destructive/10 hover:text-destructive"
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

        {/* Visit Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Date */}
          <div className="flex items-center gap-2.5 text-sm min-h-11">
            <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Calendar className="size-4 text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-foreground font-semibold text-sm">
                {formatDate(visit.visitDate, locale)}
              </span>
              <span className="text-muted-foreground text-xs">
                {t("visits.visitDate")}
              </span>
            </div>
          </div>

          {/* Form Type Icon */}
          <div className="flex items-center gap-2.5 text-sm min-h-11">
            <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <ClipboardList className="size-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-foreground font-medium truncate text-sm">
                {t(`visits.formTypes.${formTypeKeys[formType]}` as any)}
              </span>
              <span className="text-muted-foreground text-xs">
                {t("visits.formType")}
              </span>
            </div>
          </div>
        </div>

        {/* User Info - Role-based display */}
        {/* Phase 6: Column Order - SELLER sees Dealer first, Company second */}
        {/* DEALER sees P.Manager first, Company second */}
        <div className="pt-3 border-t border-border space-y-2.5">
          {/* SELLER sees: Dealer who assigned the visit (first) */}
          {isSeller && (
            <div className="flex items-center gap-2.5 text-sm min-h-11">
              <div className="size-8 rounded-full flex items-center justify-center shrink-0 bg-muted">
                <User className="size-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-foreground font-semibold truncate text-sm">
                  {visit.user?.name || t("users.card.noName")}
                </span>
                <span className="text-muted-foreground text-xs truncate">
                  {t("dealerPage.columns.dealer")}
                </span>
              </div>
            </div>
          )}

          {/* DEALER sees: Assigned Seller / P. Manager (first) */}
          {isDealer && visit.assignedSeller && (
            <div className="flex items-center gap-2.5 text-sm min-h-11">
              <div className="size-8 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                <User className="size-4 text-primary" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-foreground font-semibold truncate text-sm">
                  {visit.assignedSeller.name || t("users.card.noName")}
                </span>
                <span className="text-muted-foreground text-xs truncate">
                  {t("dealerPage.columns.assignedSeller")}
                </span>
              </div>
            </div>
          )}

          {/* Company / Customer (second for both SELLER and DEALER) */}
          {(isSeller || isDealer) && visit.customer && (
            <div className="flex items-center gap-2.5 text-sm min-h-11">
              <div className="size-8 rounded-full flex items-center justify-center shrink-0 bg-muted">
                <ClipboardList className="size-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-foreground font-semibold truncate text-sm">
                  {visit.customer.accountName || "-"}
                </span>
                <span className="text-muted-foreground text-xs truncate">
                  {t("dealerPage.columns.company")}
                </span>
              </div>
            </div>
          )}

          {/* ADMIN sees: Both Dealer and P.Manager */}
          {isAdmin && (
            <>
              <div className="flex items-center gap-2.5 text-sm min-h-11">
                <div className="size-8 rounded-full flex items-center justify-center shrink-0 bg-muted">
                  <User className="size-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-foreground font-semibold truncate text-sm">
                    {visit.user?.name || t("users.card.noName")}
                  </span>
                  <span className="text-muted-foreground text-xs truncate">
                    {t("dealerPage.columns.dealer")}
                  </span>
                </div>
              </div>
              {visit.assignedSeller && (
                <div className="flex items-center gap-2.5 text-sm min-h-11">
                  <div className="size-8 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                    <User className="size-4 text-primary" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-foreground font-semibold truncate text-sm">
                      {visit.assignedSeller.name || t("users.card.noName")}
                    </span>
                    <span className="text-muted-foreground text-xs truncate">
                      {t("dealerPage.columns.assignedSeller")}
                    </span>
                  </div>
                </div>
              )}
              {visit.customer && (
                <div className="flex items-center gap-2.5 text-sm min-h-11">
                  <div className="size-8 rounded-full flex items-center justify-center shrink-0 bg-muted">
                    <ClipboardList className="size-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-foreground font-semibold truncate text-sm">
                      {visit.customer.accountName || "-"}
                    </span>
                    <span className="text-muted-foreground text-xs truncate">
                      {t("dealerPage.columns.company")}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="space-y-2 w-full">
            {onView && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(visit);
                }}
              >
                {t("visits.viewDetails")}
                <ArrowUpRight className="size-4" />
              </Button>
            )}

            {onCreateVisit && (
              <Button
                variant="default"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateVisit();
                }}
              >
                <Plus className="size-4" />
                {t("visits.createVisit")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
