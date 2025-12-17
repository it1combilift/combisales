"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/empty-card";
import { useRouter, usePathname } from "next/navigation";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function DashboardCatchAll() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log(`404 - Ruta no encontrada en dashboard: ${pathname}`);
  }, [pathname]);

  return (
    <div className="container mx-auto px-4 md:px-6">
      <EmptyCard
        icon={<FileQuestion className="size-12" />}
        title="Página no encontrada"
        description={`La ruta "${pathname}" no existe. Verifica la URL o regresa al dashboard principal.`}
        className="min-h-[500px]"
        actions={
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild>
              <Link href="/dashboard/clients" className="gap-2">
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
              Volver atrás
            </Button>
          </div>
        }
      />
    </div>
  );
}
