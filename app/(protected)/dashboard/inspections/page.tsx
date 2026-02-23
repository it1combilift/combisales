"use client";

import useSWR from "swr";
import { hasRole } from "@/lib/roles";
import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertMessage } from "@/components/alert";
import { useTranslation } from "@/lib/i18n/context";
import { H1, Paragraph } from "@/components/fonts/fonts";
import { Inspection, Vehicle } from "@/interfaces/inspection";
import { useState, useMemo, useCallback, useEffect } from "react";
import { VehicleCard } from "@/components/inspections/vehicle-card";
import { AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VehiclesTable } from "@/components/inspections/vehicles-table";
import { VehicleDialog } from "@/components/inspections/vehicle-dialog";
import { VehicleFilters } from "@/components/inspections/vehicle-filters";
import { ApprovalDialog } from "@/components/inspections/approval-dialog";
import { InspectionCard } from "@/components/inspections/inspection-card";
import { InspectorDialog } from "@/components/inspections/inspector-dialog";
import { InspectorsTable } from "@/components/inspections/inspectors-table";
import { AlertDialog, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { InspectorFilters } from "@/components/inspections/inspector-filters";
import { InspectionsTable } from "@/components/inspections/inspections-table";
import { InspectionFilters } from "@/components/inspections/inspection-filters";
import { InspectionFormDialog } from "@/components/inspections/inspection-form-dialog";
import { DeleteInspectionDialog } from "@/components/inspections/delete-inspection-dialog";

import {
  Skeleton,
  InspectionTabSkeleton,
  VehicleTabSkeleton,
  InspectorTabSkeleton,
} from "@/components/ui/skeleton";

import {
  InspectorCard,
  InspectorData,
} from "@/components/inspections/inspector-card";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContents,
  TabsContent,
} from "@/components/ui/motion-tabs";

