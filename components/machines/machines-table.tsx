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
import { useI18n } from "@/lib/i18n/context";

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
  const { t, locale } = useI18n();
  const [sortField, setSortField] = useState<SortField>("description");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatHours = (hours: number) => {
    return hours.toLocaleString(locale, { maximumFractionDigits: 0 });
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
                  {t("machines.table.image")}
                </TableHead>
                <SortableHeader field="description">{t("machines.table.machine")}</SortableHeader>
                <SortableHeader
                  field="serialNumber"
                  className="hidden sm:table-cell"
                >
                  {t("machines.serialNumber")}
                </SortableHeader>
                <SortableHeader field="status">{t("machines.status")}</SortableHeader>
                <TableHead className="font-medium text-xs text-muted-foreground hidden md:table-cell">
                  {t("machines.table.availabilityShort")}
                </TableHead>
                <SortableHeader
                  field="location"
                  className="hidden lg:table-cell"
                >
                  {t("machines.location")}
                </SortableHeader>
                <SortableHeader field="usageHours" className="text-right">
                  {t("machines.card.hours")}
                </SortableHeader>
                <SortableHeader
                  field="usageHoursDate"
                  className="hidden xl:table-cell"
                >
                  {t("machines.card.date")}
                </SortableHeader>
                <TableHead className="font-medium text-xs text-muted-foreground hidden lg:table-cell">
                  {t("machines.table.docs")}
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
                      variant={
                        machine.status === "Operativa"
                          ? "success"
                          : "destructive"
                      }
                      className="text-[10px] px-1.5 py-0 h-5 flex items-center gap-0.5 font-medium"
                    >
                      {machine.status === "Operativa" ? (
                        <>
                          <CheckCircle2 className="size-2.5" />
                          <span>{t("machines.statuses.operational")}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="size-2.5" />
                          <span>{machine.status}</span>
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-2">
                    {machine.available ? (
                      <Badge
                        variant="info"
                        className="text-[10px] px-1.5 py-0 h-5 flex items-center gap-0.5 font-medium"
                      >
                        <CheckCircle2 className="size-2.5" />
                        {t("machines.availabilities.available")}
                      </Badge>
                    ) : (
                      <Badge
                        variant="destructive"
                        className="text-[10px] px-1.5 py-0 h-5 flex items-center gap-0.5 font-medium"
                      >
                        <XCircle className="size-2.5" />
                        {t("machines.availabilities.notAvailable")}
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
                            {t("machines.insured")}
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {machine.hasPhotos && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Camera className="size-3.5 text-blue-500" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {t("machines.card.photos")}
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {machine.hasTraveller && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Plane className="size-3.5 text-violet-500" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {t("machines.card.traveller")}
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {machine.hasCE && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <FileText className="size-3.5 text-amber-500" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {t("machines.card.ce")}
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
