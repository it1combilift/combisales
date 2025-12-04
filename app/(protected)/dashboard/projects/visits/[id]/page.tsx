"use client";

import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { ZohoAccount } from "@/interfaces/zoho";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/empty-card";
import { Customer, Visit } from "@/interfaces/visits";
import { H1, MonoText } from "@/components/fonts/fonts";
import { ColumnFiltersState } from "@tanstack/react-table";
import { createColumns } from "@/components/visits/columns";
import AnimatedTabsComponent from "@/components/accounts/tabs";
import { VisitsDataTable } from "@/components/visits/data-table";
import VisitFormDialog from "@/components/visits/visit-form-dialog";
import { DashboardPageSkeleton } from "@/components/dashboard-skeleton";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  MapPin,
  User,
  ArrowLeft,
  Plus,
  Link,
  FileText,
  FolderKanban,
  History,
  Loader2,
  Search,
  Hash,
} from "lucide-react";

const HistoryVisitsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [account, setAccount] = useState<ZohoAccount | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [id, setId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVisits, setIsLoadingVisits] = useState(false);
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState<Visit | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const router = useRouter();

  // Function to save customer automatically
  const saveCustomerAutomatically = async (accountData: ZohoAccount) => {
    try {
      const response = await axios.post("/api/customers", {
        zohoAccountId: accountData.id,

        accountName: accountData.Account_Name,
        razonSocial: accountData.Razon_Social,
        accountNumber: accountData.Account_Number,
        cif: accountData.CIF,
        codigoCliente: accountData.C_digo_Cliente,

        accountType: accountData.Account_Type,
        industry: accountData.Industry,
        subSector: accountData.Sub_Sector,

        phone: accountData.Phone,
        fax: accountData.Fax,
        email: accountData.Correo_electr_nico || accountData.Email,
        website: accountData.Website,

        billingStreet: accountData.Billing_Street,
        billingCity: accountData.Billing_City,
        billingState: accountData.Billing_State,
        billingCode: accountData.Billing_Code,
        billingCountry: accountData.Billing_Country,

        shippingStreet: accountData.Shipping_Street,
        shippingCity: accountData.Shipping_City,
        shippingState: accountData.Shipping_State,
        shippingCode: accountData.Shipping_Code,
        shippingCountry: accountData.Shipping_Country,

        latitude: accountData.dealsingooglemaps__Latitude,
        longitude: accountData.dealsingooglemaps__Longitude,

        zohoOwnerId: accountData.Owner?.id,
        zohoOwnerName: accountData.Owner?.name,
        zohoOwnerEmail: accountData.Owner?.email,

        zohoCreatedById: accountData.Created_By?.id,
        zohoCreatedByName: accountData.Created_By?.name,
        zohoCreatedByEmail: accountData.Created_By?.email,

        parentAccountId: accountData.Parent_Account?.id,
        parentAccountName: accountData.Parent_Account?.name,

        clienteConEquipo: accountData.Cliente_con_Equipo ?? false,
        cuentaNacional: accountData.Cuenta_Nacional ?? false,
        clienteBooks: accountData.Cliente_Books ?? false,
        condicionesEspeciales: accountData.Condiciones_Especiales ?? false,
        proyectoAbierto: accountData.Proyecto_abierto ?? false,
        revisado: accountData.Revisado ?? false,
        localizacionesMultiples: accountData.Localizaciones_multiples ?? false,

        description: accountData.Description,
        comunidadAutonoma: accountData.Comunidad_Aut_noma,
        tipoPedido: accountData.Tipo_de_pedido,
        estadoCuenta: accountData.Estado_de_la_Cuenta,

        zohoCreatedAt: accountData.Created_Time
          ? new Date(accountData.Created_Time)
          : undefined,
        zohoModifiedAt: accountData.Modified_Time
          ? new Date(accountData.Modified_Time)
          : undefined,
        lastActivityTime: accountData.Last_Activity_Time
          ? new Date(accountData.Last_Activity_Time)
          : undefined,
      });

      if (response.status === 201) {
        setCustomer(response.data.customer);
        fetchVisits(response.data.customer.id);
      }
    } catch (error: any) {
      console.error("Error saving customer:", error);
      toast.error("Error al sincronizar el cliente");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resolvedParams = await params;
        const accountId = resolvedParams.id;
        setId(accountId);

        const response = await axios.get(`/api/zoho/accounts/${accountId}`);
        if (response.status === 200) {
          const accountData = response.data.account;
          setAccount(accountData);

          try {
            const customerResponse = await axios.get(
              `/api/customers?zohoAccountId=${accountId}`
            );
            if (customerResponse.data.exists) {
              setCustomer(customerResponse.data.customer);
              fetchVisits(customerResponse.data.customer.id);
            } else {
              await saveCustomerAutomatically(accountData);
            }
          } catch (error: any) {
            if (error.response?.status === 404) {
              await saveCustomerAutomatically(accountData);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching account details:", error);
        toast.error("Error al obtener los detalles de la cuenta.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const fetchVisits = async (customerId: string) => {
    setIsLoadingVisits(true);
    try {
      const response = await axios.get(`/api/visits?customerId=${customerId}`);
      setVisits(response.data.visits);
    } catch (error) {
      console.error("Error fetching visits:", error);
      toast.error("Error al cargar las visitas");
    } finally {
      setIsLoadingVisits(false);
    }
  };

  const handleNewVisit = () => {
    if (!customer) {
      toast.error("El cliente aún se está sincronizando, intenta de nuevo");
      return;
    }
    setIsVisitDialogOpen(true);
  };

  const handleVisitSuccess = () => {
    if (customer) {
      fetchVisits(customer.id);
    }
  };

  const handleDeleteVisit = async () => {
    if (!visitToDelete) return;

    try {
      await axios.delete(`/api/visits/${visitToDelete.id}`);
      toast.success("Visita eliminada exitosamente");
      if (customer) {
        fetchVisits(customer.id);
      }
    } catch (error) {
      console.error("Error deleting visit:", error);
      toast.error("Error al eliminar la visita");
    } finally {
      setVisitToDelete(null);
    }
  };

  const handleViewVisit = (visit: Visit) => {
    router.push(`/dashboard/projects/visits/${id}/detail/${visit.id}`);
  };

  const columns = createColumns({
    onView: handleViewVisit,
    onDelete: (visit) => setVisitToDelete(visit),
  });

  const visitsTabContent = (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar visitas..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Data Table */}
      {isLoadingVisits ? (
        <div className="flex items-center justify-center py-12 border rounded-lg">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : visits.length === 0 && !globalFilter ? (
        <EmptyCard
          icon={<History className="text-muted-foreground" />}
          title="No hay visitas registradas"
          description="Comienza creando una nueva visita para este cliente"
          actions={
            <Button onClick={handleNewVisit} variant="secondary">
              <Plus className="size-4" />
              Nueva visita
            </Button>
          }
        />
      ) : (
        <VisitsDataTable
          columns={columns}
          data={visits}
          isLoading={isLoadingVisits}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />
      )}
    </div>
  );

  const detailsTabContent = (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted/50 p-6 mb-4">
        <FileText className=" text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">
        Detalles del Cliente
      </h3>
      <p className="text-sm text-muted-foreground max-w-md">
        Información detallada del cliente, datos de contacto, dirección y
        preferencias.
      </p>
    </div>
  );

  const projectsTabContent = (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted/50 p-6 mb-4">
        <FolderKanban className=" text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">
        Proyectos Asociados
      </h3>
      <p className="text-sm text-muted-foreground max-w-md">
        Lista de proyectos relacionados con este cliente, estados y progreso.
      </p>
    </div>
  );

  const tabs = [
    {
      name: "Visitas",
      value: "visits",
      icon: History,
      description: "Historial completo de visitas realizadas",
      content: visitsTabContent,
    },
    {
      name: "Detalles",
      value: "details",
      icon: FileText,
      description: "Información completa del cliente",
      content: detailsTabContent,
    },
    {
      name: "Proyectos",
      value: "projects",
      icon: FolderKanban,
      description: "Proyectos vinculados",
      content: projectsTabContent,
    },
  ];

  return (
    <section className="mx-auto px-4 space-y-6 w-full h-full">
      {isLoading ? (
        <DashboardPageSkeleton />
      ) : account ? (
        <>
          {/* Header Content */}
          <header
            className="
    sticky top-0 z-20 
    -mx-4 px-4 pb-2
    bg-background/95 backdrop-blur-md 
    border-b border-border/50
  "
            role="banner"
            aria-label="Información del cliente"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-1">
                <H1>{account?.Account_Name || "Sin nombre"}</H1>

                <div className="flex flex-wrap items-center gap-2">
                  <MonoText>
                    <Hash className="size-3 inline-block" />
                    {account?.id || "N/A"}
                  </MonoText>

                  {account?.Website && (
                    <MonoText>
                      <Link className="size-3 inline-block mr-1" />
                      <a
                        href={
                          account.Website.startsWith("http")
                            ? account.Website
                            : `http://${account.Website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary hover:underline transition-colors"
                      >
                        {account.Website.replace(/^https?:\/\//, "").replace(
                          /\/$/,
                          ""
                        )}
                      </a>
                    </MonoText>
                  )}
                </div>
              </div>

              <div className="flex gap-1 sm:gap-x-2 shrink-0">
                <Button
                  onClick={() => router.back()}
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                >
                  <ArrowLeft className="size-4" />
                  <span className="hidden sm:inline">Volver</span>
                </Button>

                <Button
                  onClick={handleNewVisit}
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                >
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">Nueva visita</span>
                </Button>
              </div>
            </div>

            <div
              className="
      mt-2 
      flex flex-wrap items-center
      gap-2
      text-xs
    "
            >
              {account.Owner && (
                <MonoText>
                  <User className="size-3 inline mr-1" />
                  {account.Owner.name}
                </MonoText>
              )}

              {account.Account_Type && (
                <MonoText>{account.Account_Type}</MonoText>
              )}

              {account.Industry && <MonoText>{account.Industry}</MonoText>}

              {(account.Billing_City || account.Billing_Country) && (
                <MonoText>
                  <MapPin className="size-3 inline mr-1" />
                  {[account.Billing_City, account.Billing_Country]
                    .filter(Boolean)
                    .join(", ")}
                </MonoText>
              )}
            </div>
          </header>

          {/* Page Content */}
          <AnimatedTabsComponent tabs={tabs} />

          {/* Visit Form Dialog */}
          {customer && (
            <VisitFormDialog
              open={isVisitDialogOpen}
              onOpenChange={setIsVisitDialogOpen}
              customer={customer}
              onSuccess={handleVisitSuccess}
            />
          )}

          {/* Delete Visit Confirmation Dialog */}
          <AlertDialog
            open={!!visitToDelete}
            onOpenChange={(open) => !open && setVisitToDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar visita?</AlertDialogTitle>
                <AlertDialogDescription className="text-pretty">
                  Esta acción no se puede deshacer. Se eliminará permanentemente
                  la visita y todos sus datos asociados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteVisit}>
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : null}
    </section>
  );
};

export default HistoryVisitsPage;
