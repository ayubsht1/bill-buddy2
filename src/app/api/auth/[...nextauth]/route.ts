import axios from "axios";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

/* =======================
   Types
======================= */

interface DjangoLoginResponse {
  success: boolean;
  data: {
    access: string;
    refresh: string;
    user: {
      id: number;
      email: string;
      username: string;
      first_name: string;
      last_name: string;
    };
  };
}

/* =======================
   Module Augmentation
======================= */

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken: string;
    refreshToken?: string;
    email: string;
    username: string;
  }
}

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: string;         // ✅ string
      email: string;
      username: string;
    };
  }
}

/* =======================
   Auth Options
======================= */

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await axios.post<DjangoLoginResponse>(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login/`,
            {
              email: credentials.email,
              password: credentials.password,
            }
          );

          if (!res.data.success) return null;

          const { user, access, refresh } = res.data.data;

          // ✅ THIS object becomes `user` in callbacks
          return {
            id: String(user.id), // ✅ MUST be string
            email: user.email,
            username: user.username,
            name: `${user.first_name} ${user.last_name}`,
            accessToken: access,
            refreshToken: refresh,
          };
        } catch (err) {
          console.error("Credentials login failed", err);
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = (user as any).id;
        token.email = user.email!;
        token.username = (user as any).username;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user = {
        id: token.id,
        email: token.email,
        username: token.username,
      };
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
