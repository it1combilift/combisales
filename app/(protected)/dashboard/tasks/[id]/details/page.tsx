"use client";

import { toast } from "sonner";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { ZohoTask } from "@/interfaces/zoho";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/empty-card";
import { CopyButton } from "@/components/copy-button";
import { Separator } from "@/components/ui/separator";
import { H1, Paragraph } from "@/components/fonts/fonts";
import { DashboardPageSkeleton } from "@/components/dashboard-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Visit, FORM_TYPE_LABELS, VisitFormType } from "@/interfaces/visits";
import VisitFormDialog from "@/components/visits/visit-form-dialog";
import { VisitsDataTable } from "@/components/visits/data-table";
import { VisitCard } from "@/components/visits/visit-card";
import { createColumns } from "@/components/visits/columns";
import { ColumnFiltersState } from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Building2,
  Flag,
  CheckCircle2,
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
import { Spinner } from "@/components/ui/spinner";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

const TaskDetailPage = ({ params }: TaskDetailPageProps) => {
  const [task, setTask] = useState<ZohoTask | null>(null);
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

  useEffect(() => {
    const fetchTaskDetail = async () => {
      try {
        const resolvedParams = await params;
        setTaskId(resolvedParams.id);

        const response = await fetch(`/api/zoho/tasks/${resolvedParams.id}`);

        if (!response.ok) {
          throw new Error("Error al obtener la tarea");
        }

        const result = await response.json();
        setTask(result.task);

        // Fetch visits for this task
        await fetchVisits(resolvedParams.id);
      } catch (error) {
        console.error("Error fetching task:", error);
        toast.error("Error al cargar los detalles de la tarea");
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
        throw new Error("Error al obtener las visitas");
      }
      const result = await response.json();
      setVisits(result.visits || []);
    } catch (error) {
      console.error("Error fetching visits:", error);
      toast.error("Error al cargar las visitas");
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
        throw new Error("Error al eliminar la visita");
      }

      toast.success("Visita eliminada exitosamente");
      if (taskId) {
        fetchVisits(taskId);
      }
    } catch (error) {
      console.error("Error deleting visit:", error);
      toast.error("Error al eliminar la visita");
    } finally {
      setVisitToDelete(null);
    }
  };

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case "Completada":
      case "Completed":
        return {
          label: "Completada",
          className:
            "bg-green-500/10 text-green-700 dark:text-green-400 w-fit h-7",
        };
      case "In Progress":
      case "En progreso":
        return {
          label: "En progreso",
          className:
            "bg-blue-500/10 text-blue-700 dark:text-blue-400 w-fit h-7",
        };
      case "Not Started":
      case "No iniciada":
        return {
          label: "No iniciada",
          className:
            "bg-gray-500/10 text-gray-700 dark:text-gray-400 w-fit h-7",
        };
      case "Deferred":
      case "Diferida":
        return {
          label: "Diferida",
          className:
            "bg-orange-500/10 text-orange-700 dark:text-orange-400 w-fit h-7",
        };
      case "Waiting for Input":
      case "Esperando entrada":
        return {
          label: "Esperando entrada",
          className:
            "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 w-fit h-7",
        };
      default:
        return {
          label: status || "Sin estado",
          className: "w-fit h-7",
        };
    }
  };

  const getPriorityConfig = (priority?: string) => {
    switch (priority) {
      case "Highest":
      case "Alta":
      case "High":
        return {
          label: "Alta",
          className: "bg-red-500/10 text-red-700 dark:text-red-400 w-fit h-7",
        };
      case "Normal":
        return {
          label: "Normal",
          className:
            "bg-blue-500/10 text-blue-700 dark:text-blue-400 w-fit h-7",
        };
      case "Low":
      case "Baja":
      case "Lowest":
        return {
          label: "Baja",
          className:
            "bg-gray-500/10 text-gray-700 dark:text-gray-400 w-fit h-7",
        };
      default:
        return {
          label: priority || "Normal",
          className: "w-fit h-7",
        };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No especificada";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: es });
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
          icon={<ListTodo className="size-16 text-muted-foreground" />}
          title="Tarea no encontrada"
          description="La tarea que buscas no existe o no tienes permisos para verla."
          actions={
            <Button
              onClick={() => router.push("/dashboard/tasks")}
              variant="default"
            >
              <ArrowLeft className="size-4" />
              Volver a tareas
            </Button>
          }
        />
      </section>
    );
  }

  const statusConfig = getStatusConfig(task.Status);
  const priorityConfig = getPriorityConfig(task.Priority);

  return (
    <section className="space-y-6 px-3 sm:px-4 w-full">
      {/* Header con información clave */}
      <header className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <div className="min-w-0">
                <H1>{task.Subject}</H1>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-start gap-2">
              <Badge className={statusConfig.className} variant="outline">
                <CheckCircle2 className="size-3" />
                {statusConfig.label}
              </Badge>

              <Badge className={priorityConfig.className} variant="outline">
                <Flag className="size-3" />
                {priorityConfig.label}
              </Badge>

              {task.Due_Date && (
                <Badge variant="outline">
                  <Calendar className="size-3 mr-1" />
                  Vence: {new Date(task.Due_Date).toLocaleDateString("es-ES")}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="size-4" />
              <span className="text-muted-foreground hidden sm:inline">
                Volver
              </span>
            </Button>

            <Button onClick={handleNewVisit} size="sm">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Nueva visita</span>
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
                      Responsable
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
                      {task.What_Id.module || "Relacionado"}
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
                      Contacto
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
                      Última actualización
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

      {/* PRIORIDAD: Visitas documentadas - Sección principal */}
      <Card className="shadow-none p-0 w-full border-none">
        <CardHeader className="p-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileCheck className="size-4 text-primary" />
                Visitas documentadas
                {visits.length > 0 && (
                  <Badge variant="secondary">{visits.length}</Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground text-pretty">
                Registro de todas las visitas realizadas para esta tarea
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingVisits ? (
            <div className="flex flex-row items-center justify-center gap-2">
              <Spinner variant="bars" className="size-4" />
              <span className="text-sm text-muted-foreground animate-pulse">
                Cargando visitas...
              </span>
            </div>
          ) : visits.length === 0 ? (
            <EmptyCard
              title="Sin visitas registradas"
              description="Aún no se han documentado visitas para esta tarea. Haz clic en 'Nueva visita' para comenzar a documentar."
              icon={<FileCheck />}
              actions={
                <Button onClick={handleNewVisit} size="sm">
                  <Plus className="size-4" />
                  Crear primera visita
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
                />
              ))}
            </div>
          ) : (
            <VisitsDataTable
              columns={createColumns({
                onView: handleViewVisit,
                onEdit: handleEditVisit,
                onDelete: (visit) => setVisitToDelete(visit),
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
                  Descripción
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
                  Recordatorio programado
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
                    Activo
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
                Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.Created_Time && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Creada
                  </Label>
                  <p className="text-sm font-medium">
                    {formatDate(task.Created_Time)}
                  </p>
                  {task.Created_By?.name && (
                    <p className="text-xs text-muted-foreground">
                      por {task.Created_By.name}
                    </p>
                  )}
                </div>
              )}

              {task.Modified_Time && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Modificada
                    </Label>
                    <p className="text-sm font-medium">
                      {formatDate(task.Modified_Time)}
                    </p>
                    {task.Modified_By?.name && (
                      <p className="text-xs text-muted-foreground">
                        por {task.Modified_By.name}
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
                      Completada
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
                Información del sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">
                  ID de tarea
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
                    Ubicación
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
            <AlertDialogTitle>¿Eliminar visita?</AlertDialogTitle>
            <AlertDialogDescription className="text-pretty">
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              visita y todos sus datos asociados.
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
    </section>
  );
};

export default TaskDetailPage;
