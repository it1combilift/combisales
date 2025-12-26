"use client";

import React from "react";
import { formatDate } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VisitStatus, VisitFormType } from "@prisma/client";
import { FORM_TYPE_LABELS, VISIT_STATUS_LABELS } from "@/interfaces/visits";

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
  ArrowUpRight,
  Calendar,
  ClipboardList,
  Copy,
  MoreVertical,
  PencilLine,
  Trash2,
  User,
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
}

export const VisitCard = ({
  visit,
  onView,
  onEdit,
  onDelete,
}: VisitCardProps) => {
  const status = visit.status as VisitStatus;
  const formType = visit.formType as VisitFormType;

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
                {FORM_TYPE_LABELS[formType]}
              </Badge>

              <Badge variant={STATUS_VARIANTS[status]} className="ml-2 text-xs">
                {VISIT_STATUS_ICONS[status] && (
                  <span>
                    {React.createElement(VISIT_STATUS_ICONS[status], {
                      className: "size-3",
                    })}
                  </span>
                )}
                {VISIT_STATUS_LABELS[status]}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 w-9 p-0 hover:bg-accent"
                aria-label="Abrir menú de acciones"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigator.clipboard.writeText(visit.id)}
              >
                <Copy className="size-4" />
                Copiar ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onEdit && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onEdit(visit)}
                >
                  <PencilLine className="size-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {onView && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onView(visit)}
                >
                  <ArrowUpRight className="size-4" />
                  Detalles
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
                    Eliminar
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
                {formatDate(visit.visitDate)}
              </span>
              <span className="text-muted-foreground text-xs">
                Fecha de la visita
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
                {FORM_TYPE_LABELS[formType]}
              </span>
              <span className="text-muted-foreground text-xs">
                Tipo de formulario
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
                  {visit.user.name || "Sin nombre"}
                </span>
                <span className="text-muted-foreground text-xs truncate">
                  {visit.user.email}
                </span>
              </div>
            </div>
          )}

          {onView && (
            <Button
              variant="default"
              size="sm"
              className="w-full mt-2"
              onClick={() => onView(visit)}
            >
              Ver detalles
              <ArrowUpRight className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
