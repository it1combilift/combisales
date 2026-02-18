"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDateShort, getInitials } from "@/lib/utils";
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
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
}

export function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
  const { t } = useTranslation();

  const inspectionCount = (vehicle as any)._count?.inspections || 0;
  const isActive = vehicle.status === VehicleStatus.ACTIVE;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border rounded-2xl bg-card shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-sm hover:shadow-black/8 flex flex-col p-0",
        "shadow-sm transition-all duration-300 ease-out",
        "hover:-translate-y-1.5",
        "flex flex-col p-0",
      )}
    >
      {/* ---- Image Section ---- */}
      <div className="relative h-48 sm:h-44 overflow-hidden bg-secondary/50 shrink-0">
        {vehicle.imageUrl ? (
          <>
            <Image
              src={vehicle.imageUrl}
              alt={`${vehicle.model} - ${vehicle.plate}`}
              fill
              className="object-contain object-center transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Gradient overlay - works in light and dark mode */}
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/10 dark:from-black/60 dark:via-black/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary">
            <div className="size-14 rounded-2xl bg-muted flex items-center justify-center">
              <Car className="size-7 text-muted-foreground/40" />
            </div>
            <span className="text-xs text-muted-foreground/60 font-medium uppercase tracking-[0.2em]">
              {t("inspectionsPage.noImage")}
            </span>
          </div>
        )}

        {/* Status pill */}
        <div className="absolute top-3 right-3 z-10">
          <Badge variant={isActive ? "outline-success" : "outline-destructive"}>
            {isActive ? (
              <CheckCircle2 className="size-3" />
            ) : (
              <XCircle className="size-3" />
            )}
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Quick actions on hover */}
        {(onEdit || onDelete) && (
          <div className="absolute top-3 left-3 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-1 group-hover:translate-y-0">
            {onEdit && (
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(vehicle);
                }}
                aria-label={`Edit ${vehicle.model}`}
                className={cn(
                  "size-8 rounded-xl backdrop-blur-md flex items-center justify-center",
                  "transition-all duration-200 cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <Edit className="size-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(vehicle);
                }}
                aria-label={`Delete ${vehicle.model}`}
                variant="destructive"
                className={cn(
                  "size-8 rounded-xl backdrop-blur-md flex items-center justify-center",
                  "transition-all duration-200 cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        )}

        {/* Plate badge — anchored at bottom */}
        <div className="absolute bottom-3 left-3 z-10">
          <span
            className={cn(
              "inline-flex items-center px-3 py-1.5 rounded-xl",
              "font-mono text-xs font-bold tracking-[0.15em]",
              "bg-foreground/40 text-card backdrop-blur-md",
              "border border-card/10 shadow-sm",
            )}
          >
            {vehicle.plate}
          </span>
        </div>
      </div>

      {/* ---- Body ---- */}
      <CardContent className="px-5 py-4 flex-1 flex flex-col gap-4">
        {/* Model name */}
        <h3 className="font-semibold text-sm text-card-foreground truncate leading-snug text-balance">
          {vehicle.model}
        </h3>

        {/* Inspector */}
        <div className="flex items-center gap-3 min-w-0">
          {vehicle.assignedInspector ? (
            <>
              <Avatar className="size-10 shrink-0 ring-2 ring-border">
                <AvatarImage
                  className="object-center object-cover"
                  src={vehicle.assignedInspector.image || undefined}
                  alt={
                    vehicle.assignedInspector.name ||
                    vehicle.assignedInspector.email
                  }
                />
                <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-bold">
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
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {vehicle.assignedInspector.email}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="size-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="size-4" />
              </div>
              <span className="text-xs italic">No inspector assigned</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-border/60" />

        {/* Stats row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            {/* Inspections count */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-default">
                  <div className="size-7 rounded-lg bg-secondary flex items-center justify-center">
                    <ClipboardCheck className="size-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-semibold text-card-foreground tabular-nums">
                    {inspectionCount}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {inspectionCount} inspection{inspectionCount !== 1 ? "s" : ""}
              </TooltipContent>
            </Tooltip>

            {/* Date */}
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-secondary flex items-center justify-center">
                <Calendar className="size-3.5 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDateShort(vehicle.createdAt)}
              </span>
            </div>
          </div>

          {/* Active indicator dot with pulse */}
          <span className="relative flex size-2.5">
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75",
                isActive ? "bg-success animate-ping" : "bg-destructive",
              )}
            />
            <span
              className={cn(
                "relative inline-flex size-2.5 rounded-full",
                isActive ? "bg-success" : "bg-destructive",
              )}
            />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
