"use client";

import { useMemo } from "react";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { hasRole, getPrimaryRole } from "@/lib/roles";

interface UseLanguageValidationProps {
  locale: string;
}

interface UseLanguageValidationReturn {
  /** Whether the current user is a SELLER */
  isSeller: boolean;
  /** Whether the current user is a DEALER */
  isDealer: boolean;
  /** Whether the language validation is required (SELLER only) */
  requiresEnglish: boolean;
  /** Whether the current language is English */
  isEnglish: boolean;
  /** Whether the form can be submitted (DEALER always true, SELLER only if English) */
  canSubmit: boolean;
  /** Whether to show the language warning alert */
  showLanguageWarning: boolean;
  /** User primary role */
  userRole: Role | undefined;
}

/**
 * Hook to validate language requirements for SELLER users.
 * SELLERs must complete forms in English only.
 * DEALERs can complete forms in any language.
 */
export function useLanguageValidation({
  locale,
}: UseLanguageValidationProps): UseLanguageValidationReturn {
  const { data: session } = useSession();

  const userRoles = session?.user?.roles;
  const userRole = getPrimaryRole(userRoles);
  const isSeller = hasRole(userRoles, Role.SELLER);
  const isDealer = hasRole(userRoles, Role.DEALER);
  const isEnglish = locale === "en";

  const result = useMemo(() => {
    // SELLER: requires English
    const requiresEnglish = isSeller;

    // Can submit: DEALER always true, SELLER only if English, ADMIN always true
    const canSubmit = !isSeller || isEnglish;

    // Show warning: SELLER and language is NOT English
    const showLanguageWarning = isSeller && !isEnglish;

    return {
      isSeller,
      isDealer,
      requiresEnglish,
      isEnglish,
      canSubmit,
      showLanguageWarning,
      userRole,
    };
  }, [isSeller, isDealer, isEnglish, userRole]);

  return result;
}
