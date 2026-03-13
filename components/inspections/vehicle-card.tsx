"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { Vehicle, VehicleStatus } from "@/interfaces/inspection";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  User,
  ClipboardCheck,
  Trash2,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  PencilLine,
  Play,
  Fuel,
  Palette,
  CarFront,
  CalendarDays,
  Hash,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  onStartInspection?: (vehicle: Vehicle) => void;
}

export function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
  onStartInspection,
}: VehicleCardProps) {
  const { t, locale } = useTranslation();
  const inspectionCount = vehicle._count?.inspections ?? 0;
  const isActive = vehicle.status === VehicleStatus.ACTIVE;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/60 bg-card p-0",
        "shadow-sm transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-md hover:border-border",
        "flex flex-col",
      )}
    >
      {/* ---- Image ---- */}
      <div className="relative aspect-16/10 overflow-hidden bg-secondary/40 shrink-0">
        {vehicle.imageUrl ? (
          <>
            <Image
              src={vehicle.imageUrl}
              alt={`${vehicle.model} - ${vehicle.plate}`}
              fill
              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-foreground/50 via-foreground/5 to-transparent dark:from-foreground/0 dark:via-foreground/10" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary/60">
            <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
              <CarFront className="size-6 text-muted-foreground/50" />
            </div>
            <span className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-widest">
              {t("inspectionsPage.vehicleCard.noImage")}
            </span>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge
            variant={isActive ? "outline-success" : "outline-destructive"}
            className="backdrop-blur-sm bg-background/70 dark:bg-background/50 text-[11px] font-semibold"
          >
            {isActive ? (
              <CheckCircle2 className="size-3" />
            ) : (
              <XCircle className="size-3" />
            )}
            {isActive
              ? t("inspectionsPage.vehicleCard.active")
              : t("inspectionsPage.vehicleCard.inactive")}
          </Badge>
        </div>

        {/* Actions dropdown */}
        {(onEdit || onDelete || onStartInspection) && (
          <div className="absolute top-3 left-3 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "size-8 rounded-lg backdrop-blur-sm bg-background/70 dark:bg-background/50",
                    "border-border/40 cursor-pointer",
                    "md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200",
                    "focus-visible:opacity-100",
                  )}
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">
                    {t("inspectionsPage.vehicleCard.actions")}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                {vehicle.status === VehicleStatus.ACTIVE &&
                  onStartInspection && (
                    <DropdownMenuItem
                      onClick={() => onStartInspection(vehicle)}
                      className="cursor-pointer"
                    >
                      <Play className="size-4" />
                      {t("inspectionsPage.vehicleCard.startInspection")}
                    </DropdownMenuItem>
                  )}

                {vehicle.status === VehicleStatus.ACTIVE &&
                  (onEdit || onDelete) && <DropdownMenuSeparator />}

                {onEdit && (
                  <DropdownMenuItem
                    onClick={() => onEdit(vehicle)}
                    className="cursor-pointer"
                  >
                    <PencilLine className="size-4" />
                    {t("inspectionsPage.vehicleCard.editVehicle")}
                  </DropdownMenuItem>
                )}

                {onEdit && onDelete && <DropdownMenuSeparator />}

                {onDelete && (
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(vehicle)}
                    className="cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                    {t("inspectionsPage.vehicleCard.deleteVehicle")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* ---- Body ---- */}
      <CardContent className="px-4  pb-4 flex-1 flex flex-col gap-3">
        {/* Vehicle name — primary identity, full width, truncates gracefully */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-card-foreground leading-snug line-clamp-2 text-pretty">
              {vehicle.model}
            </h3>
          </div>
          {/* Pulse dot */}
          <span className="relative flex size-2 mt-1.5 shrink-0">
            <span
              className={cn(
                "relative inline-flex size-2 rounded-full animate-pulse",
                isActive ? "bg-emerald-500" : "bg-destructive",
              )}
            />
          </span>
        </div>

        {/* Plate + Year + optional details row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Plate — distinct monospace badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md",
              "font-mono text-[11px] font-bold tracking-widest",
              "bg-foreground/5 text-foreground",
              "border border-border/50",
            )}
          >
            <Hash className="size-2.5 opacity-50" />
            {vehicle.plate}
          </span>

          {/* Year */}
          {vehicle.year && (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md",
                "text-[11px] font-medium text-muted-foreground",
                "bg-secondary/60 border border-border/30",
              )}
            >
              <CalendarDays className="size-2.5" />
              {vehicle.year}
            </span>
          )}

          {/* Color */}
          {vehicle.color && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Palette className="size-2.5" />
              {vehicle.color}
            </span>
          )}

          {/* Fuel */}
          {vehicle.fuelType && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Fuel className="size-2.5" />
              {vehicle.fuelType}
            </span>
          )}
        </div>

        {/* Inspector */}
        <div className="flex items-center gap-2.5 min-w-0">
          {vehicle.assignedInspector ? (
            <>
              <Avatar className="size-7 shrink-0 ring-2 ring-border/60 group-hover:ring-primary/20 transition-all duration-300">
                <AvatarImage
                  className="object-cover object-center"
                  src={vehicle.assignedInspector.image || undefined}
                  alt={
                    vehicle.assignedInspector.name ||
                    vehicle.assignedInspector.email
                  }
                />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {getInitials(
                    vehicle.assignedInspector.name ||
                      vehicle.assignedInspector.email,
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-card-foreground truncate leading-tight">
                  {vehicle.assignedInspector.name ||
                    vehicle.assignedInspector.email}
                </p>
                {vehicle.assignedInspector.name && (
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {vehicle.assignedInspector.email}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="size-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="size-3" />
              </div>
              <span className="text-[11px] italic">
                {t("inspectionsPage.vehicleCard.noInspector")}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50" />

        {/* Stats row */}
        <div className="flex items-center justify-between gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 cursor-default">
                <div className="size-6 rounded-md bg-violet-500/10 flex items-center justify-center">
                  <ClipboardCheck className="size-3 text-violet-500" />
                </div>
                <span className="text-xs font-semibold text-card-foreground tabular-nums">
                  {inspectionCount}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {inspectionCount === 1
                ? t("inspectionsPage.vehicleCard.inspectionCountSingular", {
                    count: inspectionCount,
                  })
                : t("inspectionsPage.vehicleCard.inspectionCount", {
                    count: inspectionCount,
                  })}
            </TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground">
              {formatDate(vehicle.createdAt, locale)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
