import { Role } from "@prisma/client";

/**
 * Role utility functions for multi-role support.
 * A user can have multiple roles simultaneously.
 */

/**
 * Check if a user has a specific role
 */
export function hasRole(
  roles: Role[] | Role | undefined | null,
  role: Role,
): boolean {
  if (!roles) return false;
  // Handle legacy single role for backwards compatibility
  if (!Array.isArray(roles)) {
    return roles === role;
  }
  return roles.includes(role);
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(
  roles: Role[] | Role | undefined | null,
  targetRoles: Role[],
): boolean {
  if (!roles) return false;
  // Handle legacy single role for backwards compatibility
  if (!Array.isArray(roles)) {
    return targetRoles.includes(roles);
  }
  return targetRoles.some((r) => roles.includes(r));
}

/**
 * Check if a user has all of the specified roles
 */
export function hasAllRoles(
  roles: Role[] | Role | undefined | null,
  targetRoles: Role[],
): boolean {
  if (!roles) return false;
  // Handle legacy single role for backwards compatibility
  if (!Array.isArray(roles)) {
    return targetRoles.length === 1 && targetRoles.includes(roles);
  }
  return targetRoles.every((r) => roles.includes(r));
}

/**
 * Check if user is an admin (has ADMIN role)
 */
export function isAdmin(roles: Role[] | Role | undefined | null): boolean {
  return hasRole(roles, Role.ADMIN);
}

/**
 * Check if user is a seller (has SELLER role)
 */
export function isSeller(roles: Role[] | Role | undefined | null): boolean {
  return hasRole(roles, Role.SELLER);
}

/**
 * Check if user is a dealer (has DEALER role)
 */
export function isDealer(roles: Role[] | Role | undefined | null): boolean {
  return hasRole(roles, Role.DEALER);
}

/**
 * Check if user can act as a seller (has SELLER role or is ADMIN with SELLER role)
 * This is used for filtering users that can be assigned to DEALERs
 */
export function canActAsSeller(
  roles: Role[] | Role | undefined | null,
): boolean {
  return hasRole(roles, Role.SELLER);
}

/**
 * Get the primary role for display purposes.
 * Priority: ADMIN > SELLER > DEALER
 */
export function getPrimaryRole(roles: Role[] | Role | undefined | null): Role {
  if (!roles) return Role.SELLER;
  if (!Array.isArray(roles)) {
    return roles;
  }
  if (roles.includes(Role.ADMIN)) return Role.ADMIN;
  if (roles.includes(Role.SELLER)) return Role.SELLER;
  if (roles.includes(Role.DEALER)) return Role.DEALER;
  return Role.SELLER;
}

/**
 * Normalize roles to always be an array
 */
export function normalizeRoles(
  roles: Role[] | Role | undefined | null,
): Role[] {
  if (!roles) return [];
  if (!Array.isArray(roles)) return [roles];
  return roles;
}

/**
 * Get the all roles for display purposes.
 */
export function getAllRoles(roles: Role[] | Role | undefined | null): Role[] {
  if (!roles) return [];
  if (!Array.isArray(roles)) return [roles];
  return roles;
}