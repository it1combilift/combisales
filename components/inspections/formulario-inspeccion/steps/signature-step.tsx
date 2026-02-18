"use client";

import axios from "axios";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";
import { Eraser, PenTool, Loader2 } from "lucide-react";
import { InspectionFormSchema } from "@/schemas/inspections";
import { useRef, useState, useCallback, useEffect } from "react";

interface SignatureStepProps {
  form: UseFormReturn<InspectionFormSchema>;
}

export function SignatureStep({ form }: SignatureStepProps) {
  const { t } = useTranslation();
  const {
    watch,
    setValue,
    formState: { errors },
  } = form;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const signatureUrl = watch("signatureUrl");

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Canvas style
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // White background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  const getPosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      setIsDrawing(true);
      setHasDrawn(true);
      const pos = getPosition(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    },
    [getPosition],
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      const pos = getPosition(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    },
    [isDrawing, getPosition],
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    setValue("signatureUrl", "", { shouldValidate: true });
    setValue("signatureCloudinaryId", "", { shouldValidate: true });
  }, [setValue]);

  const saveSignature = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    setIsUploading(true);

    try {
      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("Failed to create blob");

      const formData = new FormData();
      formData.append("files", blob, "signature.png");
      formData.append("folder", "combisales/inspections/signatures");

      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = response.data;
      if (!result.success || !result.files?.length) {
        throw new Error(result.errors?.[0] || "Upload failed");
      }

      const uploaded = result.files[0];
      setValue("signatureUrl", uploaded.cloudinaryUrl, {
        shouldValidate: true,
      });
      setValue("signatureCloudinaryId", uploaded.cloudinaryId, {
        shouldValidate: true,
      });
    } catch (error) {
      console.error("Failed to upload signature:", error);
    } finally {
      setIsUploading(false);
    }
  }, [hasDrawn, setValue]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t("inspectionsPage.form.signature.label")}</Label>
        <p className="text-xs text-muted-foreground">
          {t("inspectionsPage.form.signature.hint")}
        </p>
      </div>

      {signatureUrl ? (
        <div className="space-y-3">
          <div className="relative w-full max-w-md mx-auto rounded-lg border overflow-hidden bg-white">
            <Image
              src={signatureUrl}
              alt="Signature"
              width={400}
              height={200}
              className="object-contain w-full"
            />
          </div>
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearCanvas}
            >
              <Eraser className="size-4" />
              {t("inspectionsPage.form.signature.clear")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative w-full max-w-full mx-auto rounded-lg border border-dashed overflow-hidden touch-none">
            <canvas
              ref={canvasRef}
              className="w-full cursor-crosshair"
              style={{ height: "400px" }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-2 text-muted-foreground/50">
                  <PenTool className="size-4" />
                  <span className="text-sm">
                    {t("inspectionsPage.form.signature.drawHere")}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearCanvas}
              disabled={!hasDrawn}
            >
              <Eraser className="size-4" />
              {t("inspectionsPage.form.signature.clear")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={saveSignature}
              disabled={!hasDrawn || isUploading}
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <PenTool className="size-4" />
              )}
              {t("inspectionsPage.form.signature.save")}
            </Button>
          </div>
        </div>
      )}

      {errors.signatureUrl && (
        <p className="text-sm text-destructive text-center">
          {errors.signatureUrl.message}
        </p>
      )}
    </div>
  );
}
