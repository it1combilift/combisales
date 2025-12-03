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
import { DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
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
  CalendarIcon,
  Building2,
  FileText,
  Package,
  Ruler,
  MapPin,
  Users,
  Globe,
  Check,
  CheckCircle2,
} from "lucide-react";

import {
  VisitFormType,
  ContenedorTipo,
  ContenedorMedida,
} from "@prisma/client";

import {
  CONTENEDOR_TIPO_LABELS,
  CONTENEDOR_MEDIDA_LABELS,
  Customer,
} from "@/interfaces/visits";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FormularioCSSAnalisisProps {
  customer: Customer;
  onBack: () => void;
  onSuccess: () => void;
}

interface StepConfig {
  id: number;
  name: string;
  shortName: string;
  icon: React.ElementType;
  fields: (keyof FormularioCSSSchema)[];
}

// ==================== CONSTANTS ====================
const STEPS: StepConfig[] = [
  {
    id: 1,
    name: "Empresa",
    shortName: "Empresa",
    icon: Building2,
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
    name: "Dirección",
    shortName: "Dirección",
    icon: MapPin,
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
    shortName: "Comercial",
    icon: Users,
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
    shortName: "Producto",
    icon: FileText,
    fields: ["descripcionProducto"],
  },
  {
    id: 5,
    name: "Contenedor",
    shortName: "Contenedor",
    icon: Package,
    fields: ["contenedorTipos", "contenedoresPorSemana", "condicionesSuelo"],
  },
  {
    id: 6,
    name: "Medidas",
    shortName: "Medidas",
    icon: Ruler,
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
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const form = useForm<FormularioCSSSchema>({
    resolver: zodResolver(formularioCSSSchema),
    mode: "onChange",
    defaultValues: {
      // Paso 1: Empresa - usa razonSocial si existe, si no accountName
      razonSocial: customer.razonSocial || customer.accountName || "",
      personaContacto: customer.zohoOwnerName || "",
      email: customer.email || "",
      numeroIdentificacionFiscal: customer.cif || "",
      website: customer.website || "",

      // Paso 2: Dirección - prefiere billing, luego shipping
      direccion: customer.billingStreet || customer.shippingStreet || "",
      localidad: customer.billingCity || customer.shippingCity || "",
      provinciaEstado:
        customer.billingState ||
        customer.shippingState ||
        customer.comunidadAutonoma ||
        "",
      pais: customer.billingCountry || customer.shippingCountry || "",
      codigoPostal: customer.billingCode || customer.shippingCode || "",

      // Paso 3: Comercial - usa datos del propietario de Zoho
      distribuidor: customer.zohoOwnerName || "",
      contactoDistribuidor: customer.zohoOwnerEmail || "",
      datosClienteUsuarioFinal: "",

      // Paso 4-6: Campos vacíos (específicos de cada visita)
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

  const onSubmit = async (data: FormularioCSSSchema) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/visits", {
        visitData: {
          customerId: customer.id,
          formType: VisitFormType.ANALISIS_CSS,
          visitDate: new Date(),
        },
        formularioData: data,
      });
      if (response.status === 201) {
        toast.success("Visita creada exitosamente");
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error creating visit:", error);
      toast.error(error.response?.data?.error || "Error al crear la visita");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepConfig = STEPS[currentStep - 1];
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === STEPS.length;
  const StepIcon = currentStepConfig.icon;

  // ==================== STEP CONTENT ====================

  const Step1Content = (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="razonSocial"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">
              Razón social *
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Nombre de la empresa"
                className="h-11 text-xs sm:text-sm"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="personaContacto"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Persona de contacto <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nombre completo"
                  className="h-11 text-xs sm:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Email <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="correo@empresa.com"
                  className="h-11 text-xs sm:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="numeroIdentificacionFiscal"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">NIF/CIF</FormLabel>
              <FormControl>
                <Input
                  placeholder="Identificación fiscal"
                  className="h-11 text-xs sm:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Sitio web</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://..."
                  className="h-11 text-xs sm:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  const Step2Content = (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="direccion"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">
              Dirección <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Calle, número, piso..."
                className="h-11 text-xs sm:text-sm"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="localidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Localidad <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ciudad"
                  className="h-11 text-xs sm:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="codigoPostal"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">C.P.</FormLabel>
              <FormControl>
                <Input
                  placeholder="Código postal"
                  className="h-11 text-xs sm:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="provinciaEstado"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Provincia/Estado <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Provincia o Estado"
                  className="h-11 text-xs sm:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pais"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                País <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="País"
                  className="h-11 text-xs sm:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  const Step3Content = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="distribuidor"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Distribuidor
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nombre del distribuidor"
                  className="h-11 text-xs sm:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactoDistribuidor"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Contacto distribuidor
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Persona de contacto"
                  className="h-11 text-xs sm:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="fechaCierre"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">
              Fecha cierre estimada
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-11 w-full justify-start text-left font-normal text-xs sm:text-sm",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="size-4" />
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
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="datosClienteUsuarioFinal"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">
              Notas usuario final
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Información adicional..."
                className="resize-none min-h-24 text-xs sm:text-sm"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const Step4Content = (
    <FormField
      control={form.control}
      name="descripcionProducto"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            Descripción detallada <span className="text-destructive">*</span>
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder="Describa el producto, necesidades, aplicación, condiciones de trabajo..."
              className="resize-none min-h-[200px] text-xs sm:text-sm"
              {...field}
            />
          </FormControl>
          <FormDescription className="text-xs text-muted-foreground text-pretty">
            Incluya capacidades, dimensiones, frecuencia de uso y requisitos
            especiales.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const Step5Content = (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="contenedorTipos"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">
              Tipo de contenedor <span className="text-destructive">*</span>
            </FormLabel>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {Object.entries(CONTENEDOR_TIPO_LABELS).map(([key, label]) => {
                const isChecked = field.value?.includes(key as ContenedorTipo);
                return (
                  <Label
                    key={key}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer transition-all select-none text-xs sm:text-sm text-pretty",
                      isChecked
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "hover:bg-accent/50 border-input"
                    )}
                  >
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
                      className="size-4"
                    />
                    <span className="text-xs font-medium leading-tight">
                      {label}
                    </span>
                  </Label>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Globe className="size-3.5" />
          <span>Operación</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="contenedoresPorSemana"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Contenedores/Semana</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Cantidad"
                    min={1}
                    className="h-10 text-xs sm:text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="condicionesSuelo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Condiciones del suelo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Superficie, nivelación..."
                    className="h-10 text-xs sm:text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );

  const Step6Content = (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="contenedorMedida"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">
              Medida del contenedor <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-2 gap-2 mt-2"
              >
                {Object.entries(CONTENEDOR_MEDIDA_LABELS).map(
                  ([key, label]) => (
                    <Label
                      key={key}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer transition-all select-none",
                        field.value === key
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "hover:bg-accent/50 border-input"
                      )}
                    >
                      <RadioGroupItem value={key} className="size-4" />
                      <span className="text-xs sm:text-sm font-medium">
                        {label}
                      </span>
                    </Label>
                  )
                )}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {form.watch("contenedorMedida") === ContenedorMedida.OTRO && (
        <FormField
          control={form.control}
          name="contenedorMedidaOtro"
          render={({ field }) => (
            <FormItem className="animate-in fade-in-50 duration-200">
              <FormLabel className="text-sm">
                Especificar Medida <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: 45 pies, dimensiones..."
                  className="h-10 text-xs sm:text-sm"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground text-pretty">
                Indique dimensiones exactas (largo x ancho x alto)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Ready Card */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <p className="text-xs text-emerald-700 dark:text-emerald-300">
          Listo para guardar. Revise y confirme.
        </p>
      </div>
    </div>
  );

  const renderStepContent = () => {
    // Esto mantiene el estado del formulario persistente
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
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* ==================== HEADER ==================== */}
      <header className="shrink-0 px-4 pt-4 pb-3 border-b bg-linear-to-b from-muted/50 to-background">
        {/* Title Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
              <StepIcon className="size-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-semibold leading-tight">
                {currentStepConfig.name}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Paso {currentStep} de {STEPS.length}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground">{progress}%</span>
            <span className="text-[10px] text-muted-foreground">
              completado
            </span>
          </div>
        </div>

        {/* Modern Step Indicators */}
        <div className="flex items-center justify-between gap-1 sm:gap-2">
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
                    "relative flex items-center justify-center transition-all duration-200",
                    "size-8 sm:size-9 rounded-full border-2",
                    isCurrent
                      ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : isCompleted
                      ? "border-primary bg-primary/10 text-primary"
                      : isAccessible
                      ? "border-muted-foreground/30 bg-background text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/50"
                      : "border-muted/50 bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                  )}
                  title={step.name}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="size-4" strokeWidth={3} />
                  ) : (
                    <Icon className="size-3.5 sm:size-4" />
                  )}

                  {/* Step number badge */}
                  <span
                    className={cn(
                      "absolute -top-1 -right-1 flex items-center justify-center",
                      "size-4 text-[9px] font-bold rounded-full",
                      isCurrent
                        ? "bg-background text-primary border border-primary"
                        : isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {step.id}
                  </span>
                </button>

                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-1 sm:mx-2 rounded-full transition-colors duration-300",
                      completedSteps.has(step.id)
                        ? "bg-primary"
                        : "bg-muted-foreground/20"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step name on mobile */}
        <div className="mt-3 sm:hidden">
          <p className="text-center text-xs text-muted-foreground">
            {currentStepConfig.name}
          </p>
        </div>
      </header>

      {/* ==================== CONTENT ==================== */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0"
        >
          <main className="flex-1 overflow-y-auto p-3">
            <div className="w-full mx-auto">
              <div className="animate-in fade-in-50 duration-200">
                {renderStepContent()}
              </div>
            </div>
          </main>

          {/* ==================== FOOTER ==================== */}
          <footer className="shrink-0 px-4 py-3 border-t bg-muted/30">
            <div className="max-w-md mx-auto flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={isFirstStep ? onBack : handlePrevStep}
                disabled={isSubmitting}
                className="h-10 px-4 gap-2"
              >
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline">
                  {isFirstStep ? "Salir" : "Atrás"}
                </span>
              </Button>

              {/* Step counter - centered */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">{currentStep}</span>
                <span>/</span>
                <span>{STEPS.length}</span>
              </div>

              {isLastStep ? (
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="h-10 px-5 gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="size-4" />
                      <span>Guardar</span>
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleNextStep}
                  className="h-10 px-5 gap-2"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </footer>
        </form>
      </Form>
    </div>
  );
}
