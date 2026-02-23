import { cn } from "@/lib/utils";
import { TableRow, TableCell } from "@/components/ui/table";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

// Stats Card Skeleton
function StatsCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="size-4 rounded-full" />
      </div>
      <div className="p-6 pt-0">
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}

// Table Row Skeleton
function TableRowSkeleton() {
  return (
    <TableRow>
      {/* Checkbox */}
      <TableCell className="w-12">
        <Skeleton className="size-4 rounded" />
      </TableCell>
      {/* User (Avatar + Name + Email) */}
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-lg shrink-0" />
          <div className="space-y-2 flex-1 min-w-0">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </TableCell>
      {/* Role */}
      <TableCell>
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>
      {/* Created At */}
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      {/* Country */}
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      {/* Status */}
      <TableCell>
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>
      {/* Auth */}
      <TableCell>
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>
      {/* Last Login */}
      <TableCell>
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>
      {/* Actions */}
      <TableCell className="w-12">
        <div className="flex justify-end">
          <Skeleton className="size-8 rounded-md" />
        </div>
      </TableCell>
    </TableRow>
  );
}

// Table Content Skeleton (for refresh state)
function TableContentSkeleton() {
  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Table Header */}
      <div className="bg-muted/50 p-4 border-b">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex-1 hidden md:block">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="w-24">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="w-32 hidden lg:block">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="w-16 flex justify-end">
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
      {/* Table Rows */}
      <TableRowSkeleton />
      <TableRowSkeleton />
      <TableRowSkeleton />
      <TableRowSkeleton />
      <TableRowSkeleton />
    </div>
  );
}

// Users Page Complete Skeleton
function UsersPageSkeleton() {
  return (
    <div className="container mx-auto px-4 md:px-6 space-y-6 animate-in fade-in duration-300">
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
      <div className="rounded-lg border overflow-hidden bg-card">
        <div className="divide-y">
          <Skeleton className="h-[50vh] w-full" />
        </div>
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

// User Card Skeleton (for mobile view)
function UserCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="size-12 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="size-8 rounded" />
        </div>
      </div>
      <div className="border-t" />
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// INSPECTIONS PAGE SKELETONS
// ──────────────────────────────────────────────────────────────────────────────

// ---- Filters bar skeletons ----

function InspectionFiltersSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
      <Skeleton className="h-9 flex-1 min-w-40 sm:max-w-xs" />
      <Skeleton className="h-9 w-full sm:w-36" />
      <div className="flex-1 hidden sm:block" />
      <Skeleton className="h-9 w-full sm:w-28" />
      <div className="flex gap-1.5">
        <Skeleton className="h-9 w-9 rounded-md shrink-0" />
        <Skeleton className="h-9 w-9 rounded-md shrink-0" />
      </div>
    </div>
  );
}

function VehicleFiltersSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
      <Skeleton className="h-9 flex-1 min-w-40 sm:max-w-xs" />
      <Skeleton className="h-9 w-full sm:w-36" />
      <Skeleton className="h-9 w-full sm:w-36" />
      <div className="flex-1 hidden sm:block" />
      <div className="flex gap-1.5">
        <Skeleton className="h-9 w-9 rounded-md shrink-0" />
        <Skeleton className="h-9 w-9 rounded-md shrink-0" />
      </div>
    </div>
  );
}

// ---- Card skeletons ----

/** Replicates the exact visual structure of InspectionCard */
function InspectionCardSkeleton() {
  return (
    <div className="relative overflow-hidden border rounded-2xl shadow-sm bg-card flex flex-col">
      {/* Left status accent bar */}
      <div className="absolute inset-y-0 left-0 w-[3px] rounded-l-2xl bg-muted" />

      <div className="pl-5 pr-4 pb-4 pt-4 flex flex-col gap-4">
        {/* Header: vehicle image + model/plate + status badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Skeleton className="size-20 rounded-xl shrink-0" />
            <div className="flex flex-col gap-1.5 min-w-0">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full shrink-0" />
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50" />

        {/* Metadata */}
        <div className="space-y-2">
          {/* Inspector avatar row */}
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-full shrink-0" />
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          {/* 3 icon-based metadata items */}
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2 min-w-0">
                <Skeleton className="size-6 rounded-md shrink-0" />
                <Skeleton className="h-3 flex-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Score bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="flex-1 h-8 rounded-lg" />
          <Skeleton className="size-8 rounded-lg shrink-0" />
        </div>
      </div>
    </div>
  );
}

/** Replicates the exact visual structure of VehicleCard */
function VehicleCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm flex flex-col">
      {/* Image area — aspect-[16/10] */}
      <div className="relative w-full" style={{ paddingBottom: "62.5%" }}>
        <Skeleton className="absolute inset-0 rounded-none" />
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3">
        {/* Model + plate + status badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1.5 min-w-0">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full shrink-0" />
        </div>

        {/* Metadata rows */}
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="size-4 rounded shrink-0" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>

        {/* Action row */}
        <div className="flex gap-2 pt-1">
          <Skeleton className="flex-1 h-8 rounded-lg" />
          <Skeleton className="size-8 rounded-lg shrink-0" />
        </div>
      </div>
    </div>
  );
}

