"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/empty-card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  const { t } = useI18n();
  useEffect(() => {
    console.error("Dashboard error:", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error, t]);

  return (
    <div className="container mx-auto px-4 md:px-6">
      <EmptyCard
        icon={<AlertTriangle />}
        title={t("dashboard.error.title")}
        description={
          error.message ||
          t("dashboard.error.description")
        }
        className="min-h-[500px]"
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={reset} className="gap-2">
              <RefreshCw className="size-4" />
              {t("dashboard.error.tryAgain")}
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href="/dashboard/tasks">
                <Home className="size-4" />
                {t("dashboard.error.goBack")}
              </Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
