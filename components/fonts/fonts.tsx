// Header Font Component
export function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="scroll-m-20 text-left text-xl sm:text-2xl font-extrabold tracking-tight text-balance leading-tight">
      {children}
    </h1>
  );
}

// Body Font Component
export function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs sm:text-sm leading-relaxed text-left text-balance text-muted-foreground max-w-prose">
      {children}
    </p>
  );
}
// Mono Font Component
export function MonoText({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs sm:text-sm md:text-base wrap-break-word px-1 py-0.5 rounded bg-muted">
      {children}
    </code>
  );
}
