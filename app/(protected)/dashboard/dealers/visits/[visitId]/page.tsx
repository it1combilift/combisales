"use client";

import React from "react";
import axios from "axios";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertMessage } from "@/components/alert";
import { use, useEffect, useState } from "react";
import { EmptyCard } from "@/components/empty-card";
import { H1, Paragraph } from "@/components/fonts/fonts";
import { Card, CardContent } from "@/components/ui/card";
import { VisitStatus, VisitFormType } from "@prisma/client";
import { DashboardPageSkeleton } from "@/components/dashboard-skeleton";

import {
  CSSDetail,
  IndustrialDetail,
  LogisticaDetail,
  StraddleCarrierDetail,
  StatCard,
} from "@/components/visit-detail";

import FormularioCSSAnalisis from "@/components/formulario-css-analisis";
import FormularioIndustrialAnalisis from "@/components/formulario-industrial-analisis";
import FormularioLogisticaAnalisis from "@/components/formulario-logistica-analisis";
import FormularioStraddleCarrierAnalisis from "@/components/formulario-straddle-carrier-analisis";

import { Dialog, DialogContent } from "@/components/ui/dialog";

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

  const router = useRouter();
  const { t } = useI18n();

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
  const renderFormularioDetail = () => {
    if (!visit) return null;

    switch (visit.formType) {
      case VisitFormType.ANALISIS_CSS:
        return visit.formularioCSSAnalisis ? (
          <CSSDetail formulario={visit.formularioCSSAnalisis} />
        ) : null;
      case VisitFormType.ANALISIS_INDUSTRIAL:
        return visit.formularioIndustrialAnalisis ? (
          <IndustrialDetail formulario={visit.formularioIndustrialAnalisis} />
        ) : null;
      case VisitFormType.ANALISIS_LOGISTICA:
        return visit.formularioLogisticaAnalisis ? (
          <LogisticaDetail formulario={visit.formularioLogisticaAnalisis} />
        ) : null;
      case VisitFormType.ANALISIS_STRADDLE_CARRIER:
        return visit.formularioStraddleCarrierAnalisis ? (
          <StraddleCarrierDetail
            formulario={visit.formularioStraddleCarrierAnalisis}
          />
        ) : null;
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

    const formProps = {
      onBack: () => setIsEditing(false),
      onSuccess: handleSuccess,
      existingVisit: visit,
      assignedSellerId: visit.assignedSellerId || undefined,
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

  const statusConfig = visit ? STATUS_CONFIG[visit.status] : null;

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
                <div className="flex items-center gap-3 w-fit">
                  <H1>
                    {FORM_TYPE_LABELS[visit.formType]?.replace(
                      "Análisis ",
                      "",
                    ) || t("visits.detailTitle")}
                  </H1>
                  <Badge
                    variant={statusConfig?.variant}
                    className="text-xs font-medium w-fit"
                  >
                    <span className="inline-flex">
                      {React.createElement(
                        VISIT_STATUS_ICONS[visit.status as VisitStatus],
                        {
                          className: "size-3.5",
                        },
                      )}
                    </span>
                    {t(
                      `visits.statuses.${
                        visit.status === VisitStatus.BORRADOR
                          ? "draft"
                          : "completed"
                      }`,
                    )}
                  </Badge>
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
                    {visit.status === VisitStatus.BORRADOR && (
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
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <StatCard
              icon={ClipboardList}
              label={t("tasks.type")}
              value={
                FORM_TYPE_LABELS[visit.formType]?.replace("Análisis ", "") ||
                visit.formType
              }
            />
            <StatCard
              icon={Calendar}
              label={t("visits.visitDate")}
              value={formatDate(visit.visitDate)}
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
              value={visit.createdAt ? formatDate(visit.createdAt) : "N/A"}
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
        <DialogContent className="p-0 m-0 border-none shadow-none bg-none overflow-hidden">
          {renderEditForm()}
        </DialogContent>
      </Dialog>
    </section>
  );
}
