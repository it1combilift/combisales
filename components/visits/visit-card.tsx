"use client";

import React from "react";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VisitStatus, VisitFormType } from "@prisma/client";
import { FORM_TYPE_LABELS, VISIT_STATUS_LABELS } from "@/interfaces/visits";
import { useI18n } from "@/lib/i18n/context";

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
} from "lucide-react";

const STATUS_VARIANTS: Record<
  VisitStatus,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  BORRADOR: "warning",
  COMPLETADA: "success",
};

const STATUS_COLORS: Record<VisitStatus, string> = {
  BORRADOR: "border-l-amber-500",
  COMPLETADA: "border-l-green-500",
};

interface VisitCardProps {
  visit: Visit;
  onSelect: (selected: boolean) => void;
  isSelected: boolean;
  onView?: (visit: Visit) => void;
  onEdit?: (visit: Visit) => void;
  onDelete?: (visit: Visit) => void;
  onCreateVisit?: () => void;
}

export const VisitCard = ({
  visit,
  onView,
  onEdit,
  onDelete,
  onCreateVisit,
}: VisitCardProps) => {
  const { t, locale } = useI18n();
  const status = visit.status as VisitStatus;
  const formType = visit.formType as VisitFormType;

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

  return (
    <Card
      className={`p-4 hover:shadow-lg transition-all duration-200 active:scale-[0.98] border-l-4 ${STATUS_COLORS[status]}`}
      onClick={() => onView && onView(visit)}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex justify-start w-full items-start">
              <Badge variant="info" className="text-xs">
                {FORM_TYPE_ICONS[formType] && (
                  <span className="inline-flex size-3 items-center justify-center">
                    {React.createElement(FORM_TYPE_ICONS[formType])}
                  </span>
                )}
                {t(`visits.formTypes.${formTypeKeys[formType]}` as any)}
              </Badge>

              <Badge variant={STATUS_VARIANTS[status]} className="ml-2 text-xs">
                {VISIT_STATUS_ICONS[status] && (
                  <span>
                    {React.createElement(VISIT_STATUS_ICONS[status], {
                      className: "size-3",
                    })}
                  </span>
                )}
                {t(`visits.statuses.${statusKeys[status]}` as any)}
              </Badge>
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
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigator.clipboard.writeText(visit.id)}
              >
                <Copy className="size-4" />
                {t("visits.copy")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onEdit && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onEdit(visit)}
                >
                  <PencilLine className="size-4" />
                  {t("common.edit")}
                </DropdownMenuItem>
              )}
              {onView && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onView(visit)}
                >
                  <ArrowUpRight className="size-4" />
                  {t("visits.viewDetails")}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(visit)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                    {t("common.delete")}
                  </DropdownMenuItem>
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

        {/* Seller Info */}
        <div className="pt-3 border-t border-border space-y-2.5">
          {visit.user && (
            <div className="flex items-center gap-2.5 text-sm min-h-11">
              <div className="size-8 rounded-full flex items-center justify-center shrink-0 bg-muted">
                <User className="size-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-foreground font-semibold truncate text-sm">
                  {visit.user.name || t("users.card.noName")}
                </span>
                <span className="text-muted-foreground text-xs truncate">
                  {visit.user.email}
                </span>
              </div>
            </div>
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
