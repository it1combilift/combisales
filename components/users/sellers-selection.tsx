"use client";

import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import { useI18n } from "@/lib/i18n/context";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SellerInfo } from "@/interfaces/user";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, User, CheckSquare, Square } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  const handleToggleSeller = useCallback(
    (sellerId: string) => {
      if (selectedSellerIds.includes(sellerId)) {
        onSelectionChange(selectedSellerIds.filter((id) => id !== sellerId));
      } else {
        onSelectionChange([...selectedSellerIds, sellerId]);
      }
    },
    [selectedSellerIds, onSelectionChange]
  );

  const handleSelectAll = useCallback(() => {
    onSelectionChange(filteredSellers.map((s) => s.id));
  }, [filteredSellers, onSelectionChange]);

  const handleDeselectAll = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  const allSelected =
    filteredSellers.length > 0 &&
    filteredSellers.every((s) => selectedSellerIds.includes(s.id));

  return (
    <Card className={cn("w-full p-0 m-0 border-none shadow-none", className)}>
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2">
          {t("users.form.sellers.title")}
        </CardTitle>
        <CardDescription>{t("users.form.sellers.description")}</CardDescription>

        {/* Selection count */}
        {selectedSellerIds.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 bg-primary/5 rounded-md border border-primary/20">
            <span className="text-sm font-medium">
              {t("users.form.sellers.selected", {
                count: selectedSellerIds.length,
              })}
            </span>
            <Badge variant="default">{selectedSellerIds.length}</Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4 w-full p-0 m-0">
        {/* Search and bulk actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("users.form.sellers.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={
                isLoading || filteredSellers.length === 0 || allSelected
              }
            >
              <CheckSquare className="size-4 mr-2" />
              {t("users.form.sellers.selectAll")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDeselectAll}
              disabled={isLoading || selectedSellerIds.length === 0}
            >
              <Square className="size-4 mr-2" />
              {t("users.form.sellers.deselectAll")}
            </Button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Spinner variant="bars" size={14} />
            <span className="ml-2 text-sm text-muted-foreground animate-pulse">
              {t("users.form.sellers.loading")}
            </span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Sellers list */}
        {!isLoading && !error && (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {filteredSellers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="size-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">{t("users.form.sellers.noSellers")}</p>
              </div>
            ) : (
              filteredSellers.map((seller) => {
                const isSelected = selectedSellerIds.includes(seller.id);
                return (
                  <div
                    key={seller.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-accent",
                      isSelected && "bg-primary/5 border-primary/50"
                    )}
                    onClick={() => handleToggleSeller(seller.id)}
                  >
                    <div className="mt-1">
                      {isSelected ? (
                        <CheckSquare className="size-4 text-primary" />
                      ) : (
                        <Square className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {seller.name || seller.email}
                        </p>
                        {seller.country && (
                          <Badge variant="outline" className="text-xs">
                            {seller.country}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {seller.email}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
