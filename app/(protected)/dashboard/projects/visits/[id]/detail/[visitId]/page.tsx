"use client";

import axios from "axios";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertMessage } from "@/components/alert";
import { EmptyCard } from "@/components/empty-card";
import { H1, Paragraph } from "@/components/fonts/fonts";
import { Card, CardContent } from "@/components/ui/card";
import { VisitStatus, VisitFormType } from "@prisma/client";
import { DashboardPageSkeleton } from "@/components/dashboard-skeleton";

import {
  CSSDetail,
  IndustrialDetail,
  LogisticaDetail,
  StatCard,
} from "@/components/visit-detail";

import {
  Visit,
  FORM_TYPE_LABELS,
  VISIT_STATUS_LABELS,
} from "@/interfaces/visits";

import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Phone,
  ArrowUpRight,
  ClipboardList,
  Clock,
  FileX,
} from "lucide-react";

interface VisitDetailPageProps {
  params: Promise<{ id: string; visitId: string }>;
}

const STATUS_CONFIG: Record<
  VisitStatus,
  {
    variant: "default" | "secondary" | "success" | "warning" | "destructive";
    bgColor: string;
    textColor: string;
  }
> = {
  BORRADOR: {
    variant: "warning",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  COMPLETADA: {
    variant: "success",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  ENVIADA: {
    variant: "default",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  APROBADA: {
    variant: "success",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  RECHAZADA: {
    variant: "destructive",
    bgColor: "bg-red-500/10",
    textColor: "text-red-600 dark:text-red-400",
  },
};

// ==================== MAIN COMPONENT ====================
const VisitDetailPage = ({ params }: VisitDetailPageProps) => {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accountId, setAccountId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchVisitDetail = async () => {
      try {
        const resolvedParams = await params;
        const { id, visitId } = resolvedParams;
        setAccountId(id);

        const response = await axios.get(`/api/visits/${visitId}`);
        setVisit(response.data.visit);
      } catch (error) {
        console.error("Error fetching visit details:", error);
        toast.error("Error al cargar los detalles de la visita");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitDetail();
  }, [params]);

  // Get the appropriate formulario based on formType
  const getFormulario = () => {
    if (!visit) return null;

    switch (visit.formType) {
      case VisitFormType.ANALISIS_CSS:
        return visit.formularioCSSAnalisis;
      case VisitFormType.ANALISIS_INDUSTRIAL:
        return visit.formularioIndustrialAnalisis;
      case VisitFormType.ANALISIS_LOGISTICA:
        return visit.formularioLogisticaAnalisis;
      default:
        return null;
    }
  };

  // Render the appropriate detail component based on formType
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
      default:
        return (
          <AlertMessage
            variant="info"
            title="Tipo de formulario no soportado"
            description={`El tipo de formulario "${
              FORM_TYPE_LABELS[visit.formType] || visit.formType
            }" aún no tiene vista de detalle implementada.`}
          />
        );
    }
  };

  const formulario = getFormulario();
  const statusConfig = visit ? STATUS_CONFIG[visit.status] : null;

  return (
    <section className="mx-auto w-full min-h-full">
      {isLoading ? (
        <DashboardPageSkeleton />
      ) : !visit ? (
        <div className="px-4 py-8">
          <EmptyCard
            icon={<FileX className="size-10 text-muted-foreground" />}
            title="Visita no encontrada"
            description="La visita que buscas no existe o fue eliminada."
            actions={
              <Button onClick={() => router.back()} variant="outline" size="sm">
                <ArrowLeft className="size-4" />
                Volver
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 pb-8">
          {/* ==================== HEADER ==================== */}
          <header className="space-y-4">
            {/* Title and status */}
            <div>
              <div className="flex flex-row justify-between items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-3 w-fit">
                  <H1>{visit.customer?.accountName || "Detalle de visita"}</H1>
                  <Badge
                    variant={statusConfig?.variant}
                    className="text-xs font-medium w-fit"
                  >
                    {VISIT_STATUS_LABELS[visit.status]}
                  </Badge>
                </div>

                {/* Top bar with back button and actions */}
                <div className="flex items-center justify-center gap-3 w-fit">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/projects/visits/${accountId}`)
                    }
                    className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
                  >
                    <ArrowLeft className="size-4" />
                    <span className="hidden md:inline">Volver</span>
                  </Button>

                  <div className="flex items-center gap-2 w-fit">
                    {visit.status === VisitStatus.BORRADOR && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => console.log("Enviar datos")}
                        className="gap-1.5"
                      >
                        <span className="hidden md:inline">Enviar</span>
                        <ArrowUpRight className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Paragraph>
                Información completa de la visita realizada al cliente.
              </Paragraph>
            </div>

            {/* Alert for draft status */}
            {visit.status === VisitStatus.BORRADOR && (
              <AlertMessage
                variant="warning"
                title="Visita en estado de borrador"
                description="Por favor, revisa todos los datos y envía el formulario cuando esté listo para su revisión y aprobación."
              />
            )}
          </header>

          {/* ==================== STATS GRID ==================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <StatCard
              icon={ClipboardList}
              label="Tipo"
              value={
                FORM_TYPE_LABELS[visit.formType]?.replace("Formulario ", "") ||
                visit.formType
              }
            />
            <StatCard
              icon={Calendar}
              label="Fecha de visita"
              value={formatDate(visit.visitDate)}
            />
            <StatCard
              icon={User}
              label="Vendedor"
              value={visit.user?.name || visit.user?.email || "Sin asignar"}
            />
            <StatCard
              icon={Clock}
              label="Creada"
              value={visit.createdAt ? formatDate(visit.createdAt) : "N/A"}
            />
          </div>

          {/* ==================== CUSTOMER QUICK INFO ==================== */}
          <Card className="overflow-hidden">
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <h3 className="text-base font-semibold text-foreground truncate">
                      {visit.customer?.accountName}
                    </h3>
                    {visit.customer?.industry && (
                      <p className="text-xs text-muted-foreground">
                        {visit.customer.industry}
                      </p>
                    )}
                  </div>

                  {/* Contact row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                    {visit.customer?.email && (
                      <a
                        href={`mailto:${visit.customer.email}`}
                        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Mail className="size-3.5" />
                        <span className="truncate max-w-[180px]">
                          {visit.customer.email}
                        </span>
                      </a>
                    )}
                    {visit.customer?.phone && (
                      <a
                        href={`tel:${visit.customer.phone}`}
                        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Phone className="size-3.5" />
                        <span>{visit.customer.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ==================== FORMULARIO SECTIONS (Dynamic) ==================== */}
          {renderFormularioDetail()}
        </div>
      )}
    </section>
  );
};

export default VisitDetailPage;
