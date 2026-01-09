import { Role } from "@prisma/client";

export type { Role };

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  password: string | null;
  image: string | null;
  role: Role;
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
  role: Role;
  country?: string;
  isActive?: boolean;
  assignedSellerIds?: string[];
}

export interface UserListItem {
  id: string;
  name: string | null;
  email: string;
  role: Role;
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
}

export interface UpdateUserInput
  extends Partial<
    Omit<User, "id" | "createdAt" | "updatedAt" | "emailVerified">
  > {
  assignedSellerIds?: string[];
}

export interface SellerInfo {
  id: string;
  name: string | null;
  email: string;
  country: string | null;
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
