"use client";

import { cn } from "@/lib/utils";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ZohoTask } from "@/interfaces/zoho";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "@/lib/i18n/context";
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
  const { t, locale } = useTranslation();
  const TASK_DETAIL_URL = (taskId: string) =>
    `/dashboard/tasks/${taskId}/details`;

  const getTaskTypeLabel = (value?: string): string => {
    if (!value) return "—";
    const typeMap: Record<string, string> = {
      "Propuesta de Visita": "tasks.types.visitProposal",
      "Visita Comercial": "tasks.types.visitCommercial",
      Demostración: "tasks.types.demonstration",
      Oferta: "tasks.types.offer",
      Cotización: "tasks.types.quote",
      "Oferta / Cotización": "tasks.types.offerQuote",
    };
    return t(typeMap[value] || "tasks.type");
  };

  const getStatusConfig = (status?: string) => {
    const statusMap: Record<
      string,
      {
        key: string;
        variant: "default" | "secondary" | "outline";
        className: string;
        icon: any;
      }
    > = {
      Completada: {
        key: "tasks.statuses.completed",
        variant: "default" as const,
        className:
          "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
        icon: CheckCircle2,
      },
      Completed: {
        key: "tasks.statuses.completed",
        variant: "default" as const,
        className:
          "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
        icon: CheckCircle2,
      },
      "In Progress": {
        key: "tasks.statuses.inProgress",
        variant: "secondary" as const,
        className:
          "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
        icon: Clock,
      },
      "En progreso": {
        key: "tasks.statuses.inProgress",
        variant: "secondary" as const,
        className:
          "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
        icon: Clock,
      },
      "Not Started": {
        key: "tasks.statuses.notStarted",
        variant: "outline" as const,
        className:
          "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
        icon: FileText,
      },
      "No iniciada": {
        key: "tasks.statuses.notStarted",
        variant: "outline" as const,
        className:
          "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
        icon: FileText,
      },
      Deferred: {
        key: "tasks.statuses.deferred",
        variant: "outline" as const,
        className:
          "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
        icon: Clock,
      },
      Diferida: {
        key: "tasks.statuses.deferred",
        variant: "outline" as const,
        className:
          "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
        icon: Clock,
      },
      "Waiting for Input": {
        key: "tasks.statuses.waitingInput",
        variant: "outline" as const,
        className:
          "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
        icon: Clock,
      },
      "Esperando entrada": {
        key: "tasks.statuses.waitingInput",
        variant: "outline" as const,
        className:
          "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
        icon: Clock,
      },
    };

    const config = status ? statusMap[status] : null;

    if (config) {
      return {
        label: t(config.key),
        variant: config.variant,
        className: config.className,
        icon: config.icon,
      };
    }

    return {
      label: status || t("common.status"),
      variant: "outline" as const,
      className: "border-border/50",
      icon: FileText,
    };
  };

  const getPriorityConfig = (priority?: string) => {
    const priorityMap: Record<
      string,
      { key: string; className: string; dotColor: string }
    > = {
      Highest: {
        key: "tasks.priorities.highest",
        className:
          "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
        dotColor: "bg-red-500",
      },
      Alta: {
        key: "tasks.priorities.high",
        className:
          "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
        dotColor: "bg-red-500",
      },
      High: {
        key: "tasks.priorities.high",
        className:
          "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
        dotColor: "bg-red-500",
      },
      Normal: {
        key: "tasks.priorities.normal",
        className:
          "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
        dotColor: "bg-blue-500",
      },
      Low: {
        key: "tasks.priorities.low",
        className:
          "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
        dotColor: "bg-gray-500",
      },
      Baja: {
        key: "tasks.priorities.low",
        className:
          "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
        dotColor: "bg-gray-500",
      },
      Lowest: {
        key: "tasks.priorities.lowest",
        className:
          "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
        dotColor: "bg-gray-500",
      },
    };

    const config = priority ? priorityMap[priority] : null;

    if (config) {
      return {
        label: t(config.key),
        className: config.className,
        dotColor: config.dotColor,
      };
    }

    return {
      label: priority || t("tasks.priorities.normal"),
      className: "border-border/50",
      dotColor: "bg-gray-400",
    };
  };

  const statusConfig = getStatusConfig(task.Status);
  const priorityConfig = getPriorityConfig(task.Priority);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const localeStr = locale === "es" ? "es-ES" : "en-US";
      return date.toLocaleDateString(localeStr, {
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
      const dateLocale = locale === "es" ? es : undefined;
      return formatDistanceToNow(date, { addSuffix: true, locale: dateLocale });
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
            <Badge variant="info">{getTaskTypeLabel(task.Tipo_de_Tarea)}</Badge>
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
              {t("tasks.overdue")}
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
                  {t("tasks.dueDate")}
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
                  {t("tasks.assignedTo")}
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
                    {t("tasks.relatedTo")}
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
                    {t("tasks.contact")}
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
                {t("tasks.modified")}{" "}
                {formatRelativeTime(task.Modified_Time) ||
                  t("tasks.modifiedRecently")}
              </div>
            )}
            {task.Closed_Time && (
              <div className="flex items-center text-xs text-muted-foreground">
                {t("tasks.completed")}{" "}
                {formatRelativeTime(task.Closed_Time) || t("tasks.completed")}
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
              {t("tasks.createVisit")}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
