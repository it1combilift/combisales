"use client";

import { formatDateShort } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ZohoAccount } from "@/interfaces/zoho";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpRight, Building2, PencilLine } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  IconDotsVertical,
  IconTrash,
  IconWorld,
  IconMail,
  IconPhone,
  IconCopy,
} from "@tabler/icons-react";

export function createColumns(): ColumnDef<ZohoAccount>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todo"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "Account_Name",
      header: "Cuenta",
      cell: ({ row }) => {
        const name = row.getValue("Account_Name") as string;
        const accountType = row.original.Account_Type;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 max-w-sm">
              <span className="font-medium truncate">{name}</span>
            </div>
            {accountType && (
              <span className="text-xs font-medium text-muted-foreground">
                {accountType}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "Industry",
      header: "Industria",
      cell: ({ row }) => {
        const industry = row.getValue("Industry") as string | undefined;
        return industry ? (
          <Badge
            variant="outline"
            className="gap-1.5 border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 font-medium"
          >
            <Building2 className="h-3.5 w-3.5" />
            {industry}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground italic">N/A</span>
        );
      },
    },
    {
      accessorKey: "Billing_Country",
      header: "País",
      cell: ({ row }) => {
        const country = row.getValue("Billing_Country") as string | undefined;
        const city = row.original.Billing_City;
        return (
          <div className="flex flex-col gap-1">
            {country && (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium">{country}</span>
              </div>
            )}

            {city && (
              <span className="text-xs font-medium text-muted-foreground">
                {city}
              </span>
            )}

            {!country && !city && (
                <span className="text-xs text-muted-foreground italic">N/A</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "Phone",
      header: "Contacto",
      cell: ({ row }) => {
        const phone = row.getValue("Phone") as string | undefined;
        const email = row.original.Email;
        const website = row.original.Website;

        return (
          <div className="flex flex-col gap-1">
            {phone && (
              <div className="flex items-center gap-1.5">
                <IconPhone className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {phone}
                </span>
              </div>
            )}

            {email && (
              <div className="flex items-center gap-1.5">
                <IconMail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {email}
                </span>
              </div>
            )}

            {website && (
              <div className="flex items-center gap-1.5">
                <IconWorld className="h-3.5 w-3.5 text-muted-foreground" />
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-muted-foreground hover:underline"
                >
                  Sitio web
                </a>
              </div>
            )}

            {!phone && !email && !website && (
              <span className="text-xs text-muted-foreground italic">N/A</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "Owner",
      header: "Propietario",
      cell: ({ row }) => {
        const owner = row.getValue("Owner") as ZohoAccount["Owner"];
        return owner ? (
          <div className="flex flex-col gap-0.5 max-w-sm">
            <span className="text-sm font-medium truncate">{owner.name}</span>
            <span className="text-xs font-medium text-muted-foreground truncate">
              {owner.email}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">N/A</span>
        );
      },
    },
    {
      accessorKey: "Modified_Time",
      header: "Últ. modificación",
      cell: ({ row }) => {
        const date = row.getValue("Modified_Time") as string | undefined;
        if (!date)
          return (
            <span className="text-xs text-muted-foreground italic">N/A</span>
          );

        return (
          <span className="text-xs text-muted-foreground">
            {formatDateShort(date)}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const account = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <IconDotsVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => navigator.clipboard.writeText(account.id)}
              >
                <IconCopy className="size-4" />
                Copiar ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <ArrowUpRight className="size-4" />
                Detalles
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <PencilLine className="size-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive cursor-pointer hover:bg-destructive/10 hover:text-destructive">
                <IconTrash className="size-4 text-destructive" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
