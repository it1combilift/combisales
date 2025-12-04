import { cn } from "@/lib/utils";

// Header Font Component
export function H1({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        "text-lg xs:text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-primary",
        "drop-shadow-sm",
        "transition-all duration-200",
        "hover:text-primary/90 hover:scale-[1.02]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        "min-w-0 shrink truncate"
      )}
      {...(className && { className })}
    >
      {children}
    </h1>
  );
}

// Body Font Component
export function Paragraph({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`
        text-xs sm:text-sm
        leading-relaxed md:leading-loose 
        text-left 
        text-balance 
        text-muted-foreground 
        max-w-prose 
        transition-colors 
        duration-200
        ${className}
      `}
    >
      {children}
    </p>
  );
}

// Mono Font Component
export function MonoText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <code
      className={`
        font-mono
        text-[10px]
        sm:text-xs
        wrap-break-word 
        px-2 py-1 
        rounded-md 
        bg-muted/50 
        dark:bg-muted/30 
        border border-border/50 
        text-foreground/90 
        transition-all 
        duration-200 
        hover:bg-muted/70 
        dark:hover:bg-muted/50
        flex items-center gap-1
        ${className}
      `}
    >
      {children}
    </code>
  );
}
