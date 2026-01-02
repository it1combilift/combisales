"use client";

import { ArrowUpDown } from "lucide-react";
import { ZohoTask } from "@/interfaces/zoho";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "@/lib/i18n/context";

const getStatusConfig = (status?: string) => {
  switch (status) {
    case "Completada":
    case "Completed":
      return {
        label: "Completada",
        className: "bg-green-500/10 text-green-700 dark:text-green-400",
      };
    case "In Progress":
    case "En progreso":
      return {
        label: "En progreso",
        className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      };
    case "Not Started":
    case "No iniciada":
      return {
        label: "No iniciada",
        className: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
      };
    case "Deferred":
    case "Diferida":
      return {
        label: "Diferida",
        className: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
      };
    case "Waiting for Input":
    case "Esperando entrada":
      return {
        label: "Esperando entrada",
        className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      };
    default:
      return {
        label: status || "Sin estado",
        className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      };
  }
};

const getPriorityConfig = (priority?: string) => {
  switch (priority) {
    case "Highest":
    case "Alta":
    case "High":
      return {
        label: "Alta",
        className: "bg-red-500/10 text-red-700 dark:text-red-400",
      };
    case "Normal":
      return {
        label: "Normal",
        className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      };
    case "Low":
    case "Baja":
    case "Lowest":
      return {
        label: "Baja",
        className: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
      };
    default:
      return {
        label: priority || "Normal",
        className: "",
      };
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

export const columns: ColumnDef<ZohoTask>[] = [
  {
    accessorKey: "Subject",
    header: ({ column }) => {
      const { t } = useTranslation();

      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-1"
        >
          {t("taskPage.columns.matter")}
          <ArrowUpDown className="size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const subject = row.getValue("Subject") as string;
      const description = row.original.Description;
      return (
        <div className="flex flex-col gap-1 max-w-[200px] pl-1">
          <span className="font-medium truncate" title={subject}>
            {subject}
          </span>
          {description && (
            <span
              className="text-xs text-muted-foreground line-clamp-1 truncate"
              title={description}
            >
              {description}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "Tipo_de_Tarea",
    header: ({ column }) => {
      const { t } = useTranslation();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 mx-auto"
        >
          {t("taskPage.columns.type")}
          <ArrowUpDown className="size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const tipoDeTarea = row.getValue("Tipo_de_Tarea") as string | undefined;
      return (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {tipoDeTarea || "—"}
        </span>
      );
    },
    filterFn: (row, id, value) => {
      const cellValue = row.getValue(id) as string;
      return cellValue === value;
    },
  },
  {
    accessorKey: "Status",
    header: ({ column }) => {
      const { t } = useTranslation();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          {t("taskPage.columns.status")}
          <ArrowUpDown className="size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue("Status") as string | undefined;
      const config = getStatusConfig(status);
      return (
        <Badge className={config.className} variant="outline">
          {config.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const cellValue = row.getValue(id) as string;
      return cellValue === value;
    },
  },
  {
    accessorKey: "Priority",
    header: ({ column }) => {
      const { t } = useTranslation();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          {t("taskPage.columns.priority")}
          <ArrowUpDown className="size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const priority = row.getValue("Priority") as string | undefined;
      const config = getPriorityConfig(priority);
      return (
        <Badge className={config.className} variant="outline">
          {config.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const cellValue = row.getValue(id) as string;
      return cellValue === value;
    },
  },
  {
    accessorKey: "Due_Date",
    header: ({ column }) => {
      const { t } = useTranslation();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          {t("taskPage.columns.dueDate")}
          <ArrowUpDown className="size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const dueDate = row.getValue("Due_Date") as string | undefined;
      return (
        <span className="text-sm whitespace-nowrap">{formatDate(dueDate)}</span>
      );
    },
  },
  {
    accessorKey: "Owner",
    header: ({ column }) => {
      const { t } = useTranslation();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          {t("taskPage.columns.assignedTo")}
          <ArrowUpDown className="size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const owner = row.original.Owner;
      return (
        <div
          className="flex flex-col gap-0.5"
          title={owner?.name || "Sin asignar"}
        >
          <span className="text-sm font-medium">
            {owner?.name || "Sin asignar"}
          </span>
          {owner?.email && (
            <span className="text-xs text-muted-foreground">{owner.email}</span>
          )}
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const nameA = rowA.original.Owner?.name || "";
      const nameB = rowB.original.Owner?.name || "";
      return nameA.localeCompare(nameB);
    },
  },
  {
    accessorKey: "What_Id",
    header: ({ column }) => {
      const { t } = useTranslation();
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-1"
        >
          {t("taskPage.columns.relatedTo")}
          <ArrowUpDown className="size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const whatId = row.original.What_Id;
      return (
        <div
          className="flex flex-col gap-1 max-w-[150px]"
          title={whatId?.name || "—"}
        >
          <span className="text-xs text-muted-foreground line-clamp-1 truncate">
            {whatId?.name || "—"}
          </span>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      const nameA = rowA.original.What_Id?.name || "";
      const nameB = rowB.original.What_Id?.name || "";
      return nameA.localeCompare(nameB);
    },
  },
  // {
  //   accessorKey: "Modified_Time",
  //   header: ({ column }) => {
  //     const { t } = useTranslation();
  //     return (
  //       <Button
  //         variant="ghost"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //         className="-ml-4"
  //       >
  //         {t("taskPage.columns.lastModified")}
  //         <ArrowUpDown className="size-4" />
  //       </Button>
  //     );
  //   },
  //   cell: ({ row }) => {
  //     const modifiedTime = row.getValue("Modified_Time") as string | undefined;
  //     return (
  //       <span className="text-sm text-muted-foreground whitespace-nowrap">
  //         {formatRelativeTime(modifiedTime)}
  //       </span>
  //     );
  //   },
  // },
];
