import { Skeleton } from "./ui/skeleton";

export function DashboardPageSkeleton() {
  return (
    <div className="mx-auto space-y-6 animate-in fade-in duration-300 w-full">
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

export function DashboardProjectsPageSkeleton() {
  return (
    <div className="mx-auto space-y-6 animate-in fade-in duration-300 w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-2">
        {/* Title and Description */}
        <div className="space-y-2.5 flex-1">
          <Skeleton className="h-8 w-56" /> {/* Gestión de proyectos */}
          <Skeleton className="h-4 w-80 max-w-full" /> {/* Subtitle */}
          <Skeleton className="h-4 w-44 mt-2" /> {/* 200 cuentas encontradas */}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" /> {/* Exportar */}
          <Skeleton className="h-9 w-28" /> {/* Actualizar */}
        </div>
      </div>

      {/* Search and Columns Button */}
      <div className="flex flex-col sm:flex-row gap-3 pb-1">
        <Skeleton className="h-10 w-full sm:w-80" /> {/* Search bar */}
        <div className="flex-1" />
        <Skeleton className="h-10 w-32" /> {/* Columnas button */}
      </div>

      {/* Table Header */}
      <div className="rounded-t-lg border border-b-0 bg-muted/50 p-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-4 rounded" /> {/* Checkbox */}
          <Skeleton className="h-4 w-20" /> {/* Cuenta */}
          <Skeleton className="h-4 w-24 ml-auto" /> {/* Industria */}
          <Skeleton className="h-4 w-20" /> {/* País */}
          <Skeleton className="h-4 w-24" /> {/* Contacto */}
          <Skeleton className="h-4 w-32" /> {/* Propietario */}
          <Skeleton className="h-4 w-32" /> {/* Últ. modificación */}
          <Skeleton className="h-4 w-4" /> {/* Actions */}
        </div>
      </div>

      {/* Table Rows */}
      <div className="rounded-b-lg border overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 border-b last:border-b-0"
          >
            <Skeleton className="h-4 w-4 rounded" /> {/* Checkbox */}
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <Skeleton className="h-4 w-32" /> {/* Company name */}
              <Skeleton className="h-3 w-24" /> {/* Cliente Final */}
            </div>
            <Skeleton className="h-4 w-32 hidden md:block" /> {/* Industria */}
            <div className="hidden lg:flex flex-col gap-1 w-28">
              <Skeleton className="h-4 w-20" /> {/* Country */}
              <Skeleton className="h-3 w-24" /> {/* City */}
            </div>
            <Skeleton className="h-4 w-24 hidden xl:block" /> {/* Contacto */}
            <div className="hidden xl:flex flex-col gap-1 w-36">
              <Skeleton className="h-4 w-32" /> {/* Owner name */}
              <Skeleton className="h-3 w-36" /> {/* Email */}
            </div>
            <Skeleton className="h-4 w-24 hidden sm:block" /> {/* Date */}
            <Skeleton className="h-8 w-8" /> {/* Actions menu */}
          </div>
        ))}
      </div>

      {/* Footer/Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <Skeleton className="h-4 w-56" /> {/* Selected items text */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32" /> {/* Rows per page */}
          <Skeleton className="h-9 w-28" /> {/* Page number */}
          <div className="flex gap-1">
            <Skeleton className="h-9 w-9" /> {/* First */}
            <Skeleton className="h-9 w-9" /> {/* Previous */}
            <Skeleton className="h-9 w-9" /> {/* Next */}
            <Skeleton className="h-9 w-9" /> {/* Last */}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardUsersPageSkeleton() {
  return (
    <div className="mx-auto space-y-6 animate-in fade-in duration-300 w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-2">
        {/* Title and Description */}
        <div className="space-y-2.5 flex-1">
          <Skeleton className="h-8 w-56" /> {/* Gestión de usuarios */}
          <Skeleton className="h-4 w-64 max-w-full" />{" "}
          {/* Administra los usuarios del sistema */}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28" /> {/* Actualizar */}
          <Skeleton className="h-9 w-24" /> {/* Agregar */}
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="flex flex-col lg:flex-row gap-3 pb-1">
        <Skeleton className="h-10 w-full lg:w-80" /> {/* Búsqueda */}
        <div className="flex-1" />
        <Skeleton className="h-10 w-full sm:w-40" /> {/* Rol dropdown */}
        <Skeleton className="h-10 w-full sm:w-40" /> {/* Estado dropdown */}
      </div>

      {/* Table Header */}
      <div className="rounded-t-lg border border-b-0 bg-muted/50 p-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-4 rounded" /> {/* Checkbox */}
          <Skeleton className="h-4 w-20" /> {/* Usuario */}
          <Skeleton className="h-4 w-16 ml-auto" /> {/* Rol */}
          <Skeleton className="h-4 w-20" /> {/* Creación */}
          <Skeleton className="h-4 w-24" /> {/* País */}
          <Skeleton className="h-4 w-20" /> {/* Cuenta */}
          <Skeleton className="h-4 w-16" /> {/* Auth */}
          <Skeleton className="h-4 w-24" /> {/* Últ. Login */}
          <Skeleton className="h-4 w-20" /> {/* Zoho ID */}
          <Skeleton className="h-4 w-4" /> {/* Actions */}
        </div>
      </div>

      {/* Table Rows */}
      <div className="rounded-b-lg border overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 border-b last:border-b-0"
          >
            <Skeleton className="h-4 w-4 rounded" /> {/* Checkbox */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Skeleton className="h-10 w-10 rounded-full" /> {/* Avatar */}
              <div className="flex flex-col gap-1 min-w-0">
                <Skeleton className="h-4 w-32" /> {/* User name */}
                <Skeleton className="h-3 w-40" /> {/* Email */}
              </div>
            </div>
            <div className="hidden md:block">
              <Skeleton className="h-6 w-20 rounded-full" /> {/* Rol badge */}
            </div>
            <Skeleton className="h-4 w-32 hidden lg:block" /> {/* Creación */}
            <Skeleton className="h-4 w-28 hidden xl:block" /> {/* País */}
            <div className="hidden xl:block">
              <Skeleton className="h-6 w-20 rounded-full" />{" "}
              {/* Cuenta badge */}
            </div>
            <div className="hidden 2xl:flex items-center gap-2">
              <Skeleton className="h-4 w-4" /> {/* Auth icon */}
              <Skeleton className="h-4 w-12" /> {/* Auth text */}
            </div>
            <Skeleton className="h-4 w-32 hidden sm:block" /> {/* Últ. Login */}
            <Skeleton className="h-4 w-20 hidden lg:block" /> {/* Zoho ID */}
            <Skeleton className="h-8 w-8" /> {/* Actions menu */}
          </div>
        ))}
      </div>

      {/* Footer/Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <Skeleton className="h-4 w-40" /> {/* Mostrando 2 de 2 usuario(s) */}
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-9 w-24" /> {/* Anterior */}
          <Skeleton className="h-9 w-32" /> {/* Página 1 de 1 */}
          <Skeleton className="h-9 w-24" /> {/* Siguiente */}
        </div>
      </div>
    </div>
  );
}

