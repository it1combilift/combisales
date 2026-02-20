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
  Car,
  User,
  Calendar,
  ClipboardCheck,
  Trash2,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  PencilLine,
  Play,
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
              <Car className="size-6 text-muted-foreground/50" />
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

                {vehicle.status === VehicleStatus.ACTIVE && (onEdit || onDelete) && (
                  <DropdownMenuSeparator />
                )}

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

        {/* Plate badge */}
        <div className="absolute bottom-3 left-3 z-10">
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-lg",
              "font-mono text-[11px] font-bold tracking-widest",
              "bg-background/80 text-foreground backdrop-blur-sm",
              "border border-border/30 shadow-sm font-mono",
            )}
          >
            {vehicle.model} - {vehicle.plate}
          </span>
        </div>
      </div>

      {/* ---- Body ---- */}
      <CardContent className="px-4 pb-4 flex-1 flex flex-col gap-3">
        {/* Inspector */}
        <div className="flex items-center gap-2.5 min-w-0">
          {vehicle.assignedInspector ? (
            <>
              <Avatar className="size-8 shrink-0 ring-2 ring-border/60 group-hover:ring-primary/20 transition-all duration-300">
                <AvatarImage
                  className="object-cover object-center"
                  src={vehicle.assignedInspector.image || undefined}
                  alt={
                    vehicle.assignedInspector.name ||
                    vehicle.assignedInspector.email
                  }
                />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                  {getInitials(
                    vehicle.assignedInspector.name ||
                      vehicle.assignedInspector.email,
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-card-foreground truncate leading-tight">
                  {vehicle.assignedInspector.name ||
                    vehicle.assignedInspector.email}
                </p>
                {vehicle.assignedInspector.name && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {vehicle.assignedInspector.email}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <div className="size-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="size-3.5" />
              </div>
              <span className="text-[11px] italic">
                {t("inspectionsPage.vehicleCard.noInspector")}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50" />

        {/* Stats */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
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
              <div className="size-6 rounded-md bg-amber-500/10 flex items-center justify-center">
                <Calendar className="size-3 text-amber-500" />
              </div>
              <span className="text-[11px] text-muted-foreground">
                {formatDate(vehicle.createdAt, locale)}
              </span>
            </div>
          </div>

          {/* Pulse dot */}
          <span className="relative flex size-2">
            <span
              className={cn(
                "relative inline-flex size-2 rounded-full animate-pulse",
                isActive ? "bg-emerald-500" : "bg-destructive",
              )}
            />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
