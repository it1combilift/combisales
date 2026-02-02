"use client";

import { Spinner } from "../ui/spinner";
import { EmptyCard } from "../empty-card";
import { useI18n } from "@/lib/i18n/context";
import { cn, getInitials } from "@/lib/utils";
import { User, Mail, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SellerInfo {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
}

interface DealerSellerSelectorProps {
  sellers: SellerInfo[];
  isLoading: boolean;
  onSelect: (seller: SellerInfo) => void;
  selectedSellerId?: string;
}

export function DealerSellerSelector({
  sellers,
  isLoading,
  onSelect,
  selectedSellerId,
}: DealerSellerSelectorProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
        <Spinner variant="bars" className="size-4" />
        <span className="text-sm text-muted-foreground animate-pulse">
          {t("dealerPage.dialog.loadingSellers")}
        </span>
      </div>
    );
  }

  if (sellers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center gap-2">
        <EmptyCard
          icon={<User />}
          title={t("dealerPage.dialog.noSellersTitle")}
          description={t("dealerPage.dialog.noSellersAssigned")}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {sellers.map((seller) => {
        const isSelected = selectedSellerId === seller.id;

        return (
          <button
            key={seller.id}
            onClick={() => onSelect(seller)}
            className={cn(
              "group relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer",
              "hover:border-primary/50 hover:shadow-md hover:-translate-y-px",
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card",
            )}
          >
            <Avatar className="size-10 shrink-0">
              {seller.image ? (
                <AvatarImage
                  src={seller.image}
                  alt={seller.name || "Seller"}
                  className="object-center object-cover"
                />
              ) : null}

              <AvatarFallback
                className={cn(
                  "text-sm font-medium",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted",
                )}
              >
                {getInitials(seller.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">
                {seller.name || t("common.noName")}
              </p>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <Mail className="size-3 shrink-0" />
                {seller.email}
              </p>
            </div>

            {isSelected && (
              <div className="shrink-0 size-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="size-3 text-primary-foreground" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
