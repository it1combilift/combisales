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
        className="gap-1.5 bg-blue-500 hover:bg-blue-600 text-white border-0 font-medium px-2.5 py-1"
      >
        <ShieldCheckIcon className="size-3.5" />
        ADMIN
      </Badge>
    );
  }
  return (
    <Badge
      variant="default"
      className="gap-1.5 bg-green-500 hover:bg-green-600 text-white border-0 font-medium px-2.5 py-1"
    >
      <User className="size-3.5" />
      VENDEDOR
    </Badge>
  );
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};
