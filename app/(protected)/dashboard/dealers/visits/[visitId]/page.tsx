"use client";

import axios from "axios";
import { toast } from "sonner";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Visit } from "@/interfaces/visits";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/empty-card";
import { H1 } from "@/components/fonts/fonts";
import { DashboardPageSkeleton } from "@/components/dashboard-skeleton";
import { useI18n } from "@/lib/i18n/context";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VisitFormType, VisitStatus } from "@prisma/client";

// Form components for editing
import FormularioCSSAnalisis from "@/components/formulario-css-analisis";
import FormularioIndustrialAnalisis from "@/components/formulario-industrial-analisis";
import FormularioLogisticaAnalisis from "@/components/formulario-logistica-analisis";
import FormularioStraddleCarrierAnalisis from "@/components/formulario-straddle-carrier-analisis";

interface DealerVisitDetailPageProps {
  params: Promise<{ visitId: string }>;
}

const FORM_TYPE_LABELS: Record<VisitFormType, string> = {
  ANALISIS_CSS: "CSS Analysis",
  ANALISIS_INDUSTRIAL: "Industrial Analysis",
  ANALISIS_LOGISTICA: "Logistics Analysis",
  ANALISIS_STRADDLE_CARRIER: "Straddle Carrier Analysis",
};

const STATUS_COLORS: Record<VisitStatus, string> = {
  BORRADOR: "bg-yellow-500",
  COMPLETADA: "bg-green-500",
};

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
        setVisit(response.data);
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

  const handleSuccess = () => {
    setIsEditing(false);
    // Refresh visit data
    axios.get(`/api/visits/${visitId}`).then((response) => {
      setVisit(response.data);
    });
    toast.success(t("toast.form.changesSuccess"));
  };

  const handleBack = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      router.push("/dashboard/dealers");
    }
  };

  // Render the appropriate form for editing
  const renderEditForm = () => {
    if (!visit) return null;

    const formProps = {
      onBack: () => setIsEditing(false),
      onSuccess: handleSuccess,
      existingVisit: visit,
      assignedSellerId: visit.assignedSellerId || undefined,
    };

    switch (visit.formType) {
      case "ANALISIS_CSS":
        return <FormularioCSSAnalisis {...formProps} />;
      case "ANALISIS_INDUSTRIAL":
        return <FormularioIndustrialAnalisis {...formProps} />;
      case "ANALISIS_LOGISTICA":
        return <FormularioLogisticaAnalisis {...formProps} />;
      case "ANALISIS_STRADDLE_CARRIER":
        return <FormularioStraddleCarrierAnalisis {...formProps} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <DashboardPageSkeleton />;
  }

  if (!visit) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <EmptyCard
          title={t("common.notFound")}
          description={t("visitDetail.notFound")}
          icon={<AlertTriangle className="w-8 h-8" />}
        />
        <Button onClick={() => router.push("/dashboard/dealers")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("common.back")}
        </Button>
      </div>
    );
  }

  // If editing, show the form
  if (isEditing) {
    return renderEditForm();
  }

  // Visit detail view
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <H1>{t("visitDetail.title")}</H1>
            <p className="text-sm text-muted-foreground">
              {FORM_TYPE_LABELS[visit.formType]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={STATUS_COLORS[visit.status]}>{visit.status}</Badge>
          {visit.status !== "COMPLETADA" && (
            <Button onClick={() => setIsEditing(true)}>
              {t("common.edit")}
            </Button>
          )}
        </div>
      </div>

      {/* Visit Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("visitDetail.generalInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("dealerPage.table.formType")}:
              </span>
              <span>{FORM_TYPE_LABELS[visit.formType]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("dealerPage.table.status")}:
              </span>
              <Badge className={STATUS_COLORS[visit.status]}>
                {visit.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("dealerPage.table.createdAt")}:
              </span>
              <span>{new Date(visit.createdAt).toLocaleDateString()}</span>
            </div>
            {visit.visitDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("visitDetail.visitDate")}:
                </span>
                <span>{new Date(visit.visitDate).toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {visit.assignedSeller && (
          <Card>
            <CardHeader>
              <CardTitle>{t("dealerPage.dialog.assignedTo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("usersPage.form.name")}:
                </span>
                <span>{visit.assignedSeller.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("usersPage.form.email")}:
                </span>
                <span className="text-sm">{visit.assignedSeller.email}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {visit.user && (
          <Card>
            <CardHeader>
              <CardTitle>{t("visitDetail.createdBy")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("usersPage.form.name")}:
                </span>
                <span>{visit.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("usersPage.form.email")}:
                </span>
                <span className="text-sm">{visit.user.email}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
