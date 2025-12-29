"use client";

import axios from "axios";
import { toast } from "sonner";
import { ZohoAccount } from "@/interfaces/zoho";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/empty-card";
import { H1, Paragraph } from "@/components/fonts/fonts";
import { createColumns } from "@/components/accounts/columns";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { useState, useEffect, useCallback, useRef } from "react";
import { AccountsTable } from "@/components/accounts/accounts-table";
import { RefreshCw, Building2, AlertCircle, Search } from "lucide-react";
import { DashboardProjectsPageSkeleton } from "@/components/dashboard-skeleton";

const PER_PAGE = 200;
const INITIAL_LOAD_ONLY_FIRST_PAGE = true;

interface PaginationState {
  currentPage: number;
  hasMoreRecords: boolean;
  isLoadingMore: boolean;
}

export default function ClientsPage() {
  const [accounts, setAccounts] = useState<ZohoAccount[]>([]);
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

  const allAccountsRef = useRef<ZohoAccount[]>([]);
  const isLoadingRef = useRef(false);

  /**
   * Fetch accounts from a specific page
   */
  const fetchAccountsPage = useCallback(
    async (page: number, search?: string) => {
      const params: Record<string, string | number> = {
        page,
        per_page: PER_PAGE,
      };

      if (search && search.trim().length > 0) {
        params.search = search.trim();
      }

      const response = await axios.get("/api/zoho/accounts", { params });

      if (response.status !== 200) {
        throw new Error(response.data.error || "Error al obtener los clientes");
      }

      return {
        accounts: response.data.accounts || [],
        pagination: response.data.pagination as {
          page: number;
          per_page: number;
          count: number;
          more_records: boolean;
        },
      };
    },
    []
  );

  /**
   * Load remaining accounts in background (optional)
   */
  const loadMoreAccountsInBackground = useCallback(
    async (startPage: number) => {
      let currentPage = startPage;
      let hasMore = true;

      while (hasMore) {
        try {
          const result = await fetchAccountsPage(currentPage);

          const existingIds = new Set(allAccountsRef.current.map((a) => a.id));
          const newAccounts = result.accounts.filter(
            (a: ZohoAccount) => !existingIds.has(a.id)
          );

          const updatedAccounts = [...allAccountsRef.current, ...newAccounts];
          allAccountsRef.current = updatedAccounts;
          setAccounts([...updatedAccounts]);

          hasMore = result.pagination.more_records;
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
          console.error("Error loading accounts in background:", err);
          break;
        }
      }

      setPagination((prev) => ({ ...prev, isLoadingMore: false }));
    },
    [fetchAccountsPage]
  );

  /**
   * Fetch initial accounts (only first page for performance)
   */
  const fetchInitialAccounts = useCallback(
    async (options: { isRefresh?: boolean } = {}) => {
      const { isRefresh = false } = options;

      if (isLoadingRef.current) return;
      isLoadingRef.current = true;

      try {
        if (isRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        // Load only first page initially for performance
        const result = await fetchAccountsPage(1);

        allAccountsRef.current = result.accounts;
        setAccounts(result.accounts);

        setPagination({
          currentPage: 1,
          hasMoreRecords: result.pagination.more_records,
          isLoadingMore: false,
        });

        if (result.pagination.more_records && !INITIAL_LOAD_ONLY_FIRST_PAGE) {
          // If configured to load all, continue loading in background
          loadMoreAccountsInBackground(2);
        }

        if (isRefresh) {
          toast.success(
            `${result.accounts.length} clientes cargados correctamente`,
            { closeButton: true }
          );
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || err.message || "Error desconocido";
        setError(errorMessage);
        toast.error(errorMessage, { closeButton: true });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        isLoadingRef.current = false;
      }
    },
    [fetchAccountsPage, loadMoreAccountsInBackground]
  );

  /**
   * Load more accounts (for "Load More" button)
   */
  const loadMoreAccounts = useCallback(async () => {
    if (isLoadingRef.current || !pagination.hasMoreRecords) return;

    isLoadingRef.current = true;
    setPagination((prev) => ({ ...prev, isLoadingMore: true }));

    try {
      const nextPage = pagination.currentPage + 1;
      const result = await fetchAccountsPage(nextPage);

      const existingIds = new Set(allAccountsRef.current.map((a) => a.id));
      const newAccounts = result.accounts.filter(
        (a: ZohoAccount) => !existingIds.has(a.id)
      );

      const updatedAccounts = [...allAccountsRef.current, ...newAccounts];
      allAccountsRef.current = updatedAccounts;
      setAccounts(updatedAccounts);

      setPagination({
        currentPage: nextPage,
        hasMoreRecords: result.pagination.more_records,
        isLoadingMore: false,
      });

      toast.success(`${newAccounts.length} clientes más cargados`);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || "Error al cargar más";
      toast.error(errorMessage);
      setPagination((prev) => ({ ...prev, isLoadingMore: false }));
    } finally {
      isLoadingRef.current = false;
    }
  }, [fetchAccountsPage, pagination]);

  /**
   * Search accounts (single page search - Zoho handles the search)
   */
  const fetchSearchResults = useCallback(
    async (searchText: string) => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;

      try {
        setIsSearching(true);
        setError(null);

        const result = await fetchAccountsPage(1, searchText);
        setAccounts(result.accounts);
        setPagination({
          currentPage: 1,
          hasMoreRecords: result.pagination.more_records,
          isLoadingMore: false,
        });
      } catch (err: any) {
        console.error("Search error:", err);
        setAccounts([]);
      } finally {
        setIsSearching(false);
        isLoadingRef.current = false;
      }
    },
    [fetchAccountsPage]
  );

  // Initial load - fetch first page only
  useEffect(() => {
    fetchInitialAccounts();
  }, [fetchInitialAccounts]);

  // Handle remote search
  const handleSearch = useCallback(
    (searchText: string) => {
      setSearchQuery(searchText);

      if (searchText.trim().length === 0) {
        setAccounts(allAccountsRef.current);
        setPagination({
          currentPage: 1,
          hasMoreRecords: false,
          isLoadingMore: false,
        });
        return;
      }

      if (searchText.trim().length < 2) {
        return;
      }

      fetchSearchResults(searchText);
    },
    [fetchSearchResults]
  );

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setAccounts(allAccountsRef.current);
    setPagination({
      currentPage: 1,
      hasMoreRecords: false,
      isLoadingMore: false,
    });
  }, []);

  // Handle refresh - reload first page
  const handleRefresh = useCallback(() => {
    setSearchQuery("");
    allAccountsRef.current = [];
    fetchInitialAccounts({ isRefresh: true });
  }, [fetchInitialAccounts]);

  const columns = createColumns();
  const hasData = accounts.length > 0;
  const showLoader = isLoading && !isRefreshing;

  // Calculate if user is on the last page of currently loaded data
  const filteredAccountsCount =
    columnFilters.length > 0
      ? accounts.filter((account) => {
          return columnFilters.every((filter) => {
            const value = account[filter.id as keyof ZohoAccount];
            return value === filter.value;
          });
        }).length
      : accounts.length;

  const totalPages = Math.ceil(filteredAccountsCount / tablePageSize);
  const isOnLastPage = currentTablePage >= totalPages;

  return (
    <section className="mx-auto px-4 space-y-6 w-full h-full">
      {showLoader ? (
        <DashboardProjectsPageSkeleton />
      ) : error ? (
        <EmptyCard
          title="Error al cargar los clientes"
          description={error}
          icon={<AlertCircle className="h-12 w-12" />}
          actions={
            <Button onClick={() => fetchInitialAccounts()} variant="outline">
              <RefreshCw className="size-4" /> Reintentar
            </Button>
          }
        />
      ) : !hasData && !searchQuery ? (
        <EmptyCard
          title="No se encontraron clientes"
          description="No hay clientes disponibles en Zoho CRM"
          icon={<Building2 className="h-12 w-12 text-muted-foreground" />}
          actions={
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="size-4" /> Recargar
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex gap-4 flex-row items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur">
            <div>
              <H1>Gestión de clientes</H1>
              <div className="flex flex-col justify-start gap-2">
                <Paragraph>Administra las visitas de tus clientes</Paragraph>

                {!isLoading && !error && (
                  <div className="flex items-center gap-2">
                    <span className="w-fit hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground text-left">
                      {searchQuery
                        ? `${accounts.length} resultados encontrados`
                        : `${accounts.length} clientes cargados`}
                    </span>
                    {pagination.isLoadingMore && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary animate-pulse">
                        <RefreshCw className="size-3 animate-spin" />
                        Cargando...
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={
                  isRefreshing ||
                  showLoader ||
                  isSearching ||
                  pagination.isLoadingMore
                }
                title="Actualizar datos"
                size="sm"
              >
                <RefreshCw
                  className={`size-4 ${
                    isRefreshing || pagination.isLoadingMore
                      ? "animate-spin"
                      : ""
                  }`}
                />
                <span className="hidden md:inline">Actualizar</span>
              </Button>
            </div>
          </div>

          <div className="min-h-[400px]">
            <AccountsTable
              columns={columns}
              data={accounts}
              isLoading={isRefreshing}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
              columnFilters={columnFilters}
              setColumnFilters={setColumnFilters}
              onSearch={handleSearch}
              isSearching={isSearching}
              searchQuery={searchQuery}
              onClearSearch={handleClearSearch}
              isLoadingMore={pagination.isLoadingMore}
              hasMoreRecords={pagination.hasMoreRecords}
              totalLoaded={accounts.length}
              onPageChange={setCurrentTablePage}
              onPageSizeChange={setTablePageSize}
              onLoadMore={loadMoreAccounts}
              isOnLastPage={isOnLastPage && !searchQuery}
            />

            {/* Empty state for search with no results */}
            {searchQuery && !hasData && !isSearching && (
              <EmptyCard
                title="Sin resultados"
                description={`No se encontraron clientes que coincidan con "${searchQuery}"`}
                icon={<Search className="h-12 w-12 text-muted-foreground" />}
                actions={
                  <Button onClick={handleClearSearch} variant="outline">
                    <RefreshCw className="size-4" /> Limpiar búsqueda
                  </Button>
                }
              />
            )}
          </div>
        </>
      )}
    </section>
  );
}
