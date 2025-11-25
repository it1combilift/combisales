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

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("es-PA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateShort(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("es-PA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString("es-PA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function getRoleBadge(role: Role) {
  if (role === Role.ADMIN) {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 font-medium"
      >
        <ShieldCheck className="size-3.5" />
        Admin
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="gap-1.5 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/50 font-medium"
    >
      <PackageCheck className="size-3.5" />
      Vendedor
    </Badge>
  );
}
