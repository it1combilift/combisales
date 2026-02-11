"use client";

import { Role } from "@prisma/client";
import { signOut } from "next-auth/react";
import { useI18n } from "@/lib/i18n/context";
import { H1, Paragraph } from "./fonts/fonts";
import { Button } from "@/components/ui/button";
import { getInitials, getRoleBadge } from "@/lib/utils";
import { getPrimaryRole } from "@/lib/roles";
import { ProfileUser } from "@/components/profile/profile-edit-dialog";
import { Camera, LogOut, Mail, PencilLine, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  user: ProfileUser;
  onEditClick: () => void;
}

export default function ProfileHeader({
  user,
  onEditClick,
}: ProfileHeaderProps) {
  const { t } = useI18n();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Get authentication provider display name
  const getAuthProviders = () => {
    if (user.accounts && user.accounts.length > 0) {
      return user.accounts
        .map((account) => {
          const providerKey = `profile.info.${account.provider}`;
          return t(providerKey) || account.provider;
        })
        .join(", ");
    }
    return t("profile.info.credentials");
  };

  return (
    <div className="w-full pt-0 mt-0 bg-transparent border-none">
      {/* Desktop & Tablet Layout (md and up) */}
      <div className="hidden md:block">
        <div className="border-none shadow-none overflow-hidden">
          {/* Content Container */}
          <div className="px-4 pb-2">
            <div className="flex items-end gap-3">
              {/* Avatar Section */}
              <div className="relative shrink-0">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-card ring-1 ring-border/50">
                    <AvatarImage
                      src={user.image || undefined}
                      alt={user.name || "User"}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-3xl font-semibold bg-linear-to-br from-blue-500 to-purple-600 text-white">
                      {getInitials(user.name || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute -right-1 bottom-2 h-9 w-9 rounded-full shadow-lg border border-border hover:scale-105 transition-transform"
                    onClick={onEditClick}
                    title={t("profile.header.changePhoto")}
                  >
                    <Camera className="size-4" />
                  </Button>
                </div>
              </div>

              {/* User Information Section */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <H1>{user.name || t("profile.notAvailable")}</H1>
                  {getRoleBadge(getPrimaryRole(user.roles))}
                </div>

                <Paragraph>{t("profile.header.company")}</Paragraph>

                <div className="flex flex-wrap items-center text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center size-8">
                      <Mail className="size-4" />
                    </div>
                    <span className="font-medium">{user.email}</span>
                  </div>

                  <div className="flex items-center">
                    <div className="flex items-center justify-center size-8">
                      <ShieldCheck className="size-4" />
                    </div>
                    <span className="text-xs">
                      {t("profile.header.authenticatedWith", {
                        provider: getAuthProviders(),
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={onEditClick} size="sm">
                  <PencilLine className="size-4" />
                  {t("profile.header.editProfile")}
                </Button>
                <Button variant="destructive" onClick={handleLogout} size="sm">
                  <LogOut className="size-4" />
                  {t("common.logout")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout (sm and below) */}
      <div className="md:hidden">
        <div className="border-none shadow-none overflow-hidden">
          {/* Content */}
          <div className="px-4 pb-2">
            {/* Avatar Centered */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                <Avatar className="h-28 w-28 border-4 border-card shadow-xl ring-1 ring-border/50">
                  <AvatarImage
                    src={user.image || undefined}
                    alt={user.name || "User"}
                    className="object-cover object-center"
                  />
                  <AvatarFallback className="text-2xl font-semibold bg-linear-to-br from-blue-500 to-purple-600 text-white">
                    {getInitials(user.name || "U")}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute -right-1 bottom-1 rounded-full shadow-lg border border-border"
                  onClick={onEditClick}
                  title={t("profile.header.changePhoto")}
                >
                  <Camera className="size-4" />
                </Button>
              </div>
            </div>

            {/* User Info Centered */}
            <div className="text-center space-y-2">
              <div className="space-y-2 flex flex-col items-center">
                <H1>{user.name || t("profile.notAvailable")}</H1>
                {getRoleBadge(getPrimaryRole(user.roles))}
                <Paragraph>{t("profile.header.company")}</Paragraph>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 flex flex-col items-center">
                <div className="flex items-center justify-center text-sm">
                  <div className="flex items-center justify-center size-7">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground text-balance">
                    {user.email}
                  </span>
                </div>

                <div className="flex items-center justify-center text-xs text-muted-foreground">
                  <div className="flex items-center justify-center size-7">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-balance">
                    {t("profile.header.authenticatedWith", {
                      provider: getAuthProviders(),
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons Stacked */}
            <div className="space-y-2 grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={onEditClick} size="sm">
                <PencilLine className="size-4" />
                {t("profile.header.editProfile")}
              </Button>
              <Button variant="destructive" onClick={handleLogout} size="sm">
                <LogOut className="size-4" />
                {t("common.logout")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, rgb(0 0 0 / 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(0 0 0 / 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
