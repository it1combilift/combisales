"use client";

import { toast } from "sonner";
import { User } from "@/types/user";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmptyCard } from "@/components/empty-card";
import { UserCard } from "@/components/users/user-card";
import { Paragraph, H1 } from "@/components/fonts/fonts";
import { DataTable } from "@/components/users/data-table";
import { createColumns } from "@/components/users/columns";
import { UserCardSkeleton } from "@/components/ui/skeleton";
import { EditUserForm } from "@/components/users/edit-user-form";
import { CreateUserForm } from "@/components/users/create-user-form";
import { UserPlus, RefreshCw, Trash, UsersIcon } from "lucide-react";
import { DashboardPageSkeleton } from "@/components/dashboard-skeleton";

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
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteMultipleDialogOpen, setIsDeleteMultipleDialogOpen] =
    useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  // Fetch users
  const fetchUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetch("/api/users/list");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar usuarios");
      }

      const filteredUsers = (data.users || []).filter(
        (user: User) => user.email !== session?.user?.email
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
  const handleDeleteUser = async (user: User) => {
    setDeletingUserId(user.id);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar usuario");
      }

      toast.success("Usuario eliminado exitosamente");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      await fetchUsers(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Hubo un problema al eliminar el usuario."
      );
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

      const response = await fetch("/api/users/delete-multiple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: userIdsToDelete,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar usuarios");
      }

      toast.success(data.message || "Usuarios eliminados exitosamente");
      setRowSelection({});
      setIsDeleteMultipleDialogOpen(false);
      fetchUsers(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Hubo un problema al eliminar los usuarios."
      );
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const columns = createColumns({
    onEdit: openEditDialog,
    onDelete: openDeleteDialog,
  });

  const selectedUserIds = Object.keys(rowSelection).filter(
    (key) => rowSelection[key as keyof typeof rowSelection]
  );

  return (
    <>
      {isLoading ? (
        <DashboardPageSkeleton />
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
        <section className="container mx-auto px-4 space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <H1>Gestión de usuarios</H1>
              <Paragraph>Administra los usuarios del sistema</Paragraph>
            </div>
            <div className="flex gap-2">
              {/* Bulk Actions */}
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
                  <Button size="sm" className="gap-2">
                    <UserPlus className="size-4" />
                    Agregar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Crear nuevo usuario</DialogTitle>
                    <DialogDescription>
                      Completa el formulario para agregar un nuevo usuario al
                      sistema
                    </DialogDescription>
                  </DialogHeader>
                  <CreateUserForm onSuccess={handleUserCreated} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Desktop Table View */}
          {!isMobile && (
            <DataTable
              columns={columns}
              data={users}
              isLoading={isRefreshing}
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
            />
          )}

          {/* Mobile Card View */}
          {isMobile && (
            <div className="space-y-4">
              {isRefreshing ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <UserCardSkeleton key={index} />
                ))
              ) : users.length === 0 ? (
                <EmptyCard
                  icon={<UsersIcon />}
                  title="No hay usuarios"
                  description="No se encontraron usuarios en el sistema"
                />
              ) : (
                users.map((user, index) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    isSelected={
                      !!rowSelection[index as keyof typeof rowSelection]
                    }
                    onSelect={(checked) => {
                      setRowSelection((prev) => ({
                        ...prev,
                        [index]: checked,
                      }));
                    }}
                    onEdit={openEditDialog}
                    onDelete={openDeleteDialog}
                  />
                ))
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar usuario</DialogTitle>
                <DialogDescription>
                  Modifica la información del usuario seleccionado
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <EditUserForm
                  user={selectedUser}
                  onSuccess={handleUserUpdated}
                />
              )}
            </DialogContent>
          </Dialog>
        </section>
      )}
    </>
  );
}
