"use client";

import { H1, Paragraph } from "@/components/fonts/fonts";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import { RefreshCw } from "lucide-react";

const DealersPage = () => {
  const { t } = useI18n();
  return (
    <section className="mx-auto px-4 space-y-3 w-full h-full">
      <div className="flex flex-row items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur py-0">
        <div>
          <H1>{t("dealerPage.title")}</H1>
          <div className="flex flex-col justify-start">
            <Paragraph>{t("dealerPage.description")}</Paragraph>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" title={t("common.refresh")} size="sm">
            <RefreshCw className={`size-4 `} />
            <span className="hidden md:inline">{t("common.refresh")}</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DealersPage;
