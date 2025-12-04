"use client";

import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { DialogTitle } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useMemo, useCallback } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formularioCSSSchema, FormularioCSSSchema } from "@/schemas/visits";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  Building2,
  FileText,
  Package,
  Ruler,
  MapPin,
  Users,
  Globe,
  Check,
  Mail,
  User,
  Hash,
  Link2,
  Home,
  Navigation,
  MapPinned,
  Flag,
  Briefcase,
  Phone,
  CalendarDays,
  BoxSelect,
  Layers,
  HardHat,
  Sparkles,
  FileDown,
} from "lucide-react";

import {
  VisitFormType,
  VisitStatus,
  ContenedorTipo,
  ContenedorMedida,
} from "@prisma/client";

import {
  CONTENEDOR_TIPO_LABELS,
  CONTENEDOR_MEDIDA_LABELS,
  StepConfig,
  FormularioCSSAnalisisProps,
} from "@/interfaces/visits";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const CONTENEDOR_TIPO_ICONS: Record<ContenedorTipo, React.ElementType> = {
  SOBRE_CAMION: Layers,
  EN_SUELO: BoxSelect,
  INTERIOR: Home,
  EXTERIOR: Globe,
};

const STEPS: StepConfig[] = [
  {
    id: 1,
    name: "Empresa",
    description: "Datos de la empresa",
    icon: Building2,
    color: "primary",
    fields: [
      "razonSocial",
      "personaContacto",
      "email",
      "numeroIdentificacionFiscal",
      "website",
    ],
  },
  {
    id: 2,
    name: "Ubicación",
    description: "Dirección y localización",
    icon: MapPin,
    color: "blue",
    fields: [
      "direccion",
      "localidad",
      "codigoPostal",
      "provinciaEstado",
      "pais",
    ],
  },
  {
    id: 3,
    name: "Comercial",
    description: "Información de ventas",
    icon: Users,
    color: "amber",
    fields: [
      "distribuidor",
      "contactoDistribuidor",
      "fechaCierre",
      "datosClienteUsuarioFinal",
    ],
  },
  {
    id: 4,
    name: "Producto",
    description: "Descripción del proyecto",
    icon: FileText,
    color: "violet",
    fields: ["descripcionProducto"],
  },
  {
    id: 5,
    name: "Contenedor",
    description: "Tipo y operación",
    icon: Package,
    color: "emerald",
    fields: ["contenedorTipos", "contenedoresPorSemana", "condicionesSuelo"],
  },
  {
    id: 6,
    name: "Medidas",
    description: "Dimensiones del contenedor",
    icon: Ruler,
    color: "rose",
    fields: ["contenedorMedida", "contenedorMedidaOtro"],
  },
];

