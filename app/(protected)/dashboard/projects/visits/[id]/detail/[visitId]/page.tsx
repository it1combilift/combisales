"use client";

import axios from "axios";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { VisitStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertMessage } from "@/components/alert";
import { EmptyCard } from "@/components/empty-card";
import { Separator } from "@/components/ui/separator";
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
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Package,
  Ruler,
  FileImage,
  CheckCircle2,
  FileX,
  ArrowUpRight,
  ExternalLink,
  ClipboardList,
  Truck,
  Hash,
  Contact,
  Image,
  Video,
  File,
} from "lucide-react";
import { H1, Paragraph } from "@/components/fonts/fonts";

interface VisitDetailPageProps {
  params: Promise<{ id: string; visitId: string }>;
}

const STATUS_VARIANTS: Record<
  VisitStatus,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  BORRADOR: "warning",
  COMPLETADA: "success",
  ENVIADA: "default",
  APROBADA: "success",
  RECHAZADA: "destructive",
};

// Componente reutilizable para campos de información
const InfoField = ({
  label,
  value,
  icon: Icon,
  isLink = false,
}: {
  label: string;
  value?: string | null;
  icon?: React.ElementType;
  isLink?: boolean;
}) => {
  if (!value) return null;

  return (
    <div className="space-y-1.5">
      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </dt>
      <dd className="text-sm font-medium text-foreground">
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            {value}
            <ExternalLink className="size-3" />
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
};

// Componente para secciones de información
const InfoSection = ({
  title,
  description,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle className="flex items-center gap-2.5 text-base">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
          <Icon className="size-4 text-primary" />
        </div>
        {title}
      </CardTitle>
      {description && (
        <CardDescription className="text-xs">{description}</CardDescription>
      )}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

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

  // Función para obtener icono según extensión de archivo
  const getFileIcon = (url: string) => {
    const extension = url.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || ""))
      return Image;
    if (["mp4", "webm", "mov", "avi"].includes(extension || "")) return Video;
    return File;
  };

  return (
    <section className="mx-auto w-full">
      {isLoading ? (
        <DashboardPageSkeleton />
      ) : !visit ? (
        <div className="px-4">
          <EmptyCard
            icon={<FileX className="size-8 text-muted-foreground" />}
            title="Visita no encontrada"
            description="La visita que buscas no existe o fue eliminada."
            actions={
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="size-4" />
                Volver
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-6 px-4 pb-8">
          {/* Header mejorado */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              {/* Título con Badge alineado */}
              <div className="flex flex-wrap items-center gap-3">
                <H1>{visit.customer?.accountName || "Detalle de visita"}</H1>
                <Badge
                  variant={STATUS_VARIANTS[visit.status]}
                  className="text-xs font-medium"
                >
                  {VISIT_STATUS_LABELS[visit.status]}
                </Badge>
              </div>

              {/* Descripción */}
              <Paragraph>
                Información completa de la visita realizada al cliente.
              </Paragraph>

              {/* Alerta de borrador */}
              {visit.status === VisitStatus.BORRADOR && (
                <AlertMessage
                  variant="warning"
                  title="Visita en estado de borrador"
                  description="Por favor, revisa todos los datos y envía el formulario cuando esté listo para su revisión y aprobación."
                />
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/dashboard/projects/visits/${accountId}`)
                }
              >
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline">Volver</span>
              </Button>

              {visit.status === VisitStatus.BORRADOR && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => console.log("Enviar datos")}
                >
                  Enviar
                  <ArrowUpRight className="size-4" />
                </Button>
              )}
            </div>
          </header>

          {/* Grid principal de información */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Información General */}
            <InfoSection title="Información general" icon={FileText}>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Tipo de formulario
                  </dt>
                  <dd>
                    <Badge variant="outline" className="font-medium">
                      {FORM_TYPE_LABELS[visit.formType]}
                    </Badge>
                  </dd>
                </div>
                <InfoField
                  label="Fecha de visita"
                  value={formatDate(visit.visitDate)}
                  icon={Calendar}
                />
                <InfoField
                  label="Vendedor"
                  value={visit.user?.name || visit.user?.email}
                  icon={User}
                />
                {visit.createdAt && (
                  <InfoField
                    label="Creada"
                    value={formatDate(visit.createdAt)}
                    icon={Calendar}
                  />
                )}
              </dl>
            </InfoSection>

            {/* Datos del Cliente */}
            <InfoSection title="Datos del cliente" icon={Building2}>
              <dl className="grid gap-4">
                <div className="space-y-1.5">
                  <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Razón social
                  </dt>
                  <dd className="text-sm font-semibold text-foreground">
                    {visit.customer?.accountName}
                  </dd>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {visit.customer?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="size-4 text-muted-foreground shrink-0" />
                      <a
                        href={`mailto:${visit.customer.email}`}
                        className="text-primary hover:underline truncate"
                      >
                        {visit.customer.email}
                      </a>
                    </div>
                  )}
                  {visit.customer?.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="size-4 text-muted-foreground shrink-0" />
                      <a
                        href={`tel:${visit.customer.phone}`}
                        className="hover:underline"
                      >
                        {visit.customer.phone}
                      </a>
                    </div>
                  )}
                </div>
              </dl>
            </InfoSection>
          </div>

          {/* Detalles del Formulario CSS */}
          {formulario && (
            <>
              <div className="space-y-3">
                <h2 className="text-sm md:text-base font-semibold tracking-tight flex items-center gap-2">
                  <ClipboardList className="size-4 text-primary" />
                  Detalles del formulario CSS
                </h2>

                {/* Información del Cliente del Formulario */}
                <InfoSection title="Datos del cliente" icon={Contact}>
                  <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoField
                      label="Razón Social"
                      value={formulario.razonSocial}
                    />
                    <InfoField
                      label="Persona de contacto"
                      value={formulario.personaContacto}
                    />
                    <InfoField
                      label="Email"
                      value={formulario.email}
                      icon={Mail}
                    />
                    <InfoField
                      label="Dirección"
                      value={formulario.direccion}
                      icon={MapPin}
                    />
                    <InfoField label="Localidad" value={formulario.localidad} />
                    <InfoField
                      label="Provincia/Estado"
                      value={formulario.provinciaEstado}
                    />
                    <InfoField label="País" value={formulario.pais} />
                    <InfoField
                      label="Código postal"
                      value={formulario.codigoPostal}
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
                    <InfoField
                      label="Distribuidor"
                      value={formulario.distribuidor}
                      icon={Truck}
                    />
                    <InfoField
                      label="Contacto distribuidor"
                      value={formulario.contactoDistribuidor}
                    />
                    {formulario.fechaCierre && (
                      <InfoField
                        label="Fecha de cierre"
                        value={formatDate(formulario.fechaCierre)}
                        icon={Calendar}
                      />
                    )}
                  </dl>

                  {formulario.datosClienteUsuarioFinal && (
                    <div className="mt-6 pt-4 border-t">
                      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Datos cliente/Usuario final
                      </dt>
                      <dd className="text-sm text-foreground bg-muted/50 rounded-lg p-3">
                        {formulario.datosClienteUsuarioFinal}
                      </dd>
                    </div>
                  )}
                </InfoSection>

                {/* Descripción del Producto */}
                <InfoSection title="Descripción del producto" icon={FileText}>
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {formulario.descripcionProducto}
                      </p>
                    </div>

                    {formulario.fotosVideosUrls &&
                      formulario.fotosVideosUrls.length > 0 && (
                        <div className="pt-4 border-t space-y-3">
                          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            <FileImage className="size-4" />
                            Archivos adjuntos (
                            {formulario.fotosVideosUrls.length})
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {formulario.fotosVideosUrls.map((url, index) => {
                              const FileIcon = getFileIcon(url);
                              return (
                                <a
                                  key={index}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2.5 rounded-lg border bg-background hover:bg-muted/50 transition-colors group"
                                >
                                  <div className="flex items-center justify-center size-8 rounded-md bg-primary/10 text-primary">
                                    <FileIcon className="size-4" />
                                  </div>
                                  <span className="text-sm font-medium truncate flex-1">
                                    Archivo {index + 1}
                                  </span>
                                  <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </div>
                </InfoSection>

                {/* Contenedores - Grid de 2 columnas */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Tipo de Contenedor */}
                  <InfoSection title="Tipo de contenedor" icon={Package}>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {formulario.contenedorTipos.map((tipo) => (
                          <Badge
                            key={tipo}
                            variant="outline-warning"
                            className="gap-1.5 py-1.5"
                          >
                            <CheckCircle2 className="size-3" />
                            {CONTENEDOR_TIPO_LABELS[tipo]}
                          </Badge>
                        ))}
                      </div>

                      {(formulario.contenedoresPorSemana ||
                        formulario.condicionesSuelo) && (
                        <div className="pt-4 border-t space-y-4">
                          {formulario.contenedoresPorSemana && (
                            <InfoField
                              label="Contenedores por semana"
                              value={String(formulario.contenedoresPorSemana)}
                            />
                          )}
                          {formulario.condicionesSuelo && (
                            <div className="space-y-1.5">
                              <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Condiciones del suelo
                              </dt>
                              <dd className="text-sm text-foreground bg-muted/50 rounded-lg p-3">
                                {formulario.condicionesSuelo}
                              </dd>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </InfoSection>

                  {/* Medidas del Contenedor */}
                  <InfoSection title="Medidas del contenedor" icon={Ruler}>
                    <div className="space-y-4">
                      <Badge variant="outline-warning" className="py-1.5">
                        {CONTENEDOR_MEDIDA_LABELS[formulario.contenedorMedida]}
                      </Badge>

                      {formulario.contenedorMedidaOtro && (
                        <div className="pt-4 border-t">
                          <InfoField
                            label="Especificación adicional"
                            value={formulario.contenedorMedidaOtro}
                          />
                        </div>
                      )}
                    </div>
                  </InfoSection>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default VisitDetailPage;
