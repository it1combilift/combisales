"use client";

import React from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useI18n } from "@/lib/i18n/context";
import { formatDateShort } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { use, useEffect, useState } from "react";
import { AlertMessage } from "@/components/alert";
import { EmptyCard } from "@/components/empty-card";
import { H1, Paragraph } from "@/components/fonts/fonts";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { VisitStatus, VisitFormType, Role } from "@prisma/client";
import { DashboardPageSkeleton } from "@/components/dashboard-skeleton";
import FormularioCSSAnalisis from "@/components/formulario-css-analisis";
import FormularioLogisticaAnalisis from "@/components/formulario-logistica-analisis";
import FormularioIndustrialAnalisis from "@/components/formulario-industrial-analisis";
import FormularioStraddleCarrierAnalisis from "@/components/formulario-straddle-carrier-analisis";

import {
  CSSDetail,
  IndustrialDetail,
  LogisticaDetail,
  StraddleCarrierDetail,
  StatCard,
} from "@/components/visit-detail";

import {
  Visit,
  FORM_TYPE_LABELS,
  STATUS_CONFIG,
  VISIT_STATUS_ICONS,
} from "@/interfaces/visits";

import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  ClipboardList,
  Clock,
  FileX,
  UserCheck,
  PencilLine,
  GitBranch,
  Split,
} from "lucide-react";

interface DealerVisitDetailPageProps {
  params: Promise<{ visitId: string }>;
}

