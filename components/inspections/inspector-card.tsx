"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDateShort, getInitials } from "@/lib/utils";

import {
  ClipboardCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  CarFront,
  Edit,
  Trash2,
} from "lucide-react";

export interface InspectorData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  assignedVehicles?: {
    id: string;
    model: string;
    plate: string;
    status: string;
    imageUrl?: string | null;
  }[];
  _count?: {
    inspections: number;
    assignedVehicles: number;

  };
}

interface InspectorCardProps {
  inspector: InspectorData;
  onEdit?: (inspector: InspectorData) => void;
  onDelete?: (inspector: InspectorData) => void;
}

export function InspectorCard({
  inspector,
  onEdit,
  onDelete,
}: InspectorCardProps) {
  const { t, locale } = useTranslation();

  const vehicleCount =
    inspector._count?.assignedVehicles ??
    inspector.assignedVehicles?.length ??
    0;
  const inspectionCount = inspector._count?.inspections ?? 0;
  const isActive = inspector.isActive;

  return (
    <Card className="group relative overflow-hidden border rounded-2xl shadow-sm bg-card transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-black/8 flex flex-col p-0">
      {/* Left color band — status indicator */}
      <div
        className={cn(
          "w-1 h-full shrink-0 transition-all duration-300 absolute",
          isActive
            ? "bg-linear-to-b from-emerald-400 via-emerald-500 to-teal-400"
            : "bg-linear-to-b from-rose-400 via-rose-500 to-pink-400",
        )}
      />

      <CardContent className="px-4 pt-4 pb-4 flex flex-col gap-4 flex-1">
        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            {inspector.image ? (
              <Image
                src={inspector.image}
                alt={inspector.name || inspector.email}
                width={48}
                height={48}
                className="size-12 rounded-xl object-cover ring-2 ring-border group-hover:ring-primary/20 transition-all duration-300"
              />
            ) : (
              <div className="size-12 rounded-xl bg-primary/10 text-primary text-sm font-bold flex items-center justify-center ring-2 ring-primary/15 group-hover:ring-primary/30 transition-all duration-300">
                {getInitials(inspector.name || inspector.email)}
              </div>
            )}

            {/* Status dot */}
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-card transition-colors duration-300",
                isActive ? "bg-emerald-400" : "bg-rose-400",
              )}
            />
          </div>

          {/* Name + email */}
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm text-foreground truncate leading-snug">
              {inspector.name || inspector.email}
            </h3>
            {inspector.name && (
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {inspector.email}
              </p>
            )}
            <Badge
              variant={isActive ? "success" : "destructive"}
              className="mt-1.5 text-[10px] h-5 px-2 gap-1 rounded-full border-0"
            >
              {isActive ? (
                <CheckCircle2 className="size-2.5" />
              ) : (
                <XCircle className="size-2.5" />
              )}
              {isActive
                ? t("inspectionsPage.inspectors.active")
                : t("inspectionsPage.inspectors.inactive")}
            </Badge>
          </div>
        </div>

        {/* ── Divider ────────────────────────────────── */}
        <div className="h-px bg-border/50" />

        {/* ── Stats ──────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2">
          {/* Vehicles */}
          <div className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl bg-muted/50 border border-border/30">
            <div className="size-7 rounded-lg bg-sky-500/10 flex items-center justify-center mb-0.5">
              <CarFront className="size-3.5 text-sky-500" />
            </div>
            <span className="text-sm font-bold text-foreground tabular-nums leading-none">
              {vehicleCount}
            </span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              {t("inspectionsPage.inspectors.vehiclesCount")}
            </span>
          </div>

          {/* Inspections */}
          <div className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl bg-muted/50 border border-border/30">
            <div className="size-7 rounded-lg bg-violet-500/10 flex items-center justify-center mb-0.5">
              <ClipboardCheck className="size-3.5 text-violet-500" />
            </div>
            <span className="text-sm font-bold text-foreground tabular-nums leading-none">
              {inspectionCount}
            </span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              {t("inspectionsPage.inspectors.inspectionsCount")}
            </span>
          </div>

          {/* Since */}
          <div className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl bg-muted/50 border border-border/30">
            <div className="size-7 rounded-lg bg-amber-500/10 flex items-center justify-center mb-0.5">
              <Calendar className="size-3.5 text-amber-500" />
            </div>
            <span className="text-[11px] font-bold text-foreground leading-none">
              {formatDateShort(inspector.createdAt, locale)}
            </span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              {t("profile.memberSince")}
            </span>
          </div>
        </div>

        {/* ── Assigned vehicles ──────────────────────── */}
        {inspector.assignedVehicles &&
          inspector.assignedVehicles.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {t("inspectionsPage.inspectors.assignedVehicles")}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {inspector.assignedVehicles.slice(0, 3).map((v) => (
                  <Badge
                    key={v.id}
                    variant="outline"
                    className="text-[10px] h-5 px-2 gap-1 font-mono rounded-md bg-muted/30 border-border/50"
                  >
                    <CarFront className="size-2.5 text-muted-foreground" />
                    {v.model} · {v.plate}
                  </Badge>
                ))}
                {inspector.assignedVehicles.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-5 px-2 rounded-md"
                  >
                    +{inspector.assignedVehicles.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        {/* ── Actions ─────────────────────────────── */}
        {(onEdit || onDelete) && (
          <>
            <div className="h-px bg-border/50" />
            <div className="flex items-center justify-end gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={() => onEdit(inspector)}
                >
                  <Edit className="size-3" />
                  {t("common.edit")}
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2.5 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(inspector)}
                >
                  <Trash2 className="size-3" />
                  {t("common.delete")}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
