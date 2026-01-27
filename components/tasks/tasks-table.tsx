"use client";

import * as React from "react";
import { TaskCard } from "./task-card";
import { Spinner } from "../ui/spinner";
import { Skeleton } from "../ui/skeleton";
import { EmptyCard } from "../empty-card";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDebouncedCallback } from "use-debounce";
import { useTranslation } from "@/lib/i18n/context";
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

const getTaskTypeLabel = (
  value: string,
  t: (key: string) => string,
): string => {
  const typeMap: Record<string, string> = {
    "Propuesta de Visita": "tasks.types.visitProposal",
    "Visita Comercial": "tasks.types.visitCommercial",
    Demostración: "tasks.types.demonstration",
    Oferta: "tasks.types.offer",
    Cotización: "tasks.types.quote",
    "Oferta / Cotización": "tasks.types.offerQuote",
  };
  return t(typeMap[value] || "tasks.type");
};

const getFilterLabel = (
  type: "status" | "priority" | "taskType",
  value: string,
  t: (key: string) => string,
): string => {
  if (type === "status") {
    const statusMap: Record<string, string> = {
      "Not Started": "tasks.statuses.notStarted",
      "In Progress": "tasks.statuses.inProgress",
      Completed: "tasks.statuses.completed",
      Deferred: "tasks.statuses.deferred",
      "Waiting for Input": "tasks.statuses.waitingInput",
    };
    return t(statusMap[value] || "common.status");
  }

  if (type === "priority") {
    const priorityMap: Record<string, string> = {
      Highest: "tasks.priorities.highest",
      High: "tasks.priorities.high",
      Normal: "tasks.priorities.normal",
      Low: "tasks.priorities.low",
      Lowest: "tasks.priorities.lowest",
    };
    return t(priorityMap[value] || "tasks.priority");
  }

  if (type === "taskType") {
    return getTaskTypeLabel(value, t);
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
  onPageChange,
  onPageSizeChange,
  isOnLastPage,
  onCreateVisit,
}: TasksTableProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { t } = useTranslation();

  const [localSearchValue, setLocalSearchValue] = React.useState(
    externalSearchQuery || "",
  );

  const [pageIndex, setPageIndex] = useQueryState(
    "page",
    parseAsInteger.withDefault(1),
  );
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(10),
  );
  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsString.withDefault(""),
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsString.withDefault(""),
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
    parseAsString.withDefault(""),
  );
  const [priorityFilter, setPriorityFilter] = useQueryState(
    "priority",
    parseAsString.withDefault(""),
  );
  const [tipoFilter, setTipoFilter] = useQueryState(
    "type",
    parseAsString.withDefault(""),
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
        <div className="flex flex-row items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-col items-start justify-center gap-2 flex-wrap">
            <div className="relative flex-1 max-w-full sm:max-w-sm">
              <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("common.searchPlaceholder")}
                value={localSearchValue}
                onChange={(event) => handleSearchChange(event.target.value)}
                className="pl-9 pr-9 h-10 text-xs sm:text-sm w-full"
              />
              {isSearching ? (
                <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground animate-spin" />
              ) : localSearchValue ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={t("common.clearFilters")}
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>

            {(statusFilter || priorityFilter || tipoFilter) && (
              <div className="flex items-center gap-2 flex-wrap">
                {tipoFilter && (
                  <Badge variant="secondary" className="text-xs">
                    {t("taskPage.filters.type")}:{" "}
                    {getFilterLabel("taskType", tipoFilter, t)}
                    <button
                      onClick={() => setTipoFilter("")}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}

                <Button
                  onClick={() => {
                    setStatusFilter("");
                    setPriorityFilter("");
                    setTipoFilter("");
                  }}
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                >
                  <FilterX className="size-3" />
                  <span className="hidden sm:inline">
                    {t("common.clearFilters")}
                  </span>
                </Button>
              </div>
            )}

            {externalSearchQuery && !isSearching && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary whitespace-nowrap">
                {t("common.resultsFor")} &quot;{externalSearchQuery}&quot;
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={tipoFilter || undefined}
              onValueChange={(value) => {
                setTipoFilter(value);
              }}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue
                  placeholder={t("taskPage.filters.typePlaceholderType")}
                />
              </SelectTrigger>
              <SelectContent>
                {COMMERCIAL_TASK_TYPES.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {getTaskTypeLabel(tipo, t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns className="size-4" />
                  <span className="hidden sm:inline">
                    {t("common.columns")}
                  </span>
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
                          ? t("taskPage.columns.matter")
                          : column.id === "Tipo_de_Tarea"
                            ? t("taskPage.columns.type")
                            : column.id === "Status"
                              ? t("taskPage.columns.status")
                              : column.id === "Priority"
                                ? t("taskPage.columns.priority")
                                : column.id === "Due_Date"
                                  ? t("taskPage.columns.dueDate")
                                  : column.id === "Owner"
                                    ? t("taskPage.columns.assignedTo")
                                    : column.id === "What_Id"
                                      ? t("taskPage.columns.relatedTo")
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
                {t("pagination.itemsPerPage")}
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
                  ({table.getFilteredRowModel().rows.length}{" "}
                  {t("pagination.of")} {data.length} {t("common.results")})
                </p>
              )}
            </div>

            <div className="flex items-center justify-center text-xs sm:text-sm font-medium whitespace-nowrap">
              {t("pagination.page")} {table.getState().pagination.pageIndex + 1}{" "}
              {t("pagination.of")} {table.getPageCount()}
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
                <span className="sr-only">
                  {t("pagination.gotToFirstPage")}
                </span>
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
                <span className="sr-only">{t("pagination.previous")}</span>
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
                <span className="sr-only">{t("pagination.next")}</span>
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
                <span className="sr-only">{t("pagination.goToLastPage")}</span>
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
                  title={t("common.loadMore")}
                >
                  {isLoadingMore ? (
                    <>
                      <Spinner variant="bars" className="size-3" />
                    </>
                  ) : (
                    <>
                      <RefreshCw className="size-4" />
                      <span className="hidden sm:inline">
                        {t("common.loadMore")}
                      </span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
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
              icon={<ListTodo />}
              title={
                externalSearchQuery || columnFilters.length > 0
                  ? t("tasks.emptySearchTitle")
                  : t("tasks.emptyStateTitle")
              }
              description={
                externalSearchQuery || columnFilters.length > 0
                  ? t("tasks.emptySearchDescription")
                  : t("tasks.emptyStateDescription")
              }
              actions={
                (externalSearchQuery || columnFilters.length > 0) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearSearch}
                  >
                    <FilterX className="size-4" />
                    {t("common.clearFilters")}
                  </Button>
                )
              }
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
                              header.getContext(),
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
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-64 text-center"
                  >
                    <EmptyCard
                      icon={<ListTodo />}
                      title={
                        externalSearchQuery || columnFilters.length > 0
                          ? t("tasks.emptySearchTitle")
                          : t("tasks.emptyStateTitle")
                      }
                      description={
                        externalSearchQuery || columnFilters.length > 0
                          ? t("tasks.emptySearchDescription")
                          : t("tasks.emptyStateDescription")
                      }
                      actions={
                        (externalSearchQuery || columnFilters.length > 0) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearSearch}
                          >
                            <FilterX className="size-4" />
                            {t("common.clearFilters")}
                          </Button>
                        )
                      }
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
              {t("pagination.itemsPerPage")}
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
            {t("pagination.page")} {table.getState().pagination.pageIndex + 1}{" "}
            {t("pagination.of")} {table.getPageCount()}
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
              <span className="sr-only">{t("pagination.gotToFirstPage")}</span>
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
              <span className="sr-only">
                {t("pagination.gotToPreviousPage")}
              </span>
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
              <span className="sr-only">{t("pagination.gotToNextPage")}</span>
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
              <span className="sr-only">{t("pagination.gotToLastPage")}</span>
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
                title={t("common.loadMore")}
              >
                {isLoadingMore ? (
                  <>
                    <Spinner variant="bars" className="size-3" />
                  </>
                ) : (
                  <>
                    <RefreshCw className="size-4" />
                    <span className="hidden sm:inline">
                      {t("common.loadMore")}
                    </span>
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
