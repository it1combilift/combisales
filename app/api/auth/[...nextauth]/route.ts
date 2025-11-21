import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const getPrisma = async () => {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
};

const getCompare = async () => {
  const { compare } = await import("bcryptjs");
  return compare;
};

export const authOptions: NextAuthOptions = {
  adapter: undefined,
  providers: [
    {
      id: "zoho",
      name: "Zoho",
      type: "oauth",
      wellKnown: "https://accounts.zoho.com/.well-known/openid-configuration",
      clientId: process.env.ZOHO_CLIENT_ID!,
      clientSecret: process.env.ZOHO_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "ZohoCRM.modules.ALL ZohoCRM.users.READ openid profile email",
          access_type: "offline",
          prompt: "consent",
        },
      },
      idToken: true,
      checks: ["pkce", "state"],
      async profile(profile) {
        const prisma = await getPrisma();
        let user = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.name,
              image: profile.picture,
              emailVerified: new Date(),
            },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos");
        }

        const prisma = await getPrisma();
        const compare = await getCompare();

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Credenciales inválidas");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Credenciales inválidas");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.apiDomain = account.api_domain as string | undefined;
      }
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = user.role;
      }

      if (!token.role && token.email) {
        const prisma = await getPrisma();
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string;
        session.apiDomain = token.apiDomain as string;
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          image: (token.picture as string) || (token.image as string),
          role: token.role,
        };
      }

      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
