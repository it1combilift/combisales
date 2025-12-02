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
      className={`
        scroll-m-20 
        text-left 
        text-xl sm:text-2xl
        font-extrabold 
        tracking-tight 
        text-balance 
        leading-tight 
        bg-linear-to-r from-foreground to-foreground/80 
        bg-clip-text 
        transition-colors 
        duration-200
        ${className}
      `}
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
        text-xs sm:text-sm
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
        ${className}
      `}
    >
      {children}
    </code>
  );
}