export default function FormularioCSSAnalisis({
  customer,
  onBack,
  onSuccess,
}: FormularioCSSAnalisisProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const form = useForm<FormularioCSSSchema>({
    resolver: zodResolver(formularioCSSSchema),
    mode: "onChange",
    defaultValues: {
      // Step 1: Company
      razonSocial: customer.razonSocial || customer.accountName || "",
      personaContacto: customer.zohoOwnerName || "",
      email: customer.email || "",
      numeroIdentificacionFiscal: customer.cif || "",
      website: customer.website || "",

      // Step 2: Address
      direccion: customer.billingStreet || customer.shippingStreet || "",
      localidad: customer.billingCity || customer.shippingCity || "",
      provinciaEstado:
        customer.billingState ||
        customer.shippingState ||
        customer.comunidadAutonoma ||
        "",
      pais: customer.billingCountry || customer.shippingCountry || "",
      codigoPostal: customer.billingCode || customer.shippingCode || "",

      // Step 3: Commercial
      distribuidor: customer.zohoOwnerName || "",
      contactoDistribuidor: customer.zohoOwnerEmail || "",
      datosClienteUsuarioFinal: "",

      // Step 4-6: Empty fields
      descripcionProducto: "",
      fotosVideosUrls: [],
      contenedorTipos: [],
      condicionesSuelo: "",
      contenedorMedida: ContenedorMedida.VEINTE_PIES,
      contenedorMedidaOtro: "",
    },
  });

  const progress = useMemo(
    () => Math.round((currentStep / STEPS.length) * 100),
    [currentStep]
  );

  const handleNextStep = useCallback(async () => {
    const currentStepConfig = STEPS[currentStep - 1];
    const isValid = await form.trigger(currentStepConfig.fields);
    if (isValid) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      if (currentStep < STEPS.length) setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, form]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  }, [currentStep]);

  const goToStep = useCallback(
    (stepId: number) => {
      if (
        stepId < currentStep ||
        completedSteps.has(stepId - 1) ||
        stepId === 1
      ) {
        setCurrentStep(stepId);
      }
    },
    [currentStep, completedSteps]
  );

  const saveVisit = async (data: FormularioCSSSchema, status: VisitStatus) => {
    const isCompletada = status === VisitStatus.COMPLETADA;
    if (isCompletada) {
      setIsSubmitting(true);
    } else {
      setIsSavingDraft(true);
    }

    try {
      const response = await axios.post("/api/visits", {
        visitData: {
          customerId: customer.id,
          formType: VisitFormType.ANALISIS_CSS,
          visitDate: new Date(),
          status: status,
        },
        formularioData: data,
      });
      if (response.status === 201) {
        toast.success(
          isCompletada
            ? "Visita guardada exitosamente"
            : "Borrador guardado exitosamente"
        );
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error saving visit:", error);
      toast.error(error.response?.data?.error || "Error al guardar la visita");
    } finally {
      if (isCompletada) {
        setIsSubmitting(false);
      } else {
        setIsSavingDraft(false);
      }
    }
  };

  // Submit and save as COMPLETED
  const onSubmit = async (data: FormularioCSSSchema) => {
    await saveVisit(data, VisitStatus.COMPLETADA);
  };

  // Save as DRAFT
  const onSaveDraft = async () => {
    const data = form.getValues();
    await saveVisit(data, VisitStatus.BORRADOR);
  };

  const currentStepConfig = STEPS[currentStep - 1];
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === STEPS.length;
  const StepIcon = currentStepConfig.icon;

  const getStepColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> =
      {
        primary: {
          bg: "bg-primary/10",
          text: "text-primary",
          border: "border-primary",
        },
        blue: {
          bg: "bg-blue-500/10",
          text: "text-blue-600 dark:text-blue-400",
          border: "border-blue-500",
        },
        amber: {
          bg: "bg-amber-500/10",
          text: "text-amber-600 dark:text-amber-400",
          border: "border-amber-500",
        },
        violet: {
          bg: "bg-violet-500/10",
          text: "text-violet-600 dark:text-violet-400",
          border: "border-violet-500",
        },
        emerald: {
          bg: "bg-emerald-500/10",
          text: "text-emerald-600 dark:text-emerald-400",
          border: "border-emerald-500",
        },
        rose: {
          bg: "bg-rose-500/10",
          text: "text-rose-600 dark:text-rose-400",
          border: "border-rose-500",
        },
      };
    return colors[color] || colors.primary;
  };

  const currentColors = getStepColorClasses(currentStepConfig.color);

  // ==================== FIELD WRAPPER COMPONENT ====================
  const FieldWrapper = ({
    children,
    icon: Icon,
    className,
  }: {
    children: React.ReactNode;
    icon?: React.ElementType;
    className?: string;
  }) => (
    <div
      className={cn(
        "group relative",
        Icon && "[&_input]:pl-10 [&_textarea]:pl-10",
        className
      )}
    >
      {children}
      {Icon && (
        <Icon className="absolute left-3 top-10 size-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors pointer-events-none z-10" />
      )}
    </div>
  );

  // ==================== STEP CONTENT ====================

  // ==================== STEP 1: EMPRESA ====================
  const Step1Content = (
    <div className="space-y-3">
      {/* Header del paso */}
      <div className="flex items-center gap-3 pb-2 border-b">
        <div className={cn("p-2.5 rounded-xl", currentColors.bg)}>
          <Building2 className={cn("size-4", currentColors.text)} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-xs">
            Información de la empresa
          </h3>
          <p className="text-xs text-muted-foreground text-pretty">
            Datos principales del cliente
          </p>
        </div>
      </div>

      {/* Razón social - campo principal destacado */}
      <FieldWrapper icon={Building2}>
        <FormField
          control={form.control}
          name="razonSocial"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                Razón social
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nombre legal de la empresa"
                  className="h-12 text-xs bg-background/50 border-input focus:ring-2 focus:ring-primary/20 transition-all"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </FieldWrapper>

      {/* Grid de 2 columnas para contacto y email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper icon={User}>
          <FormField
            control={form.control}
            name="personaContacto"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                  Persona de contacto
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nombre completo"
                    className="h-12 text-xs bg-background/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>

        <FieldWrapper icon={Mail}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                  Email
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="correo@empresa.com"
                    className="h-12 text-xs bg-background/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>
      </div>

      {/* Grid para NIF y Website */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper icon={Hash}>
          <FormField
            control={form.control}
            name="numeroIdentificacionFiscal"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  NIF/CIF
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Identificación fiscal"
                    className="h-12 text-xs bg-background/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>

        <FieldWrapper icon={Link2}>
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Sitio web
                </FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://www.ejemplo.com"
                    className="h-12 text-xs bg-background/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>
      </div>
    </div>
  );

  // ==================== STEP 2: UBICACIÓN ====================
  const Step2Content = (
    <div className="space-y-3">
      {/* Header del paso */}
      <div className="flex items-center gap-3 pb-2 border-b">
        <div className={cn("p-2.5 rounded-xl", currentColors.bg)}>
          <MapPin className={cn("size-4", currentColors.text)} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-xs">Ubicación</h3>
          <p className="text-xs text-muted-foreground text-pretty">
            Dirección completa del cliente
          </p>
        </div>
      </div>

      {/* Dirección completa */}
      <FieldWrapper icon={Home}>
        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                Dirección
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Calle, número, piso, puerta..."
                  className="h-12 text-xs bg-background/50"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </FieldWrapper>

      {/* Grid para localidad y CP */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <FieldWrapper icon={Navigation}>
            <FormField
              control={form.control}
              name="localidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                    Localidad
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ciudad"
                      className="h-12 text-xs bg-background/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </FieldWrapper>
        </div>

        <FieldWrapper icon={Hash}>
          <FormField
            control={form.control}
            name="codigoPostal"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  C.P.
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="12345"
                    className="h-12 text-xs bg-background/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>
      </div>

      {/* Grid para provincia y país */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper icon={MapPinned}>
          <FormField
            control={form.control}
            name="provinciaEstado"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                  Provincia/Estado
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Provincia o Estado"
                    className="h-12 text-xs bg-background/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>

        <FieldWrapper icon={Flag}>
          <FormField
            control={form.control}
            name="pais"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                  País
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: España"
                    className="h-12 text-xs bg-background/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>
      </div>
    </div>
  );

  // ==================== STEP 3: COMERCIAL ====================
  const Step3Content = (
    <div className="space-y-3">
      {/* Header del paso */}
      <div className="flex items-center gap-3 pb-2 border-b">
        <div className={cn("p-2.5 rounded-xl", currentColors.bg)}>
          <Users className={cn("size-4", currentColors.text)} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-xs">
            Información comercial
          </h3>
          <p className="text-xs text-muted-foreground text-pretty">
            Datos de distribución y ventas
          </p>
        </div>
      </div>

      {/* Grid para distribuidor y contacto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWrapper icon={Briefcase}>
          <FormField
            control={form.control}
            name="distribuidor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Distribuidor
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nombre del distribuidor"
                    className="h-12 text-xs bg-background/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>

        <FieldWrapper icon={Phone}>
          <FormField
            control={form.control}
            name="contactoDistribuidor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Contacto distribuidor
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email o teléfono"
                    className="h-12 text-xs bg-background/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>
      </div>

      {/* Fecha de cierre */}
      <FormField
        control={form.control}
        name="fechaCierre"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <CalendarDays className="size-4" />
              Fecha de cierre estimada
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-12 w-full justify-start text-left font-normal text-sm",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="size-4" />
                    {field.value
                      ? format(field.value, "PPP", { locale: es })
                      : "Seleccionar fecha"}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {/* Notas adicionales */}
      <FieldWrapper>
        <FormField
          control={form.control}
          name="datosClienteUsuarioFinal"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-muted-foreground">
                Notas del usuario final
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Información adicional sobre el cliente o proyecto..."
                  className="min-h-[120px] text-xs bg-background/50 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </FieldWrapper>
    </div>
  );

  // ==================== STEP 4: PRODUCTO ====================
  const Step4Content = (
    <div className="space-y-3">
      {/* Header del paso */}
      <div className="flex items-center gap-3 pb-2 border-b">
        <div className={cn("p-2.5 rounded-xl", currentColors.bg)}>
          <FileText className={cn("size-4", currentColors.text)} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-xs">
            Descripción del producto
          </h3>
          <p className="text-xs text-muted-foreground text-pretty">
            Detalle las necesidades del proyecto
          </p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="descripcionProducto"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
              Descripción detallada
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describa detalladamente el producto..."
                className="min-h-[220px] text-xs bg-background/50 resize-none leading-relaxed"
                {...field}
              />
            </FormControl>
            <FormDescription className="text-xs text-muted-foreground flex items-start gap-2 mt-3 p-3 bg-muted/50 rounded-lg border">
              <Sparkles className="size-4 shrink-0 mt-0.5 text-primary" />
              <span>
                Incluya toda la información relevante: capacidades, dimensiones,
                frecuencia de uso, condiciones ambientales y requisitos
                especiales del proyecto.
              </span>
            </FormDescription>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </div>
  );

  // ==================== STEP 5: CONTENEDOR ====================
  const Step5Content = (
    <div className="space-y-3">
      {/* Header del paso */}
      <div className="flex items-center gap-3 pb-2 border-b">
        <div className={cn("p-2.5 rounded-xl", currentColors.bg)}>
          <Package className={cn("size-4", currentColors.text)} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-xs">
            Tipo de contenedor
          </h3>
          <p className="text-xs text-muted-foreground text-pretty">
            Seleccione las opciones aplicables
          </p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="contenedorTipos"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium flex items-center gap-1.5 mb-3">
              Tipo de contenedor
              <span className="text-destructive">*</span>
            </FormLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(CONTENEDOR_TIPO_LABELS).map(([key, label]) => {
                const isChecked = field.value?.includes(key as ContenedorTipo);
                const Icon = CONTENEDOR_TIPO_ICONS[key as ContenedorTipo];
                return (
                  <Label
                    key={key}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all select-none group",
                      isChecked
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-input hover:border-primary/50 hover:bg-accent/50"
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        isChecked
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-medium block text-balance">{label}</span>
                    </div>
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          field.onChange([...field.value, key]);
                        } else {
                          field.onChange(
                            field.value?.filter(
                              (v: ContenedorTipo) => v !== key
                            )
                          );
                        }
                      }}
                      className="size-4 border-2"
                    />
                  </Label>
                );
              })}
            </div>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {/* Sección de operación */}
      <div className="pt-4 border-t space-y-4">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <HardHat className="size-4" />
          <span>Datos de operación</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contenedoresPorSemana"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Contenedores por semana
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ej: 5"
                    min={1}
                    className="h-12 text-xs bg-background/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="condicionesSuelo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Condiciones del suelo
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Compactado, rocoso..."
                    className="h-12 text-xs bg-background/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );

  // ==================== STEP 6: MEDIDAS ====================
  const Step6Content = (
    <div className="space-y-3">
      {/* Header del paso */}
      <div className="flex items-center gap-3 pb-2 border-b">
        <div className={cn("p-2.5 rounded-xl", currentColors.bg)}>
          <Ruler className={cn("size-4", currentColors.text)} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-xs">
            Medidas del contenedor
          </h3>
          <p className="text-xs text-muted-foreground text-pretty">
            Seleccione el tamaño requerido
          </p>
        </div>
      </div>

      <FormField
        control={form.control}
        name="contenedorMedida"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium flex items-center gap-1.5 mb-3">
              Medida del contenedor
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-2 gap-3"
              >
                {Object.entries(CONTENEDOR_MEDIDA_LABELS).map(
                  ([key, label]) => (
                    <Label
                      key={key}
                      className={cn(
                        "flex items-center justify-between rounded-xl border-2 p-4 cursor-pointer transition-all select-none",
                        field.value === key
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-input hover:border-primary/50 hover:bg-accent/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={key} className="size-5" />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      {field.value === key && (
                        <Check className="size-5 text-primary" />
                      )}
                    </Label>
                  )
                )}
              </RadioGroup>
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      {form.watch("contenedorMedida") === ContenedorMedida.OTRO && (
        <FormField
          control={form.control}
          name="contenedorMedidaOtro"
          render={({ field }) => (
            <FormItem className="animate-in fade-in-50 slide-in-from-top-2 duration-300">
              <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                Especificar medida
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: 45 pies, 12m x 2.5m x 2.9m..."
                  className="h-12 text-xs bg-background/50"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                Indique las dimensiones exactas (largo x ancho x alto)
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      )}
    </div>
  );

  const renderStepContent = () => {
    return (
      <>
        <div className={cn(currentStep !== 1 && "hidden")}>{Step1Content}</div>
        <div className={cn(currentStep !== 2 && "hidden")}>{Step2Content}</div>
        <div className={cn(currentStep !== 3 && "hidden")}>{Step3Content}</div>
        <div className={cn(currentStep !== 4 && "hidden")}>{Step4Content}</div>
        <div className={cn(currentStep !== 5 && "hidden")}>{Step5Content}</div>
        <div className={cn(currentStep !== 6 && "hidden")}>{Step6Content}</div>
      </>
    );
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh] bg-background">
      {/* ==================== HEADER ==================== */}
      <header className="shrink-0 px-4 pt-2 pb-2 bg-linear-to-b from-muted/40 to-background">
        {/* Title Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "size-8 rounded-2xl flex items-center justify-center shadow-sm transition-colors",
                currentColors.bg
              )}
            >
              <StepIcon className={cn("size-4", currentColors.text)} />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                {currentStepConfig.name}
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                {currentStepConfig.description}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <Progress value={progress} className="h-2 mb-4" />

        {/* Step Indicators */}
        <div className="flex items-center justify-between gap-1">
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = currentStep === step.id;
            const isAccessible =
              step.id < currentStep ||
              completedSteps.has(step.id - 1) ||
              step.id === 1;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  type="button"
                  onClick={() => goToStep(step.id)}
                  disabled={!isAccessible}
                  className={cn(
                    "relative flex flex-col items-center justify-center transition-all duration-300 cursor-pointer",
                    "group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
                  )}
                  title={step.name}
                >
                  <div
                    className={cn(
                      "size-10 sm:size-11 rounded-xl flex items-center justify-center transition-all duration-300 border-2",
                      isCurrent
                        ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110"
                        : isCompleted
                        ? "border-primary bg-primary/10 text-primary"
                        : isAccessible
                        ? "border-muted-foreground/30 bg-background text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/50"
                        : "border-muted/50 bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                    )}
                  >
                    {isCompleted && !isCurrent ? (
                      <Check className="size-5" strokeWidth={2.5} />
                    ) : (
                      <Icon className="size-4 sm:size-5" />
                    )}
                  </div>

                  <span
                    className={cn(
                      "hidden md:block text-[10px] mt-1.5 font-medium transition-colors",
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                        ? "text-primary/80"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.name}
                  </span>
                </button>

                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-1 sm:mx-2 rounded-full transition-all duration-500",
                      completedSteps.has(step.id) ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </header>

      {/* ==================== CONTENT ==================== */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 max-w-2xl mx-auto">
              <div className="animate-in fade-in-50 slide-in-from-right-4 duration-300">
                {renderStepContent()}
              </div>
            </div>
          </main>

          {/* ==================== FOOTER ==================== */}
          <footer className="shrink-0 px-4 sm:px-6 py-4 border-t bg-muted/20 backdrop-blur-sm">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
              {/* Back button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={isFirstStep ? onBack : handlePrevStep}
                disabled={isSubmitting || isSavingDraft}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline">
                  {isFirstStep ? "Salir" : "Atrás"}
                </span>
              </Button>

              {/* Step counter */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                <span className="text-sm font-semibold text-foreground">
                  {currentStep}
                </span>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">
                  {STEPS.length}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {isLastStep ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onSaveDraft}
                      disabled={isSubmitting || isSavingDraft}
                      className="gap-2"
                    >
                      {isSavingDraft ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <FileDown className="size-4" />
                      )}
                      <span className="hidden sm:inline">Borrador</span>
                    </Button>

                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSubmitting || isSavingDraft}
                      className="gap-2 shadow-lg shadow-primary/25"
                    >
                      {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="size-4" />
                          <span>Guardar y enviar</span>
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleNextStep}
                    disabled={isSubmitting || isSavingDraft}
                    className="gap-2"
                  >
                    <span className="hidden sm:inline">Siguiente</span>
                    <ArrowRight className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </footer>
        </form>
      </Form>
    </div>
  );
}
