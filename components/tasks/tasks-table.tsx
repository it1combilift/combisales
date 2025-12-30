"use client";

import * as React from "react";
import { Label } from "../ui/label";
import { TaskCard } from "./task-card";
import { Spinner } from "../ui/spinner";
import { EmptyCard } from "../empty-card";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDebouncedCallback } from "use-debounce";
import { TasksTableProps } from "@/interfaces/zoho";
import { useIsMobile } from "@/components/ui/use-mobile";
import { TasksCardsSkeleton } from "../dashboard-skeleton";
import { COMMERCIAL_TASK_TYPES } from "@/constants/constants";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { ListTodo, X, Loader2, Filter, FilterX, RefreshCw } from "lucide-react";

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

// Helper function to get readable filter labels
const getFilterLabel = (type: "status" | "priority", value: string): string => {
  if (type === "status") {
    const statusLabels: Record<string, string> = {
      "Not Started": "No iniciada",
      "In Progress": "En progreso",
      Completed: "Completada",
      Deferred: "Diferida",
      "Waiting for Input": "Esperando entrada",
    };
    return statusLabels[value] || value;
  }

  if (type === "priority") {
    const priorityLabels: Record<string, string> = {
      Highest: "Máxima",
      High: "Alta",
      Normal: "Normal",
      Low: "Baja",
      Lowest: "Mínima",
    };
    return priorityLabels[value] || value;
  }

  return value;
};

