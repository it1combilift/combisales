import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { formatDateShort } from "@/lib/utils";
import { ZohoAccount } from "@/interfaces/zoho";
import { useI18n } from "@/lib/i18n/context";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  ArrowUpRight,
  Briefcase,
  Calendar,
  Copy,
  Globe,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Trash2,
  User,
  Plus,
} from "lucide-react";

export const AccountCard = ({
  account,
  onCreateVisit,
}: {
  account: ZohoAccount;
  onSelect: (selected: boolean) => void;
  isSelected: boolean;
  onCreateVisit?: () => void;
}) => {
  const router = useRouter();
  const { t } = useI18n();
  const ACCOUNT_ID_URL = (accountId: string) =>
    `/dashboard/clients/visits/${accountId}`;

  return (
    <Card
      className="p-4 hover:shadow-lg transition-all duration-200 active:scale-[0.98] border-l-4 border-l-primary/20 cursor-pointer"
      onClick={() => router.push(ACCOUNT_ID_URL(account.id))}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-foreground line-clamp-2 leading-tight">
                {account.Account_Name}
              </h3>
              {account.Account_Type && (
                <Badge variant="secondary" className="mt-1.5 text-xs">
                  {account.Account_Type}
                </Badge>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 w-9 p-0 hover:bg-accent"
                aria-label={t("common.actions")}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigator.clipboard.writeText(account.id)}
              >
                <Copy className="h-4 w-4" />
                {t("clients.copyId")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push(ACCOUNT_ID_URL(account.id))}
              >
                <ArrowUpRight className="h-4 w-4" />
                {t("clients.details")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-destructive cursor-pointer hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4 text-destructive" />
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>{" "}
        {/* Industry and Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {account.Industry && (
            <div className="flex items-center gap-2.5 text-sm min-h-11">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground font-medium truncate">
                {account.Industry}
              </span>
            </div>
          )}

          {(account.Billing_Country || account.Billing_City) && (
            <div className="flex items-center gap-2.5 text-sm min-h-11">
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex flex-col min-w-0">
                {account.Billing_Country && (
                  <span className="text-foreground font-semibold truncate text-sm">
                    {account.Billing_Country}
                  </span>
                )}
                {account.Billing_City && (
                  <span className="text-muted-foreground text-xs truncate">
                    {account.Billing_City}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Contact Information */}
        <div className="space-y-2.5">
          {account.Phone && (
            <a
              href={`tel:${account.Phone}`}
              className="flex items-center gap-2.5 text-sm text-foreground hover:text-primary transition-colors min-h-11 rounded-md hover:bg-accent px-2 -mx-2"
              aria-label={`Llamar a ${account.Phone}`}
            >
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-green-600" />
              </div>
              <span className="font-medium truncate">{account.Phone}</span>
            </a>
          )}

          {account.Email && (
            <a
              href={`mailto:${account.Email}`}
              className="flex items-center gap-2.5 text-sm text-foreground hover:text-primary transition-colors min-h-11 rounded-md hover:bg-accent px-2 -mx-2"
              aria-label={`Enviar email a ${account.Email}`}
            >
              <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-orange-600" />
              </div>
              <span className="font-medium truncate">{account.Email}</span>
            </a>
          )}

          {account.Website && (
            <a
              href={account.Website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 text-sm text-primary hover:text-primary/80 transition-colors min-h-11 rounded-md hover:bg-accent px-2 -mx-2"
              aria-label={`Visitar sitio web de ${account.Account_Name}`}
            >
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Globe className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-medium truncate">
                {t("clients.visitWebsite")}
              </span>
            </a>
          )}
        </div>
        {/* Owner and Date */}
        <div className="pt-3 border-t border-border space-y-2.5">
          {account.Owner && (
            <div className="flex items-center gap-2.5 text-sm min-h-11">
              <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-foreground font-semibold truncate text-sm">
                  {account.Owner.name}
                </span>
                <span className="text-muted-foreground text-xs truncate">
                  {account.Owner.email}
                </span>
              </div>
            </div>
          )}

          {account.Modified_Time && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="text-xs">
                {t("clients.modified")}:{" "}
                {formatDateShort(account.Modified_Time)}
              </span>
            </div>
          )}

          {onCreateVisit && (
            <Button
              variant="default"
              size="sm"
              className="w-full mt-2"
              onClick={(e) => {
                e.stopPropagation();
                onCreateVisit();
              }}
            >
              <Plus className="size-4" />
              {t("clients.createVisit")}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
