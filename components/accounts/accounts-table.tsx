"use client";

import * as React from "react";
import { Spinner } from "../ui/spinner";
import { EmptyCard } from "../empty-card";
import { useRouter } from "next/navigation";
import { AccountCard } from "./accounts-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebouncedCallback } from "use-debounce";
import { AccountsTableProps } from "@/interfaces/zoho";
import { useIsMobile } from "@/components/ui/use-mobile";
import { Building2, X, Loader2, RefreshCw } from "lucide-react";
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
  // Props para búsqueda remota
  onSearch,
  isSearching = false,
  searchQuery: externalSearchQuery,
  onClearSearch,
  // Props para paginación progresiva
  isLoadingMore = false,
  hasMoreRecords = false,
  onLoadMore,
  // Props para paginación
  onPageChange,
  onPageSizeChange,
  isOnLastPage = false,
}: AccountsTableProps) {
  const isMobile = useIsMobile();
  const router = useRouter();

  // Local search input state (for immediate UI feedback)
  const [localSearchValue, setLocalSearchValue] = React.useState(
    externalSearchQuery || ""
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
  const columnFilters = externalColumnFilters ?? internalColumnFilters;
  const setColumnFilters = setExternalColumnFilters ?? setInternalColumnFilters;

  // Debounced search callback - triggers remote search after 400ms of inactivity
  const debouncedSearch = useDebouncedCallback((value: string) => {
    if (onSearch) {
      onSearch(value);
    }
    setPageIndex(1); // Reset to first page on search
  }, 400);

  // Sync local search value with external search query
  React.useEffect(() => {
    if (
      externalSearchQuery !== undefined &&
      externalSearchQuery !== localSearchValue
    ) {
      setLocalSearchValue(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setLocalSearchValue(value);
    debouncedSearch(value);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setLocalSearchValue("");
    if (onClearSearch) {
      onClearSearch();
    }
    setPageIndex(1);
  };

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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
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

  // Notify parent of page changes
  React.useEffect(() => {
    if (onPageChange) {
      onPageChange(pageIndex);
    }
  }, [pageIndex, onPageChange]);

  React.useEffect(() => {
    if (onPageSizeChange) {
      onPageSizeChange(pageSize);
    }
  }, [pageSize, onPageSizeChange]);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-row items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-full sm:max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              value={localSearchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              className="pl-9 pr-9 h-10 text-xs sm:text-sm"
            />
            {/* Clear button or loading indicator */}
            {isSearching ? (
              <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground animate-spin" />
            ) : localSearchValue ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          {/* Show search status badge */}
          {externalSearchQuery && !isSearching && (
            <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary whitespace-nowrap">
              Resultados para &quot;{externalSearchQuery}&quot;
            </span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <IconLayoutColumns className="size-4" />
              <span className="sm:hidden md:inline">Columnas</span>
              <IconChevronDown className="size-4" />
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
              title="No se encontraron clientes."
              description="No hay clientes disponibles para mostrar."
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
                    onClick={() =>
                      router.push(
                        `/dashboard/clients/visits/${data[row.index].id}`
                      )
                    }
                    className="cursor-pointer"
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
                      title="No se encontraron clientes."
                      description="No hay clientes disponibles para mostrar."
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
              <IconChevronsLeft className="size-4" />
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
              <IconChevronLeft className="size-4" />
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
              <IconChevronRight className="size-4" />
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
              <IconChevronsRight className="size-4" />
            </Button>

            {/* Load More Button - Integrated in pagination */}
            {isOnLastPage && hasMoreRecords && onLoadMore && (
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="ml-2 gap-2"
                title="Cargar más registros"
              >
                {isLoadingMore ? (
                  <>
                    <Spinner variant="bars" className="size-3" />
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-4" />
                    <span className="hidden sm:inline">Cargar más</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
