"use client";

import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import { useI18n } from "@/lib/i18n/context";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SellerInfo } from "@/interfaces/user";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, User, X, Check, UserCheck } from "lucide-react";

interface SellerSelectionProps {
  /** Currently selected seller ID (single selection) */
  selectedSellerId: string | null | undefined;
  /** Callback when seller selection changes */
  onSelectionChange: (id: string | null) => void;
  className?: string;
}

/**
 * Single seller selection component for DEALER users.
 * A DEALER can only have ONE assigned seller.
 */
export function SellerSelection({
  selectedSellerId,
  onSelectionChange,
  className,
}: SellerSelectionProps) {
  const { t } = useI18n();
  const [sellers, setSellers] = useState<SellerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch sellers
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/users/sellers");

        if (!response.ok) {
          throw new Error("Failed to fetch sellers");
        }

        const data = await response.json();
        setSellers(data.sellers || []);
      } catch (err) {
        console.error("Error fetching sellers:", err);
        setError(t("users.form.sellers.errorLoading"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellers();
  }, [t]);

  // Filtered sellers based on search
  const filteredSellers = useMemo(() => {
    if (!searchQuery.trim()) return sellers;

    const query = searchQuery.toLowerCase();
    return sellers.filter(
      (seller) =>
        seller.name?.toLowerCase().includes(query) ||
        seller.email.toLowerCase().includes(query) ||
        seller.country?.toLowerCase().includes(query),
    );
  }, [sellers, searchQuery]);

  // Get the currently selected seller object
  const selectedSeller = useMemo(() => {
    if (!selectedSellerId) return null;
    return sellers.find((seller) => seller.id === selectedSellerId) || null;
  }, [sellers, selectedSellerId]);

  // Available sellers (excluding selected one)
  const availableSellers = useMemo(() => {
    return filteredSellers.filter((seller) => seller.id !== selectedSellerId);
  }, [filteredSellers, selectedSellerId]);

  const handleSelectSeller = useCallback(
    (sellerId: string) => {
      onSelectionChange(sellerId);
    },
    [onSelectionChange],
  );

  const handleRemoveSeller = useCallback(() => {
    onSelectionChange(null);
  }, [onSelectionChange]);

  return (
    <div className={cn("w-full flex flex-col", className)}>
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Spinner variant="bars" size={12} />
          <span className="ml-2 text-xs text-muted-foreground animate-pulse">
            {t("users.form.sellers.loading")}
          </span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <div className="flex flex-col gap-3 max-h-[calc(100vh-400px)] sm:max-h-[350px] overflow-hidden">
          {/* Selected Seller Section */}
          <div className="border rounded-lg bg-primary/5 border-primary/20 overflow-hidden">
            <div className="flex items-center justify-between w-full px-3 py-2">
              <div className="flex items-center gap-2">
                <UserCheck className="size-4 text-primary" />
                <span className="text-xs font-semibold">
                  {t("users.form.sellers.assigned")}
                </span>
              </div>
              {selectedSeller && (
                <Badge
                  variant="default"
                  className="text-[10px] px-1.5 py-0 h-4"
                >
                  1
                </Badge>
              )}
            </div>

            <div className="px-2 pb-2">
              {!selectedSeller ? (
                <div className="text-center text-muted-foreground py-3 px-2">
                  <User className="size-4 mx-auto mb-1 opacity-50" />
                  <p className="text-[11px]">
                    {t("users.form.sellers.noAssigned")}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                    {t("users.form.sellers.selectOneBelow")}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 py-1.5 px-2 rounded-md bg-background border h-14">
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage
                      src={selectedSeller.image || undefined}
                      alt={selectedSeller.name || selectedSeller.email}
                      className="object-center object-cover"
                    />
                    <AvatarFallback className="text-xs bg-primary/10">
                      {getInitials(selectedSeller.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs truncate leading-tight">
                      {selectedSeller.name || selectedSeller.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate leading-tight">
                      {selectedSeller.email}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-6 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 touch-manipulation"
                    onClick={handleRemoveSeller}
                    title={t("users.form.sellers.removeSeller")}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Available Sellers Section */}
          <div className="border rounded-lg overflow-hidden flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between w-full px-3 py-2 border-b">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">
                  {t("users.form.sellers.available")}
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 tabular-nums"
                >
                  {availableSellers.length}
                </Badge>
              </div>
            </div>

            <div className="px-2 py-2 flex flex-col gap-2 min-h-0 flex-1">
              {/* Search */}
              <div className="relative shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder={t("users.form.sellers.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 h-7 text-xs"
                />
              </div>

              {/* Available sellers list */}
              {availableSellers.length === 0 ? (
                <div className="text-center py-3 text-muted-foreground">
                  <User className="size-4 mx-auto mb-1 opacity-50" />
                  <p className="text-[11px]">
                    {searchQuery
                      ? t("users.form.sellers.noResults")
                      : t("users.form.sellers.noAvailable")}
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[120px] sm:max-h-[150px] flex-1 min-h-0">
                  <div className="space-y-1 pr-2">
                    {availableSellers.map((seller) => (
                      <button
                        key={seller.id}
                        type="button"
                        onClick={() => handleSelectSeller(seller.id)}
                        className="flex items-center gap-2 py-1.5 px-2 rounded-md bg-background border touch-manipulation h-14 w-full text-left hover:bg-accent/50 hover:border-primary/30 transition-colors"
                      >
                        <Avatar className="size-10 shrink-0">
                          <AvatarImage
                            src={seller.image || undefined}
                            alt={seller.name || seller.email}
                            className="object-center object-cover"
                          />
                          <AvatarFallback className="text-xs bg-primary/10">
                            {getInitials(seller.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs truncate leading-tight">
                            {seller.name || seller.email}
                          </p>
                          <p className="text-xs text-muted-foreground truncate leading-tight">
                            {seller.email}
                          </p>
                        </div>
                        <Check className="size-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
