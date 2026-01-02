"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { ZohoAccount } from "@/interfaces/zoho";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n/context";

import {
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  User,
  Calendar,
  Tag,
  Briefcase,
  Hash,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  ExternalLink,
  Copy,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ==================== TYPES ====================
interface AccountDetailsCardProps {
  account: ZohoAccount;
  className?: string;
}

interface DetailItemProps {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  className?: string;
  copyable?: boolean;
  isLink?: boolean;
  href?: string;
}

interface DetailSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}

interface StatusBadgeProps {
  value: boolean | undefined | null;
  trueLabel: string;
  falseLabel?: string;
}

// ==================== HELPER COMPONENTS ====================

/**
 * Badge para mostrar estados booleanos
 */
function StatusBadge({ value, trueLabel, falseLabel }: StatusBadgeProps) {
  if (value === undefined || value === null) return null;

  return (
    <Badge
      variant={value ? "default" : "secondary"}
      className={cn(
        "text-xs font-medium",
        value
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
          : "bg-muted text-muted-foreground"
      )}
    >
      {value ? (
        <CheckCircle2 className="size-3 mr-1" />
      ) : (
        <XCircle className="size-3 mr-1" />
      )}
      {value ? trueLabel : falseLabel || `No ${trueLabel.toLowerCase()}`}
    </Badge>
  );
}

/**
 * Componente para un item de detalle individual
 */
