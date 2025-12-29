"use client";

import { toast } from "sonner";
import { ZohoTask } from "@/interfaces/zoho";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { RefreshCw, ListTodo } from "lucide-react";
import { EmptyCard } from "@/components/empty-card";
import { columns } from "@/components/tasks/columns";
import { H1, Paragraph } from "@/components/fonts/fonts";
import { ColumnFiltersState } from "@tanstack/react-table";
import { TasksTable } from "@/components/tasks/tasks-table";
import { useState, useCallback, useRef, useEffect } from "react";

const PER_PAGE = 200;
const INITIAL_LOAD_ONLY_FIRST_PAGE = true; // Set to false to load all pages initially

interface PaginationState {
  currentPage: number;
  hasMoreRecords: boolean;
  isLoadingMore: boolean;
}

export default function TasksPage() {
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
        throw new Error("Error al obtener tareas");
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
            // Add small delay to avoid overwhelming the API
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

        // Load only first page initially for performance
        const { tasks: initialTasks, hasMore } = await fetchTasksPage(1);

        allTasksRef.current = initialTasks;
        setTasks(initialTasks);

        setPagination({
          currentPage: 1,
          hasMoreRecords: hasMore,
          isLoadingMore: false,
        });

        if (hasMore && !INITIAL_LOAD_ONLY_FIRST_PAGE) {
          // If configured to load all, continue loading in background
          loadMoreTasksInBackground(2);
        }
      } catch (err) {
        console.error("Error fetching initial tasks:", err);
        setError(
          err instanceof Error ? err.message : "Error al cargar las tareas"
        );
        toast.error("Error al cargar las tareas");
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

      toast.success(`${newTasks.length} tareas más cargadas`);
    } catch (err) {
      console.error("Error loading more tasks:", err);
      toast.error("Error al cargar más tareas");
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
        setError(err instanceof Error ? err.message : "Error al buscar tareas");
        toast.error("Error al buscar tareas");
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
    fetchInitialTasks();
  };

  useEffect(() => {
    fetchInitialTasks();
  }, [fetchInitialTasks]);

  // Calculate if user is on the last page of currently loaded data
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

  return (
    <section className="mx-auto px-4 space-y-3 w-full h-full">
      <div className="flex flex-row items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur py-0">
        <div>
          <H1>Gestión de tareas</H1>
          <div className="flex flex-col justify-start">
            <Paragraph>
              Aquí puedes ver todas las tareas configuradas en el sistema.
            </Paragraph>

            <Badge variant="secondary" size="sm" className="mt-1">
              {isLoading || isRefreshing ? (
                <>
                  <Spinner variant="circle" size="sm" />
                  <span className="text-xs">Cargando tareas...</span>
                </>
              ) : isRefreshing ? (
                "Actualizando tareas..."
              ) : (
                <>
                  {tasks.length === 1
                    ? "1 tarea cargada"
                    : `${tasks.length} tareas cargadas`}
                </>
              )}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            title="Actualizar datos"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
          >
            <RefreshCw
              className={`size-4 ${
                isRefreshing || isLoading ? "animate-spin" : ""
              }`}
            />
            <span className="hidden md:inline">Actualizar</span>
          </Button>
        </div>
      </div>

      {error ? (
        <EmptyCard
          icon={<ListTodo className="size-16 text-muted-foreground" />}
          title="Error al cargar tareas"
          description={error}
          actions={
            <Button onClick={handleRefresh} variant="default">
              Intentar de nuevo
            </Button>
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
          />
        </>
      )}
    </section>
  );
}
