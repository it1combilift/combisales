import { Role } from "@prisma/client";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { Badge } from "@/components/ui/badge";
import { ShieldCheckIcon, User } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const getInitials = (name: string | null) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const getRoleBadge = (role: Role) => {
  if (role === Role.ADMIN) {
    return (
      <Badge
        variant="default"
        className="gap-1.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0 shadow-sm font-medium px-2.5 py-1"
      >
        <ShieldCheckIcon className="size-3.5" />
        ADMIN
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      className="gap-1.5 bg-linear-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-500/20 font-medium px-2.5 py-1"
    >
      <User className="size-3.5" />
      VENDEDOR
    </Badge>
  );
}; export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};