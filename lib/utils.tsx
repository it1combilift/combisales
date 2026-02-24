import { Role } from "@prisma/client";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { Badge } from "@/components/ui/badge";
import { IconTruckDelivery } from "@tabler/icons-react";
import { ShieldCheck, PackageCheck, ClipboardCheck } from "lucide-react";
import { useTranslation } from "./i18n/context";

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

export function formatDate(
  date: string | Date,
  locale: string = "es-PA",
): string {
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

export function formatDateShort(
  date: string | Date,
  locale: string = "es-PA",
): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(
  date: string | Date,
  locale: string = "es-PA",
): string {
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
  const { t } = useTranslation();

  if (role === Role.ADMIN) {
    return (
      <Badge
        variant="outline-info"
        key={`role-badge-admin-${label || t("users.roles.admin")}`}
      >
        <ShieldCheck className="size-3.5" />
        {label || t("users.roles.admin")}
      </Badge>
    );
  }

  if (role === Role.DEALER) {
    return (
      <Badge
        variant="outline-warning"
        key={`role-badge-dealer-${label || t("users.roles.dealer")}`}
      >
        <IconTruckDelivery className="size-3.5" />
        {label || t("users.roles.dealer")}
      </Badge>
    );
  }

  if (role === Role.INSPECTOR) {
    return (
      <Badge
        variant="purple"
        key={`role-badge-inspector-${label || t("users.roles.inspector")}`}
      >
        <ClipboardCheck className="size-3.5" />
        {label || t("users.roles.inspector")}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline-success"
      key={`role-badge-manager-${label || t("users.roles.seller")}`}
    >
      <PackageCheck className="size-3.5" />
      {label || t("users.roles.seller")}
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
