"use client";

import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn, formatDate } from "@/lib/utils";
import { VisitStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertMessage } from "@/components/alert";
import { EmptyCard } from "@/components/empty-card";
import { Separator } from "@/components/ui/separator";
import { H1, Paragraph } from "@/components/fonts/fonts";
import AttachmentsGallery from "@/components/attachments-gallery";
import { DashboardPageSkeleton } from "@/components/dashboard-skeleton";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Visit,
  FORM_TYPE_LABELS,
  VISIT_STATUS_LABELS,
  CONTENEDOR_TIPO_LABELS,
  CONTENEDOR_MEDIDA_LABELS,
} from "@/interfaces/visits";

import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  Mail,
  Phone,
  MapPin,
  Globe,
  Package,
  Ruler,
  CheckCircle2,
  FileX,
  ArrowUpRight,
  ExternalLink,
  ClipboardList,
  Truck,
  Hash,
  Contact,
  Clock,
  Layers,
  Info,
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

// ==================== INFO FIELD COMPONENT ====================
const InfoField = ({
  label,
  value,
  icon: Icon,
  isLink = false,
  className = "",
}: {
  label: string;
  value?: string | null;
  icon?: React.ElementType;
  isLink?: boolean;
  className?: string;
}) => {
  if (!value) return null;

  return (
    <div className={cn("space-y-1", className)}>
      <dt className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        {Icon && <Icon className="size-3" />}
        {label}
      </dt>
      <dd className="text-sm font-medium text-foreground">
        {isLink ? (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1 break-all"
          >
            <span className="truncate max-w-[200px]">{value}</span>
            <ExternalLink className="size-3 shrink-0" />
          </a>
        ) : (
          <span className="wrap-break-word">{value}</span>
        )}
      </dd>
    </div>
  );
};

// ==================== INFO SECTION COMPONENT ====================
const InfoSection = ({
  title,
  description,
  icon: Icon,
  children,
  className = "",
  headerAction,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}) => (
  <Card className={cn("overflow-hidden", className)}>
    <CardHeader>
      <div className="flex items-start justify-between gap-3">
        <CardTitle className="flex items-center gap-2.5 text-sm sm:text-base font-semibold">
          <div className="flex items-center justify-center size-8  rounded-xl bg-primary/10 shrink-0">
            <Icon className="size-4 text-primary" />
          </div>
          <span className="truncate">{title}</span>
        </CardTitle>
        {headerAction}
      </div>
      {description && (
        <CardDescription className="text-xs mt-1.5 ml-11 sm:ml-12">
          {description}
        </CardDescription>
      )}
    </CardHeader>
    <CardContent className="pt-0">{children}</CardContent>
  </Card>
);

