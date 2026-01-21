"use client";

import axios from "axios";
import { toast } from "sonner";
import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Visit } from "@/interfaces/visits";
import { useSession } from "next-auth/react";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmptyCard } from "@/components/empty-card";
import { useEffect, useState, useCallback } from "react";
import { H1, Paragraph } from "@/components/fonts/fonts";
import { VisitCard } from "@/components/visits/visit-card";
import { createColumns } from "@/components/visits/columns";
import { Plus, RefreshCw, ClipboardList } from "lucide-react";
import { VisitsDataTable } from "@/components/visits/data-table";
import { DashboardPageSkeleton } from "@/components/dashboard-skeleton";
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
import { Spinner } from "@/components/ui/spinner";

const DealersPage = () => {
  const { t, locale } = useI18n();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { status: sessionStatus } = useSession();

  // State
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState<Visit | null>(null);
  const [visitToEdit, setVisitToEdit] = useState<Visit | null>(null);
  const [isFormReadOnly, setIsFormReadOnly] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [isCloning, setIsCloning] = useState(false);

  // Check user roles
  const isAdmin = userRole === Role.ADMIN;
  const isDealer = userRole === Role.DEALER;
  const isSeller = userRole === Role.SELLER;

  // Fetch visits based on role
  // ADMIN: sees all visits created by DEALER users + all clones
  // DEALER: sees only their own visits
  // SELLER: sees visits assigned to them by DEALERs + their own clones
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
    // SELLER: can only edit their own clones
    if (isSeller && !visit.clonedFromId) {
      toast.error(t("dealerPage.seller.cannotEditOriginal"));
      return;
    }
    setIsFormReadOnly(false);
    setVisitToEdit(visit);
    setIsVisitDialogOpen(true);
  };

  // View form (read-only) - for SELLER viewing original visits
  const handleViewForm = (visit: Visit) => {
    setIsFormReadOnly(true);
    setVisitToEdit(visit);
    setIsVisitDialogOpen(true);
  };

  // Clone visit (SELLER only)
  const handleCloneVisit = async (visit: Visit) => {
    if (!isSeller) return;

    // Cannot clone a clone
    if (visit.clonedFromId) {
      toast.error(t("dealerPage.seller.cannotCloneClone"));
      return;
    }

    setIsCloning(true);
    try {
      const response = await axios.post(`/api/visits/${visit.id}/clone`);
      if (response.status === 201) {
        toast.success(t("dealerPage.seller.cloneSuccess"), {
          description: t("dealerPage.seller.cloneSuccessDescription"),
        });
        await fetchVisits();
      }
    } catch (error) {
      console.error("Error cloning visit:", error);
      toast.error(t("dealerPage.errors.cloneVisit"));
    } finally {
      setIsCloning(false);
    }
  };

  // Delete visit
  const handleDeleteVisit = async () => {
    if (!visitToDelete) return;

    // SELLER: can only delete their own clones
    if (isSeller && !visitToDelete.clonedFromId) {
      toast.error(t("dealerPage.seller.cannotDeleteOriginal"));
      setVisitToDelete(null);
      return;
    }

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
    setIsFormReadOnly(false);
    fetchVisits();
  };

  // Table columns
  const columns = createColumns({
    onView: handleViewVisit,
    onEdit: handleEditVisit,
    onDelete: (visit) => setVisitToDelete(visit),
    onClone: handleCloneVisit,
    onViewForm: handleViewForm,
    t,
    locale,
    userRole,
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
            {isAdmin
              ? t("dealerPage.titleAdmin")
              : isSeller
                ? t("dealerPage.seller.title")
                : t("dealerPage.title")}
          </H1>
          <div className="flex flex-col justify-start">
            <Paragraph>
              {isAdmin
                ? t("dealerPage.descriptionAdmin")
                : isSeller
                  ? t("dealerPage.seller.description")
                  : t("dealerPage.description")}
            </Paragraph>

            {isCloning && (
              <div className="mt-1 text-sm text-muted-foreground italic">
                <Spinner variant="bars" className="size-10" />
                {t("dealerPage.cloning")}
              </div>
            )}
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
          icon={<ClipboardList />}
          title={
            isAdmin
              ? t("dealerPage.empty.titleAdmin")
              : isSeller
                ? t("dealerPage.seller.empty.title")
                : t("dealerPage.empty.title")
          }
          description={
            isAdmin
              ? t("dealerPage.empty.descriptionAdmin")
              : isSeller
                ? t("dealerPage.seller.empty.description")
                : t("dealerPage.empty.description")
          }
          actions={
            isDealer ? (
              <Button onClick={() => setIsVisitDialogOpen(true)}>
                <Plus className="size-4" />
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
              onClone={isSeller ? handleCloneVisit : undefined}
              onViewForm={isSeller ? handleViewForm : undefined}
              userRole={userRole}
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
          if (!open) {
            setVisitToEdit(null);
            setIsFormReadOnly(false);
          }
        }}
        onSuccess={handleVisitSuccess}
        existingVisit={visitToEdit || undefined}
        isSellerEditing={isSeller && !!visitToEdit?.clonedFromId}
        readOnly={isFormReadOnly}
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
