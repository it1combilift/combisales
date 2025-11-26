import { prisma } from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const getCompare = async () => {
  const { compare } = await import("bcryptjs");
  return compare;
};

// Helper: Log audit event
async function logAuthEvent(data: {
  userId?: string;
  email?: string;
  event: string;
  provider?: string;
  ipAddress?: string;
  metadata?: any;
}) {
  try {
    await prisma.authAuditLog.create({ data });
  } catch (error) {
    console.error("Error logging auth event:", error);
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    {
      id: "zoho",
      name: "Zoho",
      type: "oauth",
      clientId: process.env.ZOHO_CLIENT_ID!,
      clientSecret: process.env.ZOHO_CLIENT_SECRET!,
      authorization: {
        url: "https://accounts.zoho.com/oauth/v2/auth",
        params: {
          scope:
            "AaaServer.profile.Read,ZohoCRM.modules.ALL,ZohoCRM.settings.ALL",
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
        },
      },
      token: "https://accounts.zoho.com/oauth/v2/token",
      userinfo: "https://accounts.zoho.com/oauth/user/info",
      checks: ["state"],
      async profile(profile, tokens) {
        console.log("=== ZOHO PROFILE DATA ===");
        console.log(JSON.stringify(profile, null, 2));
        console.log("=== ZOHO TOKENS ===");
        console.log(
          JSON.stringify(
            {
              expires_in: tokens.expires_in,
              token_type: tokens.token_type,
              scope: tokens.scope,
            },
            null,
            2
          )
        );
        console.log("========================");

        const fullName =
          `${profile.First_Name || ""} ${profile.Last_Name || ""}`.trim() ||
          profile.Email;

        return {
          id: profile.ZUID.toString(),
          name: fullName,
          email: profile.Email,
          image: profile.ProfileImage || null,
          emailVerified: new Date(),
        };
      },
    },

    // Provider de Credentials (email/password)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos");
        }

        const compare = await getCompare();

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          await logAuthEvent({
            email: credentials.email,
            event: "LOGIN_FAILED",
            provider: "credentials",
            ipAddress: req.headers?.["x-forwarded-for"] as string,
            metadata: { reason: "USER_NOT_FOUND" },
          });
          throw new Error("Credenciales inválidas");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          await logAuthEvent({
            userId: user.id,
            email: user.email,
            event: "LOGIN_FAILED",
            provider: "credentials",
            ipAddress: req.headers?.["x-forwarded-for"] as string,
            metadata: { reason: "INVALID_PASSWORD" },
          });
          throw new Error("Credenciales inválidas");
        }

        if (!user.isActive) {
          await logAuthEvent({
            userId: user.id,
            email: user.email,
            event: "LOGIN_BLOCKED",
            provider: "credentials",
            ipAddress: req.headers?.["x-forwarded-for"] as string,
          });
          throw new Error("ACCOUNT_BLOCKED");
        }

        await logAuthEvent({
          userId: user.id,
          email: user.email,
          event: "LOGIN_SUCCESS",
          provider: "credentials",
          ipAddress: req.headers?.["x-forwarded-for"] as string,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          isActive: user.isActive,
        };
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async signIn({ user, account, profile }) {
      try {
        console.log("=== SIGNIN CALLBACK START ===");
        console.log("User:", {
          id: user.id,
          email: user.email,
          name: user.name,
        });
        console.log("Account:", {
          provider: account?.provider,
          type: account?.type,
        });
        console.log("=== SIGNIN CALLBACK END ===");

        if (account?.provider === "zoho" && profile) {
          await new Promise((resolve) => setTimeout(resolve, 500));

          const updated = await prisma.account.updateMany({
            where: {
              provider: "zoho",
              providerAccountId: account.providerAccountId,
            },
            data: {
              zoho_org_id: (profile as any)?.Organization_Id,
              api_domain: (profile as any)?.accounts_server,
              token_refreshed_at: new Date(),
            },
          });

          console.log("Account metadata updated:", updated);

          await logAuthEvent({
            userId: user.id,
            email: user.email!,
            event: "LOGIN_SUCCESS",
            provider: "zoho",
            metadata: { zuid: (profile as any)?.ZUID },
          });
        }

        return true;
      } catch (error) {
        console.error("Error en signIn callback:", error);
        return true;
      }
    },

    async jwt({ token, account, user, trigger }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at
          ? Number(account.expires_at)
          : undefined;
        token.apiDomain = account.api_domain as string;
        token.provider = account.provider;
      }

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = (user as any).role;
        token.isActive = (user as any).isActive;
      }

      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: {
            isActive: true,
            role: true,
            image: true,
            name: true,
            id: true,
          },
        });

        if (!dbUser || !dbUser.isActive) {
          console.error(
            "User blocked or not found in JWT callback:",
            token.email
          );

          if (dbUser && !dbUser.isActive) {
            await logAuthEvent({
              userId: dbUser.id,
              email: token.email as string,
              event: "LOGIN_BLOCKED",
              provider: (token.provider as string) || "unknown",
            });
          }

          return {};
        }

        token.role = dbUser.role;
        token.isActive = dbUser.isActive;
        token.image = dbUser.image;
        token.name = dbUser.name;
      }

      if (trigger === "update" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: {
            role: true,
            isActive: true,
            image: true,
            name: true,
          },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.isActive = dbUser.isActive;
          token.image = dbUser.image;
          token.name = dbUser.name;
        }
      }

      if (token.provider === "zoho" && token.expiresAt && token.refreshToken) {
        const now = Math.floor(Date.now() / 1000);
        const shouldRefresh = (token.expiresAt as number) - now < 300;

        if (shouldRefresh) {
          try {
            const response = await fetch(
              "https://accounts.zoho.com/oauth/v2/token",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                  refresh_token: token.refreshToken as string,
                  client_id: process.env.ZOHO_CLIENT_ID!,
                  client_secret: process.env.ZOHO_CLIENT_SECRET!,
                  grant_type: "refresh_token",
                }),
              }
            );

            const tokens = await response.json();

            if (tokens.access_token) {
              token.accessToken = tokens.access_token;
              token.expiresAt = now + (tokens.expires_in || 3600);

              await prisma.account.updateMany({
                where: {
                  provider: "zoho",
                  userId: token.id as string,
                },
                data: {
                  access_token: tokens.access_token,
                  expires_at: token.expiresAt
                    ? Math.floor(token.expiresAt)
                    : Math.floor(now + 3600),
                  token_refreshed_at: new Date(),
                },
              });

              await logAuthEvent({
                userId: token.id as string,
                email: token.email as string,
                event: "TOKEN_REFRESH_SUCCESS",
                provider: "zoho",
              });
            }
          } catch (error) {
            await logAuthEvent({
              userId: token.id as string,
              email: token.email as string,
              event: "TOKEN_REFRESH_FAILED",
              provider: "zoho",
              metadata: { error: (error as Error).message },
            });
          }
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        if (token.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { isActive: true },
          });

          if (!dbUser || !dbUser.isActive) {
            throw new Error(
              "Tu cuenta ha sido bloqueada. Contacta al administrador."
            );
          }
        }

        session.accessToken = token.accessToken as string;
        session.apiDomain = token.apiDomain as string;
        session.provider = token.provider as string;
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          image: (token.picture as string) || (token.image as string),
          role: token.role,
          isActive: token.isActive as boolean,
        };
      }

      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.id) {
        await logAuthEvent({
          userId: token.id as string,
          email: token.email as string,
          event: "LOGOUT",
          provider: token.provider as string,
        });
      }
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