// ==================== STAT CARD COMPONENT ====================
const StatCard = ({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}) => (
  <div
    className={cn(
      "flex items-center gap-3 p-1 sm:p-2 rounded-xl bg-muted/40 border border-border/50",
      className
    )}
  >
    <div className="flex items-center justify-center size-8 rounded-lg bg-background border border-border/60 shadow-sm">
      <Icon className="size-4 text-muted-foreground" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">
        {label}
      </p>
      <p className="text-sm font-semibold text-foreground truncate text-balance">{value}</p>
    </div>
  </div>
);

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

  const formulario = visit?.formularioCSSAnalisis;
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

          {/* ==================== FORMULARIO SECTIONS ==================== */}
          {formulario && (
            <div className="space-y-4 sm:space-y-6">
              {/* Section Header */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                  <ClipboardList className="size-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold tracking-tight">
                    Detalles del formulario
                  </h2>
                  <p className="text-xs text-muted-foreground">Análisis CSS</p>
                </div>
              </div>

              {/* ==================== DATOS DEL CLIENTE ==================== */}
              <InfoSection title="Datos del cliente" icon={Contact}>
                <div className="space-y-4">
                  {/* Primary info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoField
                      label="Razón Social"
                      value={formulario.razonSocial}
                    />
                    <InfoField
                      label="Persona de contacto"
                      value={formulario.personaContacto}
                    />
                  </div>

                  <Separator />

                  {/* Contact info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoField
                      label="Email"
                      value={formulario.email}
                      icon={Mail}
                    />
                    <InfoField
                      label="Website"
                      value={formulario.website}
                      icon={Globe}
                      isLink
                    />
                    <InfoField
                      label="NIF/CIF"
                      value={formulario.numeroIdentificacionFiscal}
                      icon={Hash}
                    />
                  </div>

                  <Separator />

                  {/* Address */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      <MapPin className="size-3" />
                      Dirección
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <InfoField
                        label="Dirección"
                        value={formulario.direccion}
                      />
                      <InfoField
                        label="Localidad"
                        value={formulario.localidad}
                      />
                      <InfoField
                        label="Provincia/Estado"
                        value={formulario.provinciaEstado}
                      />
                      <InfoField label="País" value={formulario.pais} />
                      <InfoField
                        label="Código postal"
                        value={formulario.codigoPostal}
                      />
                    </div>
                  </div>

                  {/* Distributor info */}
                  {(formulario.distribuidor ||
                    formulario.contactoDistribuidor) && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          <Truck className="size-3" />
                          Distribuidor
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <InfoField
                            label="Distribuidor"
                            value={formulario.distribuidor}
                          />
                          <InfoField
                            label="Contacto distribuidor"
                            value={formulario.contactoDistribuidor}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Additional info */}
                  {(formulario.fechaCierre ||
                    formulario.datosClienteUsuarioFinal) && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {formulario.fechaCierre && (
                          <InfoField
                            label="Fecha de cierre"
                            value={formatDate(formulario.fechaCierre)}
                            icon={Calendar}
                          />
                        )}
                      </div>
                      {formulario.datosClienteUsuarioFinal && (
                        <div className="space-y-2 mt-2">
                          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                            Datos cliente/Usuario final
                          </p>
                          <div className="text-sm text-foreground bg-muted/40 rounded-xl p-3 sm:p-4 border border-border/50">
                            {formulario.datosClienteUsuarioFinal}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </InfoSection>

              {/* ==================== DESCRIPCION DEL PRODUCTO ==================== */}
              <InfoSection title="Descripción del producto" icon={FileText}>
                <div className="space-y-4">
                  <div className="bg-muted/40 rounded-xl p-3 sm:p-4 border border-border/50">
                    <p
                      className={cn(
                        "text-sm text-foreground whitespace-pre-wrap leading-relaxed",
                        !formulario.descripcionProducto &&
                          "italic text-muted-foreground"
                      )}
                    >
                      {formulario.descripcionProducto || "No proporcionada."}
                    </p>
                  </div>
                </div>
              </InfoSection>

              {/* ==================== ARCHIVOS ADJUNTOS ==================== */}
              {formulario.archivos && formulario.archivos.length > 0 && (
                <AttachmentsGallery archivos={formulario.archivos} />
              )}

              {/* ==================== CONTENEDOR INFO ==================== */}
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                {/* Tipo de contenedor */}
                <InfoSection title="Tipo de contenedor" icon={Package}>
                  <div className="space-y-4">
                    {/* Container types badges */}
                    <div className="flex flex-wrap gap-2">
                      {formulario.contenedorTipos.map((tipo) => (
                        <Badge
                          key={tipo}
                          variant="outline"
                          className="gap-1.5 py-1.5 px-3 bg-primary/5 border-primary/20"
                        >
                          <CheckCircle2 className="size-3 text-primary" />
                          {CONTENEDOR_TIPO_LABELS[tipo] || tipo}
                        </Badge>
                      ))}
                    </div>

                    {/* Additional container info */}
                    {(formulario.contenedoresPorSemana ||
                      formulario.condicionesSuelo) && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          {formulario.contenedoresPorSemana && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
                              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Contenedores por semana
                              </span>
                              <span className="text-xs font-bold text-primary">
                                {formulario.contenedoresPorSemana}
                              </span>
                            </div>
                          )}
                          {formulario.condicionesSuelo && (
                            <div className="space-y-2">
                              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                Condiciones del suelo
                              </p>
                              <div className="text-sm text-foreground bg-muted/40 rounded-xl p-3 border border-border/50">
                                {formulario.condicionesSuelo}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </InfoSection>

                {/* Medidas del contenedor */}
                <InfoSection title="Medidas del contenedor" icon={Ruler}>
                  <div className="space-y-4">
                    {/* Main measurement */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                        <Layers className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Medida seleccionada
                        </p>
                        <p className="text-xs md:text-sm font-semibold text-foreground">
                          {CONTENEDOR_MEDIDA_LABELS[
                            formulario.contenedorMedida
                          ] || "No especificada"}
                        </p>
                      </div>
                    </div>

                    {/* Custom measurement */}
                    {formulario.contenedorMedidaOtro && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Info className="size-3" />
                            Especificación adicional
                          </p>
                          <div className="text-sm text-foreground bg-muted/40 rounded-xl p-3 border border-border/50">
                            {formulario.contenedorMedidaOtro}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </InfoSection>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default VisitDetailPage;
