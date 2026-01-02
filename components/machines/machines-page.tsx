"use client";

import useSWR from "swr";
import { Badge } from "../ui/badge";
import { AlertMessage } from "../alert";
import { MachineCard } from "./machine-card";
import { H1, Paragraph } from "../fonts/fonts";
import { Button } from "@/components/ui/button";
import { RefreshCw, Truck } from "lucide-react";
import { MachinesTable } from "./machines-table";
import { MachineFilters } from "./machine-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { MachineDetailModal } from "./machine-detail-modal";
import { Machine, MachinesResponse } from "@/interfaces/machine";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

export function MachinesPageComponent() {
  const { t } = useI18n();
  const { data, error, isLoading, mutate } = useSWR<MachinesResponse>(
    "/api/equipment",
    fetcher
  );
  const isMobile = useIsMobile();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [insuranceFilter, setInsuranceFilter] = useState("all");
  const [hoursRangeFilter, setHoursRangeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setViewMode("grid");
    }
  }, [isMobile]);

  const locations = useMemo(() => {
    if (!data?.machines) return [];
    return [...new Set(data.machines.map((m: Machine) => m.location))].sort();
  }, [data?.machines]);

  const filteredMachines = useMemo(() => {
    if (!data?.machines) return [];

    return data.machines.filter((machine: Machine) => {
      const matchesSearch =
        searchQuery === "" ||
        machine.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        machine.serialNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        machine.dealer?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || machine.status === statusFilter;

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && machine.available) ||
        (availabilityFilter === "unavailable" && !machine.available);

      const matchesLocation =
        locationFilter === "all" || machine.location === locationFilter;

      const matchesInsurance =
        insuranceFilter === "all" ||
        (insuranceFilter === "insured" && machine.insured) ||
        (insuranceFilter === "not-insured" && !machine.insured);

      let matchesHoursRange = true;
      if (hoursRangeFilter !== "all") {
        const hours = machine.usageHours;
        switch (hoursRangeFilter) {
          case "0-1000":
            matchesHoursRange = hours >= 0 && hours < 1000;
            break;
          case "1000-5000":
            matchesHoursRange = hours >= 1000 && hours < 5000;
            break;
          case "5000-10000":
            matchesHoursRange = hours >= 5000 && hours < 10000;
            break;
          case "10000+":
            matchesHoursRange = hours >= 10000;
            break;
        }
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesAvailability &&
        matchesLocation &&
        matchesInsurance &&
        matchesHoursRange
      );
    });
  }, [
    data?.machines,
    searchQuery,
    statusFilter,
    availabilityFilter,
    locationFilter,
    insuranceFilter,
    hoursRangeFilter,
  ]);

  const hasActiveFilters =
    searchQuery !== "" ||
    statusFilter !== "all" ||
    availabilityFilter !== "all" ||
    locationFilter !== "all" ||
    insuranceFilter !== "all" ||
    hoursRangeFilter !== "all";

  const activeFilterCount = [
    statusFilter !== "all",
    availabilityFilter !== "all",
    locationFilter !== "all",
    insuranceFilter !== "all",
    hoursRangeFilter !== "all",
  ].filter(Boolean).length;

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setAvailabilityFilter("all");
    setLocationFilter("all");
    setInsuranceFilter("all");
    setHoursRangeFilter("all");
  }, []);

  const handleViewMachine = useCallback((machine: Machine) => {
    setSelectedMachine(machine);
    setIsModalOpen(true);
  }, []);

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <>
      {error ? (
        <section className="mx-auto px-4 py-6 space-y-6 w-full max-w-7xl">
          <AlertMessage
            title={t("machines.errorLoading")}
            description={t("machines.errorDescription")}
            variant="destructive"
          />
        </section>
      ) : (
        <section className="mx-auto px-4 space-y-6 w-full h-full">
          <div className="flex gap-4 flex-row items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur">
            <div>
              <H1>{t("machines.pageTitle")}</H1>
              <div className="flex flex-col justify-start">
                <Paragraph>
                  {t("machines.pageDescription")}
                </Paragraph>

                <Badge variant="secondary" size="sm" className="mt-1">
                  {data?.metadata.totalMachines || 0} {t("machines.equipmentFound")}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                title={t("common.refresh")}
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className="size-4" />
                <span className="hidden md:inline">{t("common.refresh")}</span>
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-12 rounded-lg" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="aspect-4/5 rounded-xl" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <MachineFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                availabilityFilter={availabilityFilter}
                onAvailabilityChange={setAvailabilityFilter}
                locationFilter={locationFilter}
                onLocationChange={setLocationFilter}
                insuranceFilter={insuranceFilter}
                onInsuranceChange={setInsuranceFilter}
                hoursRangeFilter={hoursRangeFilter}
                onHoursRangeChange={setHoursRangeFilter}
                locations={locations}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
                activeFilterCount={activeFilterCount}
                showViewToggle={!isMobile}
              />

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">
                    {filteredMachines.length}
                  </span>
                  {` ${t("machines.of")} `}
                  <span className="font-medium text-foreground">
                    {data?.metadata.totalMachines || 0}
                  </span>
                  {` ${t("machines.machinesLabel")}`}
                </p>
                {!isMobile && (
                  <Badge variant="secondary">
                    {t("machines.view")}:{" "}
                    <span>{viewMode === "grid" ? t("machines.viewCards") : t("machines.viewTable")}</span>
                  </Badge>
                )}
              </div>

              {isMobile || viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
                  {filteredMachines.map((machine) => (
                    <MachineCard
                      key={machine.id}
                      machine={machine}
                      onViewDetails={handleViewMachine}
                    />
                  ))}
                </div>
              ) : (
                <MachinesTable
                  machines={filteredMachines}
                  onViewMachine={handleViewMachine}
                />
              )}

              {filteredMachines.length === 0 && !isLoading && (
                <div className="text-center py-12 px-4">
                  <div className="inline-flex items-center justify-center size-12 rounded-full bg-muted mb-3">
                    <Truck className="size-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {t("machines.noMachinesFound")}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 max-w-sm mx-auto">
                    {t("machines.noMachinesMatchFilters")}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      {t("common.clearFilters")}
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

          <MachineDetailModal
            machine={selectedMachine}
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
          />
        </section>
      )}
    </>
  );
}
