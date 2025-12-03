import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface EmptyCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actions?: React.ReactNode;
  className?: string;
}

export function EmptyCard({
  icon,
  title,
  description,
  actions,
  className,
}: EmptyCardProps) {
  return (
    <Empty className={className}>
      <EmptyHeader className="space-y-0">
        <EmptyMedia
          variant="icon"
          aria-hidden="true"
          className="mx-auto scale-90 sm:scale-100 transition-transform"
        >
          {icon}
        </EmptyMedia>
        <EmptyTitle className="text-sm sm:text-base px-4 text-center text-pretty">
          {title}
        </EmptyTitle>
        <EmptyDescription className="text-xs sm:text-sm max-w-2xl mx-auto text-center leading-relaxed text-pretty">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      {actions && (
        <EmptyContent className="mt-0 w-full max-w-md mx-auto">
          {actions}
        </EmptyContent>
      )}
    </Empty>
  );
}
