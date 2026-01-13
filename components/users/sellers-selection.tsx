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
import { Search, User, X, Plus, ChevronDown, ChevronUp } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SellersSelectionProps {
  selectedSellerIds: string[];
  onSelectionChange: (ids: string[]) => void;
  className?: string;
}

export function SellersSelection({
  selectedSellerIds,
  onSelectionChange,
  className,
}: SellersSelectionProps) {
  const { t } = useI18n();
  const [sellers, setSellers] = useState<SellerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAssignedOpen, setIsAssignedOpen] = useState(true);
  const [isAvailableOpen, setIsAvailableOpen] = useState(true);

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
        seller.country?.toLowerCase().includes(query)
    );
  }, [sellers, searchQuery]);

  // Separate assigned sellers from available ones
  const assignedSellers = useMemo(() => {
    return sellers.filter((seller) => selectedSellerIds.includes(seller.id));
  }, [sellers, selectedSellerIds]);

  const availableSellers = useMemo(() => {
    if (!searchQuery.trim()) {
      return sellers.filter((seller) => !selectedSellerIds.includes(seller.id));
    }
    const query = searchQuery.toLowerCase();
    return sellers.filter(
      (seller) =>
        !selectedSellerIds.includes(seller.id) &&
        (seller.name?.toLowerCase().includes(query) ||
          seller.email.toLowerCase().includes(query) ||
          seller.country?.toLowerCase().includes(query))
    );
  }, [sellers, selectedSellerIds, searchQuery]);

  const handleRemoveSeller = useCallback(
    (sellerId: string) => {
      onSelectionChange(selectedSellerIds.filter((id) => id !== sellerId));
    },
    [selectedSellerIds, onSelectionChange]
  );

  const handleAddSeller = useCallback(
    (sellerId: string) => {
      onSelectionChange([...selectedSellerIds, sellerId]);
    },
    [selectedSellerIds, onSelectionChange]
  );

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
        <div className="flex flex-col gap-2 max-h-[calc(100vh-400px)] sm:max-h-[400px] overflow-hidden">
          {/* Assigned Sellers Section - Collapsible */}
          <Collapsible
            open={isAssignedOpen}
            onOpenChange={setIsAssignedOpen}
            className="border rounded-lg bg-primary/5 border-primary/20 overflow-hidden"
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-between w-full px-3 py-2 hover:bg-primary/10 transition-colors touch-manipulation"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">
                    {t("users.form.sellers.assigned")}
                  </span>
                  <Badge
                    variant="default"
                    className="text-[10px] px-1.5 py-0 h-4 tabular-nums"
                  >
                    {assignedSellers.length}
                  </Badge>
                </div>
                {isAssignedOpen ? (
                  <ChevronUp className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col min-h-0 flex-1">
              <div className="px-2 pb-2">
                {assignedSellers.length === 0 ? (
                  <div className="text-center text-muted-foreground py-3 px-2">
                    <User className="size-4 mx-auto mb-1 opacity-50" />
                    <p className="text-[11px]">
                      {t("users.form.sellers.noAssigned")}
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[120px] sm:max-h-[150px] flex-1 min-h-0 overflow-y-auto">
                    <div className="space-y-1 pr-2">
                      {assignedSellers.map((seller) => (
                        <div
                          key={seller.id}
                          className="flex items-center gap-2 py-1.5 px-2 rounded-md bg-background border touch-manipulation"
                        >
                          <Avatar className="size-7 shrink-0">
                            <AvatarImage
                              src={seller.image || undefined}
                              alt={seller.name || seller.email}
                            />
                            <AvatarFallback className="text-[10px] bg-primary/10">
                              {getInitials(seller.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[11px] truncate leading-tight">
                              {seller.name || seller.email}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate leading-tight">
                              {seller.email}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-6 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 touch-manipulation"
                            onClick={() => handleRemoveSeller(seller.id)}
                            title={t("users.form.sellers.removeSeller")}
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Available Sellers Section - Collapsible */}
          <Collapsible
            open={isAvailableOpen}
            onOpenChange={setIsAvailableOpen}
            className="border rounded-lg overflow-hidden flex-1 flex flex-col min-h-0"
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-between w-full px-3 py-2 hover:bg-accent/50 transition-colors touch-manipulation"
              >
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
                {isAvailableOpen ? (
                  <ChevronUp className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground" />
                )}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="flex flex-col min-h-0 flex-1">
              <div className="px-2 pb-2 flex flex-col gap-2 min-h-0">
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
                        <div
                          key={seller.id}
                          className="flex items-center gap-2 py-1.5 px-2 rounded-md border hover:bg-accent/50 active:bg-accent transition-colors touch-manipulation cursor-pointer"
                          onClick={() => handleAddSeller(seller.id)}
                        >
                          <Avatar className="size-7 shrink-0">
                            <AvatarImage
                              src={seller.image || undefined}
                              alt={seller.name || seller.email}
                            />
                            <AvatarFallback className="text-[10px] bg-muted">
                              {getInitials(seller.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[11px] truncate leading-tight">
                              {seller.name || seller.email}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate leading-tight">
                              {seller.email}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-6 shrink-0 hover:bg-primary/10 touch-manipulation"
                            onClick={() => handleAddSeller(seller.id)}
                            title={t("users.form.sellers.addSeller")}
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
}
