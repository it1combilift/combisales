"use client";

import axios from "axios";
import { toast } from "sonner";
import { ZohoAccount } from "@/interfaces/zoho";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/empty-card";
import { H1, Paragraph } from "@/components/fonts/fonts";
import { useState, useEffect, useCallback, useRef } from "react";
import { createColumns } from "@/components/accounts/columns";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { RefreshCw, Building2, AlertCircle, Search } from "lucide-react";
import { AccountsTable } from "@/components/accounts/accounts-table";
import { DashboardProjectsPageSkeleton } from "@/components/dashboard-skeleton";

// Constantes de paginación
const PER_PAGE = 200;

interface PaginationState {
  currentPage: number;
  hasMoreRecords: boolean;
  isLoadingMore: boolean;
}

export default function ProjectsPage() {
  const [accounts, setAccounts] = useState<ZohoAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Estado de paginación del backend
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    hasMoreRecords: false,
    isLoadingMore: false,
  });

  // Store all accounts for reference when clearing search
  const allAccountsRef = useRef<ZohoAccount[]>([]);

  // Flag para evitar llamadas duplicadas
  const isLoadingRef = useRef(false);

  /**
   * Fetch accounts from a specific page
   * Returns the accounts and pagination info
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
   * Fetch all accounts progressively (all pages)
   */
  const fetchAllAccounts = useCallback(
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

        let allAccounts: ZohoAccount[] = [];
        let currentPage = 1;
        let hasMore = true;

        // Cargar todas las páginas progresivamente
        while (hasMore) {
          const result = await fetchAccountsPage(currentPage);

          // Concatenar sin duplicados (por ID)
          const existingIds = new Set(allAccounts.map((a) => a.id));
          const newAccounts = result.accounts.filter(
            (a: ZohoAccount) => !existingIds.has(a.id)
          );
          allAccounts = [...allAccounts, ...newAccounts];

          // Actualizar estado progresivamente para mostrar datos mientras carga
          setAccounts([...allAccounts]);
          setPagination({
            currentPage,
            hasMoreRecords: result.pagination.more_records,
            isLoadingMore: result.pagination.more_records,
          });

          hasMore = result.pagination.more_records;
          currentPage++;

          // Prevenir rate limiting (pequeña pausa entre requests)
          if (hasMore) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        // Guardar referencia de todas las cuentas
        allAccountsRef.current = allAccounts;

        setPagination((prev) => ({
          ...prev,
          isLoadingMore: false,
          hasMoreRecords: false,
        }));

        if (isRefresh) {
          toast.success(
            `${allAccounts.length} clientes actualizados correctamente`,
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
    [fetchAccountsPage]
  );

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
        // No mostrar error en búsqueda para evitar spam
        console.error("Search error:", err);
        setAccounts([]);
      } finally {
        setIsSearching(false);
        isLoadingRef.current = false;
      }
    },
    [fetchAccountsPage]
  );

  // Initial load - fetch all pages
  useEffect(() => {
    fetchAllAccounts();
  }, [fetchAllAccounts]);

  // Handle remote search
  const handleSearch = useCallback(
    (searchText: string) => {
      setSearchQuery(searchText);

      if (searchText.trim().length === 0) {
        // If search is empty, restore all accounts
        setAccounts(allAccountsRef.current);
        setPagination({
          currentPage: 1,
          hasMoreRecords: false,
          isLoadingMore: false,
        });
        return;
      }

      // Minimum 2 characters to search
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

  // Handle refresh - reload all pages
  const handleRefresh = useCallback(() => {
    setSearchQuery("");
    setAccounts([]);
    allAccountsRef.current = [];
    fetchAllAccounts({ isRefresh: true });
  }, [fetchAllAccounts]);

  const columns = createColumns();
  const hasData = accounts.length > 0;
  const showLoader = isLoading && !isRefreshing;

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
            <Button onClick={() => fetchAllAccounts()} variant="outline">
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
                        Cargando más...
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
