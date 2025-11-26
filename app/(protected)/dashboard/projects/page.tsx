import { H1, Paragraph } from "@/components/fonts/fonts";

export default function ProjectsPage() {
  return (
    <section className="mx-auto px-4 space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <H1>Gestión de proyectos</H1>
          <Paragraph>Administra los proyectos de la empresa</Paragraph>
        </div>

        <div className="flex gap-2">actions buttons</div>
      </div>
    </section>
  );
}
