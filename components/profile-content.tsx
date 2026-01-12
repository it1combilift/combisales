"use client";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, Key, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProfileContentProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function ProfileContent({ user }: ProfileContentProps) {
  const { t } = useI18n();
  const userName = user.name || "";
  const userEmail = user.email || "";
  const [firstName, lastName] = userName.split(" ");

  return (
    <Tabs defaultValue="personal" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="personal">{t("profile.tabs.personal")}</TabsTrigger>
        <TabsTrigger value="account">{t("profile.tabs.account")}</TabsTrigger>
        <TabsTrigger value="security">{t("profile.tabs.security")}</TabsTrigger>
      </TabsList>

      {/* Personal Information */}
      <TabsContent value="personal" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.personal.title")}</CardTitle>
            <CardDescription>
              {t("profile.personal.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 w-full">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("profile.personal.firstName")}</Label>
                <Input id="firstName" defaultValue={firstName || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("profile.personal.lastName")}</Label>
                <Input id="lastName" defaultValue={lastName || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("profile.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={userEmail}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("profile.personal.phone")}</Label>
                <Input id="phone" placeholder={t("profile.personal.phonePlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">{t("profile.personal.jobTitle")}</Label>
                <Input id="jobTitle" placeholder={t("profile.personal.jobTitlePlaceholder")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">{t("profile.personal.company")}</Label>
                <Input id="company" defaultValue="Combilift Company" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">{t("profile.personal.bio")}</Label>
              <Textarea id="bio" placeholder={t("profile.personal.bioPlaceholder")} rows={4} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">{t("profile.personal.location")}</Label>
              <Input id="location" placeholder={t("profile.personal.locationPlaceholder")} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Account Settings */}
      <TabsContent value="account" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.account.title")}</CardTitle>
            <CardDescription>
              {t("profile.account.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">{t("profile.account.status")}</Label>
                <p className="text-muted-foreground text-sm">
                  {t("profile.account.statusActive")}
                </p>
              </div>
              <Badge
                variant="outline"
                className="border-green-200 bg-green-50 text-green-700"
              >
                {t("profile.account.active")}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">{t("profile.account.subscription")}</Label>
                <p className="text-muted-foreground text-sm">
                  {t("profile.account.subscriptionPlan")}
                </p>
              </div>
              <Button variant="outline">{t("profile.account.manageSubscription")}</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">{t("profile.account.visibility")}</Label>
                <p className="text-muted-foreground text-sm">
                  {t("profile.account.visibilityDescription")}
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">{t("profile.account.dataExport")}</Label>
                <p className="text-muted-foreground text-sm">
                  {t("profile.account.dataExportDescription")}
                </p>
              </div>
              <Button variant="outline">{t("profile.account.exportData")}</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">{t("profile.danger.title")}</CardTitle>
            <CardDescription>
              {t("profile.danger.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">{t("profile.danger.deleteAccount")}</Label>
                <p className="text-muted-foreground text-sm">
                  {t("profile.danger.deleteAccountDescription")}
                </p>
              </div>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("profile.danger.deleteAccount")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Security Settings */}
      <TabsContent value="security" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("profile.security.title")}</CardTitle>
            <CardDescription>
              {t("profile.security.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">{t("profile.security.password")}</Label>
                  <p className="text-muted-foreground text-sm">
                    {t("profile.security.passwordLastChanged")}
                  </p>
                </div>
                <Button variant="outline">
                  <Key className="mr-2 h-4 w-4" />
                  {t("profile.security.changePassword")}
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">{t("profile.security.twoFactor")}</Label>
                  <p className="text-muted-foreground text-sm">
                    {t("profile.security.twoFactorDescription")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-green-200 bg-green-50 text-green-700"
                  >
                    {t("profile.security.enabled")}
                  </Badge>
                  <Button variant="outline" size="sm">
                    {t("profile.security.configure")}
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">{t("profile.security.loginNotifications")}</Label>
                  <p className="text-muted-foreground text-sm">
                    {t("profile.security.loginNotificationsDescription")}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">{t("profile.security.activeSessions")}</Label>
                  <p className="text-muted-foreground text-sm">
                    {t("profile.security.activeSessionsDescription")}
                  </p>
                </div>
                <Button variant="outline">
                  <Shield className="mr-2 h-4 w-4" />
                  {t("profile.security.viewSessions")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
