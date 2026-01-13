"use client";

import axios from "axios";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { useI18n } from "@/lib/i18n/context";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";
import { EmptyCard } from "@/components/empty-card";
import ProfileHeader from "@/components/profile-header";
import ProfileContent from "@/components/profile-content";

import {
  ProfileEditDialog,
  ProfileUser,
} from "@/components/profile/profile-edit-dialog";

export default function ProfilePage() {
  const { t } = useI18n();
  const { status: sessionStatus } = useSession();

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch user profile data
  const fetchUserProfile = useCallback(async () => {
    try {
      setError(null);
      const response = await axios.get("/api/auth/me");
      setUser(response.data.user);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(t("profile.errorLoading"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // Fetch profile on mount
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchUserProfile();
    } else if (sessionStatus === "unauthenticated") {
      setIsLoading(false);
    }
  }, [sessionStatus, fetchUserProfile]);

  // Handle edit success - refresh data
  const handleEditSuccess = useCallback(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Handle edit button click
  const handleEditClick = useCallback(() => {
    setIsEditDialogOpen(true);
  }, []);

  // Loading state
  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2">
        <Spinner className="size-4" variant="bars" />
        <p className="text-muted-foreground">{t("profile.loading")}</p>
      </div>
    );
  }

  // Not authenticated
  if (sessionStatus === "unauthenticated") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p>{t("common.notAuthenticated")}</p>
      </div>
    );
  }

  // Error state
  if (error || !user) {
    return (
      <div className="container mx-auto px-4 md:px-6">
        <EmptyCard
          icon={<AlertTriangle />}
          title={t("profile.errorLoading")}
          description={error || t("messages.error")}
          className="min-h-[400px]"
          actions={
            <Button onClick={fetchUserProfile} className="gap-2">
              <RefreshCw className="size-4" />
              {t("common.tryAgain")}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full">
      <ProfileHeader user={user} onEditClick={handleEditClick} />
      <ProfileContent user={user} />
      <ProfileEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={user}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
