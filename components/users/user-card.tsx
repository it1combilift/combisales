"use client";

import { User } from "@/types/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { getInitials, formatDate, getRoleBadge } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Pencil,
  Trash,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserCardProps {
  user: User;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserCard({
  user,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: UserCardProps) {
  return (
    <Card className="relative">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              aria-label={`Seleccionar ${user.name || user.email}`}
              className="mt-1"
            />
            <Avatar className="size-12 rounded-lg shrink-0">
              <AvatarImage
                src={user.image || undefined}
                alt={user.name || ""}
              />
              <AvatarFallback className="text-sm font-semibold rounded-lg bg-linear-to-br from-primary/20 to-primary/5">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <CardTitle className="text-base truncate">
                {user.name || "Sin nombre"}
              </CardTitle>
              <CardDescription className="truncate">
                {user.email}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0 shrink-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Pencil className="mr-2 size-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(user)}
                variant="destructive"
              >
                <Trash className="mr-2 size-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4 pb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Rol</p>
            {getRoleBadge(user.role)}
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Estado</p>
            {user.isActive ? (
              <Badge
                variant="outline"
                className="gap-1.5 border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/50 font-medium"
              >
                <CheckCircle2 className="size-3" />
                Activa
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1.5 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 font-medium"
              >
                <XCircle className="size-3" />
                Inactiva
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">País</p>
            <p className="text-sm font-medium">
              {user.country || "No especificado"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Creado</p>
            <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
