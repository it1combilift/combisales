import { Role } from "@prisma/client";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, PackageCheck } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string | null): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(date: string | Date, locale: string = "es-PA"): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateShort(date: string | Date, locale: string = "es-PA"): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date, locale: string = "es-PA"): string {
  const d = new Date(date);
  return d.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function getRoleBadge(role: Role, label?: string) {
  if (role === Role.ADMIN) {
    return (
      <Badge variant="info">
        <ShieldCheck className="size-3.5" />
        {label || "Admin"}
      </Badge>
    );
  }
  return (
    <Badge variant="success">
      <PackageCheck className="size-3.5" />
      {label || "Vendedor"}
    </Badge>
  );
}

export function getFormTypeName(formType: string): string {
  const names: Record<string, string> = {
    ANALISIS_CSS: "Análisis CSS",
    ANALISIS_INDUSTRIAL: "Análisis Industrial",
    ANALISIS_LOGISTICA: "Análisis Logística",
    ANALISIS_STRADDLE_CARRIER: "Análisis Straddle Carrier",
  };
  return names[formType] || formType;
}