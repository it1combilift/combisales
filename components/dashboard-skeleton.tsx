import { Skeleton } from "./ui/skeleton";

/**
 * Componente de skeleton genérico para páginas del dashboard
 * Representa la estructura común de las páginas:
 * - Header con título, descripción y acciones
 * - Controles/filtros superiores
 * - Contenido principal genérico
 * - Footer con paginación
 *
 * Compatible con modo claro/oscuro y completamente responsivo
 */
export function DashboardPageSkeleton() {
  return (
    <div className="mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-2">
        {/* Title and Description */}
        <div className="space-y-2.5 flex-1">
          <Skeleton className="h-9 w-72 max-w-full" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Controls/Filters Section */}
      <div className="flex flex-col sm:flex-row gap-3 pb-1">
        <Skeleton className="h-10 w-full sm:w-64" />
        <Skeleton className="h-10 w-full sm:w-40" />
        <Skeleton className="h-10 w-full sm:w-40" />
        <div className="flex-1" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Main Content - Generic blocks with border */}
      <div className="rounded-lg overflow-hidden">
        <Skeleton className="h-[50vh] w-full" />
      </div>

      {/* Footer/Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <Skeleton className="h-4 w-56" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * Variante compacta del skeleton (para modales o secciones más pequeñas)
 */
export function DashboardPageSkeletonCompact() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Content blocks */}
      <div className="space-y-2">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Skeleton para tarjetas de estadísticas (dashboard home)
 */
export function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-4 rounded-full" />
          </div>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}
