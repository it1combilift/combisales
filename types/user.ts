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
}

export interface UserListItem {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: Date;
  image: string | null;
}
