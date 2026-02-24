"use client";

import useSWR from "swr";
import { Role } from "@prisma/client";
import { hasRole } from "@/lib/roles";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n/context";
import { H1, Paragraph } from "@/components/fonts/fonts";
import { Inspection, InspectionStatus } from "@/interfaces/inspection";
import { ApprovalDialog } from "@/components/inspections/approval-dialog";
import { InspectionDetailCard } from "@/components/inspections/inspection-detail-card";
import { DeleteInspectionDialog } from "@/components/inspections/delete-inspection-dialog";

import {
  ArrowLeft,
  ShieldCheck,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  FileDown,
  Loader2,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession();
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inspectionId, setInspectionId] = useState<string>("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!inspection || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const res = await fetch(
        `/api/inspections/${inspection.id}/pdf?locale=${locale}`,
      );
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers.get("content-disposition")?.match(/filename="(.+)"/)?.[1] ||
        `inspection_${inspection.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  useEffect(() => {
    params.then(({ id }) => setInspectionId(id));
  }, [params]);

  const {
    data: inspection,
    isLoading,
    mutate,
  } = useSWR<Inspection>(
    inspectionId ? `/api/inspections/${inspectionId}` : null,
    fetcher,
  );

  const userRoles = session?.user?.roles as Role[] | undefined;
  const isAdmin = hasRole(userRoles, Role.ADMIN);
  const isOwner = inspection?.userId === session?.user?.id;
  const canApprove = isAdmin && inspection?.status === InspectionStatus.PENDING;
  const canDelete =
    isAdmin || (isOwner && inspection?.status === InspectionStatus.PENDING);

  const statusConfig: Record<
    string,
    { icon: typeof Clock; colorClass: string; label: string }
  > = {
    PENDING: {
      icon: Clock,
      colorClass:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      label: t("inspectionsPage.status.pending"),
    },
    APPROVED: {
      icon: CheckCircle2,
      colorClass:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      label: t("inspectionsPage.status.approved"),
    },
    REJECTED: {
      icon: XCircle,
      colorClass:
        "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800",
      label: t("inspectionsPage.status.rejected"),
    },
  };

  return (
    <section className="mx-auto px-4 pb-8 space-y-3 w-full">
      {/* ── Header ────────────────────────────── */}
      <header className="flex flex-row gap-2 md:gap-4 items-start sm:items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur -mx-4 px-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <H1>{t("inspectionsPage.detail.title")}</H1>
              {(() => {
                const cfg = statusConfig[inspection?.status as string];
                if (!cfg) return null;
                const Icon = cfg.icon;
                return (
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 px-2 gap-1 border ${cfg.colorClass}`}
                  >
                    <Icon className="size-2.5" />
                    {cfg.label}
                  </Badge>
                );
              })()}
            </div>
            <Paragraph>{t("inspectionsPage.detail.description")}</Paragraph>
          </div>
        </div>

        <div className="flex gap-2 items-center shrink-0">
          {inspection && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              title={t("inspectionsPage.pdf.download")}
            >
              {isGeneratingPdf ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileDown className="size-4" />
              )}
              <span className="hidden sm:inline">
                {isGeneratingPdf
                  ? t("inspectionsPage.pdf.generating")
                  : t("inspectionsPage.pdf.download")}
              </span>
            </Button>
          )}
          {canApprove && (
            <Button size="sm" onClick={() => setApprovalOpen(true)}>
              <ShieldCheck className="size-4" />
              <span className="hidden sm:inline">
                {t("inspectionsPage.approval.review")}
              </span>
            </Button>
          )}
          {canDelete &&
            inspection &&
            inspection.status !== InspectionStatus.APPROVED &&
            inspection.status !== InspectionStatus.REJECTED && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                <span className="hidden sm:inline">
                  {t("inspectionsPage.delete.title")}
                </span>
              </Button>
            )}

          <Button
            variant="outline"
            size="icon"
            className="shrink-0 size-9 rounded-lg"
            title={t("inspectionsPage.detail.backToList")}
            onClick={() => router.push("/dashboard/inspections")}
          >
            <ArrowLeft className="size-4" />
          </Button>
        </div>
      </header>

      {/* ── Content ───────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : inspection ? (
        <InspectionDetailCard inspection={inspection} />
      ) : (
        <div className="text-center py-20 space-y-3">
          <div className="inline-flex items-center justify-center size-14 rounded-full bg-muted mb-2">
            <XCircle className="size-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            {t("inspectionsPage.errors.notFound")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/inspections")}
          >
            <ArrowLeft className="size-4" />
            {t("inspectionsPage.detail.backToList")}
          </Button>
        </div>
      )}

      {/* ── Dialogs ───────────────────────────── */}
      <ApprovalDialog
        inspection={inspection || null}
        open={approvalOpen}
        onOpenChange={setApprovalOpen}
        onSuccess={() => mutate()}
      />

      <DeleteInspectionDialog
        inspection={inspection || null}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={() => router.push("/dashboard/inspections")}
      />
    </section>
  );
}
