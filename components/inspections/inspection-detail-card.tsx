"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/context";
import { DialogTitle } from "@/components/ui/dialog";
import { useCallback, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDate, formatDateShort } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CollapsibleContent } from "@radix-ui/react-collapsible";
import { Collapsible, CollapsibleTrigger } from "../ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

import {
  Inspection,
  CHECKLIST_GROUPS,
  INSPECTION_PHOTO_TYPES,
  ChecklistItem,
  ChecklistGroup,
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
  MessagesSquare,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ChevronDown,
  Droplets,
  Footprints,
  Lightbulb,
} from "lucide-react";
// ── Types ───────────────────────────────────────────

interface InspectionDetailCardProps {
  inspection: Inspection;
}

// ── Group Icons ─────────────────────────────────────

const GROUP_ICONS: Record<string, typeof Droplets> = {
  "inspectionsPage.detail.fluidLevels": Droplets,
  "inspectionsPage.detail.pedals": Footprints,
  "inspectionsPage.detail.lights": Lightbulb,
};

// ── Section Wrapper ─────────────────────────────────

function Section({
  icon: Icon,
  title,
  badge,
  children,
  defaultOpen = true,
}: {
  icon: typeof CheckCircle2;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border/50 bg-card shadow-none overflow-hidden transition-shadow hover:shadow-sm py-0">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3.5 md:px-5 md:py-4 text-left transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-t-xl"
            aria-expanded={isOpen}
          >
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="size-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground flex-1 leading-tight">
              {title}
            </h3>
            {badge}
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform duration-200",
                isOpen && "rotate-180",
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="px-4 pb-4 pt-0 md:px-5 md:pb-5">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ── Score Ring ───────────────────────────────────────

function ScoreRing({
  percent,
  size = 72,
  strokeWidth = 5,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const color =
    percent >= 80
      ? "text-emerald-500"
      : percent >= 50
        ? "text-amber-500"
        : "text-rose-500";
  const trackColor = "text-muted";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="-rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <circle
          className={trackColor}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        <circle
          className={cn(
            color,
            "transition-[stroke-dashoffset] duration-1000 ease-out",
          )}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "text-base font-bold tabular-nums",
            percent >= 80
              ? "text-emerald-600 dark:text-emerald-400"
              : percent >= 50
                ? "text-amber-600 dark:text-amber-400"
                : "text-rose-600 dark:text-rose-400",
          )}
        >
          {percent}%
        </span>
      </div>
    </div>
  );
}

// ── Checklist Group Component ───────────────────────

