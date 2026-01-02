"use client";

import { ModeToggle } from "./mode-toggle";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LanguageSelector } from "./language-selector";

export function SiteHeader({ session }: { session?: any }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const getTitleFromPath = (path: string) => {
    if (path === "/dashboard") return "Dashboard";
    if (path.includes("/lifecycle")) return "Lifecycle";
    if (path.includes("/analytics")) return "Analytics";
    if (path.includes("/projects")) return "Projects";
    if (path.includes("/team")) return "Team";
    if (path.includes("/profile")) return "Cuenta";
    return "Dashboard";
  };


  return (
    <header className="pt-1 flex shrink-0 items-center gap-2 rounded-t-2xl bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) border-b border-muted-foreground/10">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6 py-1">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-xs sm:text-sm font-semibold">
          {t(getTitleFromPath(pathname))}
        </h1>

        <div className="ml-auto flex items-center gap-3">
          <Separator orientation="vertical" className="h-6 hidden md:block" />

          <LanguageSelector showFlag showFullName={false} />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
