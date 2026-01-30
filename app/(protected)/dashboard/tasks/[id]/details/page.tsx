"use client";

import { toast } from "sonner";
import { es } from "date-fns/locale";
import { useI18n } from "@/lib/i18n/context";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { H1 } from "@/components/fonts/fonts";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyCard } from "@/components/empty-card";
import { CopyButton } from "@/components/copy-button";
import { Customer, Visit } from "@/interfaces/visits";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect, useCallback } from "react";
import { ZohoAccount, ZohoTask } from "@/interfaces/zoho";
import { ColumnFiltersState } from "@tanstack/react-table";
import { VisitCard } from "@/components/visits/visit-card";
import { createColumns } from "@/components/visits/columns";
import { VisitsDataTable } from "@/components/visits/data-table";
import VisitFormDialog from "@/components/visits/visit-form-dialog";
import { DashboardPageSkeleton } from "@/components/dashboard-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Building2,
  Flag,
  FileText,
  ListTodo,
  Plus,
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
        console.log(resolvedParams.id);
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
  }, [params]);

  const fetchVisits = useCallback(async (taskId: string) => {
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
  }, []);

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

  const getPriorityConfig = (priority?: string) => {
    const PRIORITY_KEYS: Record<string, string> = {
      Highest: "tasks.priorities.highest",
      High: "tasks.priorities.high",
      Alta: "tasks.priorities.high",
      Normal: "tasks.priorities.normal",
      Low: "tasks.priorities.low",
      Baja: "tasks.priorities.low",
      Lowest: "tasks.priorities.lowest",
    };

    switch (priority) {
      case "Highest":
      case "Alta":
      case "High":
        return {
          label: t(PRIORITY_KEYS[priority]),
          className: "bg-red-500/10 text-red-700 dark:text-red-400 w-fit h-7",
        };
      case "Normal":
        return {
          label: t(PRIORITY_KEYS[priority]),
          className:
            "bg-blue-500/10 text-blue-700 dark:text-blue-400 w-fit h-7",
        };
      case "Low":
      case "Baja":
      case "Lowest":
        return {
          label: t(PRIORITY_KEYS[priority]),
          className:
            "bg-gray-500/10 text-gray-700 dark:text-gray-400 w-fit h-7",
        };
      default:
        return {
          label: priority || t("tasks.priorities.normal"),
          className: "w-fit h-7",
        };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("tasks.notSpecified");
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return t("tasks.invalidDate");
    }
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: locale === "es" ? es : undefined,
      });
    } catch {
      return null;
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

  return (
    <section className="space-y-6 px-3 sm:px-4 w-full">
      {/* Header information */}
      <header className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <div className="min-w-0">
                <H1>{task.Subject}</H1>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-start gap-2">
              <Badge
                className={getPriorityConfig(task.Priority).className}
                variant="outline"
              >
                <Flag className="size-3" />
                {getPriorityConfig(task.Priority).label}
              </Badge>

              {task.Due_Date && (
                <Badge variant="outline">
                  <Calendar className="size-3" />
                  {new Date(task.Due_Date).toLocaleDateString(
                    locale === "es" ? "es-ES" : "en-US",
                  )}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="size-4" />
              <span className="text-muted-foreground hidden sm:inline">
                {t("common.back")}
              </span>
            </Button>

            <Button onClick={handleNewVisit} size="sm">
              <Plus className="size-4" />
              <span className="hidden sm:inline">
                {t("visits.createVisit")}
              </span>
            </Button>
          </div>
        </div>

        {/* Task summary card - información esencial */}
        <Card className="border-l-4 border-l-primary hidden md:block">
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {/* Responsable */}
              {task.Owner && (
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 shrink-0">
                    <User className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Label className="text-xs text-muted-foreground">
                      {t("tasks.assignedTo")}
                    </Label>
                    <p className="text-sm font-medium truncate">
                      {task.Owner.name}
                    </p>
                    {task.Owner.email && (
                      <p className="text-xs text-muted-foreground truncate">
                        {task.Owner.email}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Cuenta relacionada */}
              {task.What_Id?.name && (
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center size-8 rounded-lg bg-blue-500/10 shrink-0">
                    <Building2 className="size-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Label className="text-xs text-muted-foreground">
                      {t("tasks.relatedTo")}
                    </Label>
                    <p className="text-sm font-medium truncate">
                      {task.What_Id.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Contacto */}
              {task.Who_Id?.name && (
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center size-8 rounded-lg bg-violet-500/10 shrink-0">
                    <User className="size-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Label className="text-xs text-muted-foreground">
                      {t("tasks.contact")}
                    </Label>
                    <p className="text-sm font-medium truncate">
                      {task.Who_Id.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Última modificación */}
              {task.Modified_Time && (
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center size-8 rounded-lg bg-amber-500/10 shrink-0">
                    <Clock className="size-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Label className="text-xs text-muted-foreground">
                      {t("visits.modifiedSection")}
                    </Label>
                    <p className="text-sm font-medium">
                      {formatRelativeTime(task.Modified_Time)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </header>

      <Card className="shadow-none p-0 w-full border-none">
        <CardHeader className="p-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileCheck className="size-4 text-primary" />
                {t("visits.registeredVisitsTitleSection")}
                {visits.length > 0 && (
                  <Badge variant="secondary">{visits.length}</Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground text-pretty">
                {t("visits.registeredVisitsDescriptionSection")}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingVisits ? (
            <div className="flex flex-row items-center justify-center gap-2">
              <Spinner variant="bars" className="size-4" />
              <span className="text-sm text-muted-foreground animate-pulse">
                {t("common.loading")}
              </span>
            </div>
          ) : visits.length === 0 ? (
            <EmptyCard
              title={t("visits.emptyTitle")}
              description={t("visits.emptyDescription")}
              icon={<FileCheck />}
              actions={
                <Button onClick={handleNewVisit} size="sm">
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
        </CardContent>
      </Card>

      {/* Información detallada de la tarea */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal - Descripción y detalles */}
        <div className="lg:col-span-2 space-y-6">
          {/* Descripción */}
          {task.Description && (
            <Card className="pt-0">
              <CardHeader className="bg-muted pt-3 rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                  <FileText className="size-4" />
                  {t("visits.descriptionSection")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {task.Description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recordatorio si existe */}
          {task.Remind_At && (
            <Card className="border-l-4 border-l-amber-500 pt-0">
              <CardHeader className="bg-muted pt-3 rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                  <Clock className="size-4 text-amber-600 dark:text-amber-400" />
                  {t("visits.reminderSection")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {formatDate(task.Remind_At)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(task.Remind_At)}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-amber-500/10">
                    {t("tasks.active")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna lateral - Metadatos e información del sistema */}
        <div className="space-y-3">
          {/* Fechas importantes */}
          <Card className="pt-0">
            <CardHeader className="bg-muted pt-3 rounded-t-xl">
              <CardTitle className="text-sm md:text-base flex items-center gap-2">
                <Calendar className="size-4" />
                {t("visits.datesSection")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.Created_Time && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {t("visits.createdSection")}
                  </Label>
                  <p className="text-sm font-medium">
                    {formatDate(task.Created_Time)}
                  </p>
                  {task.Created_By?.name && (
                    <p className="text-xs text-muted-foreground">
                      {t("visits.createdBySection")} {task.Created_By.name}
                    </p>
                  )}
                </div>
              )}

              {task.Modified_Time && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      {t("visits.modifiedSection")}
                    </Label>
                    <p className="text-sm font-medium">
                      {formatDate(task.Modified_Time)}
                    </p>
                    {task.Modified_By?.name && (
                      <p className="text-xs text-muted-foreground">
                        {t("visits.modifiedBySection")} {task.Modified_By.name}
                      </p>
                    )}
                  </div>
                </>
              )}

              {task.Closed_Time && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      {t("tasks.completedSection")}
                    </Label>
                    <p className="text-sm font-medium">
                      {formatDate(task.Closed_Time)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(task.Closed_Time)}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* ID y metadatos del sistema */}
          <Card className="pt-0">
            <CardHeader className="bg-muted pt-3 rounded-t-xl">
              <CardTitle className="text-sm md:text-base flex items-center gap-2">
                <ListTodo className="size-4" />
                {t("visits.systemInfoSection")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">
                  {t("visits.taskIdSection")}
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded flex-1">
                    {task.id}
                  </code>
                  <CopyButton
                    content={task.id}
                    variant="outline"
                    size="icon"
                    className="size-8"
                  />
                </div>
              </div>

              {task.Ubicaci_n && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    {t("visits.locationSection")}
                  </Label>
                  <p className="text-sm font-medium mt-1">{task.Ubicaci_n}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

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
