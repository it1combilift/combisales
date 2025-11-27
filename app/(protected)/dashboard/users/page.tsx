"use client";

import axios from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserListItem } from "@/interfaces/user";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmptyCard } from "@/components/empty-card";
import { useState, useEffect, useMemo } from "react";
import { UserCard } from "@/components/users/user-card";
import { Paragraph, H1 } from "@/components/fonts/fonts";
import { DataTable } from "@/components/users/data-table";
import { createColumns } from "@/components/users/columns";
import { UserCardSkeleton } from "@/components/ui/skeleton";
import { UsersFilters } from "@/components/users/users-filters";
import type { ColumnFiltersState } from "@tanstack/react-table";
import { EditUserForm } from "@/components/users/edit-user-form";
import { CreateUserForm } from "@/components/users/create-user-form";
import { UserPlus, RefreshCw, Trash, UsersIcon } from "lucide-react";
import { DashboardUsersPageSkeleton } from "@/components/dashboard-skeleton";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteMultipleDialogOpen, setIsDeleteMultipleDialogOpen] =
    useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const isMobile = useIsMobile();

  // Fetch users
  const fetchUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await axios.get("/api/users/list");

      const data = response.data;

      if (response.status !== 200) {
        throw new Error(data.error || "Error al obtener la lista de usuarios");
      }

      const filteredUsers = (data.users || []).filter(
        (user: UserListItem) => user.email !== session?.user?.email
      );
      setUsers(filteredUsers);
      setError(null);
      if (isRefresh) {
        toast.success("Lista de usuarios actualizada");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      toast.error("Error al cargar usuarios");
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = () => {
    fetchUsers(true);
  };

  const handleUserCreated = () => {
    setIsCreateDialogOpen(false);
    fetchUsers(true);
  };

  const handleUserUpdated = () => {
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    fetchUsers(true);
  };

  // Delete single user
  const handleDeleteUser = async (user: UserListItem) => {
    setDeletingUserId(user.id);

    try {
      await axios.delete(`/api/users/${user.id}`);

      toast.success("Usuario eliminado exitosamente");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      await fetchUsers(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.error ||
          "Hubo un problema al eliminar el usuario."
        );
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "Hubo un problema al eliminar el usuario."
        );
      }
    } finally {
      setDeletingUserId(null);
    }
  };

  // Delete multiple users
  const handleDeleteMultiple = async () => {
    try {
      const userIdsToDelete = selectedUserIds.map(
        (index) => users[parseInt(index)].id
      );

      const response = await axios.post("/api/users/delete-multiple", {
        ids: userIdsToDelete,
      });

      toast.success(
        response.data.message || "Usuarios eliminados exitosamente"
      );
      setRowSelection({});
      setIsDeleteMultipleDialogOpen(false);
      fetchUsers(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.error ||
          "Hubo un problema al eliminar los usuarios."
        );
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "Hubo un problema al eliminar los usuarios."
        );
      }
    }
  };

  const openEditDialog = (user: UserListItem) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: UserListItem) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Revoke user session
  const handleRevokeSession = async (user: UserListItem) => {
    try {
      const response = await fetch("/api/users/revoke-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al revocar sesión");
      }

      toast.success(data.message || "Sesión revocada exitosamente");

      await fetchUsers(false);
    } catch (error) {
      console.error("Error al revocar sesión:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al revocar la sesión del usuario"
      );
    }
  };

  const columns = createColumns({
    onEdit: openEditDialog,
    onDelete: openDeleteDialog,
    onRevokeSession: handleRevokeSession,
  });

  const selectedUserIds = Object.keys(rowSelection).filter(
    (key) => rowSelection[key as keyof typeof rowSelection]
  );

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (globalFilter) {
      const searchLower = globalFilter.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply role filter
    const roleFilter = columnFilters.find((f) => f.id === "role");
    if (
      roleFilter &&
      Array.isArray(roleFilter.value) &&
      roleFilter.value.length > 0
    ) {
      filtered = filtered.filter((user) =>
        (roleFilter.value as string[]).includes(user.role)
      );
    }

    // Apply status filter
    const statusFilter = columnFilters.find((f) => f.id === "isActive");
    if (
      statusFilter &&
      Array.isArray(statusFilter.value) &&
      statusFilter.value.length > 0
    ) {
      filtered = filtered.filter((user) =>
        (statusFilter.value as boolean[]).includes(user.isActive)
      );
    }

    return filtered;
  }, [users, globalFilter, columnFilters]);

  return (
    <>
      {isLoading ? (
        <div className="px-4">
          <DashboardUsersPageSkeleton />
        </div>
      ) : error ? (
        <div className="container mx-auto py-10 px-4">
          <EmptyCard
            icon={<UsersIcon />}
            title="Ha ocurrido un error"
            description="No se pudieron cargar los usuarios. Por favor, intenta nuevamente."
            className="min-h-[500px]"
            actions={
              <Button onClick={() => fetchUsers()} className="gap-2">
                <RefreshCw className="size-4" />
                Reintentar
              </Button>
            }
          />
        </div>
      ) : (
        <section className="mx-auto px-4 space-y-6 w-full">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <H1>Gestión de usuarios</H1>
              <Paragraph>Administra los usuarios del sistema</Paragraph>
            </div>

            <div className="flex gap-2">
              {selectedUserIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteMultipleDialogOpen(true)}
                    className="gap-2"
                  >
                    <Trash className="size-4" />
                    Eliminar ({selectedUserIds.length})
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw
                  className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Actualizar
              </Button>

              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2" disabled={isRefreshing}>
                    <UserPlus className="size-4" />
                    Agregar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] xs:max-w-3xl max-h-[85vh] p-0 gap-0">
                  <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b">
                    <DialogTitle className="text-left text-base sm:text-lg">
                      Crear nuevo usuario
                    </DialogTitle>
                    <DialogDescription className="text-left text-xs sm:text-sm">
                      Completa el formulario para agregar un nuevo usuario
                    </DialogDescription>
                  </DialogHeader>
                  <div className="overflow-y-auto px-4 sm:px-6 py-4">
                    <CreateUserForm onSuccess={handleUserCreated} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <UsersFilters
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
          />

          {/* Desktop Table View */}
          {!isMobile && (
            <DataTable
              columns={columns}
              data={filteredUsers}
              isLoading={isRefreshing}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              columnFilters={columnFilters}
              setColumnFilters={setColumnFilters}
            />
          )}

          {/* Mobile Card View */}
          {isMobile && (
            <div className="space-y-4">
              {isRefreshing ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <UserCardSkeleton key={index} />
                ))
              ) : filteredUsers.length === 0 ? (
                <EmptyCard
                  icon={<UsersIcon />}
                  title="No hay usuarios"
                  description={
                    globalFilter || columnFilters.length > 0
                      ? "No se encontraron usuarios con los filtros aplicados"
                      : "No se encontraron usuarios en el sistema"
                  }
                />
              ) : (
                filteredUsers.map((user) => {
                  const originalIndex = users.findIndex(
                    (u) => u.id === user.id
                  );
                  return (
                    <UserCard
                      key={user.id}
                      user={user}
                      isSelected={
                        !!rowSelection[
                        originalIndex as keyof typeof rowSelection
                        ]
                      }
                      onSelect={(checked) => {
                        setRowSelection((prev) => ({
                          ...prev,
                          [originalIndex]: checked,
                        }));
                      }}
                      onEdit={openEditDialog}
                      onDelete={openDeleteDialog}
                      onRevokeSession={handleRevokeSession}
                    />
                  );
                })
              )}
            </div>
          )}

          {/* Delete Single User Dialog */}
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-left">
                  ¿Eliminar usuario?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-left text-pretty">
                  Estás a punto de eliminar a{" "}
                  <span className="font-semibold">
                    {selectedUser?.name || selectedUser?.email}
                  </span>
                  . Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="grid grid-cols-2">
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => selectedUser && handleDeleteUser(selectedUser)}
                  disabled={!!deletingUserId}
                >
                  {deletingUserId === selectedUser?.id ? (
                    <>
                      <RefreshCw className="mr-2 size-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete Multiple Users Dialog */}
          <AlertDialog
            open={isDeleteMultipleDialogOpen}
            onOpenChange={setIsDeleteMultipleDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-left">
                  ¿Eliminar usuarios seleccionados?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-left text-pretty">
                  Estás a punto de eliminar {selectedUserIds.length} usuario(s).
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="grid grid-cols-2">
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteMultiple}>
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Edit User Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-[95vw] xs:max-w-3xl max-h-[85vh] p-0 gap-0">
              <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b">
                <DialogTitle className="text-left text-base sm:text-lg">
                  Editar usuario
                </DialogTitle>
                <DialogDescription className="text-left text-xs sm:text-sm">
                  Modifica la información del usuario seleccionado
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto px-4 sm:px-6 py-4">
                {selectedUser && (
                  <EditUserForm
                    user={selectedUser}
                    onSuccess={handleUserUpdated}
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>
        </section>
      )}
    </>
  );
}
