"use client";

import axios from "axios";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ZohoAccount } from "@/interfaces/zoho";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/empty-card";
import { H1, Paragraph } from "@/components/fonts/fonts";
import { createColumns } from "@/components/accounts/columns";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { AccountsTable } from "@/components/accounts/accounts-table";
import { RefreshCw, Building2, FileSpreadsheet } from "lucide-react";
import { DashboardPageSkeleton } from "@/components/dashboard-skeleton";

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<ZohoAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Fetch accounts from Zoho CRM
  const fetchAccounts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await axios.get("/api/zoho/accounts", {
        params: {
          page: 1,
          per_page: 200,
          sort_by: "Modified_Time",
          sort_order: "desc",
        },
      });

      const data = response.data;

      if (response.status !== 200) {
        throw new Error(
          data.error || "Error al obtener las cuentas de Zoho CRM"
        );
      }

      setAccounts(data.accounts || []);

      if (isRefresh) {
        toast.success("Cuentas actualizadas correctamente");
      }
    } catch (err: any) {
      console.error("Error fetching accounts:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Error al cargar las cuentas";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const columns = createColumns();

  // Export to CSV
  const handleExport = () => {
    try {
      const csvContent = [
        // Headers
        [
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
        ].join(","),
        // Data rows
        ...accounts.map((account) =>
          [
            account.id,
            `"${account.Account_Name || ""}"`,
            `"${account.Account_Type || ""}"`,
            `"${account.Industry || ""}"`,
            `"${account.Billing_Country || ""}"`,
            `"${account.Billing_City || ""}"`,
            `"${account.Phone || ""}"`,
            `"${account.Email || ""}"`,
            `"${account.Website || ""}"`,
            `"${account.Owner?.name || ""}"`,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `cuentas_zoho_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Datos exportados correctamente");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Error al exportar los datos");
    }
  };

  if (isLoading && !isRefreshing) {
    return <DashboardPageSkeleton />;
  }

  // Error state
  if (error && accounts.length === 0) {
    return (
      <section className="mx-auto px-4 space-y-6 w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <H1>Gestión de proyectos</H1>
            <Paragraph>
              Administra las cuentas y proyectos de tus clientes
            </Paragraph>
          </div>
        </div>

        <EmptyCard
          title="Error al cargar las cuentas"
          description={error}
          icon={<Building2 className="h-12 w-12" />}
          actions={
            <Button onClick={() => fetchAccounts()} variant="outline">
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          }
        />
      </section>
    );
  }

  // Empty state
  if (!isLoading && accounts.length === 0) {
    return (
      <section className="mx-auto px-4 space-y-6 w-full">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <H1>Gestión de proyectos</H1>
            <Paragraph>
              Administra las cuentas y proyectos de tus clientes
            </Paragraph>
          </div>

          <Button onClick={() => fetchAccounts(true)} variant="outline">
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        </div>

        <EmptyCard
          title="No se encontraron cuentas"
          description="No hay cuentas de clientes disponibles en Zoho CRM"
          icon={<Building2 className="h-12 w-12" />}
          actions={
            <Button onClick={() => fetchAccounts(true)} variant="outline">
              <RefreshCw className="h-4 w-4" />
              Recargar
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section className="mx-auto px-4 space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <H1>Gestión de proyectos</H1>
          <Paragraph>
            Administra las cuentas y proyectos de tus clientes
          </Paragraph>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>
              {accounts.length} cuenta{accounts.length !== 1 ? "s" : ""}{" "}
              encontrada{accounts.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            variant="outline"
            disabled={accounts.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button
            onClick={() => fetchAccounts(true)}
            variant="outline"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Table */}
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
    </section>
  );
}
