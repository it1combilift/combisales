// Header Font Component
export function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="scroll-m-20 text-left text-xl md:text-4xl font-extrabold tracking-tight text-balance">
      {children}
    </h1>
  );
}

// Body Font Component
export function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-sm md:text-base leading-7 text-left text-balance text-muted-foreground">{children}</p>;
}
// Mono Font Component
export function MonoText({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-sm">{children}</code>;
}
