"use client";

import { toast } from "sonner";
import { ZohoTask } from "@/interfaces/zoho";
import { Badge } from "@/components/ui/badge";
import { Customer } from "@/interfaces/visits";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "@/lib/i18n/context";
import { columns } from "@/components/tasks/columns";
import { H1, Paragraph } from "@/components/fonts/fonts";
import { ColumnFiltersState } from "@tanstack/react-table";
import { TasksTable } from "@/components/tasks/tasks-table";
import { RefreshCw, ListTodo, FilterX } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import VisitFormDialog from "@/components/visits/visit-form-dialog";
import { EmptyCard } from "@/components/empty-card";

const PER_PAGE = 200;
const INITIAL_LOAD_ONLY_FIRST_PAGE = true;

interface PaginationState {
  currentPage: number;
  hasMoreRecords: boolean;
  isLoadingMore: boolean;
}

export default function TasksPage() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<ZohoTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(10);

  // Visit dialog state
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [selectedTaskForVisit, setSelectedTaskForVisit] =
    useState<ZohoTask | null>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    hasMoreRecords: false,
    isLoadingMore: false,
  });

  const allTasksRef = useRef<ZohoTask[]>([]);
  const isLoadingRef = useRef(false);

  /**
   * Fetch tasks from a specific page
   */
  const fetchTasksPage = useCallback(async (page: number, search?: string) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: PER_PAGE.toString(),
        sort_by: "Modified_Time",
        sort_order: "desc",
      });

      if (search && search.trim().length > 0) {
        params.append("search", search.trim());
      }

      const response = await fetch(`/api/zoho/tasks?${params.toString()}`);

      if (!response.ok) {
        console.log("Error fetching tasks");
      }

      const result = await response.json();
      return {
        tasks: result.tasks || [],
        hasMore: result.info?.more_records || false,
      };
    } catch (err) {
      console.error("Error fetching tasks:", err);
      throw err;
    }
  }, []);

  /**
   * Load remaining tasks in background (optional, for auto-loading all)
   */
  const loadMoreTasksInBackground = useCallback(
    async (startPage: number) => {
      let currentPage = startPage;
      let hasMoreRecords = true;

      while (hasMoreRecords) {
        try {
          const { tasks: pageTasks, hasMore } = await fetchTasksPage(
            currentPage
          );

          const updatedTasks = [...allTasksRef.current, ...pageTasks];
          allTasksRef.current = updatedTasks;
          setTasks([...updatedTasks]);

          hasMoreRecords = hasMore;
          setPagination({
            currentPage,
            hasMoreRecords: hasMore,
            isLoadingMore: hasMore,
          });

          if (hasMore) {
            currentPage++;
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (err) {
          console.error("Error loading tasks in background:", err);
          break;
        }
      }

      setPagination((prev) => ({ ...prev, isLoadingMore: false }));
    },
    [fetchTasksPage]
  );

  /**
   * Fetch initial tasks (only first page for better performance)
   */
  const fetchInitialTasks = useCallback(
    async (options: { isRefresh?: boolean } = {}) => {
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      const isRefresh = options.isRefresh || false;

      try {
        if (isRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setError(null);

        const { tasks: initialTasks, hasMore } = await fetchTasksPage(1);

        allTasksRef.current = initialTasks;
        setTasks(initialTasks);

        setPagination({
          currentPage: 1,
          hasMoreRecords: hasMore,
          isLoadingMore: false,
        });

        if (hasMore && !INITIAL_LOAD_ONLY_FIRST_PAGE) {
          loadMoreTasksInBackground(2);
        }
      } catch (err) {
        console.error("Error fetching initial tasks:", err);
        toast.error(t("tasks.errorLoadingTitle"));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        isLoadingRef.current = false;
      }
    },
    [fetchTasksPage, loadMoreTasksInBackground]
  );

  /**
   * Load more tasks (for "Load More" button)
   */
  const loadMoreTasks = useCallback(async () => {
    if (isLoadingRef.current || !pagination.hasMoreRecords) return;

    isLoadingRef.current = true;
    setPagination((prev) => ({ ...prev, isLoadingMore: true }));

    try {
      const nextPage = pagination.currentPage + 1;
      const { tasks: newTasks, hasMore } = await fetchTasksPage(nextPage);

      const updatedTasks = [...allTasksRef.current, ...newTasks];
      allTasksRef.current = updatedTasks;
      setTasks(updatedTasks);

      setPagination({
        currentPage: nextPage,
        hasMoreRecords: hasMore,
        isLoadingMore: false,
      });

      toast.success(
        t("plurals.items_other", { count: newTasks.length }) +
          " " +
          t("common.tasks").toLowerCase()
      );
    } catch (err) {
      console.error("Error loading more tasks:", err);
      toast.error(t("errors.loadingMore"));
      setPagination((prev) => ({ ...prev, isLoadingMore: false }));
    } finally {
      isLoadingRef.current = false;
    }
  }, [fetchTasksPage, pagination]);

  /**
   * Search tasks
   */
  const searchTasks = useCallback(
    async (searchText: string) => {
      if (isLoadingRef.current) return;

      if (!searchText || searchText.trim().length === 0) {
        setSearchQuery("");
        await fetchInitialTasks();
        return;
      }

      isLoadingRef.current = true;
      setIsSearching(true);
      setSearchQuery(searchText);
      setError(null);

      try {
        const { tasks: searchedTasks } = await fetchTasksPage(1, searchText);
        setTasks(searchedTasks);
        allTasksRef.current = searchedTasks;

        setPagination({
          currentPage: 1,
          hasMoreRecords: false,
          isLoadingMore: false,
        });
      } catch (err) {
        console.error("Error searching tasks:", err);
        toast.error(t("tasks.errorLoadingTitle"));
      } finally {
        setIsSearching(false);
        isLoadingRef.current = false;
      }
    },
    [fetchTasksPage, fetchInitialTasks]
  );

  const handleRefresh = () => {
    if (searchQuery) {
      searchTasks(searchQuery);
    } else {
      fetchInitialTasks({ isRefresh: true });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setColumnFilters([]);
    fetchInitialTasks();
  };

  useEffect(() => {
    fetchInitialTasks();
  }, [fetchInitialTasks]);

  const filteredTasksCount =
    columnFilters.length > 0
      ? tasks.filter((task) => {
          return columnFilters.every((filter) => {
            const value = task[filter.id as keyof ZohoTask];
            return value === filter.value;
          });
        }).length
      : tasks.length;

  const totalPages = Math.ceil(filteredTasksCount / tablePageSize);
  const isOnLastPage = currentTablePage >= totalPages;

  const handleCreateVisitFromTask = useCallback((task: ZohoTask) => {
    setSelectedTaskForVisit(task);
    setIsVisitDialogOpen(true);
  }, []);

  const handleVisitSuccess = useCallback(() => {
    setIsVisitDialogOpen(false);
    setSelectedTaskForVisit(null);
    toast.success(t("visits.visitCreated"));
  }, [t]);

  const handleDialogClose = useCallback((open: boolean) => {
    setIsVisitDialogOpen(open);
    if (!open) {
      setSelectedTaskForVisit(null);
    }
  }, []);

  // Prepare customer data from task
  const customerFromTask: Customer | undefined = selectedTaskForVisit?.What_Id
    ? {
        id: selectedTaskForVisit.What_Id.id,
        zohoAccountId: selectedTaskForVisit.What_Id.id,
        accountName: selectedTaskForVisit.What_Id.name,
        razonSocial: null,
        accountNumber: null,
        cif: null,
        codigoCliente: null,
        accountType: null,
        industry: null,
        subSector: null,
        phone: null,
        fax: null,
        email: null,
        website: null,
        billingStreet: null,
        billingCity: null,
        billingState: null,
        billingCode: null,
        billingCountry: null,
        shippingStreet: null,
        shippingCity: null,
        shippingState: null,
        shippingCode: null,
        shippingCountry: null,
        latitude: null,
        longitude: null,
        zohoOwnerId: null,
        zohoOwnerName: null,
        zohoOwnerEmail: null,
        clienteConEquipo: false,
        cuentaNacional: false,
        clienteBooks: false,
        condicionesEspeciales: false,
        proyectoAbierto: false,
        revisado: false,
        localizacionesMultiples: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    : undefined;

  return (
    <section className="mx-auto px-4 space-y-3 w-full h-full">
      <div className="flex flex-row items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur py-0">
        <div>
          <H1>{t("taskPage.title")}</H1>
          <div className="flex flex-col justify-start">
            <Paragraph>{t("taskPage.description")}</Paragraph>

            <Badge variant="secondary" size="sm" className="mt-1">
              {isLoading || isRefreshing ? (
                <>
                  <Spinner variant="circle" size="sm" />
                  <span className="text-xs">{t("common.loading")}</span>
                </>
              ) : (
                <>
                  {tasks.length === 1
                    ? t("plurals.items_one", { count: tasks.length })
                    : t("plurals.items_other", { count: tasks.length })}
                </>
              )}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            title={t("common.refresh")}
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
          >
            <RefreshCw
              className={`size-4 ${
                isRefreshing || isLoading ? "animate-spin" : ""
              }`}
            />
            <span className="hidden md:inline">
              {isRefreshing || isLoading
                ? t("common.refreshing")
                : t("common.refresh")}
            </span>
          </Button>
        </div>
      </div>

      {error ? (
        <EmptyCard
          icon={<ListTodo className="size-6 text-muted-foreground" />}
          title={
            searchQuery
              ? t("tasks.emptySearchTitle")
              : t("tasks.emptyStateTitle")
          }
          description={
            searchQuery
              ? t("tasks.emptySearchDescription")
              : t("tasks.emptyStateDescription")
          }
          actions={
            searchQuery ? (
              <Button variant="outline" onClick={handleClearSearch}>
                <FilterX className="size-4" />
                {t("common.clearFilters")}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <TasksTable
            columns={columns}
            data={tasks}
            isLoading={isLoading}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
            onSearch={searchTasks}
            isSearching={isSearching}
            searchQuery={searchQuery}
            onClearSearch={handleClearSearch}
            isLoadingMore={pagination.isLoadingMore}
            hasMoreRecords={pagination.hasMoreRecords}
            totalLoaded={tasks.length}
            isRefreshing={isRefreshing}
            onLoadMore={loadMoreTasks}
            onPageChange={setCurrentTablePage}
            onPageSizeChange={setTablePageSize}
            isOnLastPage={isOnLastPage && !searchQuery}
            onCreateVisit={handleCreateVisitFromTask}
          />

          {/* Visit Form Dialog */}
          {selectedTaskForVisit && customerFromTask && (
            <VisitFormDialog
              open={isVisitDialogOpen}
              onOpenChange={handleDialogClose}
              customer={customerFromTask}
              zohoTaskId={selectedTaskForVisit.id}
              onSuccess={handleVisitSuccess}
            />
          )}
        </>
      )}
    </section>
  );
}
