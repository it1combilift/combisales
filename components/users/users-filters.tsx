"use client";

import * as React from "react";
import { Role } from "@prisma/client";
import { CheckCheck, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { ColumnFiltersState } from "@tanstack/react-table";

import {
  Users,
  Search,
  ShieldCheck,
  Package,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UsersFiltersProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
}

export function UsersFilters({
  globalFilter,
  setGlobalFilter,
  columnFilters,
  setColumnFilters,
}: UsersFiltersProps) {
  const roleFilter =
    (columnFilters.find((f) => f.id === "role")?.value as string[]) || [];
  const statusFilter =
    (columnFilters.find((f) => f.id === "isActive")?.value as boolean[]) || [];

  const setRoleFilter = (value: string) => {
    if (value === "todos") {
      setColumnFilters((prev) => prev.filter((f) => f.id !== "role"));
    } else {
      setColumnFilters((prev) => {
        const filtered = prev.filter((f) => f.id !== "role");
        return [...filtered, { id: "role", value: [value] }];
      });
    }
  };

  const setStatusFilter = (value: string) => {
    if (value === "todos") {
      setColumnFilters((prev) => prev.filter((f) => f.id !== "isActive"));
    } else {
      setColumnFilters((prev) => {
        const filtered = prev.filter((f) => f.id !== "isActive");
        return [...filtered, { id: "isActive", value: [value === "active"] }];
      });
    }
  };

  const hasActiveFilters =
    globalFilter || roleFilter.length > 0 || statusFilter.length > 0;

  const clearAllFilters = () => {
    setGlobalFilter("");
    setColumnFilters([]);
  };

  return (
    <div className="w-full space-y-3">
      {/* Filters Container */}
      <div className="grid grid-cols-2 lg:grid-cols-[1fr_200px_200px_auto] gap-3 items-end">
        {/* Search Input */}
        <div className="w-full space-y-1.5 sm:col-span-2 lg:col-span-1">
          <Label
            htmlFor="search-users"
            className="text-xs font-medium text-muted-foreground"
          >
            Búsqueda
          </Label>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search-users"
              placeholder="Buscar..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="h-10 pl-9 text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* Role Filter */}
        <div className="w-full space-y-1.5">
          <Label
            htmlFor="filter-role"
            className="text-xs font-medium text-muted-foreground"
          >
            Rol
          </Label>
          <Select
            value={roleFilter.length > 0 ? roleFilter[0] : "todos"}
            onValueChange={setRoleFilter}
          >
            <SelectTrigger
              id="filter-role"
              className="h-10 w-full text-xs sm:text-sm"
            >
              <SelectValue placeholder="Todos los roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">
                <div className="flex items-center gap-2">
                  <Users className="size-3.5" />
                  <span>Todos</span>
                </div>
              </SelectItem>
              <SelectItem value={Role.ADMIN}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-3.5" />
                  <span>Admin</span>
                </div>
              </SelectItem>
              <SelectItem value={Role.SELLER}>
                <div className="flex items-center gap-2">
                  <Package className="size-3.5" />
                  <span>Vendedor</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="w-full space-y-1.5">
          <Label
            htmlFor="filter-status"
            className="text-xs font-medium text-muted-foreground"
          >
            Estado
          </Label>
          <Select
            value={
              statusFilter.length > 0
                ? statusFilter[0]
                  ? "active"
                  : "inactive"
                : "todos"
            }
            onValueChange={setStatusFilter}
          >
            <SelectTrigger
              id="filter-status"
              className="h-10 w-full text-xs sm:text-sm"
            >
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">
                <div className="flex items-center gap-2">
                  <CheckCheck className="size-3.5" />
                  <span>Todos</span>
                </div>
              </SelectItem>
              <SelectItem value="active">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5" />
                  <span>Activos</span>
                </div>
              </SelectItem>
              <SelectItem value="inactive">
                <div className="flex items-center gap-2">
                  <XCircle className="size-3.5" />
                  <span>Inactivos</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Button - Aligned to bottom */}
        {hasActiveFilters && (
          <div className="w-full sm:col-span-2 lg:col-span-1 lg:w-auto">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              size="sm"
              className="h-10 gap-2 w-full lg:w-auto lg:px-4"
            >
              <X className="size-4" />
              <span className="sm:inline">Limpiar filtros</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
