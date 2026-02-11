"use client";

import { formatDate } from "@/lib/utils";
import { getPrimaryRole } from "@/lib/roles";
import { useI18n } from "@/lib/i18n/context";
import { Badge } from "@/components/ui/badge";
import { ProfileUser } from "@/components/profile/profile-edit-dialog";

import {
  CalendarDays,
  CheckCircle2,
  Globe,
  Key,
  Mail,
  RefreshCw,
  Shield,
  User,
  XCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProfileContentProps {
  user: ProfileUser;
}

export default function ProfileContent({ user }: ProfileContentProps) {
  const { t, locale } = useI18n();

  // Get authentication methods
  const getAuthMethods = () => {
    const methods: string[] = [];

    if (user.hasPassword) {
      methods.push(t("profile.info.credentials"));
    }

    if (user.accounts && user.accounts.length > 0) {
      user.accounts.forEach((account) => {
        const providerKey = `profile.info.${account.provider}`;
        methods.push(t(providerKey) || account.provider);
      });
    }

    return methods.length > 0 ? methods : [t("profile.notAvailable")];
  };

  // Info item component
  const InfoItem = ({
    icon: Icon,
    label,
    value,
    valueComponent,
  }: {
    icon: React.ElementType;
    label: string;
    value?: string | null;
    valueComponent?: React.ReactNode;
  }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/70">
      <div className="shrink-0 p-2 rounded-md bg-background">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        {valueComponent || (
          <p className="text-sm font-medium truncate">
            {value || t("profile.notAvailable")}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <section>
      {/* Personal Information Card */}
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-4" />
            {t("profile.personalInfo")}
          </CardTitle>
          <CardDescription>{t("profile.personal.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoItem icon={User} label={t("profile.name")} value={user.name} />
            <InfoItem
              icon={Mail}
              label={t("profile.email")}
              value={user.email}
            />
            <InfoItem
              icon={Globe}
              label={t("profile.country")}
              value={user.country}
            />
            <InfoItem
              icon={Shield}
              label={t("profile.role")}
              value={t(
                `users.roles.${getPrimaryRole(user.roles).toLowerCase()}`,
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Information Card */}
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="size-4" />
            {t("profile.info.title")}
          </CardTitle>
          <CardDescription>{t("profile.info.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoItem
              icon={user.isActive ? CheckCircle2 : XCircle}
              label={t("profile.info.status")}
              valueComponent={
                <Badge
                  variant={user.isActive ? "default" : "secondary"}
                  className={
                    user.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }
                >
                  {user.isActive
                    ? t("profile.info.statusActive")
                    : t("profile.info.statusInactive")}
                </Badge>
              }
            />
            <InfoItem
              icon={Key}
              label={t("profile.info.authMethods")}
              valueComponent={
                <div className="flex flex-wrap gap-1 mt-1">
                  {getAuthMethods().map((method, index) => (
                    <Badge
                      key={index}
                      variant="outline-warning"
                      className="text-xs"
                    >
                      {method}
                    </Badge>
                  ))}
                </div>
              }
            />
            <InfoItem
              icon={CalendarDays}
              label={t("profile.info.createdAt")}
              value={formatDate(user.createdAt, locale)}
            />
            <InfoItem
              icon={RefreshCw}
              label={t("profile.info.updatedAt")}
              value={formatDate(user.updatedAt, locale)}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
