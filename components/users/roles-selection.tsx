"use client";

import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";
import { useI18n } from "@/lib/i18n/context";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Users, Store } from "lucide-react";
import { Label } from "../ui/label";

interface RolesSelectionProps {
  /** Currently selected roles */
  selectedRoles: Role[];
  /** Callback when roles selection changes */
  onSelectionChange: (roles: Role[]) => void;
  /** Disable all inputs */
  disabled?: boolean;
  className?: string;
}

const ROLE_CONFIG = {
  [Role.ADMIN]: {
    icon: Shield,
    color: "bg-blue-500",
    borderColor: "border-blue-500/50",
    bgColor: "bg-blue-500/10",
  },
  [Role.SELLER]: {
    icon: Users,
    color: "bg-emerald-500",
    borderColor: "border-emerald-500/50",
    bgColor: "bg-emerald-500/10",
  },
  [Role.DEALER]: {
    icon: Store,
    color: "bg-amber-500",
    borderColor: "border-amber-500/50",
    bgColor: "bg-amber-500/10",
  },
};

/**
 * Multi-role selection component.
 * A user can have multiple roles simultaneously.
 */
export function RolesSelection({
  selectedRoles,
  onSelectionChange,
  disabled = false,
  className,
}: RolesSelectionProps) {
  const { t } = useI18n();

  const handleRoleToggle = (role: Role, checked: boolean) => {
    if (checked) {
      // Add role
      onSelectionChange([...selectedRoles, role]);
    } else {
      // Remove role - but ensure at least one role remains
      const newRoles = selectedRoles.filter((r) => r !== role);
      if (newRoles.length > 0) {
        onSelectionChange(newRoles);
      }
    }
  };

  const roleLabels: Record<Role, string> = {
    [Role.ADMIN]: t("users.roles.admin"),
    [Role.SELLER]: t("users.roles.seller"),
    [Role.DEALER]: t("users.roles.dealer"),
  };

  const roleDescriptions: Record<Role, string> = {
    [Role.ADMIN]: t("users.roles.adminDescription"),
    [Role.SELLER]: t("users.roles.sellerDescription"),
    [Role.DEALER]: t("users.roles.dealerDescription"),
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-1 gap-2">
        {Object.values(Role).map((role) => {
          const config = ROLE_CONFIG[role];
          const Icon = config.icon;
          const isChecked = selectedRoles.includes(role);
          const canUncheck = selectedRoles.length > 1 || !isChecked;

          return (
            <Label
              key={role}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                isChecked
                  ? cn(config.borderColor, config.bgColor)
                  : "border-border hover:border-muted-foreground/30",
                disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked) =>
                  handleRoleToggle(role, checked === true)
                }
                disabled={disabled || !canUncheck}
                className="data-[state=checked]:bg-primary"
              />
              <div className={cn("p-1.5 rounded", config.bgColor)}>
                <Icon className={cn("size-4", `text-${role.toLowerCase()}`)} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className={cn("size-2 rounded-full", config.color)} />
                  <span className="font-medium text-sm">
                    {roleLabels[role]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {roleDescriptions[role]}
                </p>
              </div>
            </Label>
          );
        })}
      </div>
    </div>
  );
}
