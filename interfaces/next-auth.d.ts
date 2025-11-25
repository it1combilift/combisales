import "next-auth";
import { JWT } from "next-auth/jwt";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    apiDomain?: string;
    provider?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: Role;
      isActive?: boolean;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: Role;
    isActive?: boolean;
  }

  interface Account {
    zoho_org_id?: string | null;
    api_domain?: string | null;
    token_refreshed_at?: Date | null;
    token_expires_in?: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    apiDomain?: string;
    provider?: string;
    role?: Role;
    isActive?: boolean;
  }
}
