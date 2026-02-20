import { Role } from "@prisma/client";

export type { Role };

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  password: string | null;
  image: string | null;
  roles: Role[]; // Multiple roles supported
  country: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithAccounts extends User {
  accounts: Array<{
    provider: string;
    type: string;
  }>;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  roles: Role[]; // Multiple roles supported
  country?: string;
  isActive?: boolean;
  /** For DEALER users: the single assigned seller ID */
  assignedSellerId?: string | null;
}

export interface UserListItem {
  id: string;
  name: string | null;
  email: string;
  roles: Role[]; // Multiple roles supported
  country: string | null;
  isActive: boolean;
  createdAt: Date;
  image: string | null;
  authMethods: string[]; // ["zoho", "credentials"]
  lastLoginAt: Date | null;
  zohoId: string | null; // ZUID
  hasActiveSession: boolean;
  assignedSellers?: {
    seller: {
      id: string;
      name: string | null;
      email: string;
    };
  }[];
  assignedVehicles?: {
    id: string;
    model: string;
    plate: string;
    status: string;
  }[];
}

export interface UpdateUserInput extends Partial<
  Omit<User, "id" | "createdAt" | "updatedAt" | "emailVerified">
> {
  /** For DEALER users: the single assigned seller ID */
  assignedSellerId?: string | null;
}

export interface SellerInfo {
  id: string;
  name: string | null;
  email: string;
  country: string | null;
  image?: string | null;
}

export interface EditUserFormProps {
  user: UserListItem;
  onSuccess?: () => void;
  className?: string;
}

export interface CreateUserFormProps {
  onSuccess?: () => void;
  className?: string;
}
