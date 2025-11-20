"use client";

import { UserListItem } from "@/types/user";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CreateUserForm } from "@/components/create-user-form";
import { formatDate, getInitials, getRoleBadge } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UsersPageSkeleton, TableContentSkeleton } from "@/components/ui/skeleton";

import {
    UserPlus,
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    Search,
    RefreshCw,
    Users,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Trash,
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [sortField, setSortField] = useState<SortField>("createdAt");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
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

            setUsers(data.users);
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

    const handleRefresh = () => {
        fetchUsers(true);
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        console.log("Deleting user:", selectedUser.id);
        setIsDeleteDialogOpen(false);
        setSelectedUser(null);
    };

    const handleDeleteSelected = async () => {
        console.log("Deleting users:", Array.from(selectedUsers));
        setSelectedUsers(new Set());
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
            setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
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
    }, [users, searchQuery, sortField, sortOrder]);

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
                    <Button onClick={() => fetchUsers()} variant="default" className="gap-2">
                        <RefreshCw className="size-4" />
                        Reintentar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <section className="flex flex-col gap-6 px-4 sm:px-6 mx-auto w-full">
            <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 shrink-0">
                        <h1 className="text-xl  lg:text-2xl font-bold tracking-tight">Usuarios</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                            Gestiona y administra los usuarios de la plataforma
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-48 md:w-64 lg:w-80">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-10 h-10 shadow-sm w-full text-sm"
                                disabled={isRefreshing}
                            />
                        </div>

                        {/* Refresh Button */}
                        <Button
                            variant="outline"
                            size="default"
                            onClick={handleRefresh}
                            className="gap-2 shadow-sm h-10 px-3"
                            disabled={isRefreshing}
                            title="Actualizar lista de usuarios"
                        >
                            <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
                            <span className="hidden lg:inline">Actualizar</span>
                        </Button>

                        {/* Add User Button */}
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="default" className="gap-2 shadow-sm h-10 px-3" title="Agregar nuevo usuario">
                                    <UserPlus className="size-4" />
                                    <span className="hidden md:inline">Agregar</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-left">Agregar usuario</DialogTitle>
                                    <DialogDescription className="text-left text-pretty text-muted-foreground">
                                        Completa el formulario para crear un nuevo usuario en la plataforma
                                    </DialogDescription>
                                </DialogHeader>
                                <CreateUserForm onSuccess={handleUserCreated} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        {filteredUsers.length} {filteredUsers.length === 1 ? "usuario encontrado" : "usuarios encontrados"}
                    </p>

                    {selectedUsers.size > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteSelected}
                            className="gap-2 w-full sm:w-auto"
                        >
                            <Trash className="size-4" />
                            Eliminar seleccionados ({selectedUsers.size})
                        </Button>
                    )}
                </div>
            </div>
            <div className="space-y-4 w-full">
                {/* Table */}
                {isRefreshing ? (
                    <TableContentSkeleton />
                ) : (
                    <div className="rounded-lg border border-border/50 overflow-hidden bg-card shadow-sm">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                                                onCheckedChange={toggleSelectAll}
                                                aria-label="Seleccionar todos"
                                            />
                                        </TableHead>
                                        <TableHead>
                                            <button
                                                onClick={() => handleSort("name")}
                                                className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
                                            >
                                                Usuario
                                                <SortIcon field="name" />
                                            </button>
                                        </TableHead>
                                        <TableHead className="hidden md:table-cell">
                                            <button
                                                onClick={() => handleSort("email")}
                                                className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
                                            >
                                                Email
                                                <SortIcon field="email" />
                                            </button>
                                        </TableHead>
                                        <TableHead className="text-center">
                                            <button
                                                onClick={() => handleSort("role")}
                                                className="flex items-center gap-2 font-semibold hover:text-primary transition-colors mx-auto"
                                            >
                                                Rol
                                                <SortIcon field="role" />
                                            </button>
                                        </TableHead>
                                        <TableHead className="hidden lg:table-cell text-center">
                                            <button
                                                onClick={() => handleSort("createdAt")}
                                                className="flex items-center gap-2 font-semibold hover:text-primary transition-colors mx-auto"
                                            >
                                                Fecha de registro
                                                <SortIcon field="createdAt" />
                                            </button>
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-16">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="size-20 rounded-full bg-muted/50 flex items-center justify-center mb-4 ring-8 ring-muted/20">
                                                        <Users className="size-10 text-muted-foreground/50" />
                                                    </div>
                                                    <p className="text-muted-foreground font-medium mb-2 text-lg">
                                                        {searchQuery ? "No se encontraron usuarios" : "No hay usuarios registrados"}
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
                                                className="hover:bg-muted/30 transition-colors group"
                                                onMouseEnter={() => setHoveredRow(user.id)}
                                                onMouseLeave={() => setHoveredRow(null)}
                                            >
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedUsers.has(user.id)}
                                                        onCheckedChange={() => toggleSelectUser(user.id)}
                                                        aria-label={`Seleccionar ${user.name || user.email}`}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="size-10 border-2 border-background shadow-sm ring-2 ring-primary/10">
                                                            <AvatarImage src={user.image || undefined} />
                                                            <AvatarFallback className="text-sm font-semibold bg-linear-to-br from-primary/20 to-primary/5">
                                                                {getInitials(user.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <p className="font-medium truncate">{user.name || "Sin nombre"}</p>
                                                            <p className="text-sm text-muted-foreground truncate md:hidden">
                                                                {user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <span className="text-sm text-muted-foreground">{user.email}</span>
                                                </TableCell>
                                                <TableCell className="text-center">{getRoleBadge(user.role)}</TableCell>
                                                <TableCell className="hidden lg:table-cell text-muted-foreground text-sm text-center">
                                                    {formatDate(user.createdAt)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className={`transition-opacity ${hoveredRow === user.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="size-8 hover:bg-muted">
                                                                    <MoreHorizontal className="size-4" />
                                                                    <span className="sr-only">Abrir menú</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="gap-2 cursor-pointer" title="Ver detalles">
                                                                    <Eye className="size-4" />
                                                                    Ver detalles
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="gap-2 cursor-pointer" title="Editar usuario">
                                                                    <Pencil className="size-4" />
                                                                    Editar usuario
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    title="Eliminar usuario"
                                                                    className="gap-2 text-destructive focus:text-destructive hover:bg-destructive/10 cursor-pointer"
                                                                    onClick={() => {
                                                                        setSelectedUser(user);
                                                                        setIsDeleteDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                    Eliminar
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
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
                                        Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, filteredUsers.length)} de {filteredUsers.length}
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
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el usuario{" "}
                            <span className="font-semibold">{selectedUser?.name || selectedUser?.email}</span> de
                            la plataforma.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Eliminar usuario
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}
