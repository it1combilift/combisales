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
import { ZohoAccount, ZohoDeal, ZohoTask } from "@/interfaces/zoho";
import { VisitCard } from "@/components/visits/visit-card";
import { createColumns } from "@/components/visits/columns";
import AnimatedTabsComponent from "@/components/accounts/tabs";
import { VisitsDataTable } from "@/components/visits/data-table";
import VisitFormDialog from "@/components/visits/visit-form-dialog";
import { DashboardPageSkeleton } from "@/components/dashboard-skeleton";
import { TaskDetailsCard } from "@/components/tasks/task-details-card";
import { ClientContext } from "@/interfaces/client-context";
import {
  accountToClientContext,
  dealToClientContext,
  clientContextToCustomer,
  getTaskSourceModule,
  isModuleSupported,
  hasRelatedEntity,
  logClientContextResolution,
} from "@/lib/client-context";

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

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

const TaskDetailPage = ({ params }: TaskDetailPageProps) => {
  const [task, setTask] = useState<ZohoTask | null>(null);
  const [clientContext, setClientContext] = useState<ClientContext | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [taskId, setTaskId] = useState<string>("");
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoadingVisits, setIsLoadingVisits] = useState(false);
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [visitToEdit, setVisitToEdit] = useState<Visit | null>(null);
  const [visitToDelete, setVisitToDelete] = useState<Visit | null>(null);
  const router = useRouter();
  const isMobile = useIsMobile();
  const { t, locale } = useI18n();

  /**
   * Fetch client data based on $se_module
   * Supports: Accounts, Deals
   * Future: Leads (not yet implemented)
   */
  const fetchClientContext = useCallback(
    async (taskData: ZohoTask): Promise<ClientContext | null> => {
      // Check if task has a related entity
      if (!hasRelatedEntity(taskData)) {
        logClientContextResolution(
          taskData.id,
          null,
          false,
          "No What_Id present",
        );
        return null;
      }

      const sourceModule = getTaskSourceModule(taskData);
      const whatId = taskData.What_Id!.id;

      // Check if module is supported
      if (!isModuleSupported(sourceModule)) {
        logClientContextResolution(
          taskData.id,
          sourceModule,
          false,
          `Module not supported yet: ${sourceModule}`,
        );
        return null;
      }

      try {
        if (sourceModule === "Accounts") {
          // Direct Account fetch
          const accountRes = await fetch(`/api/zoho/accounts/${whatId}`);
          if (accountRes.ok) {
            const accountData = await accountRes.json();
            const context = accountToClientContext(accountData.account);
            logClientContextResolution(
              taskData.id,
              sourceModule,
              true,
              `Account: ${context.name}`,
            );
            return context;
          }
        } else if (sourceModule === "Deals") {
          // Fetch Deal first
          const dealRes = await fetch(`/api/zoho/projects/${whatId}`);
          if (dealRes.ok) {
            const dealData = await dealRes.json();
            const deal: ZohoDeal = dealData.project;

            // Check if Deal has linked Account
            if (deal.Account_Name?.id) {
              // Fetch the linked Account for complete data
              try {
                const accountRes = await fetch(
                  `/api/zoho/accounts/${deal.Account_Name.id}`,
                );
                if (accountRes.ok) {
                  const accountData = await accountRes.json();
                  const context = dealToClientContext(
                    deal,
                    accountData.account,
                  );
                  logClientContextResolution(
                    taskData.id,
                    sourceModule,
                    true,
                    `Deal with Account: ${context.name} (Deal: ${deal.Deal_Name})`,
                  );
                  return context;
                }
              } catch (accountError) {
                console.warn(
                  "Could not fetch linked account from Deal, using Deal data only",
                );
              }
            }

            // Deal without linked Account or Account fetch failed
            const context = dealToClientContext(deal, null);
            logClientContextResolution(
              taskData.id,
              sourceModule,
              true,
              `Deal only: ${context.name}`,
            );
            return context;
          }
        }

        logClientContextResolution(
          taskData.id,
          sourceModule,
          false,
          "Fetch failed",
        );
        return null;
      } catch (error) {
        console.error(
          `Error fetching client context for module ${sourceModule}:`,
          error,
        );
        logClientContextResolution(
          taskData.id,
          sourceModule,
          false,
          `Error: ${error}`,
        );
        return null;
      }
    },
    [],
  );

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

        // Fetch client context based on $se_module
        if (result.task?.What_Id?.id) {
          const context = await fetchClientContext(result.task);
          setClientContext(context);
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
  }, [params, t, fetchClientContext]);

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
          clientContext ? clientContextToCustomer(clientContext) : undefined
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
