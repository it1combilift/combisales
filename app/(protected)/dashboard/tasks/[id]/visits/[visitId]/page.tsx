"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/empty-card";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/copy-button";
import { H1, Paragraph } from "@/components/fonts/fonts";
import { ArrowLeft, Calendar, FileText, User, Tag } from "lucide-react";
import { DashboardPageSkeleton } from "@/components/dashboard-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Visit,
  STATUS_CONFIG,
  FORM_TYPE_LABELS,
  VisitFormType,
  FORM_TYPE_ICONS,
} from "@/interfaces/visits";

import {
  FormularioCSSDetail,
  FormularioIndustrialDetail,
  FormularioLogisticaDetail,
  FormularioStraddleCarrierDetail,
} from "@/components/visit-detail";

interface VisitDetailPageProps {
  params: Promise<{ id: string; visitId: string }>;
}

const TaskVisitDetailPage = ({ params }: VisitDetailPageProps) => {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [taskId, setTaskId] = useState<string>("");
  const router = useRouter();
  const { t, locale } = useI18n();

  useEffect(() => {
    const fetchVisitDetail = async () => {
      try {
        const resolvedParams = await params;
        setTaskId(resolvedParams.id);

        const response = await fetch(`/api/visits/${resolvedParams.visitId}`);
        if (!response.ok) {
          throw new Error(t("errors.fetchingData"));
        }
        const result = await response.json();
        setVisit(result.visit);
      } catch (error) {
        console.error("Error fetching visit:", error);
        toast.error(t("visits.errorLoadingVisit"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitDetail();
  }, [params]);

  const getFormularioContent = () => {
    if (!visit) return null;

    switch (visit.formType) {
      case VisitFormType.ANALISIS_CSS:
        return visit.formularioCSSAnalisis;
      case VisitFormType.ANALISIS_INDUSTRIAL:
        return visit.formularioIndustrialAnalisis;
      case VisitFormType.ANALISIS_LOGISTICA:
        return visit.formularioLogisticaAnalisis;
      case VisitFormType.ANALISIS_STRADDLE_CARRIER:
        return visit.formularioStraddleCarrierAnalisis;
      default:
        return null;
    }
  };

  const renderFormularioDetail = () => {
    if (!visit) return null;

    const formulario = getFormularioContent();
    if (!formulario) return null;

    switch (visit.formType) {
      case VisitFormType.ANALISIS_CSS:
        return <FormularioCSSDetail formulario={formulario as any} />;
      case VisitFormType.ANALISIS_INDUSTRIAL:
        return <FormularioIndustrialDetail formulario={formulario as any} />;
      case VisitFormType.ANALISIS_LOGISTICA:
        return <FormularioLogisticaDetail formulario={formulario as any} />;
      case VisitFormType.ANALISIS_STRADDLE_CARRIER:
        return (
          <FormularioStraddleCarrierDetail formulario={formulario as any} />
        );
      default:
        return (
          <EmptyCard
            title={t("visits.formNotAvailable")}
            description={t("visits.formNotRecognized")}
            icon={<FileText />}
          />
        );
    }
  };

  const statusConfig = visit ? STATUS_CONFIG[visit.status] : null;

  return (
    <section className="mx-auto w-full min-h-full">
      {isLoading ? (
        <DashboardPageSkeleton />
      ) : !visit ? (
        <div className="container px-4 py-8">
          <EmptyCard
            title={t("visits.visitNotFound")}
            description={t("visits.visitNotFoundDescription")}
            icon={<FileText />}
            actions={
              <Button
                onClick={() =>
                  router.push(`/dashboard/tasks/${taskId}/details`)
                }
                variant="default"
              >
                <ArrowLeft className="size-4" />
                {t("common.back")}
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <header className="flex flex-row gap-2 px-4 items-center justify-between flex-wrap">
            <div className="relative">
              <div className="flex items-center gap-3">
                <H1>{t("visits.detailTitle")}</H1>

                {statusConfig && (
                  <Badge variant={statusConfig.variant} size="sm">
                    <statusConfig.icon className="size-3" />
                    {t(
                      `taskPage.columns.status.${statusConfig.label}` as string
                    )}
                  </Badge>
                )}
              </div>

              <Paragraph>{t("visits.detailDescription")}</Paragraph>
            </div>

            <div className="flex items-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  router.push(`/dashboard/tasks/${taskId}/details`)
                }
              >
                <ArrowLeft className="size-4" />
                <span className="hidden md:block">{t("common.back")}</span>
              </Button>
            </div>
          </header>

          {/* Visit Metadata */}
          <div className="px-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {t("visits.generalInfo")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Form Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Tag className="size-4 text-muted-foreground" />
                      {t("visits.formType")}
                    </Label>
                    <Badge variant="secondary">
                      {(() => {
                        const Icon =
                          FORM_TYPE_ICONS[
                            visit.formType as keyof typeof FORM_TYPE_ICONS
                          ];
                        return Icon ? <Icon className="size-3" /> : null;
                      })()}

                      {visit.formType === VisitFormType.ANALISIS_CSS
                        ? t("visits.formTypes.css")
                        : visit.formType === VisitFormType.ANALISIS_INDUSTRIAL
                        ? t("visits.formTypes.industrial")
                        : visit.formType === VisitFormType.ANALISIS_LOGISTICA
                        ? t("visits.formTypes.logistica")
                        : visit.formType ===
                          VisitFormType.ANALISIS_STRADDLE_CARRIER
                        ? t("visits.formTypes.straddleCarrier")
                        : FORM_TYPE_LABELS[visit.formType]}
                    </Badge>
                  </div>

                  {/* Visit Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      {t("visits.visitDate")}
                    </Label>
                    <Badge variant="secondary">
                      {new Date(visit.visitDate).toLocaleDateString(locale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Badge>
                  </div>

                  {/* User */}
                  {visit.user && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />
                        {t("visits.seller")}
                      </Label>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{visit.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {visit.user.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Visit Context (Task) */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("visits.associatedTask")}
                  </Label>
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-muted-foreground inline" />
                      <span className="text-sm font-medium inline">
                        {t("visits.taskNumber")}
                        {visit.zohoTaskId}
                      </span>
                      <CopyButton
                        size="icon"
                        variant="outline"
                        value={visit.zohoTaskId}
                        content={visit.zohoTaskId}
                        title="Copiar ID de tarea de Zoho"
                      />
                    </div>
                    <div>
                      <Badge variant="outline-info" className="w-fit h-fit">
                        {t("visits.zohoTask")}
                        <Image
                          src="/zoho-logo.svg"
                          alt="Zoho"
                          width={30}
                          height={30}
                          className="object-contain"
                        />
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulario Detail */}
          <div className="px-4 pb-8">{renderFormularioDetail()}</div>
        </div>
      )}
    </section>
  );
};

export default TaskVisitDetailPage;
