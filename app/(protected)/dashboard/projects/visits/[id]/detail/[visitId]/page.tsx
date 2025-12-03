"use client";

import axios from "axios";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { VisitStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyCard } from "@/components/empty-card";
import { H1, Paragraph } from "@/components/fonts/fonts";
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
} from "lucide-react";

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

  return (
    <section className="mx-auto px-4 space-y-6 w-full">
      {isLoading ? (
        <DashboardPageSkeleton />
      ) : !visit ? (
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
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <H1>Detalle de visita</H1>
                <Paragraph>
                  Información completa de la visita realizada
                </Paragraph>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={STATUS_VARIANTS[visit.status]}>
                {VISIT_STATUS_LABELS[visit.status]}
              </Badge>

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
            </div>
          </div>

          <Separator />

          {/* Visit Info Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Información general
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-muted-foreground">
                      Tipo de formulario:
                    </span>
                    <Badge variant="outline">
                      {FORM_TYPE_LABELS[visit.formType]}
                    </Badge>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="size-4" />
                      Fecha de visita:
                    </span>
                    <span className="text-sm font-medium">
                      {formatDate(visit.visitDate)}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="size-4" />
                      Vendedor:
                    </span>
                    <span className="text-sm font-medium">
                      {visit.user?.name || visit.user?.email}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Datos del cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Razón social:
                    </span>
                    <p className="text-sm font-medium">
                      {visit.customer?.accountName}
                    </p>
                  </div>
                  {visit.customer?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-muted-foreground" />
                      <span className="text-sm">{visit.customer.email}</span>
                    </div>
                  )}
                  {visit.customer?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-muted-foreground" />
                      <span className="text-sm">{visit.customer.phone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulario CSS Details */}
          {formulario && (
            <>
              <Separator />

              <div className="space-y-6">
                <H1 className="text-xl">Detalles del formulario CSS</H1>

                {/* Datos del Cliente (del formulario) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Datos del cliente
                    </CardTitle>
                    <CardDescription>
                      Información de contacto y dirección
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">
                          Razón Social
                        </span>
                        <p className="text-sm font-medium">
                          {formulario.razonSocial}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">
                          Persona de contacto
                        </span>
                        <p className="text-sm font-medium">
                          {formulario.personaContacto}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="size-4" />
                          Email
                        </span>
                        <p className="text-sm font-medium">
                          {formulario.email}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <MapPin className="size-4" />
                          Dirección
                        </span>
                        <p className="text-sm font-medium">
                          {formulario.direccion}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">
                          Localidad
                        </span>
                        <p className="text-sm font-medium">
                          {formulario.localidad}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">
                          Provincia/Estado
                        </span>
                        <p className="text-sm font-medium">
                          {formulario.provinciaEstado}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">
                          País
                        </span>
                        <p className="text-sm font-medium">{formulario.pais}</p>
                      </div>
                      {formulario.codigoPostal && (
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">
                            Código postal
                          </span>
                          <p className="text-sm font-medium">
                            {formulario.codigoPostal}
                          </p>
                        </div>
                      )}
                      {formulario.website && (
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <Globe className="size-4" />
                            Website
                          </span>
                          <a
                            href={formulario.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            {formulario.website}
                          </a>
                        </div>
                      )}
                      {formulario.numeroIdentificacionFiscal && (
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">
                            NIF/CIF
                          </span>
                          <p className="text-sm font-medium">
                            {formulario.numeroIdentificacionFiscal}
                          </p>
                        </div>
                      )}
                      {formulario.distribuidor && (
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">
                            Distribuidor
                          </span>
                          <p className="text-sm font-medium">
                            {formulario.distribuidor}
                          </p>
                        </div>
                      )}
                      {formulario.contactoDistribuidor && (
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">
                            Contacto distribuidor
                          </span>
                          <p className="text-sm font-medium">
                            {formulario.contactoDistribuidor}
                          </p>
                        </div>
                      )}
                      {formulario.fechaCierre && (
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="size-4" />
                            Fecha de cierre
                          </span>
                          <p className="text-sm font-medium">
                            {formatDate(formulario.fechaCierre)}
                          </p>
                        </div>
                      )}
                    </div>
                    {formulario.datosClienteUsuarioFinal && (
                      <div className="mt-6 space-y-2">
                        <span className="text-sm text-muted-foreground">
                          Datos cliente/Usuario final
                        </span>
                        <p className="text-sm">
                          {formulario.datosClienteUsuarioFinal}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Descripción del Producto */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Descripción del producto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">
                      {formulario.descripcionProducto}
                    </p>
                    {formulario.fotosVideosUrls &&
                      formulario.fotosVideosUrls.length > 0 && (
                        <div className="mt-6 space-y-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileImage className="size-4" />
                            <span>Fotos/Videos adjuntos:</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {formulario.fotosVideosUrls.map((url, index) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                Archivo {index + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>

                {/* Datos del Contenedor */}
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Tipo de contenedor
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {formulario.contenedorTipos.map((tipo) => (
                            <Badge
                              key={tipo}
                              variant="outline-warning"
                              className="gap-1"
                            >
                              <CheckCircle2 className="size-3" />
                              {CONTENEDOR_TIPO_LABELS[tipo]}
                            </Badge>
                          ))}
                        </div>
                        {formulario.contenedoresPorSemana && (
                          <div className="mt-4 pt-4 border-t">
                            <span className="text-sm text-muted-foreground">
                              Contenedores por semana:
                            </span>
                            <p className="text-sm font-medium mt-1">
                              {formulario.contenedoresPorSemana}
                            </p>
                          </div>
                        )}
                        {formulario.condicionesSuelo && (
                          <div className="space-y-2">
                            <span className="text-sm text-muted-foreground">
                              Condiciones del suelo:
                            </span>
                            <p className="text-sm">
                              {formulario.condicionesSuelo}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Ruler className="h-5 w-5" />
                        Medidas del contenedor
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Badge variant="outline-warning" className="text-xs">
                          {
                            CONTENEDOR_MEDIDA_LABELS[
                              formulario.contenedorMedida
                            ]
                          }
                        </Badge>
                        {formulario.contenedorMedidaOtro && (
                          <div className="mt-4 space-y-2">
                            <span className="text-sm text-muted-foreground">
                              Especificación:
                            </span>
                            <p className="text-sm font-medium">
                              {formulario.contenedorMedidaOtro}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
};

export default VisitDetailPage;
