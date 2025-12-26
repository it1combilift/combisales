"use client";

import { toast } from "sonner";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
} from "lucide-react";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

const TaskDetailPage = ({ params }: TaskDetailPageProps) => {
  const [task, setTask] = useState<ZohoTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [taskId, setTaskId] = useState<string>("");
  const router = useRouter();

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
      } catch (error) {
        console.error("Error fetching task:", error);
        toast.error("Error al cargar los detalles de la tarea");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskDetail();
  }, [params]);

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
              <ArrowLeft className="size-4 mr-2" />
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
    <section className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 pb-8">
      {/* Header */}
      <header className="flex flex-row justify-between items-center gap-2 sm:gap-3 flex-wrap">
        <div className="min-w-0 flex-1" title={task.Subject}>
          <H1>{task.Subject}</H1>
          <Paragraph className="text-muted-foreground">
            Detalles completos de la tarea
          </Paragraph>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-fit h-7 text-sm flex items-center gap-1"
          >
            <ArrowLeft className="size-3" />
            Volver
          </Button>

          <Badge className={statusConfig.className} variant="outline">
            <CheckCircle2 className="size-3" />
            {statusConfig.label}
          </Badge>
          <Badge className={priorityConfig.className} variant="outline">
            <Flag className="size-3" />
            {priorityConfig.label}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-3">
          {/* Description */}
          {task.Description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="size-4" />
                  Descripción
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {task.Description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Related Records */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="size-4" />
                Registros relacionados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {task.What_Id?.name && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Relacionado con</Label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">
                      {task.What_Id.name}
                    </span>
                    {task.What_Id.module && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        {task.What_Id.module}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {task.Who_Id?.name && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Contacto</Label>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <User className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {task.Who_Id.name}
                    </span>
                    {task.Who_Id.module && (
                      <Badge variant="outline" className="ml-auto text-xs">
                        {task.Who_Id.module}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {!task.What_Id?.name && !task.Who_Id?.name && (
                <p className="text-sm text-muted-foreground">
                  No hay registros relacionados
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Metadata */}
        <div className="space-y-6">
          {/* Task Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Información de la tarea
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Due Date */}
              {task.Due_Date && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      Fecha de vencimiento
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(task.Due_Date)}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              {/* Owner */}
              {task.Owner && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <User className="size-4 text-muted-foreground" />
                      Responsable
                    </Label>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{task.Owner.name}</p>
                      {task.Owner.email && (
                        <p className="text-xs text-muted-foreground">
                          {task.Owner.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Reminder */}
              {task.Remind_At && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" />
                      Recordatorio
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(task.Remind_At)}
                    </p>
                  </div>
                  <Separator />
                </>
              )}
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Información del sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Created */}
              {task.Created_Time && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Creada</Label>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(task.Created_Time)}
                      </p>
                      {task.Created_By?.name && (
                        <p className="text-xs text-muted-foreground">
                          por {task.Created_By.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Modified */}
              {task.Modified_Time && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Última modificación
                    </Label>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(task.Modified_Time)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(task.Modified_Time)}
                      </p>
                      {task.Modified_By?.name && (
                        <p className="text-xs text-muted-foreground">
                          por {task.Modified_By.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Closed */}
              {task.Closed_Time && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Completada</Label>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      {formatDate(task.Closed_Time)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(task.Closed_Time)}
                    </p>
                  </div>
                </div>
              )}

              {/* Task ID */}
              <div className="pt-2 border-t">
                <Label className="text-sm font-medium">ID de tarea</Label>
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  #{task.id}
                </p>
                <CopyButton
                  content={task.id}
                  className="mt-2"
                  variant="outline"
                  title="Copiar ID de tarea"
                  size="icon"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default TaskDetailPage;
