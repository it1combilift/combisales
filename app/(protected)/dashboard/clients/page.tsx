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
import VisitFormDialog from "@/components/visits/visit-form-dialog";
import { Customer } from "@/interfaces/visits";
import { useI18n } from "@/lib/i18n/context";

const PER_PAGE = 200;
const INITIAL_LOAD_ONLY_FIRST_PAGE = true;

interface PaginationState {
  currentPage: number;
  hasMoreRecords: boolean;
  isLoadingMore: boolean;
}

export default function ClientsPage() {
  const { t, locale } = useI18n();
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

  // Visit dialog state
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [selectedAccountForVisit, setSelectedAccountForVisit] =
    useState<ZohoAccount | null>(null);

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

        const result = await fetchAccountsPage(1);

        allAccountsRef.current = result.accounts;
        setAccounts(result.accounts);

        setPagination({
          currentPage: 1,
          hasMoreRecords: result.pagination.more_records,
          isLoadingMore: false,
        });

        if (result.pagination.more_records && !INITIAL_LOAD_ONLY_FIRST_PAGE) {
          loadMoreAccountsInBackground(2);
        }

        if (isRefresh) {
          toast.success(
            t("clients.clientsLoaded", {
              count: accounts.length,
            }),
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

      toast.success(
        t("clients.moreClientsLoaded", { count: newAccounts.length })
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || t("errors.loadingMore");
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

  const columns = createColumns({ t, locale });
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

  // Handle create visit from account card
  const handleCreateVisitFromAccount = useCallback((account: ZohoAccount) => {
    setSelectedAccountForVisit(account);
    setIsVisitDialogOpen(true);
  }, []);

  const handleVisitSuccess = useCallback(() => {
    setIsVisitDialogOpen(false);
    setSelectedAccountForVisit(null);
    toast.success(t("visits.visitCreated"));
  }, [t]);

  const handleDialogClose = useCallback((open: boolean) => {
    setIsVisitDialogOpen(open);
    if (!open) {
      setSelectedAccountForVisit(null);
    }
  }, []);

  // Prepare customer data from account
  const customerFromAccount: Customer | undefined = selectedAccountForVisit
    ? {
        id: selectedAccountForVisit.id,
        zohoAccountId: selectedAccountForVisit.id,
        accountName: selectedAccountForVisit.Account_Name,
        razonSocial: selectedAccountForVisit.Razon_Social || null,
        accountNumber: selectedAccountForVisit.Account_Number || null,
        cif: selectedAccountForVisit.CIF || null,
        codigoCliente: selectedAccountForVisit.C_digo_Cliente || null,
        accountType: selectedAccountForVisit.Account_Type || null,
        industry: selectedAccountForVisit.Industry || null,
        subSector: selectedAccountForVisit.Sub_Sector || null,
        phone: selectedAccountForVisit.Phone || null,
        fax: selectedAccountForVisit.Fax || null,
        email: selectedAccountForVisit.Email || null,
        website: selectedAccountForVisit.Website || null,
        billingStreet: selectedAccountForVisit.Billing_Street || null,
        billingCity: selectedAccountForVisit.Billing_City || null,
        billingState: selectedAccountForVisit.Billing_State || null,
        billingCode: selectedAccountForVisit.Billing_Code || null,
        billingCountry: selectedAccountForVisit.Billing_Country || null,
        shippingStreet: selectedAccountForVisit.Shipping_Street || null,
        shippingCity: selectedAccountForVisit.Shipping_City || null,
        shippingState: selectedAccountForVisit.Shipping_State || null,
        shippingCode: selectedAccountForVisit.Shipping_Code || null,
        shippingCountry: selectedAccountForVisit.Shipping_Country || null,
        latitude: selectedAccountForVisit.dealsingooglemaps__Latitude || null,
        longitude: selectedAccountForVisit.dealsingooglemaps__Longitude || null,
        zohoOwnerId: selectedAccountForVisit.Owner?.id || null,
        zohoOwnerName: selectedAccountForVisit.Owner?.name || null,
        zohoOwnerEmail: selectedAccountForVisit.Owner?.email || null,
        zohoCreatedById: selectedAccountForVisit.Created_By?.id || null,
        zohoCreatedByName: selectedAccountForVisit.Created_By?.name || null,
        zohoCreatedByEmail: selectedAccountForVisit.Created_By?.email || null,
        parentAccountId: selectedAccountForVisit.Parent_Account?.id || null,
        parentAccountName: selectedAccountForVisit.Parent_Account?.name || null,
        clienteConEquipo: selectedAccountForVisit.Cliente_con_Equipo || false,
        cuentaNacional: selectedAccountForVisit.Cuenta_Nacional || false,
        clienteBooks: selectedAccountForVisit.Cliente_Books || false,
        condicionesEspeciales:
          selectedAccountForVisit.Condiciones_Especiales || false,
        proyectoAbierto: selectedAccountForVisit.Proyecto_abierto || false,
        revisado: selectedAccountForVisit.Revisado || false,
        localizacionesMultiples:
          selectedAccountForVisit.Localizaciones_multiples || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    : undefined;

  return (
    <section className="mx-auto px-4 space-y-6 w-full h-full">
      {showLoader ? (
        <DashboardProjectsPageSkeleton />
      ) : error ? (
        <EmptyCard
          title={t("clients.errorLoading")}
          description={error}
          icon={<AlertCircle className="h-12 w-12" />}
          actions={
            <Button onClick={() => fetchInitialAccounts()} variant="outline">
              <RefreshCw className="size-4" /> {t("common.tryAgain")}
            </Button>
          }
        />
      ) : !hasData && !searchQuery ? (
        <EmptyCard
          title={t("clients.noClientsFound")}
          description={t("clients.noClientsAvailable")}
          icon={<Building2 className="h-12 w-12 text-muted-foreground" />}
          actions={
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="size-4" /> {t("common.refresh")}
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex gap-4 flex-row items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur">
            <div>
              <H1>{t("clients.title")}</H1>
              <div className="flex flex-col justify-start gap-2">
                <Paragraph>{t("clients.description")}</Paragraph>

                {!isLoading && !error && (
                  <div className="flex items-center gap-2">
                    <span className="w-fit hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground text-left">
                      {searchQuery
                        ? t("clients.resultsFound", { count: accounts.length })
                        : t("clients.clientsLoaded", {
                            count: accounts.length,
                          })}
                    </span>
                    {pagination.isLoadingMore && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary animate-pulse">
                        <RefreshCw className="size-3 animate-spin" />
                        {t("common.loading")}
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
                title={t("common.refresh")}
                size="sm"
              >
                <RefreshCw
                  className={`size-4 ${
                    isRefreshing || pagination.isLoadingMore
                      ? "animate-spin"
                      : ""
                  }`}
                />
                <span className="hidden md:inline">
                  {isLoading || isRefreshing || pagination.isLoadingMore
                    ? t("common.refreshing")
                    : t("common.refresh")}
                </span>
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
              onCreateVisit={handleCreateVisitFromAccount}
            />

            {/* Visit Form Dialog */}
            {selectedAccountForVisit && customerFromAccount && (
              <VisitFormDialog
                open={isVisitDialogOpen}
                onOpenChange={handleDialogClose}
                customer={customerFromAccount}
                onSuccess={handleVisitSuccess}
              />
            )}
          </div>
        </>
      )}
    </section>
  );
}
