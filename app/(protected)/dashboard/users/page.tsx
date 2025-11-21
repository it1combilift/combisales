"use client";

import { toast } from "sonner";
import { UserListItem } from "@/types/user";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useMemo } from "react";
import { EditUserForm } from "@/components/edit-user-form";
import { CreateUserForm } from "@/components/create-user-form";
import { formatDate, getInitials, getRoleBadge } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  UsersPageSkeleton,
  TableContentSkeleton,
} from "@/components/ui/skeleton";

import {
  UserPlus,
  Trash2,
  Search,
  RefreshCw,
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Trash,
  PencilLine,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Package,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortField = "name" | "email" | "role" | "createdAt";
type SortOrder = "asc" | "desc";

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteMultipleDialogOpen, setIsDeleteMultipleDialogOpen] =
    useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [roleFilter, setRoleFilter] = useState<string>("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

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

      const filteredUsers = data.users.filter(
        (user: UserListItem) => user.email !== session?.user?.email
      );

      setUsers(filteredUsers);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
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

  const handleUserCreated = () => {
    setIsDialogOpen(false);
    fetchUsers(true);
  };

  const handleUserUpdated = () => {
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    fetchUsers(true);
  };

  const handleRefresh = () => {
    fetchUsers(true);
  };

  const handleDeleteSelectedUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar usuario");
      }

      toast.success("Usuario eliminado exitosamente");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Hubo un problema al eliminar el usuario."
      );
    }
  };

  const handleDeleteSelectedUsers = async () => {
    if (selectedUsers.size === 0) return;

    try {
      const response = await fetch("/api/users/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: Array.from(selectedUsers),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar usuarios");
      }

      toast.success(data.message);
      setSelectedUsers(new Set());
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

  const openEditDialog = (user: UserListItem) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: UserListItem) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const toggleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filter by role
    if (roleFilter !== "todos") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === "name") {
        aValue = aValue?.toLowerCase() || "";
        bValue = bValue?.toLowerCase() || "";
      } else if (sortField === "email") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      } else if (sortField === "createdAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [users, searchQuery, sortField, sortOrder, roleFilter]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="size-4 text-muted-foreground/50" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="size-4 text-primary" />
    ) : (
      <ArrowDown className="size-4 text-primary" />
    );
  };

  if (isLoading) {
    return <UsersPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] p-4">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-destructive/10 ring-8 ring-destructive/5">
            <Users className="size-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Error al cargar</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button
            onClick={() => fetchUsers()}
            variant="default"
            className="gap-2"
          >
            <RefreshCw className="size-4" />
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6 px-4 sm:px-6 mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight wrap-break-word">
              Gestión de usuarios
            </h1>
            <p className="text-sm text-muted-foreground">
              Mostrando{" "}
              <span className="font-medium text-foreground">
                {filteredUsers.length}
              </span>{" "}
              de{" "}
              <span className="font-medium text-foreground">
                {filteredUsers.length}
              </span>{" "}
              usuarios
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3 lg:min-w-[420px] lg:justify-end">
            {/* Search Input */}
            <div className="relative w-full lg:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 h-10 w-full"
                disabled={isRefreshing}
              />
            </div>

            {/* Filter & Add User Row */}
            <div className="flex items-center gap-2 justify-start lg:justify-end">
              {/* Filter Dropdown */}
              <Select
                value={roleFilter}
                onValueChange={(value) => {
                  setRoleFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-10 w-fit min-w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-muted-foreground" />
                      <span>Todos</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ADMIN">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-blue-600 dark:text-blue-400" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="SELLER">
                    <div className="flex items-center gap-2">
                      <Package className="size-4 text-green-600 dark:text-green-400" />
                      <span>Seller</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Add User Button */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="default" className="gap-2 h-10 shrink-0">
                    <UserPlus className="size-4" />
                    <span>Agregar</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="md:max-w-2xl max-h-[95vh] overflow-y-auto max-w-[95vw]">
                  <DialogHeader>
                    <DialogTitle className="text-left">
                      Agregar usuario
                    </DialogTitle>
                    <DialogDescription className="text-left text-pretty text-muted-foreground">
                      Completa el formulario para crear un nuevo usuario en la
                      plataforma
                    </DialogDescription>
                  </DialogHeader>
                  <CreateUserForm onSuccess={handleUserCreated} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Delete Multiple Users Badge */}
        {selectedUsers.size > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteMultipleDialogOpen(true)}
              className="gap-2"
            >
              <Trash className="size-4" />
              Eliminar ({selectedUsers.size})
            </Button>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="space-y-4 w-full">
        {isRefreshing ? (
          <TableContentSkeleton />
        ) : (
          <div className="rounded-lg border overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="w-12 h-12">
                      <Checkbox
                        checked={
                          selectedUsers.size === filteredUsers.length &&
                          filteredUsers.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                        aria-label="Seleccionar todos"
                      />
                    </TableHead>
                    <TableHead className="h-12">
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-2 font-medium hover:text-foreground transition-colors"
                      >
                        Usuario
                        <SortIcon field="name" />
                      </button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell h-12">
                      <button
                        onClick={() => handleSort("createdAt")}
                        className="flex items-center gap-2 font-medium hover:text-foreground transition-colors"
                      >
                        Fecha de creación
                        <SortIcon field="createdAt" />
                      </button>
                    </TableHead>
                    <TableHead className="h-12">
                      <button
                        onClick={() => handleSort("role")}
                        className="flex items-center gap-2 font-medium hover:text-foreground transition-colors"
                      >
                        Rol
                        <SortIcon field="role" />
                      </button>
                    </TableHead>
                    <TableHead className="hidden lg:table-cell h-12 font-medium">
                      País
                    </TableHead>
                    <TableHead className="hidden xl:table-cell h-12 font-medium">
                      Estado
                    </TableHead>
                    <TableHead className="text-right h-12 font-medium">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-16">
                        <div className="flex flex-col items-center justify-center">
                          <div className="size-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                            <Users className="size-10 text-muted-foreground/50" />
                          </div>
                          <p className="text-muted-foreground font-medium mb-2">
                            {searchQuery
                              ? "No se encontraron usuarios"
                              : "No hay usuarios registrados"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery
                              ? "Intenta con otros términos de búsqueda"
                              : "Comienza creando tu primer usuario"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((user) => (
                      <TableRow
                        key={user.id}
                        className="hover:bg-muted/50 transition-colors"
                        onMouseEnter={() => setHoveredRow(user.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <TableCell className="py-4">
                          <Checkbox
                            checked={selectedUsers.has(user.id)}
                            onCheckedChange={() => toggleSelectUser(user.id)}
                            aria-label={`Seleccionar ${
                              user.name || user.email
                            }`}
                          />
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-10">
                              <AvatarImage src={user.image || undefined} />
                              <AvatarFallback className="text-sm font-semibold bg-linear-to-br from-primary/20 to-primary/5">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-sm">
                                {user.name || "Sin nombre"}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-4">
                          <span className="text-sm">
                            {formatDate(user.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          {getRoleBadge(user.role)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell py-4">
                          <span className="text-sm text-muted-foreground">
                            {user.country || "No especificado"}
                          </span>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell py-4">
                          {user.isActive ? (
                            <Badge
                              variant="outline"
                              className="gap-1.5 border-2 border-green-600 dark:border-green-400 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950 font-medium px-2.5 py-1"
                            >
                              <CheckCircle2 className="size-3.5" />
                              Activo
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="gap-1.5 border-2 border-red-600 dark:border-red-400 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950 font-medium px-2.5 py-1"
                            >
                              <XCircle className="size-3.5" />
                              Inactivo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 hover:bg-muted"
                              onClick={() => openEditDialog(user)}
                              title="Editar usuario"
                            >
                              <PencilLine className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => openDeleteDialog(user)}
                              title="Eliminar usuario"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Footer */}
            {filteredUsers.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-muted/20">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
                    {Math.min(currentPage * pageSize, filteredUsers.length)} de{" "}
                    {filteredUsers.length}
                  </p>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-16">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-left">
              ¿Estás seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-pretty text-left">
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              usuario{" "}
              <span className="font-semibold">
                {selectedUser?.name || selectedUser?.email}
              </span>{" "}
              de la plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelectedUser}
              className="bg-destructive hover:bg-destructive/90 text-white shadow-none hover:shadow-none"
            >
              Confirmar
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
              ¿Eliminar {selectedUsers.size} usuarios?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left text-pretty text-muted-foreground">
              Esta acción no se puede deshacer. Se eliminarán permanentemente{" "}
              <span className="font-semibold">{selectedUsers.size}</span>{" "}
              {selectedUsers.size === 1 ? "usuario" : "usuarios"} de la
              plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelectedUsers}
              className="bg-destructive hover:bg-destructive/90 text-white shadow-none hover:shadow-none"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="md:max-w-2xl max-h-[95vh] overflow-y-auto max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-left">Editar usuario</DialogTitle>
            <DialogDescription className="text-left text-pretty text-muted-foreground">
              Actualiza la información del usuario{" "}
              <span className="font-semibold">
                {selectedUser?.name || selectedUser?.email}
              </span>
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <EditUserForm user={selectedUser} onSuccess={handleUserUpdated} />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
