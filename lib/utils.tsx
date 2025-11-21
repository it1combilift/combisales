import { Role } from "@prisma/client";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { Badge } from "@/components/ui/badge";
import { PackageCheck, ShieldCheckIcon } from "lucide-react";

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
        variant="outline"
        className="gap-1.5 border-2 border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 font-medium px-2.5 py-1"
      >
        <ShieldCheckIcon className="size-3.5" />
        ADMIN
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="gap-1.5 border-2 border-green-600 dark:border-green-400 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950 font-medium px-2.5 py-1"
    >
      <PackageCheck className="size-3.5" />
      VENDEDOR
    </Badge>
  );
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};
