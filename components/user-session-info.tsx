"use client";

import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UserSessionInfo() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-20 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!session) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Sesión</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No hay sesión activa</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Usuario autenticado
                    <Badge variant="success" className="ml-auto">
                        Activo
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={session.user.image || undefined} alt={session.user.name || 'Usuario'} />
                        <AvatarFallback>
                            {session.user.name?.slice(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {session.user.name || 'Sin nombre'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {session.user.email || 'Sin email'}
                        </p>
                        {/* {session.accessToken && (
                            <Badge variant="outline" className="mt-2">
                                Token: {session.accessToken.substring(0, 20)}...
                            </Badge>
                        )} */}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
