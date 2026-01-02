"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Machine } from "@/interfaces/machine";
import { Button } from "@/components/ui/button";
import { cn, formatDateShort } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

import {
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Calendar,
  Building2,
  FileText,
  Camera,
  Plane,
  ShieldCheck,
  Ruler,
  Settings2,
  ArrowUpRight,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface MachineCardProps {
  machine: Machine;
  onViewDetails?: (machine: Machine) => void;
}

export function MachineCard({ machine, onViewDetails }: MachineCardProps) {
  const { t, locale } = useI18n();

  const formatHours = (hours: number) => {
    return hours.toLocaleString(locale, { maximumFractionDigits: 0 });
  };

  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/20 bg-card flex flex-col pt-0">
      <div className="relative h-72 overflow-hidden bg-muted">
        <Image
          src={machine.image || "/placeholder.svg"}
          alt={machine.description}
          className="object-cover transition-transform duration-300 group-hover:scale-105 object-center"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          fill
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1.5">
          <Badge
            variant={machine.status === "Operativa" ? "success" : "destructive"}
          >
            {machine.status === "Operativa" ? (
              <CheckCircle2 className="size-3" />
            ) : (
              <XCircle className="size-3" />
            )}
            {machine.status}
          </Badge>
          <Badge variant={machine.available ? "info" : "destructive"}>
            {machine.available ? t("machines.availabilities.available") : t("machines.availabilities.notAvailable")}
          </Badge>
        </div>
        <div className="absolute bottom-2 left-2 right-2">
          <h3 className="font-bold text-base text-white leading-tight drop-shadow-md truncate">
            {machine.description}
          </h3>
          <p className="text-xs text-white/80 font-mono drop-shadow">
            S/N: {machine.serialNumber}
          </p>
        </div>
      </div>

      <CardContent className="px-3 flex-1 flex flex-col gap-2.5">
        {machine.options && (
          <Badge variant="outline" className="w-fit text-[10px] h-5 px-2">
            <Settings2 className="size-2.5" />
            {machine.options}
          </Badge>
        )}

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          <div className="flex items-center gap-1.5 text-xs">
            <MapPin className="size-3 text-muted-foreground shrink-0" />
            <span className="text-foreground truncate">{machine.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="size-3 text-muted-foreground shrink-0" />
            <span className="text-foreground font-medium">
              {formatHours(machine.usageHours)} h
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar className="size-3 text-muted-foreground shrink-0" />
            <span className="text-foreground">
              {formatDateShort(machine.usageHoursDate)}
            </span>
          </div>
          {machine.height && (
            <div className="flex items-center gap-1.5 text-xs">
              <Ruler className="size-3 text-muted-foreground shrink-0" />
              <span className="text-foreground">{machine.height}</span>
            </div>
          )}
        </div>

        {machine.dealer && (
          <div className="flex items-center gap-1.5 text-xs py-1.5 px-2 rounded-md bg-muted/50">
            <Building2 className="size-3 text-muted-foreground shrink-0" />
            <span className="text-foreground font-medium truncate">
              {machine.dealer}
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {machine.insured && (
            <Badge
              variant="secondary"
              className="text-[10px] h-5 px-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0"
            >
              <ShieldCheck className="size-2.5" />
              {t("machines.insurance")}
            </Badge>
          )}
          {machine.hasPhotos && (
            <Badge
              variant="secondary"
              className="text-[10px] h-5 px-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0"
            >
              <Camera className="size-2.5" />
              {t("machines.card.photos")}
            </Badge>
          )}
          {machine.hasTraveller && (
            <Badge
              variant="secondary"
              className="text-[10px] h-5 px-1.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-0"
            >
              <Plane className="size-2.5" />
              Traveller
            </Badge>
          )}
          {machine.hasCE && (
            <Badge
              variant="secondary"
              className="text-[10px] h-5 px-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0"
            >
              <FileText className="size-2.5" />
              CE
            </Badge>
          )}
        </div>

        <div className="mt-auto pt-1.5 flex flex-col gap-1.5">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(machine)}
            >
              <ArrowUpRight className="size-4" />
              {t("machines.card.details")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
