import { LucideIcon } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "../ui/motion-tabs";

interface TabConfig {
  name: string;
  value: string;
  icon: LucideIcon;
  description: string;
  content: React.ReactNode;
}

interface AnimatedTabsComponentProps {
  tabs?: TabConfig[];
  defaultValue?: string;
}

const AnimatedTabsComponent = ({
  tabs = [],
  defaultValue = "visits",
}: AnimatedTabsComponentProps) => {
  return (
    <div className="w-full">
      <Tabs defaultValue={defaultValue} className="flex flex-col gap-6">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <TabsList className="inline-flex min-w-full sm:min-w-0 p-1 bg-muted/50 rounded-lg border border-border/50 backdrop-blur-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 sm:flex-initial min-w-0 sm:min-w-[140px] gap-0 sm:gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground hover:text-foreground rounded-md"
                  title={tab.name}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline truncate">{tab.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContents className="min-h-[300px] sm:min-h-[400px] transition-all">
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
