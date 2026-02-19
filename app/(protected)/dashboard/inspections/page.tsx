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
import { Skeleton } from "@/components/ui/skeleton";
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

  // SWR data fetching
  const {
    data: inspections,
    error: inspError,
    isLoading: inspLoading,
    mutate: mutateInspections,
  } = useSWR<Inspection[]>("/api/inspections", fetcher);

  const {
    data: vehicles,
    error: vehError,
    isLoading: vehLoading,
    mutate: mutateVehicles,
  } = useSWR<Vehicle[]>(isAdmin ? "/api/vehicles" : null, fetcher);

  const { data: inspectors, mutate: mutateInspectors } = useSWR<any[]>(
    isAdmin ? `/api/users?role=${Role.INSPECTOR}` : null,
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

  // Filtered inspectors
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
    if (isAdmin) {
      mutateVehicles();
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

  const isLoading = inspLoading || (isAdmin && vehLoading);
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
          <div className="flex gap-4 flex-row items-center justify-between sticky top-0 z-10 bg-background/95 backdrop-blur">
            <div>
              <H1>{t("inspectionsPage.title")}</H1>
              <div className="flex flex-col justify-start">
                <Paragraph>{t("inspectionsPage.description")}</Paragraph>
                <div className="flex gap-1.5 mt-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {inspectionCount} {t("inspectionsPage.badges.inspections")}
                  </Badge>
                  {isAdmin && (
                    <>
                      <Badge variant="secondary" className="text-[10px]">
                        {vehicleCount} {t("inspectionsPage.badges.vehicles")}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {inspectorCount}{" "}
                        {t("inspectionsPage.badges.inspectors")}
                      </Badge>
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
                disabled={isLoading}
              >
                <RefreshCw
                  className={`size-4 ${isLoading ? "animate-spin" : ""}`}
                />
                <span className="hidden md:inline">
                  {isLoading ? t("common.refreshing") : t("common.refresh")}
                </span>
              </Button>
              <Button size="sm" onClick={() => setFormDialogOpen(true)}>
                <Plus className="size-4" />
                <span className="hidden sm:inline">
                  {t("inspectionsPage.newInspection")}
                </span>
              </Button>
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
                    className="ml-1 text-[10px] h-4 px-1.5"
                  >
                    {inspectionCount}
                  </Badge>
                </TabsTrigger>

                {isAdmin && (
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
                      className="ml-1 text-[10px] h-4 px-1.5"
                    >
                      {vehicleCount}
                    </Badge>
                  </TabsTrigger>
                )}

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
                      className="ml-1 text-[10px] h-4 px-1.5"
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
                {inspLoading ? (
                  <div className="space-y-6">
                    <Skeleton className="h-12 rounded-lg" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-64 rounded-xl" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
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
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setFormDialogOpen(true)}
                          >
                            <Plus className="size-4" />
                            {t("inspectionsPage.newInspection")}
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {/* ==================== VEHICLES TAB ==================== */}
              {isAdmin && (
                <TabsContent
                  value="vehicles"
                  className="focus:outline-none space-y-4"
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
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditVehicle(null);
                        setVehicleDialogOpen(true);
                      }}
                    >
                      <Plus className="size-4" />
                      {t("inspectionsPage.vehicles.addVehicle")}
                    </Button>
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

                  {vehLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-44 rounded-xl" />
                      ))}
                    </div>
                  ) : filteredVehicles.length === 0 ? (
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
                      {vehicleCount === 0 ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditVehicle(null);
                            setVehicleDialogOpen(true);
                          }}
                        >
                          <Plus className="size-4" />
                          {t("inspectionsPage.vehicles.addVehicle")}
                        </Button>
                      ) : (
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
                      )}
                    </div>
                  ) : vehViewMode === "list" ? (
                    <VehiclesTable
                      vehicles={filteredVehicles}
                      onEdit={(v) => {
                        setEditVehicle(v);
                        setVehicleDialogOpen(true);
                      }}
                      onDelete={(v) => setDeleteVehicleTarget(v)}
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
                      {filteredVehicles.map((vehicle) => (
                        <VehicleCard
                          key={vehicle.id}
                          vehicle={vehicle}
                          onEdit={(v) => {
                            setEditVehicle(v);
                            setVehicleDialogOpen(true);
                          }}
                          onDelete={(v) => setDeleteVehicleTarget(v)}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}

              {/* ==================== INSPECTORS TAB ==================== */}
              {isAdmin && (
                <TabsContent
                  value="inspectors"
                  className="focus:outline-none space-y-4"
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
                      {t("inspectionsPage.inspectors.create")}
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

                  {!inspectors ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-xl" />
                      ))}
                    </div>
                  ) : filteredInspectorsList.length === 0 ? (
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
                          {t("inspectionsPage.inspectors.create")}
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
                            onDelete={(insp) => setDeleteInspectorTarget(insp)}
                          />
                        ),
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
            onOpenChange={setFormDialogOpen}
            onSuccess={() => mutateInspections()}
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
