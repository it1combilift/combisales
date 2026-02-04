"use client";

import axios from "axios";
import { toast } from "sonner";
import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Visit } from "@/interfaces/visits";
import { useSession } from "next-auth/react";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyCard } from "@/components/empty-card";
import { useEffect, useState, useCallback } from "react";
import { H1, Paragraph } from "@/components/fonts/fonts";
import { createColumns } from "@/components/visits/columns";
import { Plus, RefreshCw, ClipboardList } from "lucide-react";
import { VisitsDataTable } from "@/components/visits/data-table";
import { DashboardPageSkeleton } from "@/components/dashboard-skeleton";
import DealerVisitFormDialog from "@/components/dealers/dealer-visit-form-dialog";
import { DeleteVisitDialog } from "@/components/visits/delete-visit-dialog";

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

const DealersPage = () => {
  const { t, locale } = useI18n();
  const router = useRouter();
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
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Clone visit (SELLER and ADMIN)
  const handleCloneVisit = async (visit: Visit) => {
    if (!isSeller && !isAdmin) return;

    // Cannot clone if already has a clone (Phase 4: one clone per original)
    if (visit.clones && visit.clones.length > 0) {
      toast.error(t("dealerPage.seller.visitAlreadyCloned"));
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
    } catch (error: any) {
      console.error("Error cloning visit:", error);
      if (error.response?.data?.error === "VISIT_ALREADY_CLONED") {
        toast.error(t("dealerPage.seller.visitAlreadyCloned"));
      } else {
        toast.error(t("dealerPage.errors.cloneVisit"));
      }
    } finally {
      setIsCloning(false);
    }
  };

  // Phase 4: View clone detail (navigate to clone's detail page) - SELLER and ADMIN
  const handleViewClone = (visit: Visit) => {
    if (visit.clones && visit.clones.length > 0) {
      router.push(`/dashboard/dealers/visits/${visit.clones[0].id}`);
    }
  };

  // Phase 4: Edit clone (open dialog with clone data) - SELLER and ADMIN
  const handleEditClone = async (visit: Visit) => {
    if (!visit.clones || visit.clones.length === 0) return;

    // Fetch the full clone data
    try {
      const response = await axios.get(`/api/visits/${visit.clones[0].id}`);
      if (response.status === 200) {
        setIsFormReadOnly(false);
        setVisitToEdit(response.data.visit);
        setIsVisitDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching clone:", error);
      toast.error(t("messages.error"));
    }
  };

  // Phase 4: Delete clone
  const handleDeleteClone = (visit: Visit) => {
    if (visit.clones && visit.clones.length > 0) {
      // Create a "fake" visit object with the clone's ID for the delete dialog
      setVisitToDelete({
        ...visit,
        id: visit.clones[0].id,
        clonedFromId: visit.id, // Mark it as a clone so delete validation passes
      } as Visit);
    }
  };

  // Delete visit - supports cascade delete for ADMIN
  const handleDeleteVisit = async () => {
    if (!visitToDelete) return;

    // SELLER: can only delete clones (either their own clone or from the unified row)
    if (isSeller && !visitToDelete.clonedFromId) {
      toast.error(t("dealerPage.seller.cannotDeleteOriginal"));
      setVisitToDelete(null);
      return;
    }

    setIsDeleting(true);
    try {
      // For ADMIN deleting original with clone, cascade=true will delete both
      const hasClone = visitToDelete.clones && visitToDelete.clones.length > 0;
      const cascade = isAdmin && hasClone ? "?cascade=true" : "";

      const response = await axios.delete(
        `/api/visits/${visitToDelete.id}${cascade}`,
      );
      if (response.status === 200) {
        toast.success(t("messages.deleted"));
        // Refresh visits to update the clones array
        await fetchVisits();
        setVisitToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting visit:", error);
      toast.error(t("messages.error"));
    } finally {
      setIsDeleting(false);
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
    // Phase 4: Clone-specific handlers for SELLER unified row logic
    onViewClone: handleViewClone,
    onEditClone: handleEditClone,
    onDeleteClone: handleDeleteClone,
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
              <div className="mt-1 text-sm flex items-center gap-2">
                <Spinner variant="bars" className="size-4" />
                <span className={isCloning ? "animate-pulse" : ""}>
                  {t("dealerPage.seller.cloning")}
                </span>
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
      ) : (
        <VisitsDataTable
          columns={columns}
          data={visits}
          isLoading={isLoading || isRefreshing}
          onView={handleViewVisit}
          onEdit={handleEditVisit}
          onDelete={(v) => setVisitToDelete(v)}
          userRole={userRole}
          onClone={isSeller || isAdmin ? handleCloneVisit : undefined}
          onViewClone={isSeller || isAdmin ? handleViewClone : undefined}
          onEditClone={isSeller || isAdmin ? handleEditClone : undefined}
          onDeleteClone={isSeller ? handleDeleteClone : undefined}
          onViewForm={isSeller || isAdmin ? handleViewForm : undefined}
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

      {/* Delete Confirmation Dialog - Use custom dialog for ADMIN (cascade support) */}
      {isAdmin ? (
        <DeleteVisitDialog
          visit={visitToDelete}
          open={!!visitToDelete}
          onOpenChange={(open) => !open && setVisitToDelete(null)}
          onConfirm={handleDeleteVisit}
          isDeleting={isDeleting}
        />
      ) : (
        <AlertDialog
          open={!!visitToDelete}
          onOpenChange={(open) => !open && setVisitToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-sm text-left text-balance">
                {t("messages.confirmDelete")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-left text-muted-foreground">
                {t("messages.confirmDeleteDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="space-x-2 grid grid-cols-2">
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteVisit}
                disabled={isDeleting}
              >
                {isDeleting ? t("common.deleting") : t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </section>
  );
};

export default DealersPage;
