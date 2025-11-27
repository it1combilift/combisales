"use client";

import axios from "axios";
import { toast } from "sonner";
import { ZohoAccount } from "@/interfaces/zoho";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/empty-card";
import { H1, Paragraph } from "@/components/fonts/fonts";
import { useState, useEffect, useCallback } from "react";
import { createColumns } from "@/components/accounts/columns";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { AccountsTable } from "@/components/accounts/accounts-table";
import { DashboardProjectsPageSkeleton } from "@/components/dashboard-skeleton";

import {
  RefreshCw,
  Building2,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";

export default function ProjectsPage() {
  const [accounts, setAccounts] = useState<ZohoAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const fetchAccounts = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setIsRefreshing(true) : setIsLoading(true);
      setError(null);

      const response = await axios.get("/api/zoho/accounts", {
        params: {
          page: 1,
          per_page: 200,
          sort_by: "Modified_Time",
          sort_order: "desc",
        },
      });

      if (response.status !== 200) {
        throw new Error(response.data.error || "Error al obtener las cuentas");
      }

      setAccounts(response.data.accounts || []);
      if (isRefresh) toast.success("Cuentas actualizadas correctamente");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || "Error desconocido";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleExport = useCallback(() => {
    try {
      if (accounts.length === 0) return;

      const headers = [
        "ID",
        "Nombre",
        "Tipo",
        "Industria",
        "País",
        "Ciudad",
        "Teléfono",
        "Email",
        "Sitio Web",
        "Propietario",
      ];

      const rows = accounts.map((acc) => [
        acc.id,
        `"${acc.Account_Name || ""}"`,
        `"${acc.Account_Type || ""}"`,
        `"${acc.Industry || ""}"`,
        `"${acc.Billing_Country || ""}"`,
        `"${acc.Billing_City || ""}"`,
        `"${acc.Phone || ""}"`,
        `"${acc.Email || ""}"`,
        `"${acc.Website || ""}"`,
        `"${acc.Owner?.name || ""}"`,
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((r) => r.join(",")),
      ].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `cuentas_zoho_${new Date().toISOString().split("T")[0]
        }.csv`;
      link.click();

      URL.revokeObjectURL(url);
      toast.success("Datos exportados correctamente");
    } catch (error) {
      toast.error("Error al exportar los datos");
    }
  }, [accounts]);

  const columns = createColumns();
  const hasData = accounts.length > 0;
  const showLoader = isLoading && !isRefreshing;

  return (
    <section className="mx-auto px-4 space-y-6 w-full h-full">
      {
        showLoader ? (
          <DashboardProjectsPageSkeleton />
        )
          :
          error ? (
            <EmptyCard
              title="Error al cargar las cuentas"
              description={error}
              icon={<AlertCircle className="h-12 w-12" />}
              actions={
                <Button onClick={() => fetchAccounts()} variant="outline">
                  <RefreshCw className="h-4 w-4" /> Reintentar
                </Button>
              }
            />)
            : !hasData ? (
              <EmptyCard
                title="No se encontraron cuentas"
                description="No hay cuentas de clientes disponibles en Zoho CRM"
                icon={<Building2 className="h-12 w-12 text-muted-foreground" />}
                actions={
                  <Button onClick={() => fetchAccounts(true)} variant="outline">
                    <RefreshCw className="h-4 w-4" /> Recargar
                  </Button>
                }
              />
            ) : (
              <>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between sticky top-0 z-10 bg-background/95 backdrop-blur">
                  <div className="space-y-1">
                    <H1>Gestión de proyectos</H1>
                    <div className="flex flex-col justify-start gap-2">
                      <Paragraph>
                        Administra las cuentas y proyectos de tus clientes
                      </Paragraph>

                      {!isLoading && !error && hasData && (
                        <span className="w-fit hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground text-left">
                          {accounts.length} cuentas encontradas
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleExport}
                      variant="outline"
                      disabled={!hasData || showLoader || !!error || isRefreshing}
                      title="Exportar a CSV"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      <span className="hidden md:inline">Exportar</span>
                    </Button>

                    <Button
                      onClick={() => fetchAccounts(true)}
                      variant="outline"
                      disabled={isRefreshing || showLoader}
                      title="Actualizar datos"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
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
                    globalFilter={globalFilter}
                    setGlobalFilter={setGlobalFilter}
                    columnFilters={columnFilters}
                    setColumnFilters={setColumnFilters}
                  />
                </div>
              </>
            )
      }
    </section>
  );
}
