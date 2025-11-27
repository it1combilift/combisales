"use client";

import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatDateShort } from "@/lib/utils";
import { H1 } from "@/components/fonts/fonts";
import { Badge } from "@/components/ui/badge";
import { ZohoAccount } from "@/interfaces/zoho";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DashboardPageSkeleton } from "@/components/dashboard-skeleton";

import {
  MapPin,
  Mail,
  Phone,
  Globe,
  User,
  Briefcase,
  Calendar,
  ArrowLeft,
  Plus,
} from "lucide-react";

const HistoryVisitsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [account, setAccount] = useState<ZohoAccount | null>(null);
  const [id, setId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resolvedParams = await params;
        const accountId = resolvedParams.id;
        setId(accountId);

        const response = await axios.get(`/api/zoho/accounts/${accountId}`);
        if (response.status === 200) {
          console.log(response.data.account);
          setAccount(response.data.account);
        }
      } catch (error) {
        console.error("Error fetching account details:", error);
        toast.error("Error al obtener los detalles de la cuenta.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params]);

  return (
    <section className="mx-auto px-4 space-y-6 w-full h-full">
      {isLoading ? (
        <DashboardPageSkeleton />
      ) : account ? (
        <>
          <header
            className="sticky top-0 z-20 -mx-4 px-4 pb-4 bg-background/95 backdrop-blur-md border-b border-border/50"
            role="banner"
            aria-label="Información del cliente"
          >
            <div className="space-y-4">
              {/* Title Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <H1>{account?.Account_Name || "Sin nombre"}</H1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-mono text-xs">
                      ID: #{account?.id || "N/A"}
                    </span>
                    {account?.Website && (
                      <>
                        <span>•</span>
                        <a
                          href={account.Website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 hover:text-primary transition-colors hover:underline"
                          aria-label={`Visitar sitio web: ${account.Website}`}
                        >
                          <Globe className="size-3.5 shrink-0" />
                          <span className="truncate max-w-[200px] sm:max-w-none">
                            {account.Website.replace(
                              /^https?:\/\//,
                              ""
                            ).replace(/\/$/, "")}
                          </span>
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    onClick={() => router.back()}
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2"
                  >
                    <ArrowLeft className="size-4" />
                    <span className="hidden sm:inline">Volver</span>
                  </Button>

                  <Button
                    onClick={() => {}}
                    size="sm"
                    className="h-9 gap-2"
                    aria-label="Crear visita para el cliente"
                  >
                    <Plus className="size-4" />
                    <span>Nueva visita</span>
                  </Button>
                </div>
              </div>

              {/* Info Badges Row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                {/* Owner & Date Section */}
                {(account.Owner || account.Modified_Time) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {account.Owner && (
                      <Badge
                        variant="secondary"
                        className="h-7 gap-1.5 font-normal"
                      >
                        <User className="size-3.5" />
                        <span>{account.Owner.name}</span>
                      </Badge>
                    )}

                    {account.Modified_Time && (
                      <Badge
                        variant="outline"
                        className="h-7 gap-1.5 font-normal"
                      >
                        <Calendar className="size-3.5" />
                        <time dateTime={account.Modified_Time}>
                          {formatDateShort(account.Modified_Time)}
                        </time>
                      </Badge>
                    )}
                  </div>
                )}

                {/* Separator */}
                {(account.Owner || account.Modified_Time) &&
                  (account.Account_Type ||
                    account.Industry ||
                    account.Billing_City ||
                    account.Phone ||
                    account.Email) && (
                    <Separator
                      orientation="vertical"
                      className="h-5 hidden sm:block"
                    />
                  )}

                {/* Business Info Section */}
                {(account.Account_Type ||
                  account.Industry ||
                  account.Billing_City) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {account.Account_Type && (
                      <Badge
                        variant="secondary"
                        className="h-7 gap-1.5 font-normal"
                      >
                        <Briefcase className="size-3.5" />
                        <span>{account.Account_Type}</span>
                      </Badge>
                    )}

                    {account.Industry && (
                      <Badge variant="outline" className="h-7 font-normal">
                        {account.Industry}
                      </Badge>
                    )}

                    {(account.Billing_City || account.Billing_Country) && (
                      <Badge
                        variant="secondary"
                        className="h-7 gap-1.5 font-normal"
                      >
                        <MapPin className="size-3.5" />
                        <span>
                          {[account.Billing_City, account.Billing_Country]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </Badge>
                    )}
                  </div>
                )}

                {/* Separator */}
                {(account.Account_Type ||
                  account.Industry ||
                  account.Billing_City) &&
                  (account.Phone || account.Email) && (
                    <Separator
                      orientation="vertical"
                      className="h-5 hidden sm:block"
                    />
                  )}

                {/* Contact Info Section */}
                {(account.Phone || account.Email) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {account.Phone && (
                      <a
                        href={`tel:${account.Phone}`}
                        className="inline-flex"
                        aria-label={`Llamar a ${account.Phone}`}
                      >
                        <Badge
                          variant="outline"
                          className="h-7 gap-1.5 font-normal hover:bg-green-500/10 hover:text-green-600 hover:border-green-500/50 transition-all cursor-pointer"
                        >
                          <Phone className="size-3.5" />
                          <span>{account.Phone}</span>
                        </Badge>
                      </a>
                    )}

                    {account.Email && (
                      <a
                        href={`mailto:${account.Email}`}
                        className="inline-flex"
                        aria-label={`Enviar email a ${account.Email}`}
                      >
                        <Badge
                          variant="outline"
                          className="h-7 gap-1.5 font-normal hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/50 transition-all cursor-pointer"
                        >
                          <Mail className="size-3.5" />
                          <span className="hidden sm:inline">
                            {account.Email}
                          </span>
                          <span className="sm:hidden">Email</span>
                        </Badge>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </header>
        </>
      ) : null}
    </section>
  );
};

export default HistoryVisitsPage;
