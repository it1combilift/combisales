import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  )
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
  )
}

// Table Row Skeleton
function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      {/* Avatar + Name */}
      <div className="flex items-center gap-3 flex-1">
        <Skeleton className="size-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48 md:hidden" />
        </div>
      </div>
      {/* Email - Hidden on mobile */}
      <div className="hidden md:block flex-1">
        <Skeleton className="h-4 w-48" />
      </div>
      {/* Role Badge */}
      <div className="w-24">
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      {/* Date - Hidden on small/medium */}
      <div className="hidden lg:block w-32">
        <Skeleton className="h-4 w-28" />
      </div>
      {/* Actions Button */}
      <div className="w-16 flex justify-end">
        <Skeleton className="size-8 rounded-md" />
      </div>
    </div>
  )
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
  )
}

// Users Page Complete Skeleton
function UsersPageSkeleton() {
  return (
    <section className="flex flex-col gap-6 px-4 sm:px-6 mx-auto w-full">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 sm:w-64" />
          <Skeleton className="h-4 w-64 sm:w-80" />
        </div>
        <Skeleton className="h-11 w-full sm:w-40" />
      </div>

      {/* Main Card Skeleton */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        {/* Card Header */}
        <div className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6 pt-0 space-y-4">
          {/* Search Bar Skeleton */}
          <Skeleton className="h-11 w-full" />

          {/* Table Skeleton */}
          <div className="rounded-lg border overflow-hidden">
            {/* Table Header */}
            <div className="bg-muted/50 p-4 border-b">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24 flex-1" />
                <Skeleton className="h-4 w-32 flex-1 hidden md:block" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32 hidden lg:block" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            {/* Table Rows */}
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </div>
        </div>
      </div>
    </section>
  )
}

export { Skeleton, StatsCardSkeleton, TableRowSkeleton, TableContentSkeleton, UsersPageSkeleton }