/** Replicates the exact visual structure of InspectorCard */
function InspectorCardSkeleton() {
  return (
    <div className="relative overflow-hidden border rounded-2xl shadow-sm bg-card flex flex-col">
      {/* Left status band */}
      <div className="w-1 shrink-0 absolute inset-y-0 left-0 bg-muted rounded-l-2xl" />

      <div className="px-4 pt-4 pb-4 flex flex-col gap-4 flex-1">
        {/* Header: avatar + name/email/roles + menu */}
        <div className="flex items-start gap-3">
          <Skeleton className="size-12 rounded-xl shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
            <div className="flex gap-1 mt-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <Skeleton className="size-8 rounded-md shrink-0" />
        </div>

        {/* Stats: vehicles + inspections */}
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-lg bg-muted/40 p-2.5 space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-8" />
            </div>
          ))}
        </div>

        {/* Footer: date + action button */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ---- Table row skeletons ----

function InspectionsTableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Skeleton className="size-10 rounded-lg shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2 w-36">
        <Skeleton className="size-6 rounded-full shrink-0" />
        <Skeleton className="h-3.5 w-20" />
      </div>
      <div className="hidden md:block w-24">
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="hidden lg:block w-24">
        <Skeleton className="h-3.5 w-16" />
      </div>
      <div className="hidden lg:block w-28">
        <Skeleton className="h-3.5 w-20" />
      </div>
      <div className="flex gap-1.5 shrink-0">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

function VehiclesTableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Skeleton className="size-10 rounded-lg shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="hidden sm:block w-24">
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="hidden md:flex items-center gap-2 w-36">
        <Skeleton className="size-6 rounded-full shrink-0" />
        <Skeleton className="h-3.5 w-20" />
      </div>
      <div className="hidden lg:block w-20">
        <Skeleton className="h-3.5 w-10" />
      </div>
      <div className="hidden lg:block w-28">
        <Skeleton className="h-3.5 w-20" />
      </div>
      <div className="flex gap-1.5 shrink-0">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

function InspectorsTableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Skeleton className="size-10 rounded-xl shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
      <div className="hidden sm:block w-24">
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="hidden md:block w-20">
        <Skeleton className="h-3.5 w-10" />
      </div>
      <div className="hidden md:block w-20">
        <Skeleton className="h-3.5 w-10" />
      </div>
      <div className="hidden lg:block w-28">
        <Skeleton className="h-3.5 w-20" />
      </div>
      <div className="flex gap-1.5 shrink-0">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

// ---- Table container skeletons ----

function InspectionsTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-3 bg-muted/40 border-b">
        <Skeleton className="h-4 w-28 flex-1" />
        <Skeleton className="h-4 w-24 hidden sm:block" />
        <Skeleton className="h-4 w-20 hidden md:block" />
        <Skeleton className="h-4 w-16 hidden lg:block" />
        <Skeleton className="h-4 w-20 hidden lg:block" />
        <Skeleton className="h-4 w-16 shrink-0" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <InspectionsTableRowSkeleton key={i} />
      ))}
    </div>
  );
}

function VehiclesTableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-3 bg-muted/40 border-b">
        <Skeleton className="h-4 w-28 flex-1" />
        <Skeleton className="h-4 w-20 hidden sm:block" />
        <Skeleton className="h-4 w-24 hidden md:block" />
        <Skeleton className="h-4 w-16 hidden lg:block" />
        <Skeleton className="h-4 w-20 hidden lg:block" />
        <Skeleton className="h-4 w-16 shrink-0" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <VehiclesTableRowSkeleton key={i} />
      ))}
    </div>
  );
}

function InspectorsTableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-3 bg-muted/40 border-b">
        <Skeleton className="h-4 w-28 flex-1" />
        <Skeleton className="h-4 w-20 hidden sm:block" />
        <Skeleton className="h-4 w-16 hidden md:block" />
        <Skeleton className="h-4 w-16 hidden md:block" />
        <Skeleton className="h-4 w-20 hidden lg:block" />
        <Skeleton className="h-4 w-16 shrink-0" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <InspectorsTableRowSkeleton key={i} />
      ))}
    </div>
  );
}

// ---- Full tab content skeletons ----

/** Complete skeleton for the Inspections tab */
function InspectionTabSkeleton({
  viewMode = "grid",
}: {
  viewMode?: "grid" | "table";
}) {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <InspectionFiltersSkeleton />
      <div className="flex items-center">
        <Skeleton className="h-3.5 w-44" />
      </div>
      {viewMode === "table" ? (
        <InspectionsTableSkeleton rows={6} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <InspectionCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Complete skeleton for the Vehicles tab */
function VehicleTabSkeleton({
  viewMode = "grid",
  showAdminButton = false,
}: {
  viewMode?: "grid" | "list";
  showAdminButton?: boolean;
}) {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-44" />
        {showAdminButton && <Skeleton className="h-8 w-28 rounded-md" />}
      </div>
      <VehicleFiltersSkeleton />
      {viewMode === "list" ? (
        <VehiclesTableSkeleton rows={5} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <VehicleCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Complete skeleton for the Inspectors tab */
function InspectorTabSkeleton({
  viewMode = "grid",
}: {
  viewMode?: "grid" | "list";
}) {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-44" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
      <VehicleFiltersSkeleton />
      {viewMode === "list" ? (
        <InspectorsTableSkeleton rows={5} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <InspectorCardSkeleton key={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export {
  Skeleton,
  StatsCardSkeleton,
  TableRowSkeleton,
  TableContentSkeleton,
  UsersPageSkeleton,
  UserCardSkeleton,
  // Inspections page
  InspectionFiltersSkeleton,
  VehicleFiltersSkeleton,
  InspectionCardSkeleton,
  VehicleCardSkeleton,
  InspectorCardSkeleton,
  InspectionsTableSkeleton,
  VehiclesTableSkeleton,
  InspectorsTableSkeleton,
  InspectionTabSkeleton,
  VehicleTabSkeleton,
  InspectorTabSkeleton,
};
