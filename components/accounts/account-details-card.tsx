"use client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ZohoAccount } from "@/interfaces/zoho";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
function formatDate(dateString: string | undefined): string | null {
  if (!dateString) return null;
  try {
    return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
  } catch {
    return null;
  }
}

/**
 * Formatea una fecha con hora
 */
function formatDateTime(dateString: string | undefined): string | null {
  if (!dateString) return null;
  try {
    return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale: es });
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
      <DetailSection title="Identificación" icon={Building2}>
        <DetailItem
          icon={Building2}
          label="Nombre de cuenta"
          value={account.Account_Name}
        />
        <DetailItem
          icon={FileText}
          label="Razón social"
          value={account.Razon_Social}
        />
        <DetailItem
          icon={Hash}
          label="Código cliente"
          value={account.C_digo_Cliente}
          copyable
        />
        <DetailItem
          icon={Hash}
          label="CIF / NIF"
          value={account.CIF}
          copyable
        />
        <DetailItem
          icon={Hash}
          label="ID Zoho"
          value={account.id}
          copyable
          className="lg:col-span-2"
        />
      </DetailSection>

      <Separator />

      {/* ==================== CLASIFICACIÓN ==================== */}
      {hasClassification && (
        <>
          <DetailSection title="Clasificación" icon={Briefcase}>
            <DetailItem
              icon={Tag}
              label="Tipo de cuenta"
              value={account.Account_Type}
            />
            <DetailItem
              icon={Briefcase}
              label="Industria"
              value={account.Industry}
            />
            <DetailItem
              icon={Tag}
              label="Sub-sector"
              value={account.Sub_Sector}
            />
            <DetailItem
              icon={Tag}
              label="Comunidad Autónoma"
              value={account.Comunidad_Aut_noma}
            />
            <DetailItem
              icon={FileText}
              label="Estado de la cuenta"
              value={account.Estado_de_la_Cuenta}
            />
            <DetailItem
              icon={Truck}
              label="Tipo de pedido"
              value={account.Tipo_de_pedido}
            />
          </DetailSection>
          <Separator />
        </>
      )}

      {/* ==================== CONTACTO ==================== */}
      {hasContactInfo && (
        <>
          <DetailSection title="Contacto" icon={Phone}>
            <DetailItem
              icon={Phone}
              label="Teléfono"
              value={account.Phone}
              copyable
            />
            <DetailItem icon={Phone} label="Fax" value={account.Fax} copyable />
            <DetailItem
              icon={Mail}
              label="Correo electrónico"
              value={account.Correo_electr_nico || account.Email}
              copyable
            />
            <DetailItem
              icon={Globe}
              label="Sitio web"
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
          <DetailSection title="Dirección de Facturación" icon={MapPin}>
            <DetailItem
              icon={MapPin}
              label="Dirección"
              value={account.Billing_Street}
              className="sm:col-span-2 lg:col-span-3"
            />
            <DetailItem label="Ciudad" value={account.Billing_City} />
            <DetailItem
              label="Provincia / Estado"
              value={account.Billing_State}
            />
            <DetailItem label="Código Postal" value={account.Billing_Code} />
            <DetailItem label="País" value={account.Billing_Country} />
          </DetailSection>
          <Separator />
        </>
      )}

      {/* ==================== DIRECCIÓN DE ENVÍO ==================== */}
      {shippingAddress && (
        <>
          <DetailSection title="Dirección de Envío" icon={Truck}>
            <DetailItem
              icon={MapPin}
              label="Dirección"
              value={account.Shipping_Street}
              className="sm:col-span-2 lg:col-span-3"
            />
            <DetailItem label="Ciudad" value={account.Shipping_City} />
            <DetailItem
              label="Provincia / Estado"
              value={account.Shipping_State}
            />
            <DetailItem label="Código Postal" value={account.Shipping_Code} />
            <DetailItem label="País" value={account.Shipping_Country} />
          </DetailSection>
          <Separator />
        </>
      )}

      {/* ==================== PROPIETARIO Y RESPONSABLES ==================== */}
      <DetailSection title="Responsables" icon={Users}>
        {account.Owner && (
          <>
            <DetailItem
              icon={User}
              label="Propietario"
              value={account.Owner.name}
            />
            <DetailItem
              icon={Mail}
              label="Email propietario"
              value={account.Owner.email}
              copyable
            />
          </>
        )}
        {account.Created_By && (
          <>
            <DetailItem
              icon={User}
              label="Creado por"
              value={account.Created_By.name}
            />
            <DetailItem
              icon={Mail}
              label="Email creador"
              value={account.Created_By.email}
              copyable
            />
          </>
        )}
        {account.Modified_By && (
          <>
            <DetailItem
              icon={User}
              label="Modificado por"
              value={account.Modified_By.name}
            />
          </>
        )}
        {account.Parent_Account && (
          <DetailItem
            icon={Building2}
            label="Cuenta padre"
            value={account.Parent_Account.name}
          />
        )}
      </DetailSection>

      <Separator />

      {/* ==================== ESTADOS Y FLAGS ==================== */}
      {hasStatusFlags && (
        <>
          <DetailSection title="Estado del Cliente" icon={CheckCircle2}>
            <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3">
              <StatusBadge
                value={account.Cliente_con_Equipo}
                trueLabel="Cliente con equipo"
              />
              <StatusBadge
                value={account.Cuenta_Nacional}
                trueLabel="Cuenta nacional"
              />
              <StatusBadge
                value={account.Cliente_Books}
                trueLabel="Cliente Books"
              />
              <StatusBadge
                value={account.Condiciones_Especiales}
                trueLabel="Condiciones especiales"
              />
              <StatusBadge
                value={account.Proyecto_abierto}
                trueLabel="Proyecto abierto"
              />
              <StatusBadge value={account.Revisado} trueLabel="Revisado" />
              <StatusBadge
                value={account.Localizaciones_multiples}
                trueLabel="Múltiples localizaciones"
              />
            </div>
          </DetailSection>
          <Separator />
        </>
      )}

      {/* ==================== FECHAS ==================== */}
      <DetailSection title="Historial" icon={Calendar}>
        <DetailItem
          icon={Calendar}
          label="Fecha de creación"
          value={formatDate(account.Created_Time)}
        />
        <DetailItem
          icon={Clock}
          label="Última modificación"
          value={formatDateTime(account.Modified_Time)}
        />
        <DetailItem
          icon={Clock}
          label="Última actividad"
          value={formatDateTime(account.Last_Activity_Time)}
        />
      </DetailSection>

      {/* ==================== DESCRIPCIÓN ==================== */}
      {account.Description && (
        <>
          <Separator />
          <DetailSection title="Descripción" icon={FileText}>
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
