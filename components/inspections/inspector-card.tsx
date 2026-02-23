"use client";

import Image from "next/image";
import { Role } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllRoles, hasRole } from "@/lib/roles";
import { useTranslation } from "@/lib/i18n/context";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDateShort, getInitials, getRoleBadge } from "@/lib/utils";

import {
  ClipboardCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  CarFront,
  Edit,
  Trash2,
  AlertCircle,
  Lock,
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
  const isSeller = hasRole(inspector.roles as Role[], Role.SELLER);
  const isInspectorRole = hasRole(inspector.roles as Role[], Role.INSPECTOR);

  return (
    <Card className="group relative overflow-hidden border rounded-2xl shadow-sm bg-card transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-black/8 flex flex-col p-0 m-0">
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
                "absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-card transition-colors duration-300 animate-pulse",
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
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {inspector.email}
              </p>
            )}
            {/* Role badges */}
            <div className="flex gap-1 w-fit mt-1">
              <Badge
                variant={isActive ? "success" : "destructive"}
                className="text-xs px-2 gap-1 rounded-full border-0"
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

              {getAllRoles(inspector.roles as Role[]).map((role) =>
                getRoleBadge(role),
              )}
            </div>
          </div>
        </div>

        {/* ── Divider ────────────────────────────────── */}
        <div className="h-px bg-border/50" />

        {/* ── Stats ──────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2">
          {/* Vehicles */}
          <div
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border",
              vehicleCount > 0
                ? "bg-sky-50/50 dark:bg-sky-950/20 border-sky-200/50 dark:border-sky-800/40"
                : "bg-muted/50 border-border/30",
            )}
          >
            <div
              className={cn(
                "size-7 rounded-lg flex items-center justify-center mb-0.5",
                vehicleCount > 0 ? "bg-sky-500/15" : "bg-muted-foreground/10",
              )}
            >
              <CarFront
                className={cn(
                  "size-3.5",
                  vehicleCount > 0
                    ? "text-sky-500"
                    : "text-muted-foreground/60",
                )}
              />
            </div>
            <span
              className={cn(
                "text-sm font-bold tabular-nums leading-none",
                vehicleCount > 0
                  ? "text-sky-700 dark:text-sky-300"
                  : "text-muted-foreground",
              )}
            >
              {vehicleCount}
            </span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">
              {t("inspectionsPage.inspectors.vehiclesCount")}
            </span>
          </div>

          {/* Inspections */}
          <div
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border",
              inspectionCount > 0
                ? "bg-violet-50/50 dark:bg-violet-950/20 border-violet-200/50 dark:border-violet-800/40"
                : "bg-muted/50 border-border/30",
            )}
          >
            <div
              className={cn(
                "size-7 rounded-lg flex items-center justify-center mb-0.5",
                inspectionCount > 0
                  ? "bg-violet-500/15"
                  : "bg-muted-foreground/10",
              )}
            >
              <ClipboardCheck
                className={cn(
                  "size-3.5",
                  inspectionCount > 0
                    ? "text-violet-500"
                    : "text-muted-foreground/60",
                )}
              />
            </div>
            <span
              className={cn(
                "text-sm font-bold tabular-nums leading-none",
                inspectionCount > 0
                  ? "text-violet-700 dark:text-violet-300"
                  : "text-muted-foreground",
              )}
            >
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
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {t("inspectionsPage.inspectors.assignedVehicles")}
          </p>

          {inspector.assignedVehicles &&
          inspector.assignedVehicles.length > 0 ? (
            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-1.5">
                {inspector.assignedVehicles.slice(0, 3).map((v) => (
                  <Badge
                    key={v.id}
                    variant="outline"
                    className="text-[10px] h-5 px-2 gap-1 font-mono rounded-md bg-sky-50/50 dark:bg-sky-950/20 border-sky-200/60 dark:border-sky-800/50 text-sky-700 dark:text-sky-300"
                  >
                    <CarFront className="size-2.5 text-sky-500" />
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

              {/* SELLER max vehicle indicator */}
              {isSeller && !isInspectorRole && vehicleCount >= 1 && (
                <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400">
                  <Lock className="size-2.5 shrink-0" />
                  <span>
                    {t("inspectionsPage.inspectors.sellerMaxOneVehicle")}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 py-2 px-2.5 rounded-lg bg-muted/30 border border-dashed border-border/50">
              <div className="size-6 rounded-md bg-muted-foreground/10 flex items-center justify-center shrink-0">
                <AlertCircle className="size-3 text-muted-foreground/50" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground">
                  {t("inspectionsPage.inspectors.noVehiclesAssigned")}
                </p>
                <p className="text-[9px] text-muted-foreground/70">
                  {t("inspectionsPage.inspectors.noVehiclesAssignedHint")}
                </p>
              </div>
            </div>
          )}
        </div>
        {/* ── Actions ─────────────────────────────── */}
        {(onEdit || onDelete) && (
          <>
            <div className="h-px bg-border/50" />
            <div className="flex items-center justify-end gap-1 p-0 m-0">
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
