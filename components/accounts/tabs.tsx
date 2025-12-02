import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "../ui/motion-tabs";
import { FileText, FolderKanban, History } from "lucide-react";

const tabs = [
  {
    name: "Visitas",
    value: "visits",
    icon: History,
    description: "Historial completo de visitas realizadas",
    content: (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="rounded-full bg-muted/50 p-6 mb-4">
          <History className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          Historial de Visitas
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Aquí se mostrará el historial completo de visitas del cliente,
          incluyendo fechas, notas y seguimientos.
        </p>
      </div>
    ),
  },
  {
    name: "Detalles",
    value: "details",
    icon: FileText,
    description: "Información completa del cliente",
    content: (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="rounded-full bg-muted/50 p-6 mb-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          Detalles del Cliente
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Información detallada del cliente, datos de contacto, dirección y
          preferencias.
        </p>
      </div>
    ),
  },
  {
    name: "Proyectos",
    value: "projects",
    icon: FolderKanban,
    description: "Proyectos vinculados",
    content: (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="rounded-full bg-muted/50 p-6 mb-4">
          <FolderKanban className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          Proyectos Asociados
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Lista de proyectos relacionados con este cliente, estados y progreso.
        </p>
      </div>
    ),
  },
];

const AnimatedTabsComponent = () => {
  return (
    <div className="w-full">
      <Tabs defaultValue="visits" className="flex flex-col gap-6">
        {/* Tabs Navigation */}
        <div className="w-full overflow-x-auto scrollbar-hide">
          <TabsList className="inline-flex min-w-full sm:min-w-0 p-1 bg-muted/50 rounded-lg border border-border/50 backdrop-blur-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 sm:flex-initial min-w-[120px] sm:min-w-[140px] gap-2 px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground hover:text-foreground rounded-md"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{tab.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Tabs Content Container */}
        <TabsContents className="min-h-[400px] rounded-xl border border-border/50 bg-card shadow-sm transition-all">
          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
            >
              <div className="w-full h-full animate-in fade-in-50 duration-300">
                {tab.content}
              </div>
            </TabsContent>
          ))}
        </TabsContents>
      </Tabs>
    </div>
  );
};

export default AnimatedTabsComponent;
