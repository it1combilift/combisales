"use client";

import * as React from "react";
import { Role } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, X } from "lucide-react";
import { TableRowSkeleton } from "@/components/ui/skeleton";

import {
  Users,
  Search,
  ShieldCheck,
  Package,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  rowSelection?: Record<string, boolean>;
  setRowSelection?: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  rowSelection: externalRowSelection,
  setRowSelection: setExternalRowSelection,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [internalRowSelection, setInternalRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Use external rowSelection if provided, otherwise use internal
  const rowSelection = externalRowSelection ?? internalRowSelection;
  const setRowSelection = setExternalRowSelection ?? setInternalRowSelection;

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const roleFilter =
    (columnFilters.find((f) => f.id === "role")?.value as string[]) || [];
  const statusFilter =
    (columnFilters.find((f) => f.id === "isActive")?.value as boolean[]) || [];

  const setRoleFilter = (value: string) => {
    if (value === "todos") {
      table.getColumn("role")?.setFilterValue(undefined);
    } else {
      table.getColumn("role")?.setFilterValue([value]);
    }
  };

  const setStatusFilter = (value: string) => {
    if (value === "todos") {
      table.getColumn("isActive")?.setFilterValue(undefined);
    } else {
      table.getColumn("isActive")?.setFilterValue([value === "active"]);
    }
  };

  const hasActiveFilters =
    globalFilter || roleFilter.length > 0 || statusFilter.length > 0;

  const clearAllFilters = () => {
    setGlobalFilter("");
    table.getColumn("role")?.setFilterValue(undefined);
    table.getColumn("isActive")?.setFilterValue(undefined);
  };

  return (
    <section className="w-full space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-xs space-y-1.5">
            <Label htmlFor="search-users" className="text-xs font-medium">
              Búsqueda
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search-users"
                placeholder="Buscar por nombre o email..."
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="h-10 pl-9"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="filter-role" className="text-xs font-medium">
                Rol
              </Label>
              <Select
                value={roleFilter.length > 0 ? roleFilter[0] : "todos"}
                onValueChange={setRoleFilter}
              >
                <SelectTrigger id="filter-role" className="h-10 w-[140px]">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">
                    <div className="flex items-center gap-2">
                      <Users className="size-4" />
                      <span>Todos</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={Role.ADMIN}>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value={Role.SELLER}>
                    <div className="flex items-center gap-2">
                      <Package className="size-4" />
                      <span>Vendedor</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-status" className="text-xs font-medium">
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
                <SelectTrigger id="filter-status" className="h-10 w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">
                    <div className="flex items-center gap-2">
                      <Users className="size-4" />
                      <span>Todos</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="active">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4" />
                      <span>Activos</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <div className="flex items-center gap-2">
                      <XCircle className="size-4" />
                      <span>Inactivos</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="h-10"
            >
              <X className="size-4" />
              Limpiar
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 gap-2 bg-transparent">
                <Filter className="size-4" />
                Columnas
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === "name"
                        ? "Usuario"
                        : column.id === "role"
                        ? "Rol"
                        : column.id === "createdAt"
                        ? "Fecha"
                        : column.id === "country"
                        ? "País"
                        : column.id === "isActive"
                        ? "Cuenta"
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Selection Info */}
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-2">
            {table.getFilteredSelectedRowModel().rows.length} de{" "}
            {table.getFilteredRowModel().rows.length} fila(s) seleccionadas
          </Badge>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRowSkeleton key={i} />
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-[400px] text-center"
                >
                  <Empty className="border-0">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Users />
                      </EmptyMedia>
                      <EmptyTitle>No se encontraron usuarios</EmptyTitle>
                      <EmptyDescription>
                        {hasActiveFilters
                          ? "Intenta ajustar tus filtros de búsqueda"
                          : "No hay usuarios registrados en el sistema"}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando{" "}
          <span className="font-medium text-foreground">
            {table.getFilteredRowModel().rows.length}
          </span>{" "}
          de <span className="font-medium text-foreground">{data.length}</span>{" "}
          usuario(s)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">Página</span>
            <span className="font-medium">
              {table.getState().pagination.pageIndex + 1}
            </span>
            <span className="text-muted-foreground">de</span>
            <span className="font-medium">{table.getPageCount()}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </section>
  );
}
