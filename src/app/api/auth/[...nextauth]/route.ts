import axios from "axios";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// --- ✅ Interfaces ---
interface DjangoCredentialsResponse {
  access: string;
  refresh: string;
  email: string;
  username: string;
}

interface GoogleLoginResponse {
  access: string;
  refresh: string;
  email: string;
  username: string;
}

// --- ✅ Module Augmentations ---
declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken?: string;
    email: string;
    username: string;
  }
}

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken?: string;
    user: {
      email: string;
      username: string;
    };
  }
}

// --- ✅ Auth Options ---
export const authOptions: NextAuthOptions = {
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
          const response = await axios.post<DjangoCredentialsResponse>(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login/`,
            {
              email: credentials.email,
              password: credentials.password,
            }
          );

          return {
            id: response.data.email,
            email: response.data.email,
            name: response.data.username,
            accessToken: response.data.access,
            refreshToken: response.data.refresh,
          };
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Credentials login
      if (account?.provider === "credentials" && user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.email = user.email!;
        token.username = user.name!;
      }

      // Google login
      if (account?.provider === "google" && user?.email) {
        try {
          const res = await axios.post<GoogleLoginResponse>(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/social-login/`,
            {
              email: user.email,
              username: user.name ?? user.email.split("@")[0],
            }
          );

          token.accessToken = res.data.access;
          token.refreshToken = res.data.refresh;
          token.email = res.data.email;
          token.username = res.data.username;
        } catch (error) {
          console.error("Google login error:", error);
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user = {
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

// --- ✅ Export handler for App Router ---
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
