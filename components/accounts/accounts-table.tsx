"use client";

import * as React from "react";
import { Building2 } from "lucide-react";
import { EmptyCard } from "../empty-card";
import { AccountCard } from "./accounts-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AccountsTableProps } from "@/interfaces/zoho";
import { useIsMobile } from "@/components/ui/use-mobile";
import { AccountsCardsPageSkeleton } from "../dashboard-skeleton";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";

import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutColumns,
  IconSearch,
} from "@tabler/icons-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function AccountsTable({
  columns,
  data,
  isLoading = false,
  rowSelection: externalRowSelection,
  setRowSelection: setExternalRowSelection,
  columnFilters: externalColumnFilters,
  setColumnFilters: setExternalColumnFilters,
}: AccountsTableProps) {
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

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-full sm:max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-auto h-10 text-xs sm:text-sm"
            >
              <IconLayoutColumns className="h-4 w-4" />
              <span className="sm:hidden md:inline">Columnas</span>
              <IconChevronDown className="ml-2 size-3.5 sm:size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize text-xs sm:text-sm"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id === "Account_Name"
                      ? "Cliente"
                      : column.id === "Account_Owner"
                      ? "Propietario"
                      : column.id === "Created_Time"
                      ? "Fecha de creación"
                      : column.id === "Modified_Time"
                      ? "Últ. modificación"
                      : column.id === "Account_Type"
                      ? "Tipo de cuenta"
                      : column.id === "Industry"
                      ? "Industria"
                      : column.id === "Billing_Country"
                      ? "País"
                      : column.id === "Phone"
                      ? "Contacto"
                      : column.id === "Owner"
                      ? "Propietario"
                      : column.id.replaceAll("_", " ")}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile View - Cards */}
      {isMobile ? (
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="rounded-lg border bg-card p-4 space-y-3"
              >
                <AccountsCardsPageSkeleton />
              </div>
            ))
          ) : table.getRowModel().rows?.length ? (
            table
              .getRowModel()
              .rows.map((row) => (
                <AccountCard
                  key={row.id}
                  account={row.original}
                  isSelected={row.getIsSelected()}
                  onSelect={(selected) => row.toggleSelected(selected)}
                />
              ))
          ) : (
            <EmptyCard
              title="No se encontraron cuentas."
              description="No hay cuentas disponibles para mostrar."
              icon={<Building2 className="h-12 w-12" />}
            />
          )}
        </div>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
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
                <>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={index}>
                      {columns.map((column, colIndex) => (
                        <TableCell key={colIndex}>
                          <div className="h-4 bg-muted animate-pulse rounded"></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
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
                      title="No se encontraron cuentas."
                      description="No hay cuentas disponibles para mostrar."
                      icon={<Building2 className="h-12 w-12" />}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground order-2 sm:order-1">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
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
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium text-primary whitespace-nowrap">
            Página {pageIndex} de {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => {
                setPageIndex(1);
              }}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir a la primera página</span>
              <IconChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                setPageIndex(pageIndex - 1);
              }}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir a la página anterior</span>
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                setPageIndex(pageIndex + 1);
              }}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir a la página siguiente</span>
              <IconChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => {
                setPageIndex(table.getPageCount());
              }}
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
