"use client";

import axios from "axios";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Spinner } from "../ui/spinner";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/file-utils";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { DialogTitle } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useMemo, useCallback, useRef } from "react";
import { ALL_ALLOWED_TYPES, MAX_FILES } from "@/constants/constants";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  formularioCSSSchema,
  FormularioCSSSchema,
  ArchivoSubido,
} from "@/schemas/visits";

import {
  FORM_STEPS,
  CONTENEDOR_TIPO_ICONS,
  getStepColorClasses,
} from "@/constants/visits";

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
  Building2,
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
  Sparkles,
  FileDown,
  Upload,
  ImageIcon,
  Video,
  FileIcon,
  Camera,
  VideoIcon,
  FolderOpen,
  Send,
  EyeIcon,
  Trash2,
} from "lucide-react";

import {
  VisitFormType,
  VisitStatus,
  ContenedorTipo,
  ContenedorMedida,
  TipoArchivo,
} from "@prisma/client";

import {
  CONTENEDOR_TIPO_LABELS,
  CONTENEDOR_MEDIDA_LABELS,
  FormularioCSSAnalisisProps,
} from "@/interfaces/visits";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function FormularioCSSAnalisis({
  customer,
  onBack,
  onSuccess,
  existingVisit,
}: FormularioCSSAnalisisProps) {
  const isEditing = !!existingVisit;
  const formulario = existingVisit?.formularioCSSAnalisis;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    isEditing ? new Set([1, 2, 3, 4, 5, 6, 7]) : new Set()
  );

  const getDefaultValues = (): FormularioCSSSchema => {
    if (formulario) {
      return {
        // Step 1: Company
        razonSocial: formulario.razonSocial || "",
        personaContacto: formulario.personaContacto || "",
        email: formulario.email || "",
        numeroIdentificacionFiscal: formulario.numeroIdentificacionFiscal || "",
        website: formulario.website || "",

        // Step 2: Address
        direccion: formulario.direccion || "",
        localidad: formulario.localidad || "",
        provinciaEstado: formulario.provinciaEstado || "",
        pais: formulario.pais || "",
        codigoPostal: formulario.codigoPostal || "",

        // Step 3: Commercial
        distribuidor: formulario.distribuidor || "",
        contactoDistribuidor: formulario.contactoDistribuidor || "",
        datosClienteUsuarioFinal: formulario.datosClienteUsuarioFinal || "",
        fechaCierre: formulario.fechaCierre
          ? new Date(formulario.fechaCierre)
          : undefined,

        // Step 4: Product description
        descripcionProducto: formulario.descripcionProducto || "",

        // Step 5: Container types
        contenedorTipos: (formulario.contenedorTipos as ContenedorTipo[]) || [],
        contenedoresPorSemana: formulario.contenedoresPorSemana || undefined,
        condicionesSuelo: formulario.condicionesSuelo || "",

        // Step 6: Container measurements
        contenedorMedida:
          (formulario.contenedorMedida as ContenedorMedida) ||
          ContenedorMedida.VEINTE_PIES,
        contenedorMedidaOtro: formulario.contenedorMedidaOtro || "",

        // Step 7: Files
        archivos:
          formulario.archivos?.map((archivo) => ({
            nombre: archivo.nombre,
            tipoArchivo: archivo.tipoArchivo as TipoArchivo,
            mimeType: archivo.mimeType,
            tamanio: archivo.tamanio,
            cloudinaryId: archivo.cloudinaryId,
            cloudinaryUrl: archivo.cloudinaryUrl,
            cloudinaryType: archivo.cloudinaryType,
            ancho: archivo.ancho ?? undefined,
            alto: archivo.alto ?? undefined,
            duracion: archivo.duracion ?? undefined,
            formato: archivo.formato,
          })) ?? [],
      };
    }

    return {
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

      // Step 4-7: Empty fields
      descripcionProducto: "",
      contenedorTipos: [],
      condicionesSuelo: "",
      contenedorMedida: ContenedorMedida.VEINTE_PIES,
      contenedorMedidaOtro: "",
      archivos: [],
    };
  };

  const form = useForm<FormularioCSSSchema>({
    resolver: zodResolver(formularioCSSSchema),
    mode: "onChange",
    defaultValues: getDefaultValues(),
  });

  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraPhotoRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLInputElement>(null);

  const progress = useMemo(
    () => Math.round((currentStep / FORM_STEPS.length) * 100),
    [currentStep]
  );

  const handleNextStep = useCallback(async () => {
    const currentStepConfig = FORM_STEPS[currentStep - 1];
    const isValid = await form.trigger(currentStepConfig.fields);
    if (isValid) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      if (currentStep < FORM_STEPS.length) setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, form]);

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  }, [currentStep]);

  const goToStep = useCallback(
    (stepId: number) => {
      // In edit mode, allow navigation to any step
      if (isEditing) {
        setCurrentStep(stepId);
        return;
      }
      // In create mode, check accessibility
      if (
        stepId < currentStep ||
        completedSteps.has(stepId - 1) ||
        stepId === 1
      ) {
        setCurrentStep(stepId);
      }
    },
    [currentStep, completedSteps, isEditing]
  );

  const saveVisit = async (
    data: FormularioCSSSchema,
    status: VisitStatus,
    saveType: "submit" | "draft" | "changes" = "submit"
  ) => {
    if (saveType === "submit") {
      setIsSubmitting(true);
    } else if (saveType === "draft") {
      setIsSavingDraft(true);
    } else {
      setIsSavingChanges(true);
    }

    try {
      let response;

      if (isEditing && existingVisit) {
        response = await axios.put(`/api/visits/${existingVisit.id}`, {
          visitData: {
            status: status,
          },
          formularioData: data,
        });

        if (response.status === 200) {
          const messages = {
            submit: "Visita actualizada y enviada exitosamente",
            draft: "Borrador actualizado exitosamente",
            changes: "Cambios guardados exitosamente",
          };
          toast.success(messages[saveType]);
          onSuccess();
        }
      } else {
        response = await axios.post("/api/visits", {
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
            saveType === "submit"
              ? "Visita guardada exitosamente"
              : "Borrador guardado exitosamente"
          );
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Error saving visit:", error);
      toast.error(error.response?.data?.error || "Error al guardar la visita");
    } finally {
      if (saveType === "submit") {
        setIsSubmitting(false);
      } else if (saveType === "draft") {
        setIsSavingDraft(false);
      } else {
        setIsSavingChanges(false);
      }
    }
  };

  // Submit and save as COMPLETED
  const onSubmit = async (data: FormularioCSSSchema) => {
    await saveVisit(data, VisitStatus.COMPLETADA, "submit");
  };

  // Save as DRAFT (for new visits)
  const onSaveDraft = async () => {
    const data = form.getValues();
    await saveVisit(data, VisitStatus.BORRADOR, "draft");
  };

  // Save changes keeping current status (only for editing mode)
  const onSaveChanges = async () => {
    const data = form.getValues();
    const currentStatus = existingVisit?.status || VisitStatus.BORRADOR;
    await saveVisit(data, currentStatus, "changes");
  };

  const currentStepConfig = FORM_STEPS[currentStep - 1];
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === FORM_STEPS.length;
  const StepIcon = currentStepConfig.icon;

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
        Icon && "[&_input]:pl-11 [&_textarea]:pl-11",
        className
      )}
    >
      {children}
      {Icon && (
        <div className="absolute left-3 top-11 size-4 flex items-center justify-center pointer-events-none z-10">
          <Icon className="size-3 text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-200" />
        </div>
      )}
    </div>
  );

  // ==================== STEP CONTENT ====================

  // ==================== STEP 1: EMPRESA ====================
  const Step1Content = (
    <div className="space-y-4 sm:space-y-5">
      <FieldWrapper icon={Building2}>
        <FormField
          control={form.control}
          name="razonSocial"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                Razón social
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nombre legal de la empresa"
                  className="h-11 sm:h-12 text-sm bg-background/50 border-input/80 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-lg"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </FieldWrapper>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <FieldWrapper icon={User}>
          <FormField
            control={form.control}
            name="personaContacto"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  Persona de contacto
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nombre completo"
                    className="h-11 sm:h-12 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
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
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  Email
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="correo@empresa.com"
                    className="h-11 sm:h-12 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <FieldWrapper icon={Hash}>
          <FormField
            control={form.control}
            name="numeroIdentificacionFiscal"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  NIF/CIF
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Identificación fiscal"
                    className="h-11 sm:h-12 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
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
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  Sitio web
                </FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://www.ejemplo.com"
                    className="h-11 sm:h-12 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
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
    <div className="space-y-4 sm:space-y-5">
      <FieldWrapper icon={Home}>
        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                Dirección
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Calle, número, piso, puerta..."
                  className="h-11 sm:h-12 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </FieldWrapper>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="sm:col-span-2">
          <FieldWrapper icon={Navigation}>
            <FormField
              control={form.control}
              name="localidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                    Localidad
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ciudad"
                      className="h-11 sm:h-12 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
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
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  C.P.
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="12345"
                    className="h-11 sm:h-12 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <FieldWrapper icon={MapPinned}>
          <FormField
            control={form.control}
            name="provinciaEstado"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  Provincia/Estado
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Provincia o Estado"
                    className="h-11 sm:h-12 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
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
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  País
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: España"
                    className="h-11 sm:h-12 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
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
    <div className="space-y-4 sm:space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <FieldWrapper icon={Briefcase}>
          <FormField
            control={form.control}
            name="distribuidor"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  Distribuidor
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nombre del distribuidor"
                    className="h-11 sm:h-12 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
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
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  Contacto distribuidor
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Email o teléfono"
                    className="h-11 sm:h-12 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </FieldWrapper>
      </div>

      <FormField
        control={form.control}
        name="fechaCierre"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
              Fecha de cierre estimada
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-11 sm:h-12 w-full justify-start text-left font-normal text-sm rounded-lg border-input/80",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="size-4 mr-2" />
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

      <FieldWrapper>
        <FormField
          control={form.control}
          name="datosClienteUsuarioFinal"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                Notas del usuario final
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Información adicional sobre el cliente o proyecto..."
                  className="min-h-[100px] sm:min-h-[120px] text-sm bg-background/50 resize-none border-input/80 focus:border-primary rounded-lg leading-relaxed"
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
    <div className="space-y-4 sm:space-y-5">
      <FormField
        control={form.control}
        name="descripcionProducto"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
              Descripción detallada
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describa detalladamente el producto, incluyendo capacidades, dimensiones, frecuencia de uso..."
                className="min-h-[180px] sm:min-h-[220px] text-sm bg-background/50 resize-none leading-relaxed border-input/80 focus:border-primary rounded-lg"
                {...field}
              />
            </FormControl>
            <FormDescription className="text-xs sm:text-sm text-muted-foreground flex items-start gap-3 mt-4 p-3 sm:p-4 bg-linear-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
              <div className="size-8 sm:size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="size-4 sm:size-5 text-primary" />
              </div>
              <span className="leading-relaxed">
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
    <div className="space-y-4 sm:space-y-5">
      <FormField
        control={form.control}
        name="contenedorTipos"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
              Tipo de contenedor
              <span className="text-destructive">*</span>
            </FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CONTENEDOR_TIPO_LABELS).map(([key, label]) => {
                const isChecked = field.value?.includes(key as ContenedorTipo);
                const Icon = CONTENEDOR_TIPO_ICONS[key as ContenedorTipo];
                return (
                  <Label
                    key={key}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border-2 p-2 cursor-pointer transition-all duration-200 select-none group",
                      isChecked
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                        : "border-input/80 hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm"
                    )}
                  >
                    <div
                      className={cn(
                        "size-8 rounded-xl flex items-center justify-center transition-all duration-200",
                        isChecked
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium block text-balance">
                        {label}
                      </span>
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
                      className="size-4 border-2 rounded-sm border-input/80 bg-background/50 focus:ring-2 focus:ring-primary transition-all duration-200"
                    />
                  </Label>
                );
              })}
            </div>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />

      <div className="pt-4 border-t border-border/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <FormField
            control={form.control}
            name="contenedoresPorSemana"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  Contenedores por semana
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ej: 5"
                    min={1}
                    className="h-11 sm:h-12 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : Number(value));
                    }}
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
                <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                  Condiciones del suelo
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Compactado, rocoso..."
                    className="h-11 sm:h-12 text-sm bg-background/50 border-input/80 focus:border-primary rounded-lg"
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
    <div className="space-y-4 sm:space-y-5">
      <FormField
        control={form.control}
        name="contenedorMedida"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
              Medida del contenedor
              <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3"
              >
                {Object.entries(CONTENEDOR_MEDIDA_LABELS).map(
                  ([key, label]) => (
                    <Label
                      key={key}
                      className={cn(
                        "flex items-center justify-between rounded-xl border-2 p-3 sm:p-4 cursor-pointer transition-all duration-200 select-none",
                        field.value === key
                          ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                          : "border-input/80 hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={key} className="size-4" />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      {field.value === key && (
                        <div className="size-6 rounded-full bg-primary/15 flex items-center justify-center">
                          <Check className="size-3.5 text-primary" />
                        </div>
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
            <FormItem className="animate-in fade-in-50 slide-in-from-top-2 duration-300 p-4 bg-muted/30 rounded-xl border border-border/60">
              <FormLabel className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                Especificar medida
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: 45 pies, 12m x 2.5m x 2.9m..."
                  className="h-11 sm:h-12 text-sm bg-background border-input/80 focus:border-primary rounded-lg"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs sm:text-sm text-muted-foreground">
                Indique las dimensiones exactas (largo x ancho x alto)
              </FormDescription>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      )}
    </div>
  );

  // ==================== FILE HANDLING FUNCTIONS ====================
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const currentArchivos = form.getValues("archivos") || [];
      const remainingSlots = MAX_FILES - currentArchivos.length;

      if (files.length > remainingSlots) {
        toast.error(`Solo puedes subir ${remainingSlots} archivo(s) más`);
        return;
      }

      const validFiles: File[] = [];
      for (const file of Array.from(files)) {
        if (!ALL_ALLOWED_TYPES.includes(file.type)) {
          toast.error(`${file.name}: Tipo de archivo no permitido`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      setIsUploading(true);
      setUploadingFiles(validFiles);

      try {
        const formData = new FormData();
        validFiles.forEach((file) => formData.append("files", file));
        formData.append("folder", `combisales/visitas/${customer.id}`);

        const response = await axios.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress((prev) => ({ ...prev, total: progress }));
            }
          },
        });

        if (response.data.files && response.data.files.length > 0) {
          const newArchivos = [...currentArchivos, ...response.data.files];
          form.setValue("archivos", newArchivos, { shouldValidate: true });
          toast.success(response.data.message);
        }

        if (response.data.errors && response.data.errors.length > 0) {
          response.data.errors.forEach((error: string) => toast.error(error));
        }
      } catch (error: any) {
        console.error("Error uploading files:", error);
        toast.error(
          error.response?.data?.error || "Error al subir los archivos"
        );
      } finally {
        setIsUploading(false);
        setUploadingFiles([]);
        setUploadProgress({});
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [form, customer.id]
  );

  // Remove file handler
  const handleRemoveFile = useCallback(
    async (archivo: ArchivoSubido) => {
      setDeletingFileId(archivo.cloudinaryId);
      try {
        await axios.delete(
          `/api/upload/${encodeURIComponent(archivo.cloudinaryId)}?type=${
            archivo.cloudinaryType
          }`
        );

        const currentArchivos = form.getValues("archivos") || [];
        const newArchivos = currentArchivos.filter(
          (a) => a.cloudinaryId !== archivo.cloudinaryId
        );
        form.setValue("archivos", newArchivos, { shouldValidate: true });
        toast.success("Archivo eliminado");
      } catch (error) {
        console.error("Error removing file:", error);
        toast.error("Error al eliminar el archivo");
      } finally {
        setDeletingFileId(null);
      }
    },
    [form]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (files && files.length > 0 && fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        Array.from(files).forEach((file) => dataTransfer.items.add(file));
        fileInputRef.current.files = dataTransfer.files;
        handleFileSelect({
          target: { files: dataTransfer.files },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    },
    [handleFileSelect]
  );

  const getFileIcon = (tipoArchivo: TipoArchivo) => {
    switch (tipoArchivo) {
      case TipoArchivo.IMAGEN:
        return ImageIcon;
      case TipoArchivo.VIDEO:
        return VideoIcon;
      default:
        return FileIcon;
    }
  };

  // ==================== STEP 7: ARCHIVOS ====================
  const archivos = form.watch("archivos") || [];
  const [isDragging, setIsDragging] = useState(false);

  const Step7Content = (
    <div className="space-y-3 sm:space-y-4">
      {/* Hidden inputs */}
      <input
        ref={cameraPhotoRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading || archivos.length >= MAX_FILES}
      />
      <input
        ref={cameraVideoRef}
        type="file"
        accept="video/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading || archivos.length >= MAX_FILES}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALL_ALLOWED_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading || archivos.length >= MAX_FILES}
      />

      {/* Quick action buttons - visible on all devices */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-2 h-10 px-4 rounded-xl border-2",
            "transition-all duration-200 hover:border-blue-500/50 hover:bg-blue-500/5",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          onClick={() => cameraPhotoRef.current?.click()}
          disabled={isUploading || archivos.length >= MAX_FILES}
        >
          <div className="size-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Camera className="size-4 text-blue-600" />
          </div>
          <span className="text-xs sm:text-sm font-medium">Foto</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-2 h-10 px-4 rounded-xl border-2",
            "transition-all duration-200 hover:border-violet-500/50 hover:bg-violet-500/5",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          onClick={() => cameraVideoRef.current?.click()}
          disabled={isUploading || archivos.length >= MAX_FILES}
        >
          <div className="size-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <Video className="size-4 text-violet-600" />
          </div>
          <span className="text-xs sm:text-sm font-medium">Video</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-2 h-10 px-4 rounded-xl border-2",
            "transition-all duration-200 hover:border-amber-500/50 hover:bg-amber-500/5",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || archivos.length >= MAX_FILES}
        >
          <div className="size-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <FolderOpen className="size-4 text-amber-600" />
          </div>
          <span className="text-xs sm:text-sm font-medium">Archivos</span>
        </Button>
      </div>

      {/* Modern Drop Zone - Desktop */}
      <div
        className={cn(
          "relative rounded-2xl transition-all duration-300 overflow-hidden",
          "border-2 border-dashed",
          isDragging
            ? "border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20"
            : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30",
          isUploading && "pointer-events-none",
          archivos.length >= MAX_FILES &&
            "opacity-50 pointer-events-none cursor-not-allowed"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          setIsDragging(false);
          handleDrop(e);
        }}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <div className="p-3 cursor-pointer">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            {isUploading ? (
              <>
                <div className="size-8 sm:size-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                  <Spinner variant="bars" size={14} />
                </div>
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-semibold">
                    Subiendo archivos...
                  </p>
                  <div className="w-48 sm:w-64 mx-auto">
                    <Progress
                      value={uploadProgress.total || 0}
                      className="h-2"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {uploadProgress.total || 0}% completado
                  </p>
                </div>
              </>
            ) : (
              <>
                <div
                  className={cn(
                    "size-8 sm:size-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                    isDragging
                      ? "bg-primary/20 scale-110"
                      : "bg-linear-to-br from-primary/10 to-primary/5"
                  )}
                >
                  <Upload
                    className={cn(
                      "size-4 sm:size-6 transition-all duration-300",
                      isDragging ? "text-primary scale-110" : "text-primary/70"
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs sm:text-sm font-semibold text-foreground">
                    {isDragging
                      ? "¡Suelta aquí los archivos!"
                      : "Arrastra y suelta archivos aquí"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    o haz clic para seleccionar desde tu dispositivo
                  </p>
                </div>

                {/* File type badges */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <ImageIcon className="size-3.5" /> Imágenes hasta 10MB
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                    <Video className="size-3.5" /> Videos hasta 100MB
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <FileIcon className="size-3.5" /> Documentos hasta 25MB
                  </span>
                </div>

                <p className="text-[10px] text-muted-foreground/70">
                  Máximo {MAX_FILES} archivos en total
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Uploaded files list */}
      {archivos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold text-foreground flex items-center gap-2">
              <Check className="size-4 text-green-500" />
              Archivos subidos
            </p>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              {archivos.length}/{MAX_FILES}
            </span>
          </div>

          <div className="grid gap-2">
            {archivos.map((archivo) => {
              const IconComponent = getFileIcon(archivo.tipoArchivo);
              return (
                <div
                  key={archivo.cloudinaryId}
                  className={cn(
                    "flex items-center gap-3 p-1 sm:p-2 rounded-xl border-2 bg-card",
                    "transition-all duration-200 group",
                    "hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                  )}
                >
                  {/* Preview or icon */}
                  {archivo.tipoArchivo === TipoArchivo.IMAGEN ? (
                    <div
                      className="size-10 sm:size-12 rounded-xl overflow-hidden bg-muted shrink-0 cursor-pointer ring-2 ring-transparent hover:ring-primary/50 transition-all"
                      onClick={() =>
                        window.open(archivo.cloudinaryUrl, "_blank")
                      }
                    >
                      <Image
                        src={archivo.cloudinaryUrl}
                        alt={archivo.nombre}
                        className="w-full h-full object-cover"
                        width={80}
                        height={80}
                        loading="lazy"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "size-10 sm:size-12 rounded-xl flex items-center justify-center shrink-0",
                        archivo.tipoArchivo === TipoArchivo.VIDEO
                          ? "bg-linear-to-br from-violet-500/15 to-violet-500/5 border border-violet-500/20"
                          : "bg-linear-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/20"
                      )}
                    >
                      <IconComponent
                        className={cn(
                          "size-6",
                          archivo.tipoArchivo === TipoArchivo.VIDEO
                            ? "text-violet-600"
                            : "text-amber-600"
                        )}
                      />
                    </div>
                  )}

                  {/* File info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p
                      className="text-xs font-medium truncate max-w-full"
                      title={archivo.nombre}
                    >
                      {archivo.nombre}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-xs text-muted-foreground">
                      <span className="font-medium">
                        {formatFileSize(archivo.tamanio)}
                      </span>
                      <span className="text-border">•</span>
                      <span className="uppercase font-medium bg-muted px-1.5 py-0.5 rounded-sm">
                        {archivo.formato}
                      </span>
                      {archivo.ancho && archivo.alto && (
                        <>
                          <span className="text-border hidden sm:inline">
                            •
                          </span>
                          <span className="hidden sm:inline">
                            {archivo.ancho}×{archivo.alto}px
                          </span>
                        </>
                      )}
                      {archivo.duracion && (
                        <>
                          <span className="text-border hidden sm:inline">
                            •
                          </span>
                          <span className="hidden sm:inline">
                            {Math.round(archivo.duracion)}s
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 sm:gap-2 pr-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "size-8 rounded-xl",
                        "opacity-60 sm:opacity-0 group-hover:opacity-100 transition-all duration-200",
                        "hover:bg-green-500/10 hover:text-green-600"
                      )}
                      title="Ver archivo"
                      disabled={
                        isUploading ||
                        isSavingChanges ||
                        isSubmitting ||
                        deletingFileId !== null
                      }
                      onClick={() =>
                        window.open(archivo.cloudinaryUrl, "_blank")
                      }
                    >
                      <EyeIcon className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "size-8 rounded-xl",
                        "opacity-60 sm:opacity-0 group-hover:opacity-100 transition-all duration-200",
                        "hover:bg-destructive/10 hover:text-destructive"
                      )}
                      title="Eliminar archivo"
                      onClick={() => handleRemoveFile(archivo)}
                      disabled={
                        isUploading ||
                        isSavingChanges ||
                        isSubmitting ||
                        deletingFileId !== null
                      }
                    >
                      {deletingFileId === archivo.cloudinaryId ? (
                        <Spinner variant="ellipsis" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state when no files */}
      {archivos.length === 0 && !isUploading && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground text-balance">
            Aún no has subido ningún archivo. Usa los botones de arriba o
            arrastra archivos a la zona de carga.
          </p>
        </div>
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
        <div className={cn(currentStep !== 7 && "hidden")}>{Step7Content}</div>
      </>
    );
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh] bg-background w-full">
      {/* ==================== HEADER ==================== */}
      <header className="shrink-0 px-3 sm:px-4 pt-3 pb-0.5 bg-linear-to-b from-muted/30 to-background border-b border-border/50">
        {/* Title Row */}
        <div className="flex items-center gap-3 sm:gap-4 mb-3">
          <div
            className={cn(
              "size-8 rounded-xl flex items-center justify-center shadow-sm transition-all duration-300",
              currentColors.bg,
              currentColors.border.replace("border-", "ring-")
            )}
          >
            <StepIcon className={cn("size-4", currentColors.text)} />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-sm font-bold text-foreground truncate">
              {currentStepConfig.name}
            </DialogTitle>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {currentStepConfig.description}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-medium text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between gap-0.5 sm:gap-1">
          {FORM_STEPS.map((step) => {
            const isCompleted = completedSteps.has(step.id);
            const isCurrent = currentStep === step.id;
            const isAccessible = isEditing
              ? true
              : step.id < currentStep ||
                completedSteps.has(step.id - 1) ||
                step.id === 1;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className="flex items-center justify-center flex-1"
              >
                <button
                  type="button"
                  onClick={() => goToStep(step.id)}
                  disabled={!isAccessible}
                  className={cn(
                    "relative flex flex-col items-center justify-center transition-all duration-300 cursor-pointer",
                    "group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg p-1"
                  )}
                  title={step.name}
                >
                  <div
                    className={cn(
                      "size-8 sm:size-9 rounded-lg flex items-center justify-center transition-all duration-300",
                      isCurrent
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                        : isCompleted
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : isAccessible
                        ? "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                        : "bg-muted/40 text-muted-foreground/40 cursor-not-allowed"
                    )}
                  >
                    {isCompleted && !isCurrent ? (
                      <Check className="size-4" strokeWidth={2.5} />
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </div>

                  <span
                    className={cn(
                      "hidden lg:block text-[10px] mt-1.5 font-medium transition-colors max-w-[60px] truncate",
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
              </div>
            );
          })}
        </div>
      </header>

      {/* ==================== CONTENT ==================== */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col flex-1 min-h-0 w-full"
        >
          <main className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="p-4 max-w-2xl mx-auto">
              <div className="animate-in fade-in-50 slide-in-from-right-4 duration-300">
                {renderStepContent()}
              </div>
            </div>
          </main>

          {/* ==================== FOOTER ==================== */}
          <footer className="shrink-0 px-3 py-3 border-t bg-linear-to-t from-muted/30 to-background/80 backdrop-blur-sm">
            <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
              {/* Back button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={isFirstStep ? onBack : handlePrevStep}
                disabled={
                  isSubmitting ||
                  isSavingDraft ||
                  isSavingChanges ||
                  deletingFileId !== null ||
                  isUploading
                }
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline text-xs font-medium">
                  {isFirstStep ? "Salir" : "Atrás"}
                </span>
              </Button>

              {/* Step indicator */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/60 border border-border/50">
                <span className="text-xs font-bold text-primary">
                  {currentStep}
                </span>
                <span className="text-muted-foreground text-xs">/</span>
                <span className="text-xs text-muted-foreground font-medium">
                  {FORM_STEPS.length}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                {isLastStep ? (
                  <>
                    {isEditing ? (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={onSaveChanges}
                          disabled={
                            isSubmitting ||
                            isSavingDraft ||
                            isSavingChanges ||
                            deletingFileId !== null ||
                            isUploading
                          }
                        >
                          {isSavingChanges ? (
                            <Spinner variant="ellipsis" />
                          ) : (
                            <Save className="size-4" />
                          )}

                          {!isSavingChanges && (
                            <span className="hidden sm:inline text-xs font-medium">
                              Guardar cambios
                            </span>
                          )}
                        </Button>

                        <Button
                          type="submit"
                          size="sm"
                          disabled={
                            isSubmitting ||
                            isSavingDraft ||
                            isSavingChanges ||
                            deletingFileId !== null ||
                            isUploading
                          }
                        >
                          {isSubmitting ? (
                            <Spinner variant="ellipsis" />
                          ) : (
                            <>
                              <Send className="size-4" />
                              <span className="hidden sm:inline text-xs font-medium">
                                Guardar y enviar
                              </span>
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={onSaveDraft}
                          disabled={
                            isSubmitting ||
                            isSavingDraft ||
                            isSavingChanges ||
                            deletingFileId !== null ||
                            isUploading
                          }
                        >
                          {isSavingDraft ? (
                            <Spinner variant="ellipsis" />
                          ) : (
                            <FileDown className="size-4" />
                          )}
                          <span className="hidden sm:inline text-xs font-medium">
                            Guardar borrador
                          </span>
                        </Button>

                        <Button
                          type="submit"
                          size="sm"
                          disabled={
                            isSubmitting ||
                            isSavingDraft ||
                            isSavingChanges ||
                            deletingFileId !== null ||
                            isUploading
                          }
                          className="h-10 gap-2 px-3 sm:px-4 shadow-lg shadow-primary/25"
                        >
                          {isSubmitting ? (
                            <Spinner variant="ellipsis" />
                          ) : (
                            <>
                              <Save className="size-4" />
                              <span className="text-xs font-medium">
                                Guardar y enviar
                              </span>
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleNextStep}
                    disabled={
                      isSubmitting ||
                      isSavingDraft ||
                      isSavingChanges ||
                      deletingFileId !== null ||
                      isUploading
                    }
                  >
                    <span className="text-xs font-medium">Siguiente</span>
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