export function TasksTable({
  columns,
  data,
  isLoading = false,
  rowSelection: externalRowSelection,
  setRowSelection: setExternalRowSelection,
  columnFilters: externalColumnFilters,
  setColumnFilters: setExternalColumnFilters,
  onSearch,
  isSearching = false,
  searchQuery: externalSearchQuery,
  onClearSearch,
  isRefreshing = false,
  onLoadMore,
  hasMoreRecords = false,
  isLoadingMore = false,
  totalLoaded = 0,
  onPageChange,
  onPageSizeChange,
  isOnLastPage,
  onCreateVisit,
}: TasksTableProps) {
  const isMobile = useIsMobile();
  const router = useRouter();

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

  // Filter states
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsString.withDefault("")
  );
  const [priorityFilter, setPriorityFilter] = useQueryState(
    "priority",
    parseAsString.withDefault("")
  );
  const [tipoFilter, setTipoFilter] = useQueryState(
    "tipo",
    parseAsString.withDefault("")
  );
  const [showFilters, setShowFilters] = React.useState(false);

  const rowSelection = externalRowSelection ?? internalRowSelection;
  const setRowSelection = setExternalRowSelection ?? setInternalRowSelection;
  const columnFilters = externalColumnFilters ?? internalColumnFilters;
  const setColumnFilters = setExternalColumnFilters ?? setInternalColumnFilters;

  const debouncedSearch = useDebouncedCallback((value: string) => {
    if (onSearch) {
      onSearch(value);
    }
    setPageIndex(1);
  }, 400);

  React.useEffect(() => {
    if (
      externalSearchQuery !== undefined &&
      externalSearchQuery !== localSearchValue
    ) {
      setLocalSearchValue(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  const handleSearchChange = (value: string) => {
    setLocalSearchValue(value);
    debouncedSearch(value);
  };

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

  // Apply filters when filter values change
  React.useEffect(() => {
    const filters: ColumnFiltersState = [];

    if (statusFilter) {
      filters.push({ id: "Status", value: statusFilter });
    }

    if (priorityFilter) {
      filters.push({ id: "Priority", value: priorityFilter });
    }

    if (tipoFilter) {
      filters.push({ id: "Tipo_de_Tarea", value: tipoFilter });
    }

    setColumnFilters(filters);

    // Reset to first page when filters change
    if (statusFilter || priorityFilter || tipoFilter) {
      setPageIndex(1);
    }
  }, [
    statusFilter,
    priorityFilter,
    tipoFilter,
    setColumnFilters,
    setPageIndex,
  ]);

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
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center justify-between gap-3">
          <div className="flex flex-col items-start justify-center gap-2">
            <div className="relative flex-1 max-w-full sm:max-w-sm">
              <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar tareas..."
                value={localSearchValue}
                onChange={(event) => handleSearchChange(event.target.value)}
                className="pl-9 pr-9 h-10 text-xs sm:text-sm"
              />
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

            {externalSearchQuery && !isSearching && (
              <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary whitespace-nowrap">
                Resultados para &quot;{externalSearchQuery}&quot;
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(statusFilter || priorityFilter || tipoFilter) && (
              <div className="flex items-center gap-2 flex-wrap">
                {statusFilter && (
                  <Badge variant="secondary" className="text-xs">
                    Estado: {getFilterLabel("status", statusFilter)}
                    <button
                      onClick={() => setStatusFilter("")}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}
                {priorityFilter && (
                  <Badge variant="secondary" className="text-xs">
                    Prioridad: {getFilterLabel("priority", priorityFilter)}
                    <button
                      onClick={() => setPriorityFilter("")}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}
                {tipoFilter && (
                  <Badge variant="secondary" className="text-xs">
                    Tipo: {tipoFilter}
                    <button
                      onClick={() => setTipoFilter("")}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {(statusFilter || priorityFilter || tipoFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter("");
                  setPriorityFilter("");
                  setTipoFilter("");
                }}
              >
                <FilterX className="size-4" />
                <span className="hidden sm:inline">Limpiar filtros</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-primary/10" : ""}
            >
              <Filter className="size-4" />
              <span className="hidden sm:inline">Filtros</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns className="size-4" />
                  <span className="hidden sm:inline">Columnas</span>
                  <IconChevronDown className="size-3.5 sm:size-4" />
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
                        className="whitespace-nowrap cursor-pointer"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id === "Subject"
                          ? "Asunto"
                          : column.id === "Tipo_de_Tarea"
                          ? "Tipo"
                          : column.id === "Status"
                          ? "Estado"
                          : column.id === "Priority"
                          ? "Prioridad"
                          : column.id === "Due_Date"
                          ? "Fecha vencimiento"
                          : column.id === "Owner"
                          ? "Responsable"
                          : column.id === "What_Id"
                          ? "Relacionado con"
                          : column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex flex-row items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm font-medium whitespace-nowrap hidden lg:block">
                Por página
              </p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPageIndex(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(statusFilter || priorityFilter || tipoFilter) && (
                <p className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
                  ({table.getFilteredRowModel().rows.length} de {data.length}{" "}
                  resultados)
                </p>
              )}
            </div>

            <div className="flex items-center justify-center text-xs sm:text-sm font-medium whitespace-nowrap">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="hidden size-8 p-0 lg:flex"
                onClick={() => {
                  table.setPageIndex(0);
                  setPageIndex(1);
                }}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir a la primera página</span>
                <IconChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8 p-0"
                onClick={() => {
                  table.previousPage();
                  setPageIndex(pageIndex - 1);
                }}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir a la página anterior</span>
                <IconChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="size-8 p-0"
                onClick={() => {
                  table.nextPage();
                  setPageIndex(pageIndex + 1);
                }}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir a la página siguiente</span>
                <IconChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 p-0 lg:flex"
                onClick={() => {
                  table.setPageIndex(table.getPageCount() - 1);
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

        {/* Filters Panel */}
        {showFilters && (
          <div className="flex justify-start items-center gap-3 p-3 border rounded-lg bg-muted/30 flex-wrap">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Estado
              </Label>
              <div className="flex items-center gap-2">
                <Select
                  value={statusFilter || undefined}
                  onValueChange={(value) => setStatusFilter(value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Started">No iniciada</SelectItem>
                    <SelectItem value="In Progress">En progreso</SelectItem>
                    <SelectItem value="Completed">Completada</SelectItem>
                    <SelectItem value="Deferred">Diferida</SelectItem>
                    <SelectItem value="Waiting for Input">
                      Esperando entrada
                    </SelectItem>
                  </SelectContent>
                </Select>
                {statusFilter && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setStatusFilter("")}
                  >
                    <X className="size-4" />
                    <span className="sr-only">Limpiar filtro de estado</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Prioridad
              </Label>
              <div className="flex items-center gap-2">
                <Select
                  value={priorityFilter || undefined}
                  onValueChange={(value) => setPriorityFilter(value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Todas las prioridades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Highest">Máxima</SelectItem>
                    <SelectItem value="High">Alta</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Low">Baja</SelectItem>
                    <SelectItem value="Lowest">Mínima</SelectItem>
                  </SelectContent>
                </Select>
                {priorityFilter && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setPriorityFilter("")}
                  >
                    <X className="size-4" />
                    <span className="sr-only">Limpiar filtro de prioridad</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Tipo de tarea
              </Label>
              <div className="flex items-center gap-2">
                <Select
                  value={tipoFilter || undefined}
                  onValueChange={(value) => setTipoFilter(value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMERCIAL_TASK_TYPES.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {tipoFilter && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setTipoFilter("")}
                  >
                    <X className="size-4" />
                    <span className="sr-only">Limpiar filtro de tipo</span>
                  </Button>
                )}
              </div>
            </div>

            {(statusFilter || priorityFilter || tipoFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter("");
                  setPriorityFilter("");
                  setTipoFilter("");
                }}
                className="h-9 ml-auto"
              >
                <X className="size-4" />
                Limpiar filtros
              </Button>
            )}
          </div>
        )}
      </div>

      {isMobile ? (
        <div className="space-y-4">
          {isLoading || isRefreshing ? (
            Array.from({ length: pageSize }).map((_, index) => (
              <TasksCardsSkeleton key={index} />
            ))
          ) : table.getRowModel().rows?.length ? (
            table
              .getRowModel()
              .rows.map((row) => (
                <TaskCard
                  key={row.id}
                  task={row.original}
                  onSelect={(selected) => row.toggleSelected(selected)}
                  isSelected={row.getIsSelected()}
                  onCreateVisit={
                    onCreateVisit
                      ? () => onCreateVisit(row.original)
                      : undefined
                  }
                />
              ))
          ) : (
            <EmptyCard
              icon={<ListTodo className="size-8 text-muted-foreground" />}
              title="No se encontraron tareas"
              description="No hay tareas disponibles en este momento. Intenta ajustar los filtros de búsqueda."
            />
          )}
        </div>
      ) : (
        <div className="rounded-lg border bg-card shadow-sm">
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
              {isLoading || isRefreshing ? (
                Array.from({ length: pageSize }).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((_, i) => (
                      <TableCell key={i} className="text-center py-6">
                        <Skeleton className="mx-auto h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() =>
                      router.push(`/dashboard/tasks/${row.original.id}/details`)
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
                      icon={
                        <ListTodo className="size-8 text-muted-foreground" />
                      }
                      title="No se encontraron tareas"
                      description="No hay tareas disponibles en este momento. Intenta ajustar los filtros de búsqueda."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex flex-row items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm font-medium whitespace-nowrap hidden lg:block">
              Por página
            </p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setPageIndex(1);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center text-xs sm:text-sm font-medium whitespace-nowrap">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="hidden size-8 p-0 lg:flex"
              onClick={() => {
                table.setPageIndex(0);
                setPageIndex(1);
              }}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir a la primera página</span>
              <IconChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8 p-0"
              onClick={() => {
                table.previousPage();
                setPageIndex(pageIndex - 1);
              }}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir a la página anterior</span>
              <IconChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8 p-0"
              onClick={() => {
                table.nextPage();
                setPageIndex(pageIndex + 1);
              }}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir a la página siguiente</span>
              <IconChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 p-0 lg:flex"
              onClick={() => {
                table.setPageIndex(table.getPageCount() - 1);
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
