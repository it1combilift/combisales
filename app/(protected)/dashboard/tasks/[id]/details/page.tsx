"use client";

import { toast } from "sonner";
import { Visit } from "@/interfaces/visits";
import { useI18n } from "@/lib/i18n/context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmptyCard } from "@/components/empty-card";
import { H1, MonoText } from "@/components/fonts/fonts";
import { useState, useEffect, useCallback } from "react";
import { ZohoAccount, ZohoTask } from "@/interfaces/zoho";
import { ColumnFiltersState } from "@tanstack/react-table";
import { VisitCard } from "@/components/visits/visit-card";
import { createColumns } from "@/components/visits/columns";
import AnimatedTabsComponent from "@/components/accounts/tabs";
import { VisitsDataTable } from "@/components/visits/data-table";
import VisitFormDialog from "@/components/visits/visit-form-dialog";
import { DashboardPageSkeleton } from "@/components/dashboard-skeleton";
import { TaskDetailsCard } from "@/components/tasks/task-details-card";

import {
  ArrowLeft,
  Calendar,
  Flag,
  FileText,
  ListTodo,
  Plus,
  History,
  Hash,
  CheckCircle2,
  FileCheck,
} from "lucide-react";

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
import { Badge } from "@/components/ui/badge";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

const TaskDetailPage = ({ params }: TaskDetailPageProps) => {
  const [task, setTask] = useState<ZohoTask | null>(null);
  const [account, setAccount] = useState<ZohoAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [taskId, setTaskId] = useState<string>("");
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoadingVisits, setIsLoadingVisits] = useState(false);
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [visitToEdit, setVisitToEdit] = useState<Visit | null>(null);
  const [visitToDelete, setVisitToDelete] = useState<Visit | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const router = useRouter();
  const isMobile = useIsMobile();
  const { t, locale } = useI18n();

  useEffect(() => {
    const fetchTaskDetail = async () => {
      try {
        const resolvedParams = await params;
        setTaskId(resolvedParams.id);

        const response = await fetch(`/api/zoho/tasks/${resolvedParams.id}`);

        if (!response.ok) {
          throw new Error(t("tasks.taskNotFound"));
        }

        const result = await response.json();
        setTask(result.task);

        // Fetch account data if task is related to an account
        if (result.task?.What_Id?.id) {
          try {
            const accountRes = await fetch(
              `/api/zoho/accounts/${result.task.What_Id.id}`,
            );
            if (accountRes.ok) {
              const accountData = await accountRes.json();
              setAccount(accountData.account);
            }
          } catch (accountError) {
            console.error("Error fetching account:", accountError);
          }
        }

        await fetchVisits(resolvedParams.id);
      } catch (error) {
        console.error("Error fetching task:", error);
        toast.error(t("tasks.taskNotFoundDescription"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskDetail();
  }, [params, t]);

  const fetchVisits = useCallback(
    async (taskId: string) => {
      try {
        setIsLoadingVisits(true);
        const response = await fetch(`/api/visits?zohoTaskId=${taskId}`);
        if (!response.ok) {
          throw new Error(t("messages.error"));
        }
        const result = await response.json();
        setVisits(result.visits || []);
      } catch (error) {
        console.error("Error fetching visits:", error);
        toast.error(t("messages.error"));
      } finally {
        setIsLoadingVisits(false);
      }
    },
    [t],
  );

  const handleNewVisit = () => {
    setVisitToEdit(null);
    setIsVisitDialogOpen(true);
  };

  const handleEditVisit = (visit: Visit) => {
    setVisitToEdit(visit);
    setIsVisitDialogOpen(true);
  };

  const handleVisitSuccess = () => {
    setVisitToEdit(null);
    setIsVisitDialogOpen(false);
    if (taskId) {
      fetchVisits(taskId);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsVisitDialogOpen(open);
    if (!open) {
      setVisitToEdit(null);
    }
  };

  const handleViewVisit = (visit: Visit) => {
    router.push(`/dashboard/tasks/${taskId}/visits/${visit.id}`);
  };

  const handleDeleteVisit = async () => {
    if (!visitToDelete) return;

    try {
      const response = await fetch(`/api/visits/${visitToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(t("messages.error"));
      }

      toast.success(t("messages.deleted"));
      if (taskId) {
        fetchVisits(taskId);
      }
    } catch (error) {
      console.error("Error deleting visit:", error);
      toast.error(t("messages.error"));
    } finally {
      setVisitToDelete(null);
    }
  };

  const formatDateShortLocal = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString(
        locale === "es" ? "es-ES" : "en-US",
      );
    } catch {
      return "Invalid Date";
    }
  };

  if (isLoading) {
    return <DashboardPageSkeleton />;
  }

  if (!task) {
    return (
      <section className="mx-auto w-full min-h-full px-4">
        <EmptyCard
          icon={<ListTodo />}
          title={t("tasks.taskNotFound")}
          description={t("tasks.taskNotFoundDescription")}
          actions={
            <Button
              onClick={() => router.push("/dashboard/tasks")}
              variant="default"
            >
              <ArrowLeft />
              {t("common.back")}
            </Button>
          }
        />
      </section>
    );
  }

  // --- TAB CONTENT: VISITS ---
  const visitsTabContent = (
    <div className="w-full pt-4 m-0">
      {isLoadingVisits ? (
        <DashboardPageSkeleton />
      ) : visits.length === 0 ? (
        <EmptyCard
          title={t("visits.emptyTitle")}
          description={t("visits.emptyDescription")}
          icon={<FileCheck className="text-muted-foreground" />}
          actions={
            <Button onClick={handleNewVisit} variant="secondary">
              <Plus className="size-4" />
              {t("visits.createVisit")}
            </Button>
          }
        />
      ) : isMobile ? (
        <div className="space-y-3">
          {visits.map((visit) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              onSelect={() => {}}
              isSelected={false}
              onView={handleViewVisit}
              onEdit={handleEditVisit}
              onDelete={(visit) => setVisitToDelete(visit)}
              onCreateVisit={handleNewVisit}
            />
          ))}
        </div>
      ) : (
        <VisitsDataTable
          columns={createColumns({
            onView: handleViewVisit,
            onEdit: handleEditVisit,
            onDelete: (visit) => setVisitToDelete(visit),
            t,
            locale,
          })}
          data={visits}
          isLoading={isLoadingVisits}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          onView={handleViewVisit}
          onEdit={handleEditVisit}
          onDelete={(visit) => setVisitToDelete(visit)}
          onCreateVisit={handleNewVisit}
        />
      )}
    </div>
  );

  // --- TAB CONTENT: DETAILS ---
  const detailsTabContent = (
    <div className="py-4">
      <TaskDetailsCard task={task} />
    </div>
  );

  const tabs = [
    {
      name: t("visits.visitsTab"),
      value: "visits",
      icon: History,
      description: t("visits.visitsTabDescription"),
      content: visitsTabContent,
    },
    {
      name: t("visits.detailsTab"),
      value: "details",
      icon: FileText,
      description: t("visits.detailsTabDescription"),
      content: detailsTabContent,
    },
  ];

  return (
    <section className="mx-auto px-4 space-y-6 w-full h-full">
      {/* HEADER */}
      <header
        className="
            sticky top-0 z-20 
            -mx-4 px-4 pb-2
            bg-background/95 backdrop-blur-md 
            border-b border-border/50
          "
        role="banner"
      >
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <H1>{task.Subject}</H1>

            <div className="flex flex-wrap items-center gap-2">
              <MonoText>
                <Hash className="size-3 inline-block mr-1" />
                {task.id || "N/A"}
              </MonoText>

              {task.Priority && (
                <MonoText>
                  <Flag className="size-3 inline-block mr-1" />
                  {task.Priority}
                </MonoText>
              )}

              {task.Status && (
                <MonoText>
                  <CheckCircle2 className="size-3 inline-block mr-1" />
                  {task.Status}
                </MonoText>
              )}

              {task.Due_Date && (
                <MonoText>
                  <Calendar className="size-3 inline-block mr-1" />
                  {formatDateShortLocal(task.Due_Date)}
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
              <span className="hidden sm:inline">{t("common.back")}</span>
            </Button>

            <Button
              onClick={handleNewVisit}
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">
                {t("visits.createVisit")}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* TABS CONTENT */}
      <AnimatedTabsComponent tabs={tabs} defaultValue="visits" />

      {/* Visit Form Dialog */}
      <VisitFormDialog
        open={isVisitDialogOpen}
        onOpenChange={handleDialogClose}
        customer={
          account
            ? {
                id: account.id,
                zohoAccountId: account.id,
                accountName: account.Account_Name,
                razonSocial: account.Razon_Social || null,
                accountNumber: account.Account_Number || null,
                cif: account.CIF || null,
                codigoCliente: account.C_digo_Cliente || null,
                accountType: account.Account_Type || null,
                industry: account.Industry || null,
                subSector: account.Sub_Sector || null,
                phone: account.Phone || null,
                fax: account.Fax || null,
                email: account.Correo_electr_nico || account.Email || null,
                website: account.Website || null,
                billingStreet: account.Billing_Street || null,
                billingCity: account.Billing_City || null,
                billingState: account.Billing_State || null,
                billingCode: account.Billing_Code || null,
                billingCountry: account.Billing_Country || null,
                shippingStreet: account.Shipping_Street || null,
                shippingCity: account.Shipping_City || null,
                shippingState: account.Shipping_State || null,
                shippingCode: account.Shipping_Code || null,
                shippingCountry: account.Shipping_Country || null,
                latitude: account.dealsingooglemaps__Latitude || null,
                longitude: account.dealsingooglemaps__Longitude || null,
                zohoOwnerId: account.Owner?.id || null,
                zohoOwnerName: account.Owner?.name || null,
                zohoOwnerEmail: account.Owner?.email || null,
                clienteConEquipo: account.Cliente_con_Equipo || false,
                cuentaNacional: account.Cuenta_Nacional || false,
                clienteBooks: account.Cliente_Books || false,
                condicionesEspeciales: account.Condiciones_Especiales || false,
                proyectoAbierto: account.Proyecto_abierto || false,
                revisado: account.Revisado || false,
                localizacionesMultiples:
                  account.Localizaciones_multiples || false,
                createdAt: new Date(),
                updatedAt: new Date(),
              }
            : undefined
        }
        zohoTaskId={taskId}
        onSuccess={handleVisitSuccess}
        existingVisit={visitToEdit || undefined}
      />

      {/* Delete Visit Confirmation Dialog */}
      <AlertDialog
        open={!!visitToDelete}
        onOpenChange={(open) => !open && setVisitToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("visits.deleteVisitModalTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-pretty">
              {t("visits.deleteVisitModalDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVisit}>
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default TaskDetailPage;
