"use client";

import * as React from "react";
import { VisitStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/empty-card";
import { useIsMobile } from "@/components/ui/use-mobile";
import { VISIT_STATUS_LABELS } from "@/interfaces/visits";
import { VisitCardSkeleton } from "../dashboard-skeleton";
import { VisitCard } from "@/components/visits/visit-card";
import { GalleryHorizontalEnd, History, X } from "lucide-react";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
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
import { useI18n } from "@/lib/i18n/context";

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

const getColumnLabelKey = (id: string) => {
  const map: Record<string, string> = {
    formType: "visits.formType",
    visitDate: "visits.visitDate",
    status: "visits.status",
    user: "visits.seller",
    actions: "table.actions",
  };
  return map[id] || id;
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
  onCreateVisit,
}: DataTableProps<TData, TValue>) {
  const { t } = useI18n();
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
            <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("visits.searchPlaceholder")}
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
              <Button variant="outline" size="sm">
                <IconFilter className="size-4" />
                <span className="hidden sm:inline">{t("visits.status")}</span>
                {statusFilter && (
                  <Badge variant="secondary" className="ml-1 px-1.5 text-xs">
                    1
                  </Badge>
                )}
                <IconChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel>
                {t("visits.filterByStatus")}
              </DropdownMenuLabel>
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
                {t("visits.filters.all")}
              </DropdownMenuCheckboxItem>
              {Object.keys(VISIT_STATUS_LABELS).map((key) => (
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
                  {t(
                    `visits.statuses.${
                      key === "BORRADOR" ? "draft" : "completed"
                    }`
                  )}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {!isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns className="size-4" />
                  <span className="hidden md:inline">
                    {t("table.hideColumn")}
                  </span>
                  <IconChevronDown className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>{t("table.hideColumn")}</DropdownMenuLabel>
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
                      {t(getColumnLabelKey(column.id))}
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
            {t("machines.filters.activeFilters")}:
          </span>
          {searchQuery && (
            <Badge variant="secondary" className="text-xs">
              {t("users.filters.search")}: "{searchQuery}"
            </Badge>
          )}
          {statusFilter && (
            <Badge variant="secondary" className="text-xs">
              {t("visits.status")}:{" "}
              {t(
                `visits.statuses.${
                  statusFilter === "BORRADOR" ? "draft" : "completed"
                }`
              )}
            </Badge>
          )}
          {formTypeFilter && (
            <Badge variant="secondary" className="text-xs">
              {t("visits.formType")}:{" "}
              {t(
                `visits.formTypes.${
                  formTypeFilter === "ANALISIS_CSS"
                    ? "css"
                    : formTypeFilter === "ANALISIS_INDUSTRIAL"
                    ? "industrial"
                    : formTypeFilter === "ANALISIS_LOGISTICA"
                    ? "logistica"
                    : "straddleCarrier"
                }`
              )}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={clearAllFilters}
          >
            <X className="size-3" />
            {t("machines.filters.clearFilters")}
          </Button>
        </div>
      )}

      {/* Mobile View - Cards */}
      {isMobile ? (
        <div className="space-y-3">
          { table.getRowModel().rows?.length ? (
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
                  onCreateVisit={onCreateVisit}
                />
              ))
          ) : (
            <EmptyCard
              title={t("visits.noVisitsFound")}
              description={
                hasActiveFilters
                  ? t("table.noResultsFound.description")
                  : t("visits.noVisitsFound")
              }
              icon={<History className="h-12 w-12" />}
              actions={
                hasActiveFilters && (
                  <Button variant="outline" onClick={clearAllFilters}>
                    <X className="size-4" />
                    {t("machines.filters.clearFilters")}
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
                      title={t("visits.noVisitsFound")}
                      description={
                        hasActiveFilters
                          ? t("table.noResultsFound.description")
                          : t("visits.noVisitsFound")
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
              {t("table.selectedRows", {
                count: table.getFilteredSelectedRowModel().rows.length,
                total: table.getFilteredRowModel().rows.length,
              })}
            </>
          )}
          {table.getFilteredSelectedRowModel().rows.length === 0 && (
            <>
              {t("visits.title")}: {table.getFilteredRowModel().rows.length}
            </>
          )}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-6 lg:space-x-8 order-1 sm:order-2">
          <div className="flex items-center justify-between sm:justify-start space-x-2">
            <p className="text-sm font-medium whitespace-nowrap">
              {t("table.rowsPerPage")}
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
            {t("pagination.page")} {pageIndex} {t("pagination.of")}{" "}
            {table.getPageCount() || 1}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setPageIndex(1)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">{t("pagination.gotToFirstPage")}</span>
              <IconChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPageIndex(pageIndex - 1)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">{t("pagination.previous")}</span>
              <IconChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPageIndex(pageIndex + 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">{t("pagination.next")}</span>
              <IconChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setPageIndex(table.getPageCount())}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">{t("pagination.goToLastPage")}</span>
              <IconChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
