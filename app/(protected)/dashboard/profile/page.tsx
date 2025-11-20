"use client";

import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";
import ProfileHeader from "@/components/profile-header";
import ProfileContent from "@/components/profile-content";

export default function ProfilePage() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Spinner className="size-8" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <p>No autenticado</p>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full space-y-6 px-4">
            <ProfileHeader user={session.user} />
            <ProfileContent user={session.user} />
        </div>
    );
}