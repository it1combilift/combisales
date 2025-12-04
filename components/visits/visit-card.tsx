"use client";

import { formatDate } from "@/lib/utils";
import { Visit } from "@/interfaces/visits";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { VisitStatus, VisitFormType } from "@prisma/client";
import { FORM_TYPE_LABELS, VISIT_STATUS_LABELS } from "@/interfaces/visits";

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
  Trash2,
  User,
} from "lucide-react";

const STATUS_VARIANTS: Record<
  VisitStatus,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  BORRADOR: "warning",
  COMPLETADA: "success",
  ENVIADA: "default",
  APROBADA: "success",
  RECHAZADA: "destructive",
};

// ==================== STATUS COLORS ====================
const STATUS_COLORS: Record<VisitStatus, string> = {
  BORRADOR: "border-l-amber-500",
  COMPLETADA: "border-l-green-500",
  ENVIADA: "border-l-blue-500",
  APROBADA: "border-l-emerald-500",
  RECHAZADA: "border-l-red-500",
};

interface VisitCardProps {
  visit: Visit;
  onSelect: (selected: boolean) => void;
  isSelected: boolean;
  onView?: (visit: Visit) => void;
  onDelete?: (visit: Visit) => void;
}

export const VisitCard = ({
  visit,
  onSelect,
  isSelected,
  onView,
  onDelete,
}: VisitCardProps) => {
  const status = visit.status as VisitStatus;
  const formType = visit.formType as VisitFormType;

  return (
    <Card
      className={`p-4 hover:shadow-lg transition-all duration-200 active:scale-[0.98] border-l-4 ${STATUS_COLORS[status]}`}
    >
      <div className="space-y-4">
        {/* Header with checkbox, title and actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              aria-label={`Seleccionar visita ${visit.id}`}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <Badge variant="info" className="text-xs font-normal">
                {FORM_TYPE_LABELS[formType]}
              </Badge>
              <Badge variant={STATUS_VARIANTS[status]} className="ml-2 text-xs">
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
              {onView && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onView(visit)}
                >
                  <ArrowUpRight className="size-4" />
                  Ver detalles
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
