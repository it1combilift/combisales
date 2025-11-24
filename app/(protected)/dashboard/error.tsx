"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/empty-card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Dashboard error:", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="container mx-auto px-4 md:px-6">
      <EmptyCard
        icon={<AlertTriangle className="size-12 text-destructive" />}
        title="Algo salió mal"
        description={
          error.message ||
          "Ocurrió un error inesperado. Por favor, intenta nuevamente."
        }
        className="min-h-[500px]"
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={reset} className="gap-2">
              <RefreshCw className="size-4" />
              Intentar nuevamente
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href="/dashboard">
                <Home className="size-4" />
                Ir al Dashboard
              </Link>
            </Button>
          </div>
        }
      />
    </div>
  );
}
