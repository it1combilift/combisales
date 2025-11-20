import { getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Mail, PencilLineIcon, ShieldCheckIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileHeaderProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {

    const userName = user.name || "Usuario";
    const userEmail = user.email || "email@example.com";
    const userImage = user.image;

    return (
        <Card>
            <CardContent>
                <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                    <div className="relative">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={userImage || undefined} alt={userName} />
                            <AvatarFallback className="text-2xl">
                                {getInitials(userName)}
                            </AvatarFallback>
                        </Avatar>
                        <Button
                            size="icon"
                            variant="outline"
                            className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full"
                        >
                            <Camera className="size-4" />
                        </Button>
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                            <h1 className="text-2xl font-bold">{userName}</h1>
                            <Badge variant="success">
                                ACTIVO
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">Combilift Company</p>
                        <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <Mail className="size-4" />
                                {userEmail}
                            </div>
                            <div className="flex items-center gap-1">
                                <ShieldCheckIcon className="size-4" />
                                Autenticado con Zoho
                            </div>
                        </div>
                    </div>
                    <Button variant="default">Editar
                        <PencilLineIcon className="size-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}