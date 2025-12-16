"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/empty-card";
import { useIsMobile } from "@/components/ui/use-mobile";
import { VisitCardSkeleton } from "../dashboard-skeleton";
import { VisitCard } from "@/components/visits/visit-card";
import { VisitFormType, VisitStatus } from "@prisma/client";
import { GalleryHorizontalEnd, History, X } from "lucide-react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { FORM_TYPE_LABELS, VISIT_STATUS_LABELS } from "@/interfaces/visits";
import { Visit, DataTableProps, VISIT_STATUS_ICONS } from "@/interfaces/visits";

import {
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconFilter,
  IconLayoutColumns,
  IconSearch,
} from "@tabler/icons-react";

const COLUMN_LABELS: Record<string, string> = {
  formType: "Tipo de formulario",
  visitDate: "Fecha",
  status: "Estado",
  user: "Vendedor",
  actions: "Acciones",
};

export function VisitsDataTable<TData extends Visit, TValue>({
  columns,
  data,
  isLoading = false,
  rowSelection: externalRowSelection,
  setRowSelection: setExternalRowSelection,
  columnFilters: externalColumnFilters,
  setColumnFilters: setExternalColumnFilters,
  onView,
  onEdit,
  onDelete,
}: DataTableProps<TData, TValue>) {
  const isMobile = useIsMobile();

  const [searchQuery, setSearchQuery] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );
  const [pageIndex, setPageIndex] = useQueryState(
    "page",
    parseAsInteger.withDefault(1)
  );
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(10)
  );
  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsString.withDefault("")
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsString.withDefault("")
  );
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsString.withDefault("")
  );
  const [formTypeFilter, setFormTypeFilter] = useQueryState(
    "formType",
    parseAsString.withDefault("")
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [internalColumnFilters, setInternalColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [internalRowSelection, setInternalRowSelection] = React.useState({});
  const rowSelection = externalRowSelection ?? internalRowSelection;
  const setRowSelection = setExternalRowSelection ?? setInternalRowSelection;
  const globalFilter = searchQuery;
  const setGlobalFilter = setSearchQuery;
  const columnFilters = externalColumnFilters ?? internalColumnFilters;
  const setColumnFilters = setExternalColumnFilters ?? setInternalColumnFilters;

  React.useEffect(() => {
    if (sortBy && sortOrder) {
      setSorting([{ id: sortBy, desc: sortOrder === "desc" }]);
    }
  }, [sortBy, sortOrder]);

  React.useEffect(() => {
    if (sorting.length > 0) {
      setSortBy(sorting[0].id);
      setSortOrder(sorting[0].desc ? "desc" : "asc");
    } else {
      setSortBy(null);
      setSortOrder(null);
    }
  }, [sorting, setSortBy, setSortOrder]);

  React.useEffect(() => {
    const newFilters: ColumnFiltersState = [];
    if (statusFilter) {
      newFilters.push({ id: "status", value: [statusFilter] });
    }
    if (formTypeFilter) {
      newFilters.push({ id: "formType", value: [formTypeFilter] });
    }
    setColumnFilters(newFilters);
  }, [statusFilter, formTypeFilter, setColumnFilters]);

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
      pagination: {
        pageIndex: pageIndex - 1,
        pageSize,
      },
    },
    manualPagination: false,
    pageCount: Math.ceil(data.length / pageSize),
  });

  React.useEffect(() => {
    const tablePagination = table.getState().pagination;
    const internalPageIndex = pageIndex - 1;
    if (tablePagination.pageIndex !== internalPageIndex) {
      table.setPageIndex(internalPageIndex);
    }
    if (tablePagination.pageSize !== pageSize) {
      table.setPageSize(pageSize);
    }
  }, [pageIndex, pageSize, table]);

  const hasActiveFilters = globalFilter || statusFilter || formTypeFilter;

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter(null);
    setFormTypeFilter(null);
    setPageIndex(1);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-3 flex-row items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-full sm:max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar visitas..."
              value={searchQuery}
              onChange={(event) => {
                const value = event.target.value;
                setSearchQuery(value);
                setPageIndex(1);
              }}
              className="pl-9 h-10 text-xs sm:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 text-xs sm:text-sm"
                size="sm"
              >
                <IconFilter className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Estado</span>
                {statusFilter && (
                  <Badge variant="secondary" className="ml-1 px-1.5 text-xs">
                    1
                  </Badge>
                )}
                <IconChevronDown className="ml-1 size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={!statusFilter}
                onCheckedChange={() => {
                  setStatusFilter(null);
                  setPageIndex(1);
                }}
                className="cursor-pointer"
              >
                <GalleryHorizontalEnd className="size-3.5 inline-flex" />
                Todos
              </DropdownMenuCheckboxItem>
              {Object.entries(VISIT_STATUS_LABELS).map(([key, label]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={statusFilter === key}
                  onCheckedChange={() => {
                    setStatusFilter(statusFilter === key ? null : key);
                    setPageIndex(1);
                  }}
                  className="cursor-pointer"
                >
                  {VISIT_STATUS_ICONS[key as VisitStatus] && (
                    <span className="inline-flex">
                      {React.createElement(
                        VISIT_STATUS_ICONS[key as VisitStatus],
                        {
                          className: "size-3.5",
                        }
                      )}
                    </span>
                  )}
                  {label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {!isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 text-xs sm:text-sm"
                  size="sm"
                >
                  <IconLayoutColumns className="h-4 w-4" />
                  <span className="hidden md:inline ml-1">Columnas</span>
                  <IconChevronDown className="ml-1 size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-xs sm:text-sm"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {COLUMN_LABELS[column.id] || column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">
            Filtros activos:
          </span>
          {searchQuery && (
            <Badge variant="secondary" className="text-xs">
              Búsqueda: "{searchQuery}"
            </Badge>
          )}
          {statusFilter && (
            <Badge variant="secondary" className="text-xs">
              Estado: {VISIT_STATUS_LABELS[statusFilter as VisitStatus]}
            </Badge>
          )}
          {formTypeFilter && (
            <Badge variant="secondary" className="text-xs">
              Tipo: {FORM_TYPE_LABELS[formTypeFilter as VisitFormType]}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={clearAllFilters}
          >
            <X className="size-3" />
            Limpiar
          </Button>
        </div>
      )}

      {/* Mobile View - Cards */}
      {isMobile ? (
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="rounded-lg border bg-card p-4 space-y-3 animate-pulse"
              >
                <VisitCardSkeleton />
              </div>
            ))
          ) : table.getRowModel().rows?.length ? (
            table
              .getRowModel()
              .rows.map((row) => (
                <VisitCard
                  key={row.id}
                  visit={row.original}
                  isSelected={row.getIsSelected()}
                  onSelect={(selected) => row.toggleSelected(selected)}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
          ) : (
            <EmptyCard
              title="No se encontraron visitas"
              description={
                hasActiveFilters
                  ? "Intenta ajustar tus filtros de búsqueda"
                  : "No hay visitas registradas"
              }
              icon={<History className="h-12 w-12" />}
              actions={
                hasActiveFilters && (
                  <Button variant="outline" onClick={clearAllFilters}>
                    <X className="size-4" />
                    Limpiar filtros
                  </Button>
                )
              }
            />
          )}
        </div>
      ) : (
        /* Desktop View - Table */
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="pl-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
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
                    className="h-24 text-center"
                  >
                    <EmptyCard
                      title="No se encontraron visitas"
                      description={
                        hasActiveFilters
                          ? "Intenta ajustar tus filtros de búsqueda"
                          : "No hay visitas registradas"
                      }
                      icon={<History className="h-12 w-12" />}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground order-2 sm:order-1">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <>
              {table.getFilteredSelectedRowModel().rows.length} de{" "}
              {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
            </>
          )}
          {table.getFilteredSelectedRowModel().rows.length === 0 && (
            <>
              {table.getFilteredRowModel().rows.length} visita(s) encontrada(s).
            </>
          )}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-6 lg:space-x-8 order-1 sm:order-2">
          <div className="flex items-center justify-between sm:justify-start space-x-2">
            <p className="text-sm font-medium whitespace-nowrap">
              Filas por página
            </p>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                const newPageSize = Number(value);
                setPageSize(newPageSize);
                table.setPageSize(newPageSize);
                setPageIndex(1);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 30, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium text-primary whitespace-nowrap">
            Página {pageIndex} de {table.getPageCount() || 1}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setPageIndex(1)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir a la primera página</span>
              <IconChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPageIndex(pageIndex - 1)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir a la página anterior</span>
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPageIndex(pageIndex + 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir a la página siguiente</span>
              <IconChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setPageIndex(table.getPageCount())}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir a la última página</span>
              <IconChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
