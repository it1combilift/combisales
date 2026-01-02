"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/empty-card";
import { useRouter, usePathname } from "next/navigation";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function DashboardNotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  useEffect(() => {
    console.log(`404 - Página no encontrada: ${pathname}`);
  }, [pathname]);

  return (
    <div className="container mx-auto px-4 md:px-6">
      <EmptyCard
        icon={<FileQuestion className="size-12" />}
        title="Página no encontrada"
        description="La página que buscas no existe o ha sido movida. Verifica la URL o regresa al dashboard."
        className="min-h-[500px]"
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild>
              <Link href="/dashboard/tasks" className="gap-2">
                <Home className="size-4" />
                Regresar
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              {t("common.back")}
            </Button>
          </div>
        }
      />
    </div>
  );
}
