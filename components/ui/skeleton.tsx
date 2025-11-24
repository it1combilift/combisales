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
    <div className="container mx-auto px-4 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[350px]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </div>
      <Skeleton className="h-[400px] w-full rounded-lg" />
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

export {
  Skeleton,
  StatsCardSkeleton,
  TableRowSkeleton,
  TableContentSkeleton,
  UsersPageSkeleton,
  UserCardSkeleton,
};
