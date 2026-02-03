"use client";

import { z } from "zod";
import React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "@/lib/i18n/context";
import { Textarea } from "@/components/ui/textarea";
import { useState, useCallback, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
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
  UserIcon,
} from "lucide-react";

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
import { Badge } from "@/components/ui/badge";

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

  // Category
  const categories = [
    {
      value: "bug" as const,
      icon: Bug,
    },
    {
      value: "technical" as const,
      icon: Wrench,
    },
    {
      value: "feature" as const,
      icon: Lightbulb,
    },
    {
      value: "question" as const,
      icon: MessageCircle,
    },
    {
      value: "other" as const,
      icon: MoreHorizontal,
    },
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

      // Upload files to Cloudinary
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
          // Remove failed upload
          setUploadedFiles((prev) => prev.filter((f) => f.id !== newFile.id));
        }
      }

      // Show success toast if files were added
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
    <div className="min-h-screen bg-background px-4 space-y-3">
      <header>
        <div className="mx-auto flex items-center justify-between">
          <div className="flex items-start w-full">
            <div className="flex flex-col items-start w-full">
              <H1>{t("help.title")}</H1>
              <Paragraph>{t("help.description")}</Paragraph>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto">
        {/* Main Form Card */}
        <Card className="border-border shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm">
              {t("help.requestDetails")}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t("help.requestDetailsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Grid Layout for Category and Subject */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Category Selection */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("help.requestTypeLabel")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full text-xs md:text-sm">
                              <SelectValue
                                placeholder={t("help.requestTypePlaceholder")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => {
                              const Icon = category.icon;
                              return (
                                <SelectItem
                                  key={category.value}
                                  value={category.value}
                                  className="text-xs md:text-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <Icon className="size-3.5 text-muted-foreground" />
                                    <span>
                                      {t(`help.categories.${category.value}`)}
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
                        <FormLabel>{t("help.subjectLabel")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("help.subjectPlaceholder")}
                            className="w-full text-xs md:text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description Field - Full Width */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("help.descriptionLabel")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("help.descriptionPlaceholder")}
                          className="min-h-40 resize-none text-xs md:text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="flex justify-between text-xs md:text-sm">
                        <span>{t("help.descriptionDescription")}</span>
                        <span
                          className={cn(
                            "tabular-nums",
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

                {/* File Upload Section */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium leading-none text-foreground">
                      {t("help.attachments")}
                    </label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("help.attachmentsDescription")}
                    </p>
                  </div>

                  {/* Drag and Drop Zone */}
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
                      "relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/50",
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
                    <div className="flex flex-col items-center gap-2 p-6 text-center">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                          isDragging ? "bg-primary/10" : "bg-muted",
                        )}
                      >
                        <Upload
                          className={cn(
                            "h-6 w-6 transition-colors",
                            isDragging
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {isDragging
                            ? t("help.dragDropActive")
                            : t("help.dragDropInactive")}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("help.clickToBrowse")}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("help.fileTypesAllowed")} ({uploadedFiles.length}/
                        {MAX_FILES})
                      </p>
                    </div>
                  </div>

                  {/* Uploaded Files Preview */}
                  {uploadedFiles.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="group relative overflow-hidden rounded-lg border border-border bg-muted/30"
                        >
                          <div className="aspect-square relative">
                            <Image
                              src={file.preview || "/placeholder.svg"}
                              alt={file.name}
                              fill
                              className="object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            {file.isUploading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              </div>
                            )}
                          </div>
                          {!file.isUploading && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(file.id);
                              }}
                              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/80 text-background opacity-0 transition-opacity hover:bg-foreground focus:opacity-100 group-hover:opacity-100"
                              aria-label={`${t("common.remove")} ${file.name}`}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-foreground/80 to-transparent p-2 pt-6">
                            <p className="truncate text-xs font-medium text-background">
                              {file.name}
                            </p>
                            <p className="text-xs text-background/70">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <FileImage className="size-4" />
                      <span>
                        {uploadedFiles.length}{" "}
                        {uploadedFiles.length === 1
                          ? t("help.filesAttached")
                          : t("help.filesAttachedPlural")}
                      </span>
                    </div>
                    {session?.user && (
                      <Badge variant="outline-info">
                        <UserIcon className="size-3.5" />
                        {session.user.email}
                      </Badge>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting || uploadedFiles.some((f) => f.isUploading)
                    }
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner className="size-3.5" variant="bars" />
                        <span className="animate-pulse text-xs md:text-sm">
                          {t("help.submitting")}
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="size-3.5" />
                        <span className="text-xs md:text-sm">
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
      </main>
    </div>
  );
}
