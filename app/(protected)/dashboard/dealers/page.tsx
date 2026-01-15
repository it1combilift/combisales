"use client";

import axios from "axios";
import { toast } from "sonner";
import { Role } from "@prisma/client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Visit } from "@/interfaces/visits";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmptyCard } from "@/components/empty-card";
import { H1, Paragraph } from "@/components/fonts/fonts";
import { createColumns } from "@/components/visits/columns";
import { VisitsDataTable } from "@/components/visits/data-table";
import { VisitCard } from "@/components/visits/visit-card";
import { DashboardPageSkeleton } from "@/components/dashboard-skeleton";
import { useI18n } from "@/lib/i18n/context";
import DealerVisitFormDialog from "@/components/dealers/dealer-visit-form-dialog";

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

import { Plus, RefreshCw, ClipboardList } from "lucide-react";

const DealersPage = () => {
  const { t, locale } = useI18n();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { data: session, status: sessionStatus } = useSession();

  // State
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState<Visit | null>(null);
  const [visitToEdit, setVisitToEdit] = useState<Visit | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);

  // Check if user is ADMIN
  const isAdmin = userRole === Role.ADMIN;
  const isDealer = userRole === Role.DEALER;

  // Fetch visits based on role
  // ADMIN: sees all visits created by DEALER users
  // DEALER: sees only their own visits
  const fetchVisits = useCallback(async () => {
    try {
      const response = await axios.get("/api/visits?dealerVisits=true");
      if (response.status === 200) {
        setVisits(response.data.visits);
        if (response.data.userRole) {
          setUserRole(response.data.userRole as Role);
        }
      }
    } catch (error) {
      console.error("Error fetching visits:", error);
      toast.error(t("dealerPage.errors.fetchVisits"));
    }
  }, [t]);

  // Initial fetch
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      setIsLoading(true);
      fetchVisits().finally(() => setIsLoading(false));
    }
  }, [sessionStatus, fetchVisits]);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchVisits();
    setIsRefreshing(false);
    toast.success(t("messages.updated"));
  };

  // View visit detail
  const handleViewVisit = (visit: Visit) => {
    router.push(`/dashboard/dealers/visits/${visit.id}`);
  };

  // Edit visit
  const handleEditVisit = (visit: Visit) => {
    setVisitToEdit(visit);
    setIsVisitDialogOpen(true);
  };

  // Delete visit
  const handleDeleteVisit = async () => {
    if (!visitToDelete) return;

    try {
      const response = await axios.delete(`/api/visits/${visitToDelete.id}`);
      if (response.status === 200) {
        toast.success(t("messages.deleted"));
        setVisits((prev) => prev.filter((v) => v.id !== visitToDelete.id));
        setVisitToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting visit:", error);
      toast.error(t("messages.error"));
    }
  };

  // Success handler for dialog
  const handleVisitSuccess = () => {
    setIsVisitDialogOpen(false);
    setVisitToEdit(null);
    fetchVisits();
  };

  // Table columns
  const columns = createColumns({
    onView: handleViewVisit,
    onEdit: handleEditVisit,
    onDelete: (visit) => setVisitToDelete(visit),
    t,
    locale,
  });

  if (sessionStatus === "loading" || isLoading) {
    return <DashboardPageSkeleton />;
  }

  return (
    <section className="mx-auto px-4 space-y-3 w-full h-full">
      {/* Header */}
      <div className="flex flex-row items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur py-0">
        <div>
          <H1>
            {isAdmin ? t("dealerPage.titleAdmin") : t("dealerPage.title")}
          </H1>
          <div className="flex flex-col justify-start">
            <Paragraph>
              {isAdmin
                ? t("dealerPage.descriptionAdmin")
                : t("dealerPage.description")}
            </Paragraph>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            title={t("common.refresh")}
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden md:inline">
              {isLoading
                ? t("common.loading")
                : isRefreshing
                ? t("common.refreshing")
                : t("common.refresh")}
            </span>
          </Button>

          {/* Only DEALER can create visits */}
          {isDealer && (
            <Button size="sm" onClick={() => setIsVisitDialogOpen(true)}>
              <Plus className="size-4" />
              <span className="hidden md:inline">
                {t("dealerPage.createVisit")}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {visits.length === 0 ? (
        <EmptyCard
          icon={<ClipboardList className="size-12 text-muted-foreground" />}
          title={
            isAdmin
              ? t("dealerPage.empty.titleAdmin")
              : t("dealerPage.empty.title")
          }
          description={
            isAdmin
              ? t("dealerPage.empty.descriptionAdmin")
              : t("dealerPage.empty.description")
          }
          actions={
            isDealer ? (
              <Button onClick={() => setIsVisitDialogOpen(true)}>
                <Plus className="size-4 mr-2" />
                {t("dealerPage.createVisit")}
              </Button>
            ) : undefined
          }
        />
      ) : isMobile ? (
        // Mobile: Cards view
        <div className="grid grid-cols-1 gap-3 pb-4">
          {visits.map((visit) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              isSelected={false}
              onSelect={() => {}}
              onView={handleViewVisit}
              onEdit={handleEditVisit}
              onDelete={(v) => setVisitToDelete(v)}
            />
          ))}
        </div>
      ) : (
        // Desktop: Table view
        <VisitsDataTable
          columns={columns}
          data={visits}
          isLoading={isLoading || isRefreshing}
          onView={handleViewVisit}
          onEdit={handleEditVisit}
          onDelete={(v) => setVisitToDelete(v)}
        />
      )}

      {/* Visit Form Dialog (for creating/editing) */}
      <DealerVisitFormDialog
        open={isVisitDialogOpen}
        onOpenChange={(open) => {
          setIsVisitDialogOpen(open);
          if (!open) setVisitToEdit(null);
        }}
        onSuccess={handleVisitSuccess}
        existingVisit={visitToEdit || undefined}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!visitToDelete}
        onOpenChange={(open) => !open && setVisitToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("messages.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("messages.confirmDeleteDescription")}
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

export default DealersPage;