function ChecklistGroupSection({
  group,
  inspection,
  t,
}: {
  group: ChecklistGroup;
  inspection: Inspection;
  t: (key: string) => string;
}) {
  const GroupIcon = GROUP_ICONS[group.titleKey] || CheckCircle2;
  const passCount = group.items.filter(
    (item) => inspection[item.key as keyof Inspection] === true,
  ).length;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <GroupIcon className="size-3.5 text-muted-foreground" />
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t(group.titleKey)}
        </h4>
        <span className="text-[10px] text-muted-foreground ml-auto tabular-nums">
          {passCount}/{group.items.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {group.items.map((item: ChecklistItem) => {
          const value = inspection[item.key as keyof Inspection] as boolean;
          return (
            <div
              key={item.key}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors",
                value
                  ? "bg-emerald-50/60 dark:bg-emerald-950/20"
                  : "bg-rose-50/60 dark:bg-rose-950/20",
              )}
            >
              {value ? (
                <div className="size-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                </div>
              ) : (
                <div className="size-5 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0">
                  <XCircle className="size-3 text-rose-600 dark:text-rose-400" />
                </div>
              )}
              <span
                className={cn(
                  "text-[13px] leading-tight",
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
  );
}

// ── Photo Gallery with Carousel ─────────────────────

function PhotoGallery({
  photos,
  t,
}: {
  photos: Inspection["photos"];
  t: (key: string) => string;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openImage = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const closeImage = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const goNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev + 1) % photos.length : null,
    );
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev - 1 + photos.length) % photos.length : null,
    );
  }, [photos.length]);

  const getPhotoLabel = useCallback(
    (photoType: string) => {
      const found = INSPECTION_PHOTO_TYPES.find((p) => p.type === photoType);
      return found ? t(found.labelKey) : photoType;
    },
    [t],
  );

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            className="group relative aspect-4/3 rounded-xl overflow-hidden border border-border/50 bg-muted transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
            onClick={() => openImage(index)}
            aria-label={`View ${getPhotoLabel(photo.photoType)} photo`}
          >
            <Image
              src={photo.cloudinaryUrl}
              alt={getPhotoLabel(photo.photoType)}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="size-7 rounded-full bg-foreground/20 backdrop-blur-sm flex items-center justify-center">
                <ZoomIn className="size-3.5 text-card" />
              </div>
            </div>
            <div className="absolute bottom-0 inset-x-0 px-2.5 py-2">
              <span className="text-xs font-medium text-card drop-shadow-sm invert">
                {getPhotoLabel(photo.photoType)}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={closeImage}>
        <DialogContent
          className="max-w-3xl w-[calc(100vw-2rem)] p-0 border-none bg-transparent shadow-none gap-0 [&>button]:hidden"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">
            {t("inspectionsPage.detail.photoDialogTitle")}
          </DialogTitle>
          {selectedIndex !== null && (
            <div className="relative">
              {/* Close button */}
              <button
                type="button"
                onClick={closeImage}
                className="absolute -top-10 right-0 z-10 size-8 rounded-full bg-foreground/20 backdrop-blur-sm flex items-center justify-center text-card hover:bg-foreground/40 transition-colors"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>

              {/* Image */}
              <div className="relative rounded-xl overflow-hidden bg-card">
                <Image
                  src={photos[selectedIndex].cloudinaryUrl}
                  alt={getPhotoLabel(photos[selectedIndex].photoType)}
                  width={800}
                  height={600}
                  className="object-contain w-full h-auto max-h-[70vh]"
                />
                {/* Caption */}
                <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/70 to-transparent px-4 py-3">
                  <p className="text-card text-sm font-medium invert">
                    {getPhotoLabel(photos[selectedIndex].photoType)}
                  </p>
                  <p className="text-card/60 text-xs invert">
                    {selectedIndex + 1} / {photos.length}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 size-10 rounded-full bg-foreground/20 backdrop-blur-sm flex items-center justify-center text-card hover:bg-foreground/40 transition-colors"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-full bg-foreground/20 backdrop-blur-sm flex items-center justify-center text-card hover:bg-foreground/40 transition-colors"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Main Component ──────────────────────────────────

export function InspectionDetailCard({
  inspection,
}: InspectionDetailCardProps) {
  const { t, locale } = useTranslation();

  // Checklist score calculation
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

  const { passedChecks, totalChecks, scorePercent, failedChecks } =
    useMemo(() => {
      const passed = checklistKeys.filter(
        (key) => inspection[key as keyof Inspection] === true,
      ).length;
      const total = checklistKeys.length;
      return {
        passedChecks: passed,
        totalChecks: total,
        scorePercent: Math.round((passed / total) * 100),
        failedChecks: total - passed,
      };
    }, [inspection]);

  return (
    <div className="flex flex-col gap-3">
      {/* ═══════════ Approval Banner ═══════════ */}
      {inspection.approval && (
        <Card
          className={cn(
            "overflow-hidden border shadow-none pt-0",
            inspection.approval.approved
              ? "border-emerald-200/70 dark:border-emerald-800/50"
              : "border-rose-200/70 dark:border-rose-800/50",
          )}
        >
          <div
            className={cn(
              "px-4 py-3 md:px-5 md:py-3.5 flex items-center gap-2.5",
              inspection.approval.approved
                ? "bg-emerald-50/50 dark:bg-emerald-950/30"
                : "bg-rose-50/50 dark:bg-rose-950/30",
            )}
          >
            <ShieldCheck
              className={cn(
                "size-4 shrink-0",
                inspection.approval.approved
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400",
              )}
            />
            <h3 className="text-sm font-semibold text-foreground">
              {t("inspectionsPage.detail.approval")}
            </h3>
          </div>

          <CardContent className="px-4 py-0">
            <div className="flex flex-col gap-4">
              {/* Status banner */}
              <div className="flex items-start gap-3.5">
                <div
                  className={cn(
                    "size-11 rounded-xl flex items-center justify-center shrink-0",
                    inspection.approval.approved
                      ? "bg-emerald-100 dark:bg-emerald-900/40"
                      : "bg-rose-100 dark:bg-rose-900/40",
                  )}
                >
                  {inspection.approval.approved ? (
                    <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="size-5 text-rose-600 dark:text-rose-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs font-semibold border-0",
                        inspection.approval.approved
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
                      )}
                    >
                      {inspection.approval.approved
                        ? t("inspectionsPage.status.approved")
                        : t("inspectionsPage.status.rejected")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("inspectionsPage.detail.approvedBy")}{" "}
                    <span className="font-medium text-foreground">
                      {inspection.approval.user?.name ||
                        inspection.approval.user?.email}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(inspection.approval.createdAt, locale)}
                  </p>
                </div>
              </div>

              {/* Comments */}
              {inspection.approval.comments && (
                <div className="rounded-lg bg-muted/50 border border-border/40 p-3.5 flex items-start gap-2.5">
                  <MessagesSquare className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-[13px] italic text-foreground/80 leading-relaxed">
                    &ldquo;{inspection.approval.comments}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════════ Vehicle Hero Card ═══════════ */}
      <Card className="border-border/50 shadow-none overflow-hidden">
        <CardContent className="px-4 py-4 md:px-5 md:py-5">
          {/* Vehicle Info */}
          <div className="flex items-start gap-3.5">
            {/* Vehicle image */}
            <div className="relative size-16 md:size-20 rounded-xl overflow-hidden bg-muted border border-border/50 shrink-0">
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

            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <h2 className="text-base md:text-lg font-bold text-foreground leading-tight text-balance">
                  {inspection.vehicle.model}
                </h2>
                <p className="text-xs font-mono text-muted-foreground tracking-widest mt-0.5">
                  {inspection.vehicle.plate}
                </p>
              </div>

              {/* Metadata pills - responsive grid */}
              <div className="flex flex-wrap gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-md px-2 py-1 border border-border/30">
                      <User className="size-3 shrink-0" />
                      <span className="truncate max-w-[100px] sm:max-w-none">
                        {inspection.user.name || inspection.user.email}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {inspection.user.name || inspection.user.email}
                  </TooltipContent>
                </Tooltip>

                <div className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-md px-2 py-1 border border-border/30">
                  <Calendar className="size-3 shrink-0" />
                  <span>{formatDateShort(inspection.createdAt, locale)}</span>
                </div>

                <div className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-md px-2 py-1 border border-border/30">
                  <Gauge className="size-3 shrink-0" />
                  <span className="font-mono font-medium">
                    {inspection.mileage.toLocaleString()} km
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Score Section */}
          <div className="mt-4 rounded-xl bg-muted/30 border border-border/40 p-4">
            <div className="flex items-center gap-4">
              {/* Score Ring */}
              <ScoreRing percent={scorePercent} size={64} strokeWidth={5} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-foreground">
                    {t("inspectionsPage.card.checklistScore")}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700 ease-out",
                      scorePercent >= 80
                        ? "bg-emerald-500"
                        : scorePercent >= 50
                          ? "bg-amber-500"
                          : "bg-rose-500",
                    )}
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {passedChecks}/{totalChecks}{" "}
                    {t("inspectionsPage.detail.itemsPassed")}
                  </p>
                  {failedChecks > 0 && (
                    <span className="text-xs text-rose-500 flex items-center gap-1">
                      <AlertTriangle className="size-3" />
                      {failedChecks} {t("inspectionsPage.detail.failed")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════ Checklist Results ═══════════ */}
      <Section
        icon={CheckCircle2}
        title={t("inspectionsPage.detail.checklistResults")}
        badge={
          <Badge
            variant="secondary"
            className="text-[10px] h-5 px-2 tabular-nums"
          >
            {passedChecks}/{totalChecks}
          </Badge>
        }
      >
        <div className="flex flex-col gap-4">
          {CHECKLIST_GROUPS.map((group) => (
            <ChecklistGroupSection
              key={group.titleKey}
              group={group}
              inspection={inspection}
              t={t}
            />
          ))}
        </div>
      </Section>

      {/* ═══════════ Photo Gallery ═══════════ */}
      {inspection.photos.length > 0 && (
        <Section
          icon={ImageIcon}
          title={t("inspectionsPage.detail.photos")}
          badge={
            <Badge
              variant="secondary"
              className="text-[10px] h-5 px-2 tabular-nums"
            >
              {inspection.photos.length}/6
            </Badge>
          }
        >
          <PhotoGallery photos={inspection.photos} t={t} />
        </Section>
      )}

      {/* ═══════════ Observations ═══════════ */}
      {inspection.observations && (
        <Section
          icon={FileText}
          title={t("inspectionsPage.detail.observations")}
        >
          <div className="rounded-lg bg-muted/30 border border-border/40 p-4">
            <p className="text-[13px] text-foreground/80 whitespace-pre-wrap leading-relaxed">
              {inspection.observations}
            </p>
          </div>
        </Section>
      )}

      {/* ═══════════ Signature ═══════════ */}
      {inspection.signatureUrl && (
        <Section icon={PenLine} title={t("inspectionsPage.detail.signature")}>
          <div className="flex justify-center">
            <div className="w-full max-w-sm">
              <div className="rounded-xl border border-border/50 bg-muted/20 p-3 md:p-4">
                <Image
                  src={inspection.signatureUrl}
                  alt="Inspector Signature"
                  width={400}
                  height={200}
                  className="object-contain w-full rounded-lg"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {inspection.user.name || inspection.user.email}
              </p>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}