function DetailItem({
  icon: Icon,
  label,
  value,
  className,
  copyable = false,
  isLink = false,
  href,
}: DetailItemProps) {
  if (!value && value !== 0) return null;

  const handleCopy = () => {
    if (typeof value === "string") {
      navigator.clipboard.writeText(value);
      toast.success("Copiado al portapapeles");
    }
  };

  const content =
    isLink && href ? (
      <a
        href={href.startsWith("http") ? href : `https://${href}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline inline-flex items-center gap-1"
      >
        {value}
        <ExternalLink className="size-3" />
      </a>
    ) : (
      <span className="text-foreground">{value}</span>
    );

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
        {Icon && <Icon className="size-3" />}
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        {content}
        {copyable && typeof value === "string" && (
          <Button
            variant="ghost"
            size="icon"
            className="size-5 opacity-50 hover:opacity-100"
            onClick={handleCopy}
          >
            <Copy className="size-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Sección agrupadora de detalles
 */
function DetailSection({
  title,
  icon: Icon,
  children,
  className,
}: DetailSectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
        <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="size-3.5 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
}

/**
 * Formatea una fecha ISO a formato legible
 */
function formatDate(dateString: string | undefined, locale: any): string | null {
  if (!dateString) return null;
  try {
    const formatStr = locale.code === "es" ? "d 'de' MMMM, yyyy" : "MMMM d, yyyy";
    return format(new Date(dateString), formatStr, { locale });
  } catch {
    return null;
  }
}

/**
 * Formatea una fecha con hora
 */
function formatDateTime(dateString: string | undefined, locale: any): string | null {
  if (!dateString) return null;
  try {
    return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale });
  } catch {
    return null;
  }
}

/**
 * Construye la dirección completa
 */
function buildAddress(
  street?: string,
  city?: string,
  state?: string,
  code?: string,
  country?: string
): string | null {
  const parts = [street, city, state, code, country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

// ==================== MAIN COMPONENT ====================

export function AccountDetailsCard({
  account,
  className,
}: AccountDetailsCardProps) {
  const { t, locale } = useI18n();
  const dateLocale = locale === "es" ? es : enUS;

  const billingAddress = buildAddress(
    account.Billing_Street,
    account.Billing_City,
    account.Billing_State,
    account.Billing_Code,
    account.Billing_Country
  );

  const shippingAddress = buildAddress(
    account.Shipping_Street,
    account.Shipping_City,
    account.Shipping_State,
    account.Shipping_Code,
    account.Shipping_Country
  );

  const hasContactInfo =
    account.Phone ||
    account.Fax ||
    account.Correo_electr_nico ||
    account.Email ||
    account.Website;

  const hasClassification =
    account.Account_Type || account.Industry || account.Sub_Sector;

  const hasStatusFlags =
    account.Cliente_con_Equipo !== undefined ||
    account.Cuenta_Nacional !== undefined ||
    account.Cliente_Books !== undefined ||
    account.Condiciones_Especiales !== undefined ||
    account.Proyecto_abierto !== undefined;

  return (
    <div className={cn("space-y-6", className)}>
      {/* ==================== IDENTIFICACIÓN ==================== */}
      <DetailSection title={t("clients.identification")} icon={Building2}>
        <DetailItem
          icon={Building2}
          label={t("clients.accountName")}
          value={account.Account_Name}
        />
        <DetailItem
          icon={FileText}
          label={t("clients.legalName")}
          value={account.Razon_Social}
        />
        <DetailItem
          icon={Hash}
          label={t("clients.clientCode")}
          value={account.C_digo_Cliente}
          copyable
        />
        <DetailItem
          icon={Hash}
          label={t("clients.cif")}
          value={account.CIF}
          copyable
        />
        <DetailItem
          icon={Hash}
          label={t("clients.zohoId")}
          value={account.id}
          copyable
          className="lg:col-span-2"
        />
      </DetailSection>

      <Separator />

      {/* ==================== CLASIFICACIÓN ==================== */}
      {hasClassification && (
        <>
          <DetailSection title={t("clients.classification")} icon={Briefcase}>
            <DetailItem
              icon={Tag}
              label={t("clients.accountType")}
              value={account.Account_Type}
            />
            <DetailItem
              icon={Briefcase}
              label={t("clients.industry")}
              value={account.Industry}
            />
            <DetailItem
              icon={Tag}
              label={t("clients.subSector")}
              value={account.Sub_Sector}
            />
            <DetailItem
              icon={Tag}
              label={t("clients.autonomousCommunity")}
              value={account.Comunidad_Aut_noma}
            />
            <DetailItem
              icon={FileText}
              label={t("clients.accountStatus")}
              value={account.Estado_de_la_Cuenta}
            />
            <DetailItem
              icon={Truck}
              label={t("clients.orderType")}
              value={account.Tipo_de_pedido}
            />
          </DetailSection>
          <Separator />
        </>
      )}

      {/* ==================== CONTACTO ==================== */}
      {hasContactInfo && (
        <>
          <DetailSection title={t("clients.contact")} icon={Phone}>
            <DetailItem
              icon={Phone}
              label={t("clients.phone")}
              value={account.Phone}
              copyable
            />
            <DetailItem icon={Phone} label={t("clients.fax")} value={account.Fax} copyable />
            <DetailItem
              icon={Mail}
              label={t("clients.email")}
              value={account.Correo_electr_nico || account.Email}
              copyable
            />
            <DetailItem
              icon={Globe}
              label={t("clients.visitWebsite")}
              value={account.Website?.replace(/^https?:\/\//, "").replace(
                /\/$/,
                ""
              )}
              isLink
              href={account.Website}
            />
          </DetailSection>
          <Separator />
        </>
      )}

      {/* ==================== DIRECCIÓN DE FACTURACIÓN ==================== */}
      {billingAddress && (
        <>
          <DetailSection title={t("clients.billingAddress")} icon={MapPin}>
            <DetailItem
              icon={MapPin}
              label={t("clients.address")}
              value={account.Billing_Street}
              className="sm:col-span-2 lg:col-span-3"
            />
            <DetailItem label={t("clients.city")} value={account.Billing_City} />
            <DetailItem
              label={t("clients.state")}
              value={account.Billing_State}
            />
            <DetailItem label={t("clients.zipCode")} value={account.Billing_Code} />
            <DetailItem label={t("clients.country")} value={account.Billing_Country} />
          </DetailSection>
          <Separator />
        </>
      )}

      {/* ==================== DIRECCIÓN DE ENVÍO ==================== */}
      {shippingAddress && (
        <>
          <DetailSection title={t("clients.shippingAddress")} icon={Truck}>
            <DetailItem
              icon={MapPin}
              label={t("clients.address")}
              value={account.Shipping_Street}
              className="sm:col-span-2 lg:col-span-3"
            />
            <DetailItem label={t("clients.city")} value={account.Shipping_City} />
            <DetailItem
              label={t("clients.state")}
              value={account.Shipping_State}
            />
            <DetailItem label={t("clients.zipCode")} value={account.Shipping_Code} />
            <DetailItem label={t("clients.country")} value={account.Shipping_Country} />
          </DetailSection>
          <Separator />
        </>
      )}

      {/* ==================== PROPIETARIO Y RESPONSABLES ==================== */}
      <DetailSection title={t("clients.responsibles")} icon={Users}>
        {account.Owner && (
          <>
            <DetailItem
              icon={User}
              label={t("clients.owner")}
              value={account.Owner.name}
            />
            <DetailItem
              icon={Mail}
              label={t("clients.ownerEmail")}
              value={account.Owner.email}
              copyable
            />
          </>
        )}
        {account.Created_By && (
          <>
            <DetailItem
              icon={User}
              label={t("clients.createdBy")}
              value={account.Created_By.name}
            />
            <DetailItem
              icon={Mail}
              label={t("clients.creatorEmail")}
              value={account.Created_By.email}
              copyable
            />
          </>
        )}
        {account.Modified_By && (
          <>
            <DetailItem
              icon={User}
              label={t("clients.modifiedBy")}
              value={account.Modified_By.name}
            />
          </>
        )}
        {account.Parent_Account && (
          <DetailItem
            icon={Building2}
            label={t("clients.parentAccount")}
            value={account.Parent_Account.name}
          />
        )}
      </DetailSection>

      <Separator />

      {/* ==================== ESTADOS Y FLAGS ==================== */}
      {hasStatusFlags && (
        <>
          <DetailSection title={t("clients.clientStatus")} icon={CheckCircle2}>
            <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3">
              <StatusBadge
                value={account.Cliente_con_Equipo}
                trueLabel={t("clients.flags.hasEquipment")}
              />
              <StatusBadge
                value={account.Cuenta_Nacional}
                trueLabel={t("clients.flags.nationalAccount")}
              />
              <StatusBadge
                value={account.Cliente_Books}
                trueLabel={t("clients.flags.booksClient")}
              />
              <StatusBadge
                value={account.Condiciones_Especiales}
                trueLabel={t("clients.flags.specialConditions")}
              />
              <StatusBadge
                value={account.Proyecto_abierto}
                trueLabel={t("clients.flags.openProject")}
              />
              <StatusBadge value={account.Revisado} trueLabel={t("clients.flags.reviewed")} />
              <StatusBadge
                value={account.Localizaciones_multiples}
                trueLabel={t("clients.flags.multiLocation")}
              />
            </div>
          </DetailSection>
          <Separator />
        </>
      )}

      {/* ==================== FECHAS ==================== */}
      <DetailSection title={t("clients.history")} icon={Calendar}>
        <DetailItem
          icon={Calendar}
          label={t("clients.createdDate")}
          value={formatDate(account.Created_Time, dateLocale)}
        />
        <DetailItem
          icon={Clock}
          label={t("clients.modifiedDate")}
          value={formatDateTime(account.Modified_Time, dateLocale)}
        />
        <DetailItem
          icon={Clock}
          label={t("clients.lastActivity")}
          value={formatDateTime(account.Last_Activity_Time, dateLocale)}
        />
      </DetailSection>

      {/* ==================== DESCRIPCIÓN ==================== */}
      {account.Description && (
        <>
          <Separator />
          <DetailSection title={t("common.description")} icon={FileText}>
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {account.Description}
              </p>
            </div>
          </DetailSection>
        </>
      )}
    </div>
  );
}

export default AccountDetailsCard;
