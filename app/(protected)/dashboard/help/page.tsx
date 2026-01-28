"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/i18n/context";
import { HELP_CONFIG } from "@/constants/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { H1, Paragraph } from "@/components/fonts/fonts";
import { createHelpFormSchema, HelpFormData } from "@/schemas/help";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  HelpCircle,
  Send,
  Upload,
  X,
  AlertCircle,
  Bug,
  Wrench,
  Lightbulb,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";

export default function HelpPage() {
  const { t, locale } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<
    Array<{
      cloudinaryId: string;
      cloudinaryUrl: string;
      nombre: string;
      tamanio: number;
      preview?: string;
    }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<HelpFormData>({
    resolver: zodResolver(createHelpFormSchema(t)),
    defaultValues: {
      category: undefined,
      subject: "",
      description: "",
      images: [],
    },
  });

  // Category icons mapping
  const categoryIcons = {
    bug: Bug,
    technical: Wrench,
    feature: Lightbulb,
    question: MessageCircle,
    other: MoreHorizontal,
  };

  // Handle image upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check total images limit
    if (uploadedImages.length + files.length > HELP_CONFIG.maxImages) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("help.form.maxFiles").replace(
          "{{count}}",
          HELP_CONFIG.maxImages.toString(),
        ),
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Check file size
        if (file.size > HELP_CONFIG.maxImageSize) {
          throw new Error(
            `${file.name} excede el tamaño máximo permitido (10MB)`,
          );
        }

        // Upload via API endpoint
        const formData = new FormData();
        formData.append("files", file);
        formData.append("folder", "help-requests");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Error al subir imagen");
        }

        const result = await response.json();
        const uploadedFile = result.files?.[0];

        if (!uploadedFile) {
          throw new Error("No se recibió respuesta del servidor");
        }

        return {
          cloudinaryId: uploadedFile.cloudinaryId,
          cloudinaryUrl: uploadedFile.cloudinaryUrl,
          nombre: file.name,
          tamanio: file.size,
          preview: URL.createObjectURL(file),
        };
      });

      const newImages = await Promise.all(uploadPromises);
      setUploadedImages((prev) => [...prev, ...newImages]);

      toast({
        title: t("common.success"),
        description: `${newImages.length} ${newImages.length === 1 ? "imagen subida" : "imágenes subidas"}`,
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description:
          error instanceof Error ? error.message : "Error al subir imágenes",
      });
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = "";
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit form
  const onSubmit = async (data: HelpFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/help", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          images: uploadedImages.map((img) => ({
            cloudinaryId: img.cloudinaryId,
            cloudinaryUrl: img.cloudinaryUrl,
            nombre: img.nombre,
            tamanio: img.tamanio,
          })),
          locale,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Error al enviar la solicitud");
      }

      // Success
      toast({
        title: t("help.success.title"),
        description: t("help.success.message"),
      });

      // Reset form
      form.reset();
      setUploadedImages([]);
    } catch (error) {
      console.error("Error submitting help request:", error);
      toast({
        variant: "destructive",
        title: t("help.error.title"),
        description:
          error instanceof Error ? error.message : t("help.error.message"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 space-y-3">
      {/* Header */}
      <div>
        <H1>{t("help.title")}</H1>
        <Paragraph>{t("help.subtitle")}</Paragraph>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5 p-0">
        <CardContent className="py-0 pl-3 pt-3 pb-0">
          <div className="flex items-start gap-2">
            <AlertCircle className="size-4 text-primary shrink-0" />
            <Paragraph>{t("help.description")}</Paragraph>
          </div>
        </CardContent>
      </Card>

      {/* Main Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("help.submit")}</CardTitle>
          <CardDescription>
            {t("help.form.descriptionPlaceholder")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Category Field */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("help.form.category")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("help.form.categoryPlaceholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HELP_CONFIG.categories.map((category) => {
                          const Icon = categoryIcons[category];
                          return (
                            <SelectItem key={category} value={category}>
                              <div className="flex items-center gap-2">
                                <Icon className="size-4" />
                                <span>{t(`help.categories.${category}`)}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subject Field */}
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("help.form.subject")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("help.form.subjectPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("help.form.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("help.form.descriptionPlaceholder")}
                        className="min-h-[150px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value.length}/2000 {t("common.characters")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload Section */}
              <div className="space-y-4">
                <div>
                  <FormLabel>{t("help.form.images")}</FormLabel>
                  <FormDescription>
                    {t("help.form.imagesDescription")}
                  </FormDescription>
                </div>

                {/* Upload Button */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={
                      isUploading ||
                      uploadedImages.length >= HELP_CONFIG.maxImages
                    }
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                  >
                    {isUploading ? (
                      <>
                        <Spinner variant="bars" className="size-3.5" />
                        <span className="text-sm animate-pulse">
                          {t("common.uploading")}
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className="size-3.5" />
                        <span className="text-sm">
                          {t("help.form.uploadImages")}
                        </span>
                      </>
                    )}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {uploadedImages.length}/{HELP_CONFIG.maxImages}
                  </span>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={
                      isUploading ||
                      uploadedImages.length >= HELP_CONFIG.maxImages
                    }
                  />
                </div>

                {/* Uploaded Images Preview */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg border overflow-hidden bg-muted"
                      >
                        <img
                          src={image.preview || image.cloudinaryUrl}
                          alt={image.nombre}
                          className="w-full h-32 object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="size-4" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                          {image.nombre}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                     ${isSubmitting ? "cursor-not-allowed opacity-45" : ""}
                    `}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="size-3.5" variant="bars" />
                      <span className="animate-pulse text-xs sm:text-sm">
                        {t("help.submitting")}
                      </span>
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      <span className="text-xs sm:text-sm">
                        {t("help.submit")}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