import {
  Plus,
  RefreshCw,
  Car,
  ClipboardCheck,
  UserPlus,
  Users,
  CarFrontIcon,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const VehicleInspectionPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: session } = useSession();
  const isMobile = useIsMobile();

  const userRoles = session?.user?.roles as Role[] | undefined;
  const isAdmin = hasRole(userRoles, Role.ADMIN);
  const isSeller = hasRole(userRoles, Role.SELLER);
  const isInspector = hasRole(userRoles, Role.INSPECTOR);
  const canCreateInspection = isAdmin || isInspector || isSeller;

  // SWR data fetching
  const {
    data: inspections,
    error: inspError,
    isLoading: inspLoading,
    isValidating: inspValidating,
    mutate: mutateInspections,
  } = useSWR<Inspection[]>("/api/inspections", fetcher);

  // All roles (ADMIN, INSPECTOR, SELLER) can fetch vehicles — API filters by role
  const {
    data: vehicles,
    error: vehError,
    isLoading: vehLoading,
    isValidating: vehValidating,
    mutate: mutateVehicles,
  } = useSWR<Vehicle[]>("/api/vehicles", fetcher);

  const {
    data: inspectors,
    isValidating: inspectorsValidating,
    mutate: mutateInspectors,
  } = useSWR<any[]>(
    isAdmin ? `/api/users?roles=${Role.INSPECTOR},${Role.SELLER}` : null,
    fetcher,
  );

  // State
  const [activeTab, setActiveTab] = useState("inspections");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Vehicle filters state
  const [vehSearch, setVehSearch] = useState("");
  const [vehStatusFilter, setVehStatusFilter] = useState("all");
  const [vehAssignmentFilter, setVehAssignmentFilter] = useState("all");
  const [vehViewMode, setVehViewMode] = useState<"grid" | "list">("grid");

  // Inspector filters state
  const [inspSearch, setInspSearch] = useState("");
  const [inspStatusFilter, setInspStatusFilter] = useState("all");
  const [inspVehicleFilter, setInspVehicleFilter] = useState("all");
  const [inspViewMode, setInspViewMode] = useState<"grid" | "list">("grid");

  // Dialogs
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [inspectorDialogOpen, setInspectorDialogOpen] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [deleteVehicleTarget, setDeleteVehicleTarget] =
    useState<Vehicle | null>(null);
  const [selectedInspection, setSelectedInspection] =
    useState<Inspection | null>(null);
  const [editInspector, setEditInspector] = useState<InspectorData | null>(
    null,
  );
  const [deleteInspectorTarget, setDeleteInspectorTarget] =
    useState<InspectorData | null>(null);
  const [preSelectedVehicleId, setPreSelectedVehicleId] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    if (isMobile) setViewMode("grid");
  }, [isMobile]);

  // Filtered inspections
  const filteredInspections = useMemo(() => {
    if (!inspections) return [];

    return inspections.filter((inspection) => {
      const matchesSearch =
        searchQuery === "" ||
        inspection.vehicle.model
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        inspection.vehicle.plate
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (inspection.user.name || inspection.user.email)
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || inspection.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inspections, searchQuery, statusFilter]);

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all";
  const activeFilterCount = [statusFilter !== "all"].filter(Boolean).length;

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        vehSearch === "" ||
        vehicle.model.toLowerCase().includes(vehSearch.toLowerCase()) ||
        vehicle.plate.toLowerCase().includes(vehSearch.toLowerCase());

      const matchesStatus =
        vehStatusFilter === "all" || vehicle.status === vehStatusFilter;

      const matchesAssignment =
        vehAssignmentFilter === "all" ||
        (vehAssignmentFilter === "assigned" && vehicle.assignedInspectorId) ||
        (vehAssignmentFilter === "unassigned" && !vehicle.assignedInspectorId);

      return matchesSearch && matchesStatus && matchesAssignment;
    });
  }, [vehicles, vehSearch, vehStatusFilter, vehAssignmentFilter]);

  // Filtered inspectors — show ALL users with INSPECTOR or SELLER roles
  const filteredInspectorsList = useMemo(() => {
    if (!inspectors) return [];
    return inspectors.filter((inspector: InspectorData) => {
      const matchesSearch =
        inspSearch === "" ||
        (inspector.name || "")
          .toLowerCase()
          .includes(inspSearch.toLowerCase()) ||
        inspector.email.toLowerCase().includes(inspSearch.toLowerCase());

      const matchesStatus =
        inspStatusFilter === "all" ||
        (inspStatusFilter === "active" && inspector.isActive) ||
        (inspStatusFilter === "inactive" && !inspector.isActive);

      const vCount =
        inspector._count?.assignedVehicles ??
        inspector.assignedVehicles?.length ??
        0;
      const matchesVehicle =
        inspVehicleFilter === "all" ||
        (inspVehicleFilter === "with-vehicles" && vCount > 0) ||
        (inspVehicleFilter === "without-vehicles" && vCount === 0);

      return matchesSearch && matchesStatus && matchesVehicle;
    });
  }, [inspectors, inspSearch, inspStatusFilter, inspVehicleFilter]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
  }, []);

  const refreshAll = useCallback(() => {
    mutateInspections();
    mutateVehicles();
    if (isAdmin) {
      mutateInspectors();
    }
  }, [mutateInspections, mutateVehicles, mutateInspectors, isAdmin]);

  const handleViewInspection = useCallback(
    (inspection: Inspection) => {
      router.push(`/dashboard/inspections/${inspection.id}`);
    },
    [router],
  );

  const handleDeleteVehicle = async (vehicle: Vehicle) => {
    try {
      await fetch(`/api/vehicles/${vehicle.id}`, { method: "DELETE" });
      mutateVehicles();
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
    }
  };

  const handleDeleteInspector = async (inspector: any) => {
    try {
      await fetch(`/api/users/${inspector.id}`, { method: "DELETE" });
      mutateInspectors();
    } catch (error) {
      console.error("Failed to delete inspector:", error);
    }
  };

  const handleStartInspection = useCallback((vehicle: Vehicle) => {
    setPreSelectedVehicleId(vehicle.id);
    setFormDialogOpen(true);
  }, []);

  const isLoading = inspLoading || vehLoading;
  const isRefreshing =
    (!inspLoading && inspValidating) ||
    (!vehLoading && vehValidating) ||
    (isAdmin && !inspectors && inspectorsValidating);
  const hasError = inspError || vehError;

  // Tab counts
  const inspectionCount = inspections?.length || 0;
  const vehicleCount = vehicles?.length || 0;
  const inspectorCount = inspectors?.length || 0;

  return (
    <>
      {hasError ? (
        <section className="mx-auto px-4 py-6 space-y-6 w-full max-w-7xl">
          <AlertMessage
            title={t("inspectionsPage.errors.loadingError")}
            description={t("inspectionsPage.errors.loadingErrorDescription")}
            variant="destructive"
          />
        </section>
      ) : (
        <section className="mx-auto px-4 space-y-6 w-full h-full">
          {/* Sticky Header */}
          <div className="flex gap-4 flex-row items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur flex-wrap">
            <div>
              <H1>{t("inspectionsPage.title")}</H1>
              <div className="flex flex-col justify-start">
                <Paragraph>{t("inspectionsPage.description")}</Paragraph>
                <div className="flex gap-1.5 mt-1">
                  {isLoading ? (
                    <>
                      <Skeleton className="h-5 w-24 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                      {isAdmin && (
                        <Skeleton className="h-5 w-24 rounded-full" />
                      )}
                    </>
                  ) : (
                    <>
                      <Badge variant="secondary" className="text-xs">
                        {inspectionCount}{" "}
                        {t("inspectionsPage.badges.inspections")}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {vehicleCount} {t("inspectionsPage.badges.vehicles")}
                      </Badge>
                      {isAdmin && (
                        <Badge variant="secondary" className="text-xs">
                          {inspectorCount}{" "}
                          {t("inspectionsPage.badges.inspectors")}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                title={t("common.refresh")}
                size="sm"
                onClick={refreshAll}
                disabled={isLoading || isRefreshing}
              >
                <RefreshCw
                  className={`size-4 ${isLoading || isRefreshing ? "animate-spin" : ""}`}
                />
                <span className="hidden md:inline">
                  {isLoading || isRefreshing
                    ? t("common.refreshing")
                    : t("common.refresh")}
                </span>
              </Button>
              {canCreateInspection && (
                <Button size="sm" onClick={() => setFormDialogOpen(true)}>
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">
                    {t("inspectionsPage.newInspection")}
                  </span>
                </Button>
              )}
            </div>
          </div>

          {/* Motion Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col gap-4"
          >
            <div className="w-full overflow-x-auto scrollbar-hide">
              <TabsList className="inline-flex min-w-full sm:min-w-0 p-1 bg-muted/50 rounded-lg border border-border/50 backdrop-blur-sm">
                <TabsTrigger
                  value="inspections"
                  className="flex-1 sm:flex-initial min-w-0 sm:min-w-[140px] gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground hover:text-foreground rounded-md"
                  title={t("inspectionsPage.tabs.inspections")}
                >
                  <ClipboardCheck className="size-4 shrink-0" />
                  <span className="hidden sm:inline truncate">
                    {t("inspectionsPage.tabs.inspections")}
                  </span>
                  <Badge
                    variant="secondary"
                    className="ml-1 text-xs h-4 px-1.5"
                  >
                    {inspectionCount}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="vehicles"
                  className="flex-1 sm:flex-initial min-w-0 sm:min-w-[140px] gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground hover:text-foreground rounded-md"
                  title={t("inspectionsPage.tabs.vehicles")}
                >
                  <CarFrontIcon className="size-4 shrink-0" />
                  <span className="hidden sm:inline truncate">
                    {t("inspectionsPage.tabs.vehicles")}
                  </span>
                  <Badge
                    variant="secondary"
                    className="ml-1 text-xs h-4 px-1.5"
                  >
                    {vehicleCount}
                  </Badge>
                </TabsTrigger>

                {isAdmin && (
                  <TabsTrigger
                    value="inspectors"
                    className="flex-1 sm:flex-initial min-w-0 sm:min-w-[140px] gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground hover:text-foreground rounded-md"
                    title={t("inspectionsPage.tabs.inspectors")}
                  >
                    <Users className="size-4 shrink-0" />
                    <span className="hidden sm:inline truncate">
                      {t("inspectionsPage.tabs.inspectors")}
                    </span>
                    <Badge
                      variant="secondary"
                      className="ml-1 text-xs h-4 px-1.5"
                    >
                      {inspectorCount}
                    </Badge>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContents className="min-h-[300px] sm:min-h-[400px]">
              {/* ==================== INSPECTIONS TAB ==================== */}
              <TabsContent
                value="inspections"
                className="focus:outline-none space-y-4"
              >
                {inspLoading || isRefreshing || isLoading ? (
                  <InspectionTabSkeleton viewMode={viewMode} />
                ) : (
                  <div
                    className={`space-y-4 ${inspValidating && !inspLoading ? "opacity-60 pointer-events-none transition-opacity duration-200" : "transition-opacity duration-200"}`}
                  >
                    <InspectionFilters
                      searchQuery={searchQuery}
                      onSearchChange={setSearchQuery}
                      statusFilter={statusFilter}
                      onStatusChange={setStatusFilter}
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
                          {filteredInspections.length}
                        </span>
                        {` ${t("inspectionsPage.results.of")} `}
                        <span className="font-medium text-foreground">
                          {inspectionCount}
                        </span>
                        {` ${t("inspectionsPage.results.inspections")}`}
                      </p>
                    </div>

                    {filteredInspections.length > 0 ? (
                      viewMode === "table" ? (
                        <InspectionsTable
                          inspections={filteredInspections}
                          onView={handleViewInspection}
                          onApprove={(insp) => {
                            setSelectedInspection(insp);
                            setApprovalDialogOpen(true);
                          }}
                          onDelete={(insp) => {
                            setSelectedInspection(insp);
                            setDeleteDialogOpen(true);
                          }}
                          isAdmin={isAdmin}
                          currentUserId={session?.user?.id}
                        />
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
                          {filteredInspections.map((inspection) => (
                            <InspectionCard
                              key={inspection.id}
                              inspection={inspection}
                              onView={handleViewInspection}
                              onApprove={(insp) => {
                                setSelectedInspection(insp);
                                setApprovalDialogOpen(true);
                              }}
                              onDelete={(insp) => {
                                setSelectedInspection(insp);
                                setDeleteDialogOpen(true);
                              }}
                              isAdmin={isAdmin}
                              currentUserId={session?.user?.id}
                            />
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="text-center py-12 px-4">
                        <div className="inline-flex items-center justify-center size-12 rounded-full bg-muted mb-3">
                          <ClipboardCheck className="size-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">
                          {hasActiveFilters
                            ? t("inspectionsPage.empty.noResults")
                            : t("inspectionsPage.empty.inspections")}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3 max-w-sm mx-auto">
                          {hasActiveFilters
                            ? t("inspectionsPage.empty.noResultsHint")
                            : t("inspectionsPage.empty.inspectionsHint")}
                        </p>
                        {hasActiveFilters ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                          >
                            {t("inspectionsPage.filters.clearFilters")}
                          </Button>
                        ) : canCreateInspection ? (
                          <Button
                            size="sm"
                            onClick={() => setFormDialogOpen(true)}
                          >
                            <Plus className="size-4" />
                            {t("inspectionsPage.newInspection")}
                          </Button>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* ==================== VEHICLES TAB ==================== */}
              <TabsContent
                value="vehicles"
                className="focus:outline-none space-y-4"
              >
                {vehLoading || isRefreshing || isLoading ? (
                  <VehicleTabSkeleton
                    viewMode={vehViewMode}
                    showAdminButton={isAdmin}
                  />
                ) : (
                  <div
                    className={`space-y-4 ${vehValidating && !vehLoading ? "opacity-60 pointer-events-none transition-opacity duration-200" : "transition-opacity duration-200"}`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {filteredVehicles.length}
                        </span>
                        {` ${t("inspectionsPage.results.of")} `}
                        <span className="font-medium text-foreground">
                          {vehicleCount}
                        </span>
                        {` ${t("inspectionsPage.results.vehiclesRegistered")}`}
                      </p>
                      {isAdmin && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditVehicle(null);
                            setVehicleDialogOpen(true);
                          }}
                        >
                          <Plus className="size-4" />
                          <span className="hidden md:block">
                            {t("inspectionsPage.vehicles.addVehicle")}
                          </span>
                        </Button>
                      )}
                    </div>

                    <VehicleFilters
                      searchQuery={vehSearch}
                      onSearchChange={setVehSearch}
                      statusFilter={vehStatusFilter}
                      onStatusChange={setVehStatusFilter}
                      assignmentFilter={vehAssignmentFilter}
                      onAssignmentChange={setVehAssignmentFilter}
                      viewMode={vehViewMode}
                      onViewModeChange={setVehViewMode}
                      showViewToggle={!isMobile}
                    />

                    {filteredVehicles.length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <div className="inline-flex items-center justify-center size-12 rounded-full bg-muted mb-3">
                          <Car className="size-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">
                          {vehicleCount === 0
                            ? t("inspectionsPage.empty.vehicles")
                            : t("inspectionsPage.empty.noResults")}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3 max-w-sm mx-auto">
                          {vehicleCount === 0
                            ? t("inspectionsPage.empty.vehiclesHint")
                            : t("inspectionsPage.empty.noResultsHint")}
                        </p>
                        {vehicleCount === 0 && isAdmin ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              setEditVehicle(null);
                              setVehicleDialogOpen(true);
                            }}
                          >
                            <Plus className="size-4" />
                            <span className="hidden md:block">
                              {t("inspectionsPage.vehicles.addVehicle")}
                            </span>
                          </Button>
                        ) : vehicleCount > 0 ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setVehSearch("");
                              setVehStatusFilter("all");
                              setVehAssignmentFilter("all");
                            }}
                          >
                            {t("inspectionsPage.filters.clearFilters")}
                          </Button>
                        ) : null}
                      </div>
                    ) : vehViewMode === "list" ? (
                      <VehiclesTable
                        vehicles={filteredVehicles}
                        onEdit={
                          isAdmin
                            ? (v) => {
                                setEditVehicle(v);
                                setVehicleDialogOpen(true);
                              }
                            : undefined
                        }
                        onDelete={
                          isAdmin ? (v) => setDeleteVehicleTarget(v) : undefined
                        }
                        onStartInspection={
                          canCreateInspection
                            ? handleStartInspection
                            : undefined
                        }
                      />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
                        {filteredVehicles.map((vehicle) => (
                          <VehicleCard
                            key={vehicle.id}
                            vehicle={vehicle}
                            onEdit={
                              isAdmin
                                ? (v) => {
                                    setEditVehicle(v);
                                    setVehicleDialogOpen(true);
                                  }
                                : undefined
                            }
                            onDelete={
                              isAdmin
                                ? (v) => setDeleteVehicleTarget(v)
                                : undefined
                            }
                            onStartInspection={
                              canCreateInspection
                                ? handleStartInspection
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* ==================== INSPECTORS TAB ==================== */}
              {isAdmin && (
                <TabsContent
                  value="inspectors"
                  className="focus:outline-none space-y-4"
                >
                  {!inspectors || isRefreshing || isLoading ? (
                    <InspectorTabSkeleton viewMode={inspViewMode} />
                  ) : (
                    <div
                      className={`space-y-4 ${inspectorsValidating ? "opacity-60 pointer-events-none transition-opacity duration-200" : "transition-opacity duration-200"}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {filteredInspectorsList.length}
                          </span>
                          {` ${t("inspectionsPage.results.of")} `}
                          <span className="font-medium text-foreground">
                            {inspectorCount}
                          </span>
                          {` ${t("inspectionsPage.results.inspectorsRegistered")}`}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditInspector(null);
                            setInspectorDialogOpen(true);
                          }}
                        >
                          <UserPlus className="size-4" />
                          <span className="hidden md:block">
                            {t("inspectionsPage.inspectors.create")}
                          </span>
                        </Button>
                      </div>

                      <InspectorFilters
                        searchQuery={inspSearch}
                        onSearchChange={setInspSearch}
                        statusFilter={inspStatusFilter}
                        onStatusChange={setInspStatusFilter}
                        vehicleFilter={inspVehicleFilter}
                        onVehicleFilterChange={setInspVehicleFilter}
                        viewMode={inspViewMode}
                        onViewModeChange={setInspViewMode}
                        showViewToggle={!isMobile}
                      />

                      {filteredInspectorsList.length === 0 ? (
                        <div className="text-center py-12 px-4">
                          <div className="inline-flex items-center justify-center size-12 rounded-full bg-muted mb-3">
                            <Users className="size-6 text-muted-foreground" />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground mb-1">
                            {inspectorCount === 0
                              ? t("inspectionsPage.empty.inspectors")
                              : t("inspectionsPage.empty.noResults")}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-3 max-w-sm mx-auto">
                            {inspectorCount === 0
                              ? t("inspectionsPage.empty.inspectorsHint")
                              : t("inspectionsPage.empty.noResultsHint")}
                          </p>
                          {inspectorCount === 0 ? (
                            <Button
                              size="sm"
                              onClick={() => setInspectorDialogOpen(true)}
                            >
                              <UserPlus className="size-4" />
                              <span className="hidden md:block">
                                {t("inspectionsPage.inspectors.create")}
                              </span>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setInspSearch("");
                                setInspStatusFilter("all");
                                setInspVehicleFilter("all");
                              }}
                            >
                              {t("inspectionsPage.filters.clearFilters")}
                            </Button>
                          )}
                        </div>
                      ) : inspViewMode === "list" ? (
                        <InspectorsTable
                          inspectors={filteredInspectorsList}
                          onEdit={(insp) => {
                            setEditInspector(insp);
                            setInspectorDialogOpen(true);
                          }}
                          onDelete={(insp) => setDeleteInspectorTarget(insp)}
                        />
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
                          {filteredInspectorsList.map(
                            (inspector: InspectorData) => (
                              <InspectorCard
                                key={inspector.id}
                                inspector={inspector}
                                onEdit={(insp) => {
                                  setEditInspector(insp);
                                  setInspectorDialogOpen(true);
                                }}
                                onDelete={(insp) =>
                                  setDeleteInspectorTarget(insp)
                                }
                              />
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              )}
            </TabsContents>
          </Tabs>

          {/* ==================== DELETE VEHICLE CONFIRMATION ==================== */}
          {deleteVehicleTarget && (
            <ConfirmDeleteVehicle
              vehicle={deleteVehicleTarget}
              onConfirm={() => {
                handleDeleteVehicle(deleteVehicleTarget);
                setDeleteVehicleTarget(null);
              }}
              onCancel={() => setDeleteVehicleTarget(null)}
            />
          )}

          {/* ==================== DELETE INSPECTOR CONFIRMATION ==================== */}
          {deleteInspectorTarget && (
            <ConfirmDeleteInspector
              inspector={deleteInspectorTarget}
              onConfirm={() => {
                handleDeleteInspector(deleteInspectorTarget);
                setDeleteInspectorTarget(null);
              }}
              onCancel={() => setDeleteInspectorTarget(null)}
            />
          )}

          {/* ==================== DIALOGS ==================== */}
          <InspectionFormDialog
            open={formDialogOpen}
            onOpenChange={(open) => {
              setFormDialogOpen(open);
              if (!open) setPreSelectedVehicleId(undefined);
            }}
            onSuccess={() => mutateInspections()}
            preSelectedVehicleId={preSelectedVehicleId}
          />

          <VehicleDialog
            open={vehicleDialogOpen}
            onOpenChange={setVehicleDialogOpen}
            onSuccess={() => mutateVehicles()}
            editVehicle={editVehicle}
          />

          <InspectorDialog
            open={inspectorDialogOpen}
            onOpenChange={(open) => {
              setInspectorDialogOpen(open);
              if (!open) setEditInspector(null);
            }}
            onSuccess={() => mutateInspectors()}
            editInspector={editInspector}
          />

          <DeleteInspectionDialog
            inspection={selectedInspection}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onSuccess={() => mutateInspections()}
          />

          <ApprovalDialog
            inspection={selectedInspection}
            open={approvalDialogOpen}
            onOpenChange={setApprovalDialogOpen}
            onSuccess={() => mutateInspections()}
          />
        </section>
      )}
    </>
  );
};

// Simple inline confirmation for vehicle deletion
function ConfirmDeleteVehicle({
  vehicle,
  onConfirm,
  onCancel,
}: {
  vehicle: Vehicle;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border rounded-xl px-3 py-5 max-w-sm mx-4 shadow-xl">
        <AlertDialog>
          <AlertTitle className="font-semibold text-sm md:text-base">
            {t("inspectionsPage.vehicles.deleteTitle")}
          </AlertTitle>
          <AlertDescription className="text-xs text-left text-pretty md:text-sm mt-2">
            {t("inspectionsPage.vehicles.deleteDescription", {
              model: vehicle.model,
              plate: vehicle.plate,
            })}
          </AlertDescription>

          <AlertDialogFooter className="grid grid-cols-2 gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={onCancel}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" size="sm" onClick={onConfirm}>
              {t("common.delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialog>
      </div>
    </div>
  );
}

// Simple inline confirmation for inspector deletion
function ConfirmDeleteInspector({
  inspector,
  onConfirm,
  onCancel,
}: {
  inspector: any;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border rounded-xl px-3 py-5 max-w-sm mx-4 shadow-xl">
        <AlertDialog>
          <AlertTitle className="font-semibold text-sm md:text-base">
            {t("inspectionsPage.inspectors.deleteTitle")}
          </AlertTitle>
          <AlertDescription className="text-xs text-left text-pretty md:text-sm mt-2">
            {t("inspectionsPage.inspectors.deleteDescription", {
              name: inspector.name || inspector.email,
            })}
          </AlertDescription>

          <AlertDialogFooter className="grid grid-cols-2 gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={onCancel}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" size="sm" onClick={onConfirm}>
              {t("common.delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialog>
      </div>
    </div>
  );
}

export default VehicleInspectionPage;
