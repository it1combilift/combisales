"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Machine } from "@/interfaces/machine";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  CheckCircle2,
  XCircle,
  Camera,
  Plane,
  FileText,
  ShieldCheck,
  Eye,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface MachinesTableProps {
  machines: Machine[];
  onViewMachine?: (machine: Machine) => void;
}

type SortField =
  | "description"
  | "serialNumber"
  | "status"
  | "location"
  | "usageHours"
  | "usageHoursDate";
type SortDirection = "asc" | "desc";

export function MachinesTable({ machines, onViewMachine }: MachinesTableProps) {
  const [sortField, setSortField] = useState<SortField>("description");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedMachines = [...machines].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "description":
        comparison = a.description.localeCompare(b.description);
        break;
      case "serialNumber":
        comparison = a.serialNumber.localeCompare(b.serialNumber);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "location":
        comparison = a.location.localeCompare(b.location);
        break;
      case "usageHours":
        comparison = a.usageHours - b.usageHours;
        break;
      case "usageHoursDate":
        comparison =
          new Date(a.usageHoursDate).getTime() -
          new Date(b.usageHoursDate).getTime();
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="size-3 ml-0.5" />
    ) : (
      <ChevronDown className="size-3 ml-0.5" />
    );
  };

  const SortableHeader = ({
    field,
    children,
    className,
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead
      className={cn(
        "font-medium text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors whitespace-nowrap",
        className
      )}
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center">
        {children}
        <SortIcon field={field} />
      </span>
    </TableHead>
  );

  return (
    <TooltipProvider>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
                <TableHead className="w-14 font-medium text-xs text-muted-foreground p-2">
                  Img
                </TableHead>
                <SortableHeader field="description">Máquina</SortableHeader>
                <SortableHeader
                  field="serialNumber"
                  className="hidden sm:table-cell"
                >
                  S/N
                </SortableHeader>
                <SortableHeader field="status">Estado</SortableHeader>
                <TableHead className="font-medium text-xs text-muted-foreground hidden md:table-cell">
                  Disp.
                </TableHead>
                <SortableHeader
                  field="location"
                  className="hidden lg:table-cell"
                >
                  Ubicación
                </SortableHeader>
                <SortableHeader field="usageHours" className="text-right">
                  Horas
                </SortableHeader>
                <SortableHeader
                  field="usageHoursDate"
                  className="hidden xl:table-cell"
                >
                  Fecha
                </SortableHeader>
                <TableHead className="font-medium text-xs text-muted-foreground hidden lg:table-cell">
                  Docs
                </TableHead>
                <TableHead className="w-10 p-2"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMachines.map((machine) => (
                <TableRow
                  key={machine.id}
                  className="hover:bg-muted/20 transition-colors cursor-pointer group"
                  onClick={() => onViewMachine?.(machine)}
                >
                  <TableCell className="p-2">
                    <div className="relative w-12 h-9 rounded overflow-hidden bg-muted">
                      <Image
                        src={machine.image || "/placeholder.svg"}
                        alt={machine.description}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="font-medium text-sm text-foreground leading-tight">
                      {machine.description}
                    </div>
                    {machine.options && (
                      <div className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[150px]">
                        {machine.options}
                      </div>
                    )}
                    <div className="text-[10px] font-mono text-muted-foreground mt-0.5 sm:hidden">
                      {machine.serialNumber}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground hidden sm:table-cell py-2">
                    {machine.serialNumber}
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 py-0 h-5 font-medium",
                        machine.status === "Operativa"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                      )}
                    >
                      {machine.status === "Operativa" ? (
                        <>
                          <CheckCircle2 className="size-2.5 mr-0.5" />
                          <span>{machine.status}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="size-2.5 mr-0.5" />
                          <span>{machine.status}</span>
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-2">
                    {machine.available ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-5 font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                      >
                        Disponible
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 h-5 font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      >
                        No disponible
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-foreground hidden lg:table-cell py-2">
                    {machine.location}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-foreground py-2">
                    {formatHours(machine.usageHours)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden xl:table-cell py-2">
                    {formatDate(machine.usageHoursDate)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell py-2">
                    <div className="flex items-center gap-0.5">
                      {machine.insured && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <ShieldCheck className="size-3.5 text-emerald-500" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            Asegurada
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {machine.hasPhotos && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Camera className="size-3.5 text-blue-500" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            Fotos
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {machine.hasTraveller && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Plane className="size-3.5 text-violet-500" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            Traveller
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {machine.hasCE && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <FileText className="size-3.5 text-amber-500" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            Cert. CE
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="p-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewMachine?.(machine);
                      }}
                    >
                      <Eye className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
}
