"use client";

import React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "@/lib/i18n/context";
import { Textarea } from "@/components/ui/textarea";
import { useState, useCallback, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { H1, Paragraph } from "@/components/fonts/fonts";
import { createHelpFormSchema, HelpFormData } from "@/schemas/help";

import {
  Bug,
  Wrench,
  Lightbulb,
  MessageCircle,
  MoreHorizontal,
  Upload,
  X,
  Send,
  FileImage,
  Loader2,
  ImagePlus,
  CheckCircle2,
} from "lucide-react";

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

// File upload configuration
const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  cloudinaryId?: string;
  cloudinaryUrl?: string;
  isUploading?: boolean;
}

// Category configuration with colors for visual hierarchy
const CATEGORY_CONFIG = {
  bug: {
    icon: Bug,
    color: "text-red-500 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
  },
  technical: {
    icon: Wrench,
    color: "text-orange-500 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  feature: {
    icon: Lightbulb,
    color: "text-amber-500 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  question: {
    icon: MessageCircle,
    color: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  other: {
    icon: MoreHorizontal,
    color: "text-slate-500 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-950/30",
    borderColor: "border-slate-200 dark:border-slate-700",
  },
} as const;

export default function HelpPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, locale } = useTranslation();
  const { data: session } = useSession();

  const form = useForm<HelpFormData>({
    resolver: zodResolver(createHelpFormSchema(t)),
    defaultValues: {
      category: undefined,
      subject: "",
      description: "",
    },
  });

  // Category list for rendering
  const categories = [
    { value: "bug" as const },
    { value: "technical" as const },
    { value: "feature" as const },
    { value: "question" as const },
    { value: "other" as const },
  ];

  // Upload file to Cloudinary
  const uploadFileToCloudinary = async (
    file: File,
  ): Promise<{
    cloudinaryId: string;
    cloudinaryUrl: string;
  }> => {
    const formData = new FormData();
    formData.append("files", file);
    formData.append("folder", "help-requests");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || t("help.error.uploadFailed"));
    }

    const result = await response.json();
    const uploadedFile = result.files?.[0];

    if (!uploadedFile) {
      throw new Error(t("help.error.uploadFailed"));
    }

    return {
      cloudinaryId: uploadedFile.cloudinaryId,
      cloudinaryUrl: uploadedFile.cloudinaryUrl,
    };
  };

  // Handle file processing
  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remainingSlots = MAX_FILES - uploadedFiles.length;

      if (remainingSlots <= 0) {
        toast.error(t("help.validation.maxFilesReached"));
        return;
      }

      const validFiles: File[] = [];
      const errors: string[] = [];

      fileArray.forEach((file) => {
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
          errors.push(
            t("help.toast.fileTypeError").replace("{{fileName}}", file.name),
          );
          return;
        }
        if (file.size > MAX_FILE_SIZE) {
          errors.push(
            t("help.toast.fileSizeError").replace("{{fileName}}", file.name),
          );
          return;
        }
        validFiles.push(file);
      });

      // Show errors if any
      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error));
      }

      // Add valid files
      const filesToAdd = validFiles.slice(0, remainingSlots);
      const newFiles: UploadedFile[] = filesToAdd.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        isUploading: true,
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      for (const newFile of newFiles) {
        try {
          const { cloudinaryId, cloudinaryUrl } = await uploadFileToCloudinary(
            newFile.file,
          );

          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === newFile.id
                ? { ...f, cloudinaryId, cloudinaryUrl, isUploading: false }
                : f,
            ),
          );
        } catch (error) {
          console.error("Error uploading file:", error);
          toast.error(
            t("help.toast.fileTypeError").replace("{{fileName}}", newFile.name),
          );
          setUploadedFiles((prev) => prev.filter((f) => f.id !== newFile.id));
        }
      }

      if (newFiles.length > 0) {
        toast.success(
          t("help.toast.uploadSuccess").replace(
            "{{count}}",
            newFiles.length.toString(),
          ),
        );
      }
    },
    [uploadedFiles.length, t],
  );

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFiles(files);
      }
    },
    [processFiles],
  );

  // Remove uploaded file
  const removeFile = useCallback((id: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handle form submission
  const onSubmit = async (data: HelpFormData) => {
    setIsSubmitting(true);

    try {
      // Check if all files are uploaded
      const uploadingFiles = uploadedFiles.filter((f) => f.isUploading);
      if (uploadingFiles.length > 0) {
        toast.error(t("help.error.uploadFailed"));
        setIsSubmitting(false);
        return;
      }

      // Prepare images data
      const images = uploadedFiles
        .filter((f) => f.cloudinaryId && f.cloudinaryUrl)
        .map((f) => ({
          cloudinaryId: f.cloudinaryId!,
          cloudinaryUrl: f.cloudinaryUrl!,
          nombre: f.name,
          tamanio: f.size,
        }));

      // Send to API
      const response = await fetch("/api/help", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          images,
          locale,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || t("help.error.message"));
      }

      // Success
      toast.success(t("help.toast.submitSuccess"));
      form.reset();
      setUploadedFiles([]);
    } catch (error) {
      console.error("Error submitting help request:", error);
      toast.error(
        error instanceof Error ? error.message : t("help.toast.submitError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto px-4 space-y-4 w-full">
      {/* ==================== HEADER SECTION ==================== */}
      <header className="flex flex-row items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur py-0">
        <div className="flex items-center gap-3 justify-start">
          <div className="min-w-0 flex-1">
            <H1>{t("help.title")}</H1>
            <Paragraph className="text-pretty">{t("help.subtitle")}</Paragraph>
          </div>
        </div>
      </header>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="h-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 h-full"
          >
            {/* ==================== FORM CARD ==================== */}
            <Card className="shadow-none p-0 border-none">
              <CardContent className="space-y-2 md:space-y-4  p-0 border-none">
                {/* Category & Subject - Grid on larger screens */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Category Select */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">
                          {t("help.requestTypeLabel")}{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 sm:h-10 w-full">
                              <SelectValue
                                placeholder={t("help.requestTypePlaceholder")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((cat) => {
                              const config = CATEGORY_CONFIG[cat.value];
                              const Icon = config.icon;
                              return (
                                <SelectItem
                                  key={cat.value}
                                  value={cat.value}
                                  className="py-2.5"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div
                                      className={cn(
                                        "flex h-6 w-6 items-center justify-center rounded-md",
                                        config.bgColor,
                                      )}
                                    >
                                      <Icon
                                        className={cn(
                                          "h-3.5 w-3.5",
                                          config.color,
                                        )}
                                      />
                                    </div>
                                    <span className="font-medium">
                                      {t(`help.categories.${cat.value}`)}
                                    </span>
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
                        <FormLabel className="text-sm">
                          {t("help.subjectLabel")}{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("help.subjectPlaceholder")}
                            className="h-11 sm:h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description Field */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        {t("help.descriptionLabel")}{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("help.descriptionPlaceholder")}
                          className="min-h-[100px] resize-none text-base leading-relaxed sm:min-h-[120px] sm:text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {t("help.descriptionDescription")}
                        </span>
                        <span
                          className={cn(
                            "tabular-nums font-medium",
                            field.value.length > 1800 &&
                              "text-amber-600 dark:text-amber-500",
                            field.value.length > 1950 && "text-destructive",
                          )}
                        >
                          {field.value.length}/2000
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ==================== ATTACHMENTS SECTION (Inside Card) ==================== */}
                <div className="space-y-3 pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <ImagePlus className="h-4 w-4 text-muted-foreground" />
                        {t("help.attachments")}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-normal h-5"
                      >
                        {t("common.optional") || "Opcional"}
                      </Badge>
                    </div>
                    <Badge
                      variant={
                        uploadedFiles.length >= MAX_FILES
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-[10px] font-normal h-5"
                    >
                      {uploadedFiles.length}/{MAX_FILES}
                    </Badge>
                  </div>

                  {/* Upload Zone - Compact */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_FILE_TYPES.join(",")}
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files) {
                        processFiles(e.target.files);
                      }
                      e.target.value = "";
                    }}
                    disabled={uploadedFiles.length >= MAX_FILES}
                  />

                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "md:h-28 relative flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-all duration-200 overflow-hidden",
                      "py-4 px-4",
                      "active:scale-[0.99]",
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/30",
                      uploadedFiles.length >= MAX_FILES &&
                        "pointer-events-none opacity-50",
                    )}
                    role="button"
                    tabIndex={0}
                    aria-label={t("help.attachments")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200",
                          isDragging ? "bg-primary/15" : "bg-muted",
                        )}
                      >
                        <Upload
                          className={cn(
                            "h-5 w-5 transition-colors",
                            isDragging
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        />
                      </div>

                      <div className="text-left">
                        <p
                          className={cn(
                            "text-sm font-medium transition-colors",
                            isDragging ? "text-primary" : "text-foreground",
                          )}
                        >
                          {isDragging
                            ? t("help.dragDropActive")
                            : t("help.dragDropInactive")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF, WebP • Max 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Files Grid - Compact */}
                  {uploadedFiles.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="group relative overflow-hidden rounded-lg border border-border bg-muted/20 shadow-sm transition-shadow hover:shadow-md"
                        >
                          <div className="aspect-square relative">
                            <Image
                              src={file.preview || "/placeholder.svg"}
                              alt={file.name}
                              fill
                              className="object-cover transition-transform duration-200 group-hover:scale-105"
                            />

                            {/* Upload loading overlay */}
                            {file.isUploading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              </div>
                            )}

                            {/* Success indicator */}
                            {!file.isUploading && file.cloudinaryUrl && (
                              <div className="absolute top-1 left-1">
                                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500 shadow-sm">
                                  <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                                </div>
                              </div>
                            )}

                            {/* Remove button */}
                            {!file.isUploading && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile(file.id);
                                }}
                                className={cn(
                                  "absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full",
                                  "bg-foreground/80 text-background shadow-sm",
                                  "transition-all duration-200",
                                  "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100",
                                  "hover:bg-destructive focus:opacity-100 focus:scale-100",
                                  "touch-manipulation",
                                )}
                                aria-label={`${t("common.remove")} ${file.name}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>

                          {/* File info overlay */}
                          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/50 to-transparent p-1 pt-3">
                            <p className="truncate text-[9px] font-medium text-white">
                              {file.name}
                            </p>
                            <p className="text-[9px] text-white/70">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ==================== SUBMIT SECTION ==================== */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Info badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {uploadedFiles.length > 0 && (
                  <Badge variant="secondary" className="gap-1.5 font-normal">
                    <FileImage className="h-3.5 w-3.5" />
                    {uploadedFiles.length}{" "}
                    {uploadedFiles.length === 1
                      ? t("help.filesAttached")
                      : t("help.filesAttachedPlural")}
                  </Badge>
                )}
                {uploadedFiles.some((f) => f.isUploading) && (
                  <Badge
                    variant="outline"
                    className="gap-1.5 font-normal text-amber-600 dark:text-amber-500"
                  >
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t("help.submitting")}
                  </Badge>
                )}
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                size="lg"
                disabled={
                  isSubmitting || uploadedFiles.some((f) => f.isUploading)
                }
                className={cn(
                  "w-full gap-2 text-base font-medium shadow-sm sm:w-auto sm:text-sm",
                  "h-11 sm:h-10",
                  "transition-all duration-200",
                )}
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="h-4 w-4" variant="bars" />
                    <span className="animate-pulse">
                      {t("help.submitting")}
                    </span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>{t("help.submit")}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </section>
  );
}