export function DashboardLayoutSkeleton() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-56 border-r bg-background">
        {/* Logo Section */}
        <div className="flex items-center gap-2 p-4 border-b h-14">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Dashboard */}
          <div className="flex items-center gap-3 px-3 py-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Proyectos */}
          <div className="flex items-center gap-3 px-3 py-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Usuarios */}
          <div className="flex items-center gap-3 px-3 py-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Archivos Section */}
          <div className="pt-4">
            <Skeleton className="h-3 w-16 mb-3 px-3" />
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-3 py-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-3 px-3 py-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center gap-3 px-3 py-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center gap-3 px-3 py-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-3 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-3 px-3 py-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex items-center gap-3 px-3 py-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-12" />
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 px-3 py-2 border-t pt-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-2 w-24" />
            </div>
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between border-b px-4 lg:px-6 h-14 shrink-0">
          {/* Left side - Menu + Title */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 lg:hidden" /> {/* Mobile menu */}
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Right side - User + Language */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-6" />
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-8 w-32" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
            ))}
          </div>

          {/* Chart Section */}
          <div className="rounded-lg border bg-card">
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-24 rounded-md" />
                  <Skeleton className="h-9 w-24 rounded-md" />
                  <Skeleton className="h-9 w-20 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-lg border">
              <div className="bg-muted/50 p-4 border-b">
                <div className="flex items-center gap-6">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 border-b last:border-b-0 flex items-center gap-6"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function AccountsCardsPageSkeleton() {
  return (
    <>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-muted animate-pulse rounded w-3/4"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
        </div>
        <div className="h-8 w-8 bg-muted animate-pulse rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded w-full"></div>
        <div className="h-4 bg-muted animate-pulse rounded w-5/6"></div>
      </div>
    </>
  );
}

export function VisitCardSkeleton() {
  return (
    <>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="h-4 w-4 rounded bg-muted" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-24 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
          </div>
        </div>
        <div className="h-8 w-8 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-11 rounded bg-muted" />
        <div className="h-11 rounded bg-muted" />
      </div>
      <div className="pt-3 border-t">
        <div className="h-11 rounded bg-muted" />
      </div>
    </>
  );
}
