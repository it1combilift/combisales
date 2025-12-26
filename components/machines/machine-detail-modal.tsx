"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Machine } from "@/interfaces/machine";
import { ScrollArea } from "../ui/scroll-area";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Calendar,
  Building2,
  ShieldCheck,
  Camera,
  Plane,
  FileText,
  Ruler,
  Settings2,
  History,
} from "lucide-react";

interface MachineDetailModalProps {
  machine: Machine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MachineDetailModal({
  machine,
  open,
  onOpenChange,
}: MachineDetailModalProps) {
  if (!machine) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatHours = (hours: number) => {
    return hours.toLocaleString("es-ES", { maximumFractionDigits: 0 });
  };

  const certifications = [
    {
      key: "insured",
      label: "Seguro",
      icon: ShieldCheck,
      active: machine.insured,
      color: "emerald",
    },
    {
      key: "photos",
      label: "Fotos",
      icon: Camera,
      active: machine.hasPhotos,
      color: "blue",
    },
    {
      key: "traveller",
      label: "Traveller",
      icon: Plane,
      active: machine.hasTraveller,
      color: "violet",
    },
    {
      key: "ce",
      label: "CE",
      icon: FileText,
      active: machine.hasCE,
      color: "amber",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[calc(100vw-2rem)] max-h-[85vh] p-0 gap-0 overflow-hidden">
        <ScrollArea className="max-h-[85vh]">
          <div className="relative aspect-video overflow-hidden bg-muted">
            <Image
              src={machine.image || "/placeholder.svg"}
              alt={machine.description}
              fill
              className="object-cover"
              sizes="(max-width: 512px) 100vw, 512px"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute top-3 left-3 right-3 flex gap-1.5">
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
              <Badge
                variant={machine.available ? "info" : "destructive"}
              >
                {machine.available ? "Disponible" : "No disponible"}
              </Badge>
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <h2 className="text-xl font-bold text-white drop-shadow-lg leading-tight">
                {machine.description}
              </h2>
              <p className="text-white/80 font-mono text-sm mt-0.5 drop-shadow">
                S/N: {machine.serialNumber}
              </p>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <DialogHeader className="sr-only">
              <DialogTitle>{machine.description}</DialogTitle>
            </DialogHeader>

            {machine.options && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Settings2 className="size-3.5" />
                <span>Opcionales:</span>
                <span className="text-foreground font-medium">
                  {machine.options}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <InfoItem
                icon={MapPin}
                label="Ubicación"
                value={machine.location}
              />
              <InfoItem
                icon={Clock}
                label="Horas"
                value={`${formatHours(machine.usageHours)} h`}
              />
              <InfoItem
                icon={Calendar}
                label="Fecha"
                value={formatDate(machine.usageHoursDate)}
              />
              {machine.height && (
                <InfoItem icon={Ruler} label="Altura" value={machine.height} />
              )}
              {machine.dealer && (
                <InfoItem
                  icon={Building2}
                  label="Distribuidor"
                  value={machine.dealer}
                  className="col-span-2"
                />
              )}
            </div>

            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                Documentación
              </h4>
              <div className="grid grid-cols-4 gap-1.5">
                {certifications.map(
                  ({ key, label, icon: Icon, active, color }) => (
                    <div
                      key={key}
                      className={cn(
                        "flex items-center justify-center gap-1 py-2 px-1 rounded-lg border text-center transition-colors",
                        active
                          ? `bg-${color}-500/10 border-${color}-500/20 text-${color}-600 dark:text-${color}-400`
                          : "bg-muted/50 border-border text-muted-foreground/50"
                      )}
                      style={{
                        backgroundColor: active
                          ? `var(--${color}-bg)`
                          : undefined,
                      }}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          active
                            ? `text-${color}-500`
                            : "text-muted-foreground/50"
                        )}
                      />
                      <span className="text-[10px] font-medium leading-tight">
                        {label}
                      </span>
                      {active ? (
                        <CheckCircle2
                          className={cn(
                            "size-3 shrink-0",
                            `text-${color}-500`
                          )}
                        />
                      ) : (
                        <XCircle className="size-3 shrink-0 text-muted-foreground/30" />
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            {machine.history && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <History className="size-3.5" />
                  Historial
                </h4>
                <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground leading-relaxed max-h-28 overflow-y-auto">
                  {machine.history}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg bg-muted/30",
        className
      )}
    >
      <div className="p-1.5 rounded-md bg-background shadow-sm shrink-0">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-muted-foreground leading-none">
          {label}
        </p>
        <p className="text-xs font-medium text-foreground truncate mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}
