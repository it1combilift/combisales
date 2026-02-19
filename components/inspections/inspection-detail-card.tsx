"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import {
  Inspection,
  CHECKLIST_GROUPS,
  INSPECTION_PHOTO_TYPES,
} from "@/interfaces/inspection";

import {
  CheckCircle2,
  XCircle,
  Car,
  User,
  Calendar,
  Gauge,
  ImageIcon,
  FileText,
  PenLine,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface InspectionDetailCardProps {
  inspection: Inspection;
}

/* ── Section Wrapper ─────────────────────────────── */
function Section({
  icon: Icon,
  title,
  badge,
  children,
}: {
  icon: typeof CheckCircle2;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-none p-0 m-0 shadow-none mb-2 md:mb-4">
      <div className="flex items-center gap-2.5 py-3.5 border-b">
        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="size-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground flex-1">
          {title}
        </h3>
        {badge}
      </div>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

/* ── Main Component ──────────────────────────────── */
export function InspectionDetailCard({
  inspection,
}: InspectionDetailCardProps) {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Checklist score
  const checklistKeys = [
    "oilLevel",
    "coolantLevel",
    "brakeFluidLevel",
    "hydraulicLevel",
    "brakePedal",
    "clutchPedal",
    "gasPedal",
    "headlights",
    "tailLights",
    "brakeLights",
    "turnSignals",
    "hazardLights",
    "reversingLights",
    "dashboardLights",
  ] as const;

  const passedChecks = checklistKeys.filter(
    (key) => inspection[key as keyof Inspection] === true,
  ).length;
  const totalChecks = checklistKeys.length;
  const scorePercent = Math.round((passedChecks / totalChecks) * 100);
  const failedChecks = totalChecks - passedChecks;

  return (
    <div className="space-y-3">
      {/* ═══════════ Approval Information ═══════════ */}
      {inspection.approval && (
        <Section
          icon={ShieldCheck}
          title={t("inspectionsPage.detail.approval")}
        >
          <div className="space-y-4">
            {/* Approval status banner */}
            <div
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border",
                inspection.approval.approved
                  ? "bg-emerald-50/80 border-emerald-200/70 dark:bg-emerald-950/20 dark:border-emerald-800/50"
                  : "bg-rose-50/80 border-rose-200/70 dark:bg-rose-950/20 dark:border-rose-800/50",
              )}
            >
              {inspection.approval.approved ? (
                <div className="size-10 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              ) : (
                <div className="size-10 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0">
                  <XCircle className="size-5 text-rose-600 dark:text-rose-400" />
                </div>
              )}
              <div className="min-w-0">
                <p
                  className={cn(
                    "font-semibold text-sm",
                    inspection.approval.approved
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-rose-700 dark:text-rose-300",
                  )}
                >
                  {inspection.approval.approved
                    ? t("inspectionsPage.status.approved")
                    : t("inspectionsPage.status.rejected")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("inspectionsPage.detail.approvedBy")}:{" "}
                  <span className="font-medium text-foreground">
                    {inspection.approval.user?.name ||
                      inspection.approval.user?.email}
                  </span>
                </p>

                {/* Timestamp */}
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  {formatDate(inspection.approval.createdAt)}
                </p>
              </div>
            </div>

            {/* Comments */}
            {inspection.approval.comments && (
              <div className="rounded-lg bg-muted/40 border border-border/50 p-4">
                <p className="text-sm italic text-foreground/80 leading-relaxed">
                  &ldquo;{inspection.approval.comments}&rdquo;
                </p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ═══════════ Hero Header ═══════════ */}
      <Card
        className={`${inspection.approval ? "mt-6" : ""} border-none p-0 border shadow-none`}
      >
        <CardContent className="p-0">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            {/* Left: vehicle + inspector info */}
            <div className="flex items-start gap-4 min-w-0 flex-1">
              {/* Vehicle image */}
              <div className="relative size-20 rounded-xl overflow-hidden bg-muted border border-border/50 shrink-0">
                {inspection.vehicle.imageUrl ? (
                  <Image
                    src={inspection.vehicle.imageUrl}
                    alt={inspection.vehicle.model}
                    fill
                    className="object-contain object-center"
                  />
                ) : (
                  <div className="size-full flex items-center justify-center">
                    <Car className="size-6 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              <div className="space-y-2 min-w-0">
                <div>
                  <h2 className="text-xl font-bold text-foreground leading-tight">
                    {inspection.vehicle.model}
                  </h2>
                  <p className="text-sm font-mono text-muted-foreground tracking-wider">
                    {inspection.vehicle.plate}
                  </p>
                </div>

                {/* Metadata pills */}
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 rounded-lg px-2.5 py-1.5 border border-border/30">
                    <User className="size-3 shrink-0" />
                    <span className="truncate">
                      {inspection.user.name || inspection.user.email}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 rounded-lg px-2.5 py-1.5 border border-border/30">
                    <Calendar className="size-3 shrink-0" />
                    <span>{formatDateShort(inspection.createdAt)}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 rounded-lg px-2.5 py-1.5 border border-border/30">
                    <Gauge className="size-3 shrink-0" />
                    <span className="font-mono font-medium">
                      {inspection.mileage.toLocaleString()} km
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Score bar ──────────────────────── */}
          <div className="mt-5 rounded-xl bg-muted/40 border border-border/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {t("inspectionsPage.card.checklistScore")}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {failedChecks > 0 && (
                  <span className="text-xs text-rose-500 flex items-center gap-1">
                    <AlertTriangle className="size-3" />
                    {failedChecks} {t("inspectionsPage.detail.failed")}
                  </span>
                )}
                <span
                  className={cn(
                    "text-lg font-bold tabular-nums",
                    scorePercent >= 80
                      ? "text-emerald-600 dark:text-emerald-400"
                      : scorePercent >= 50
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-rose-600 dark:text-rose-400",
                  )}
                >
                  {scorePercent}%
                </span>
              </div>
            </div>
            <div className="h-1.5 md:h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  scorePercent >= 80
                    ? "bg-emerald-500"
                    : scorePercent >= 50
                      ? "bg-amber-500"
                      : "bg-rose-500",
                )}
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {passedChecks}/{totalChecks}{" "}
              {t("inspectionsPage.detail.itemsPassed")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════ Checklist Results ═══════════ */}
      <Section
        icon={CheckCircle2}
        title={t("inspectionsPage.detail.checklistResults")}
        badge={
          <Badge variant="secondary" className="text-[10px] h-5 px-2">
            {passedChecks}/{totalChecks}
          </Badge>
        }
      >
        <div className="space-y-3">
          {CHECKLIST_GROUPS.map((group) => (
            <div key={group.titleKey}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                {t(group.titleKey)}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map((item) => {
                  const value = inspection[
                    item.key as keyof Inspection
                  ] as boolean;
                  return (
                    <div
                      key={item.key}
                      className={cn(
                        "flex items-center gap-2.5 p-3 rounded-lg text-sm border transition-colors",
                        value
                          ? "bg-emerald-50/80 border-emerald-200/70 dark:bg-emerald-950/20 dark:border-emerald-800/50"
                          : "bg-rose-50/80 border-rose-200/70 dark:bg-rose-950/20 dark:border-rose-800/50",
                      )}
                    >
                      {value ? (
                        <div className="size-6 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      ) : (
                        <div className="size-6 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0">
                          <XCircle className="size-3.5 text-rose-600 dark:text-rose-400" />
                        </div>
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          value
                            ? "text-emerald-800 dark:text-emerald-300"
                            : "text-rose-800 dark:text-rose-300",
                        )}
                      >
                        {t(item.labelKey)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════ Photo Gallery ═══════════ */}
      {inspection.photos.length > 0 && (
        <Section
          icon={ImageIcon}
          title={t("inspectionsPage.detail.photos")}
          badge={
            <Badge variant="secondary" className="text-[10px] h-5 px-2">
              {inspection.photos.length}/6
            </Badge>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {inspection.photos.map((photo) => (
              <div
                key={photo.id}
                className="group/photo relative aspect-video rounded-xl overflow-hidden border bg-muted transition-all hover:shadow-lg hover:scale-[1.02]"
                onClick={() => setSelectedImage(photo.cloudinaryUrl)}
              >
                <Image
                  src={photo.cloudinaryUrl}
                  alt={photo.photoType}
                  fill
                  className="object-cover transition-transform duration-500 group-hover/photo:scale-110"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover/photo:opacity-90 transition-opacity" />
                <div className="absolute bottom-0 inset-x-0 px-3 py-2">
                  <span className="text-white text-[11px] font-medium drop-shadow-sm">
                    {INSPECTION_PHOTO_TYPES.map(({ type, labelKey }) => {
                      if (type === photo.photoType) {
                        return t(labelKey);
                      }
                      return null;
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Modal for displaying full image */}
          {selectedImage && (
            <Dialog
              open={!!selectedImage}
              onOpenChange={() => setSelectedImage(null)}
            >
              <DialogContent className="flex items-center justify-center z-50 border-none p-0 m-0 shadow-none">
                <DialogTitle className="sr-only">
                  {t("inspectionsPage.detail.photoDialogTitle")}
                </DialogTitle>
                <div className="relative max-w-4xl w-full">
                  <Image
                    src={selectedImage}
                    alt="Selected"
                    width={800}
                    height={800}
                    className="object-contain object-center w-full h-auto rounded-lg"
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </Section>
      )}

      {/* ═══════════ Observations ═══════════ */}
      {inspection.observations && (
        <Section
          icon={FileText}
          title={t("inspectionsPage.detail.observations")}
        >
          <div className="rounded-lg bg-muted/40 border border-border/50 p-4">
            <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
              {inspection.observations}
            </p>
          </div>
        </Section>
      )}

      {/* ═══════════ Signature ═══════════ */}
      {inspection.signatureUrl && (
        <Section icon={PenLine} title={t("inspectionsPage.detail.signature")}>
          <div className="flex justify-center items-center max-w-md mx-auto">
            <div className="w-full">
              <Image
                src={inspection.signatureUrl}
                alt="Signature"
                width={300}
                height={150}
                className="object-contain object-center w-full rounded-lg border bg-muted/50 border-border/50"
              />
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}