export default function DealerVisitDetailPage({
  params,
}: DealerVisitDetailPageProps) {
  const resolvedParams = use(params);
  const { visitId } = resolvedParams;

  const [visit, setVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [userRole, setUserRole] = useState<Role | null>(null);

  const router = useRouter();
  const { t, locale } = useI18n();
  const { data: session } = useSession();

  // User role helpers
  const isSeller = userRole === Role.SELLER;
  const isAdmin = userRole === Role.ADMIN;
  const isDealer = userRole === Role.DEALER;
  const isClone = !!visit?.clonedFromId;
  // SELLER can only edit their own clones (drafts)
  const canEdit = !isSeller || isClone;

  /**
   * Calculate effective status for display based on user role
   * - DEALER: Always sees BORRADOR or COMPLETADA (never EN_PROGRESO)
   * - SELLER/ADMIN on original: EN_PROGRESO unless clone is COMPLETADA
   * - SELLER/ADMIN on clone: Real status (BORRADOR or COMPLETADA)
   */
  const getEffectiveStatus = (): VisitStatus => {
    if (!visit) return VisitStatus.BORRADOR;

    const realStatus = visit.status;

    // DEALER: Never sees EN_PROGRESO - it's only for SELLER/ADMIN flow
    // If somehow status is EN_PROGRESO for dealer, show as COMPLETADA
    if (isDealer && realStatus === VisitStatus.EN_PROGRESO) {
      return VisitStatus.COMPLETADA;
    }

    // SELLER/ADMIN viewing original visit (not a clone)
    if ((isSeller || isAdmin) && !isClone) {
      // For completed visits, check clone status
      if (
        realStatus === VisitStatus.COMPLETADA ||
        realStatus === VisitStatus.EN_PROGRESO
      ) {
        const hasClone = visit.clones && visit.clones.length > 0;
        const clone = hasClone ? visit.clones![0] : null;

        if (clone && clone.status === VisitStatus.COMPLETADA) {
          return VisitStatus.COMPLETADA;
        } else {
          // No clone or clone not completed → EN_PROGRESO
          return VisitStatus.EN_PROGRESO;
        }
      }
    }

    return realStatus;
  };

  const effectiveStatus = visit ? getEffectiveStatus() : VisitStatus.BORRADOR;

  // Fetch visit data
  useEffect(() => {
    const fetchVisit = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/visits/${visitId}`);
        setVisit(response.data.visit || response.data);
      } catch (error) {
        console.error("Error fetching visit:", error);
        toast.error(t("dealerPage.errors.fetchVisits"));
      } finally {
        setIsLoading(false);
      }
    };

    if (visitId) {
      fetchVisit();
    }
  }, [visitId, t]);

  // Get user role from session
  useEffect(() => {
    if (session?.user?.role) {
      setUserRole(session.user.role as Role);
    }
  }, [session]);

  // Clone visit (SELLER only)
  const handleCloneVisit = async () => {
    if (!visit || !isSeller || isClone) return;

    setIsCloning(true);
    try {
      const response = await axios.post(`/api/visits/${visit.id}/clone`);
      if (response.status === 201) {
        toast.success(t("dealerPage.seller.cloneSuccess"), {
          description: t("dealerPage.seller.cloneSuccessDescription"),
        });
        // Navigate to the cloned visit for editing
        router.push(`/dashboard/dealers/visits/${response.data.visit.id}`);
      }
    } catch (error) {
      console.error("Error cloning visit:", error);
      toast.error(t("dealerPage.errors.cloneVisit"));
    } finally {
      setIsCloning(false);
    }
  };

  const handleSuccess = async () => {
    setIsEditing(false);
    try {
      // Force fresh data fetch with cache-busting
      const response = await axios.get(`/api/visits/${visitId}`, {
        headers: { "Cache-Control": "no-cache" },
        params: { _t: Date.now() }, // Cache buster
      });
      const updatedVisit = response.data.visit || response.data;
      setVisit(updatedVisit);
      toast.success(t("toast.form.changesSuccess"));
    } catch (error) {
      console.error("Error refreshing visit:", error);
      toast.error(t("errors.fetchingData"));
    }
  };

  const handleBack = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      router.push("/dashboard/dealers");
    }
  };

  // Render the appropriate detail component
  // NOTE: Cloned visits already have their own copy of files from the original
  // We do NOT combine files to avoid duplication - the clone owns its files independently
  const renderFormularioDetail = () => {
    if (!visit) return null;

    switch (visit.formType) {
      case VisitFormType.ANALISIS_CSS:
        if (!visit.formularioCSSAnalisis) return null;
        return <CSSDetail formulario={visit.formularioCSSAnalisis} />;

      case VisitFormType.ANALISIS_INDUSTRIAL:
        if (!visit.formularioIndustrialAnalisis) return null;
        return (
          <IndustrialDetail formulario={visit.formularioIndustrialAnalisis} />
        );

      case VisitFormType.ANALISIS_LOGISTICA:
        if (!visit.formularioLogisticaAnalisis) return null;
        return (
          <LogisticaDetail formulario={visit.formularioLogisticaAnalisis} />
        );

      case VisitFormType.ANALISIS_STRADDLE_CARRIER:
        if (!visit.formularioStraddleCarrierAnalisis) return null;
        return (
          <StraddleCarrierDetail
            formulario={visit.formularioStraddleCarrierAnalisis}
          />
        );

      default:
        return (
          <AlertMessage
            variant="info"
            title={t("visits.unsupportedFormType")}
            description={t("visits.unsupportedFormTypeDesc", {
              type: FORM_TYPE_LABELS[visit.formType] || visit.formType,
            })}
          />
        );
    }
  };

  // Render the appropriate form for editing inside Dialog
  const renderEditForm = () => {
    if (!visit) return null;

    // Use updatedAt as key to force re-mount when visit data changes
    // This ensures form re-initializes with fresh data after save
    const formKey = `${visit.id}-${visit.updatedAt}`;

    // NOTE: We do NOT pass originalArchivos for cloned visits anymore
    // The clone already has its own copy of files from the cloning process
    // Passing originalArchivos would cause duplication
    const formProps = {
      onBack: () => setIsEditing(false),
      onSuccess: handleSuccess,
      existingVisit: visit,
      assignedSellerId: visit.assignedSellerId || undefined,
      originalArchivos: [], // Empty - clone owns its files independently
      enableCustomerEntry: true, // Enable customer data steps for DEALER clone editing
    };

    switch (visit.formType) {
      case VisitFormType.ANALISIS_CSS:
        return <FormularioCSSAnalisis key={formKey} {...formProps} />;
      case VisitFormType.ANALISIS_INDUSTRIAL:
        return <FormularioIndustrialAnalisis key={formKey} {...formProps} />;
      case VisitFormType.ANALISIS_LOGISTICA:
        return <FormularioLogisticaAnalisis key={formKey} {...formProps} />;
      case VisitFormType.ANALISIS_STRADDLE_CARRIER:
        return (
          <FormularioStraddleCarrierAnalisis key={formKey} {...formProps} />
        );
      default:
        return null;
    }
  };

  const statusConfig = visit ? STATUS_CONFIG[effectiveStatus] : null;

  return (
    <section className="mx-auto w-full min-h-full">
      {isLoading ? (
        <DashboardPageSkeleton />
      ) : !visit ? (
        <div className="px-4 py-8">
          <EmptyCard
            icon={<FileX />}
            title={t("visits.visitNotFound")}
            description={t("visits.visitNotFoundDescription")}
            actions={
              <Button onClick={() => router.back()} variant="outline" size="sm">
                <ArrowLeft className="size-4" />
                {t("common.back")}
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 pb-8">
          <header className="space-y-4">
            <div>
              <div className="flex flex-row justify-between items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-3 w-fit flex-wrap">
                  <H1>{t("visits.detailTitle")}</H1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={statusConfig?.variant}
                      className="text-xs font-medium w-fit"
                    >
                      <span className="inline-flex">
                        {React.createElement(
                          VISIT_STATUS_ICONS[effectiveStatus],
                          {
                            className: "size-3.5",
                          },
                        )}
                      </span>
                      {t(
                        `visits.statuses.${
                          effectiveStatus === VisitStatus.BORRADOR
                            ? "draft"
                            : effectiveStatus === VisitStatus.EN_PROGRESO
                              ? "inProgress"
                              : "completed"
                        }`,
                      )}
                    </Badge>

                    {/* Show clone status badge for SELLER/ADMIN */}
                    {(isSeller || isAdmin) && (
                      <Badge
                        variant={isClone ? "secondary" : "outline"}
                        className="text-xs font-medium w-fit"
                      >
                        <GitBranch className="size-3" />
                        {isClone
                          ? t("dealerPage.seller.clonedBadge")
                          : t("dealerPage.seller.originalBadge")}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 w-fit">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
                  >
                    <ArrowLeft className="size-4" />
                    <span className="hidden md:inline">{t("common.back")}</span>
                  </Button>

                  <div className="flex items-center gap-2 w-fit">
                    {/* Clone button for SELLER (only for original visits) */}
                    {isSeller && !isClone && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCloneVisit}
                        disabled={isCloning}
                        className="gap-1.5"
                        title={t("dealerPage.seller.cloneTooltip")}
                      >
                        <Split
                          className={`size-4 ${isCloning ? "animate-pulse" : ""}`}
                        />
                        <span className="hidden md:inline">
                          {t("dealerPage.seller.cloneAction")}
                        </span>
                      </Button>
                    )}

                    {/* Edit button - only for drafts and if user can edit */}
                    {visit.status === VisitStatus.BORRADOR && canEdit && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="gap-1.5"
                      >
                        <span className="hidden md:inline">
                          {t("common.edit")}
                        </span>
                        <PencilLine className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Paragraph>{t("visits.description")}</Paragraph>
            </div>

            {visit.status === VisitStatus.BORRADOR && (
              <AlertMessage
                variant="warning"
                title={t("visits.visitWithDraftStateTitle")}
                description={t("visits.visitWithDraftStateDescription")}
              />
            )}

            {/* Alert for SELLER viewing original visit (cannot edit) */}
            {isSeller &&
              !isClone &&
              visit.status !== VisitStatus.COMPLETADA && (
                <AlertMessage
                  variant="info"
                  title={t("dealerPage.seller.cannotEditOriginal")}
                  description={t("dealerPage.seller.editCloneOnly")}
                />
              )}

            {/* Show clone source info */}
            {isClone && visit.clonedFrom && (
              <Card className="overflow-hidden border-dashed bg-background/80 shadow-none py-0">
                <CardContent className="py-3 px-2 sm:px-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <GitBranch className="size-4 text-primary" />
                      <span className="font-semibold">
                        {t("dealerPage.seller.clonedFrom")}:
                      </span>
                      <span className="font-medium text-foreground truncate max-w-[120px] sm:max-w-[180px]">
                        {visit.clonedFrom.user?.name ||
                          visit.clonedFrom.user?.email}
                      </span>
                    </div>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      <span className="truncate">
                        {formatDateShort(visit.clonedFrom.visitDate, locale)}
                      </span>
                    </div>
                    {visit.clonedAt && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="size-3.5 text-muted-foreground" />
                          <span>
                            {t("dealerPage.seller.clonedAt")}:{" "}
                            {formatDateShort(visit.clonedAt, locale)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <StatCard
              icon={ClipboardList}
              label={t("tasks.type")}
              value={
                visit.formType === "ANALISIS_CSS"
                  ? t("forms.formTypes.css")
                  : visit.formType === "ANALISIS_INDUSTRIAL"
                    ? t("forms.formTypes.industrial")
                    : visit.formType === "ANALISIS_LOGISTICA"
                      ? t("forms.formTypes.logistica")
                      : visit.formType === "ANALISIS_STRADDLE_CARRIER"
                        ? t("forms.formTypes.straddleCarrier")
                        : visit.formType
              }
            />
            <StatCard
              icon={Calendar}
              label={t("visits.visitDate")}
              value={formatDateShort(visit.visitDate, locale)}
            />
            <StatCard
              icon={User}
              label={t("visits.createdBySection")}
              value={
                visit.user?.name || visit.user?.email || t("visits.unassigned")
              }
            />
            <StatCard
              icon={Clock}
              label={t("tasks.createdDate")}
              value={
                visit.createdAt
                  ? formatDateShort(visit.createdAt, locale)
                  : "N/A"
              }
            />
          </div>

          {/* Assigned Seller Card - specific for dealer visits */}
          {visit.assignedSeller && (
            <Card className="overflow-hidden">
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="size-4 text-primary" />
                      <h3 className="text-base font-semibold text-foreground">
                        {t("dealerPage.dialog.assignedTo")}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-foreground">
                        <User className="size-3.5 text-muted-foreground" />
                        <span>{visit.assignedSeller.name}</span>
                      </span>
                      {visit.assignedSeller.email && (
                        <a
                          href={`mailto:${visit.assignedSeller.email}`}
                          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Mail className="size-3.5" />
                          <span className="truncate max-w-[180px]">
                            {visit.assignedSeller.email}
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Detail */}
          {renderFormularioDetail()}
        </div>
      )}

      {/* Edit Form Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent
          className="
            max-w-none
            w-[95vw] h-[80vh]
            md:max-h-[80vh]
            border border-border
            bg-background p-0 overflow-hidden flex flex-col
          "
        >
          {renderEditForm()}
        </DialogContent>
      </Dialog>
    </section>
  );
}
