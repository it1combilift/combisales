"use client";

import { cn } from "@/lib/utils";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ZohoTask } from "@/interfaces/zoho";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  Calendar,
  Clock,
  User,
  Building2,
  Flag,
  CheckCircle2,
  FileText,
  Timer,
  Plus,
} from "lucide-react";

export const TaskCard = ({
  task,
  onCreateVisit,
}: {
  task: ZohoTask;
  onSelect: (selected: boolean) => void;
  isSelected: boolean;
  onCreateVisit?: () => void;
}) => {
  const router = useRouter();
  const TASK_DETAIL_URL = (taskId: string) =>
    `/dashboard/tasks/${taskId}/details`;

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case "Completada":
      case "Completed":
        return {
          label: "Completada",
          variant: "default" as const,
          className:
            "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
          icon: CheckCircle2,
        };
      case "In Progress":
      case "En progreso":
        return {
          label: "En progreso",
          variant: "secondary" as const,
          className:
            "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
          icon: Clock,
        };
      case "Not Started":
      case "No iniciada":
        return {
          label: "No iniciada",
          variant: "outline" as const,
          className:
            "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
          icon: FileText,
        };
      case "Deferred":
      case "Diferida":
        return {
          label: "Diferida",
          variant: "outline" as const,
          className:
            "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
          icon: Clock,
        };
      case "Waiting for Input":
      case "Esperando entrada":
        return {
          label: "Esperando entrada",
          variant: "outline" as const,
          className:
            "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
          icon: Clock,
        };
      default:
        return {
          label: status || "Sin estado",
          variant: "outline" as const,
          className: "border-border/50",
          icon: FileText,
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
          className:
            "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
          dotColor: "bg-red-500",
        };
      case "Normal":
        return {
          label: "Normal",
          className:
            "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
          dotColor: "bg-blue-500",
        };
      case "Low":
      case "Baja":
      case "Lowest":
        return {
          label: "Baja",
          className:
            "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
          dotColor: "bg-gray-500",
        };
      default:
        return {
          label: priority || "Normal",
          className: "border-border/50",
          dotColor: "bg-gray-400",
        };
    }
  };

  const statusConfig = getStatusConfig(task.Status);
  const priorityConfig = getPriorityConfig(task.Priority);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return null;
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

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate || task.Status === "Completed") return false;
    try {
      const due = new Date(dueDate);
      return due < new Date();
    } catch {
      return false;
    }
  };

  const overdue = isOverdue(task.Due_Date);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:shadow-lg active:scale-[0.99]",
        "border-l-4 cursor-pointer",
        overdue
          ? "border-l-red-500 bg-red-500/5"
          : "border-l-primary/20 hover:border-l-primary/40"
      )}
      onClick={() => router.push(TASK_DETAIL_URL(task.id))}
    >
      <div className="px-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="flex items-start gap-3 flex-1 min-w-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-2 min-w-0">
                <h3 className="font-semibold text-base leading-tight text-foreground line-clamp-2 truncate text-pretty">
                  {task.Subject}
                </h3>
              </div>
              {task.Description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed text-balance">
                  {task.Description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2">
          {task.Tipo_de_Tarea && (
            <Badge variant="info">{task.Tipo_de_Tarea}</Badge>
          )}

          <Badge
            className={cn("text-xs font-medium", statusConfig.className)}
            variant="outline"
          >
            <StatusIcon className="size-3" />
            {statusConfig.label}
          </Badge>
          <Badge
            className={cn("text-xs font-medium", priorityConfig.className)}
            variant="outline"
          >
            <Flag className="size-3" />
            {priorityConfig.label}
          </Badge>
          {overdue && (
            <Badge
              className="text-xs font-medium bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
              variant="outline"
            >
              <Timer className="size-3" />
              Vencida
            </Badge>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {task.Due_Date && (
            <div className="flex items-center gap-2.5 text-sm">
              <div
                className={cn(
                  "flex items-center justify-center size-8 rounded-lg shrink-0",
                  overdue ? "bg-red-500/10" : "bg-muted"
                )}
              >
                <Calendar
                  className={cn(
                    "size-4",
                    overdue
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                  )}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted-foreground font-medium">
                  Vencimiento
                </span>
                <span
                  className={cn(
                    "text-xs md:text-sm font-medium truncate",
                    overdue
                      ? "text-red-600 dark:text-red-400"
                      : "text-foreground"
                  )}
                >
                  {formatDate(task.Due_Date)}
                </span>
              </div>
            </div>
          )}

          {task.Owner?.name && (
            <div className="flex items-center gap-2.5 text-sm">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {getInitials(task.Owner.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted-foreground font-medium">
                  Responsable
                </span>
                <span className="text-xs md:text-sm font-medium text-foreground truncate">
                  {task.Owner.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Related Info */}
        {(task.What_Id?.name || task.Who_Id?.name) && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            {task.What_Id?.name && (
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center justify-center bg-muted size-8 rounded-lg text-muted-foreground shrink-0 p">
                  <Building2 className="size-3" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs text-muted-foreground">
                    Relacionado con
                  </span>
                  <span className="font-medium text-foreground truncate text-xs md:text-sm">
                    {task.What_Id.name}
                  </span>
                </div>
              </div>
            )}

            {task.Who_Id?.name && (
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center justify-center bg-muted size-8 rounded-lg text-muted-foreground shrink-0 p">
                  <User className="size-3" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs text-muted-foreground">
                    Contacto
                  </span>
                  <span className="font-medium text-foreground truncate">
                    {task.Who_Id.name}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-border/50 space-y-3">
          <div className="flex flex-col items-start justify-center">
            {task.Modified_Time && (
              <div className="flex items-center text-xs text-muted-foreground">
                Modificada{" "}
                {formatRelativeTime(task.Modified_Time) ||
                  "Modificada hace poco"}
              </div>
            )}
            {task.Closed_Time && (
              <div className="flex items-center text-xs text-muted-foreground">
                Completada{" "}
                {formatRelativeTime(task.Closed_Time) || "Completada"}
              </div>
            )}
          </div>

          {onCreateVisit && (
            <Button
              variant="default"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onCreateVisit();
              }}
            >
              <Plus className="size-4" />
              Crear visita
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
