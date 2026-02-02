"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { ZohoTask } from "@/interfaces/zoho";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import {
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Flag,
  Hash,
  ListTodo,
  MapPin,
  User,
  Users,
} from "lucide-react";

// ==================== TYPES ====================
interface TaskDetailsCardProps {
  task: ZohoTask;
  className?: string;
}

interface DetailItemProps {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  className?: string;
  copyable?: boolean;
  isLink?: boolean;
  href?: string;
}

interface DetailSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}

// ==================== HELPER COMPONENTS ====================

function DetailItem({
  icon: Icon,
  label,
  value,
  className,
  copyable = false,
  isLink = false,
  href,
}: DetailItemProps) {
  if (!value && value !== 0) return null;

  const handleCopy = () => {
    if (typeof value === "string") {
      navigator.clipboard.writeText(value);
      toast.success("Copiado al portapapeles");
    }
  };

  const content =
    isLink && href ? (
      <a
        href={href.startsWith("http") ? href : `https://${href}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline inline-flex items-center gap-1"
      >
        {value}
        <ExternalLink className="size-3" />
      </a>
    ) : (
      <span className="text-foreground">{value}</span>
    );

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
        {Icon && <Icon className="size-3" />}
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        {content}
        {copyable && typeof value === "string" && (
          <Button
            variant="ghost"
            size="icon"
            className="size-5 opacity-50 hover:opacity-100"
            onClick={handleCopy}
          >
            <Copy className="size-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

function DetailSection({
  title,
  icon: Icon,
  children,
  className,
}: DetailSectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
        <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="size-3.5 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
}

function formatDate(
  dateString: string | undefined,
  locale: any,
): string | null {
  if (!dateString) return null;
  try {
    const formatStr =
      locale.code === "es" ? "d 'de' MMMM, yyyy" : "MMMM d, yyyy";
    return format(new Date(dateString), formatStr, { locale });
  } catch {
    return null;
  }
}

function formatDateTime(
  dateString: string | undefined,
  locale: any,
): string | null {
  if (!dateString) return null;
  try {
    return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale });
  } catch {
    return null;
  }
}

// ==================== MAIN COMPONENT ====================

export function TaskDetailsCard({ task, className }: TaskDetailsCardProps) {
  const { t, locale } = useI18n();
  const dateLocale = locale === "es" ? es : enUS;

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "Highest":
      case "Alta":
      case "High":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      case "Normal":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "Low":
      case "Baja":
      case "Lowest":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
      default:
        return "bg-muted text-muted-foreground border-transparent";
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* ==================== GENERAL INFORMATION ==================== */}
      <DetailSection title={t("visits.detailsTab")} icon={ListTodo}>
        <DetailItem
          icon={ListTodo}
          label={t("tasks.subject")}
          value={task.Subject}
          className="lg:col-span-2"
        />
        <DetailItem
          icon={Flag}
          label={t("tasks.priority")}
          value={
            <Badge
              variant="outline"
              className={cn("px-2 py-0.5", getPriorityColor(task.Priority))}
            >
              {task.Priority || t("tasks.priorities.normal")}
            </Badge>
          }
        />
        <DetailItem
          icon={Calendar}
          label={t("tasks.dueDate")}
          value={formatDate(task.Due_Date, dateLocale)}
        />
        <DetailItem
          icon={Hash}
          label={t("visits.taskIdSection")}
          value={task.id}
          copyable
        />
        <DetailItem icon={Flag} label={t("tasks.status")} value={task.Status} />
        {task.Ubicaci_n && (
          <DetailItem
            icon={MapPin}
            label={t("visits.locationSection")}
            value={task.Ubicaci_n}
          />
        )}
      </DetailSection>

      <Separator />

      {/* ==================== RELATIONS ==================== */}
      <DetailSection title={t("tasks.relatedTo")} icon={Users}>
        {task.What_Id?.name && (
          <DetailItem
            icon={Users}
            label={t("tasks.relatedTo")}
            value={task.What_Id.name}
          />
        )}
        {task.Who_Id?.name && (
          <DetailItem
            icon={User}
            label={t("tasks.contact")}
            value={task.Who_Id.name}
          />
        )}
      </DetailSection>

      <Separator />

      {/* ==================== SYSTEM INFO ==================== */}
      <DetailSection title={t("visits.systemInfoSection")} icon={Clock}>
        {task.Created_By && (
          <DetailItem
            icon={User}
            label={t("visits.createdBySection")}
            value={task.Created_By.name}
          />
        )}
        <DetailItem
          icon={Calendar}
          label={t("visits.createdSection")}
          value={formatDateTime(task.Created_Time, dateLocale)}
        />

        {task.Modified_By && (
          <DetailItem
            icon={User}
            label={t("visits.modifiedBySection")}
            value={task.Modified_By.name}
          />
        )}
        <DetailItem
          icon={Clock}
          label={t("visits.modifiedSection")}
          value={formatDateTime(task.Modified_Time, dateLocale)}
        />

        {task.Owner && (
          <DetailItem
            icon={User}
            label={t("clients.owner")}
            value={task.Owner.name}
          />
        )}
      </DetailSection>

      {/* ==================== DESCRIPTION ==================== */}
      {task.Description && (
        <>
          <Separator />
          <DetailSection title={t("visits.descriptionSection")} icon={FileText}>
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                {task.Description}
              </p>
            </div>
          </DetailSection>
        </>
      )}
    </div>
  );
}

export default TaskDetailsCard;
