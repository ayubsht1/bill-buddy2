// src/app/api/auth/[...nextauth]/route.ts
import axios from "axios";
import NextAuth, { type NextAuthConfig, type DefaultSession } from "next-auth";
import { type JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { CredentialsSignin } from "next-auth";

class DjangoAuthError extends CredentialsSignin {
  constructor(message: string) {
    super(message);
    this.code = message;
  }
}

/* =======================
   Types
======================= */
interface DjangoLoginResponse {
  success: boolean;
  data: {
    access: string;
    refresh: string;
    message: string;
    user: {
      id: number;
      email: string;
      username: string;
      first_name: string;
      last_name: string;
      profile_picture?: string; // 🌟 Added
      has_password: boolean; // 🌟 Added
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
    refreshToken: string;
    email: string;
    username: string;
    picture?: string; // 🌟 Added
    has_password: boolean; // 🌟 Added
  }
}

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email?: string | null;
    username?: string;
    accessToken?: string;
    refreshToken?: string;
    picture?: string; // 🌟 Added
    hasPassword?: boolean; // 🌟 Added
  }
}

/* =======================
   Auth Options Config
======================= */
export const authOptions: NextAuthConfig = {
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
            },
            { headers: { "Content-Type": "application/json" } }
          );

          if (!res.data.success) {
            throw new DjangoAuthError(res.data.data?.message || "Invalid credentials");
          }

          const { user, access, refresh } = res.data.data;

          return {
            id: String(user.id),
            email: user.email,
            username: user.username,
            name: `${user.first_name} ${user.last_name}`,
            picture: user.profile_picture, // 🌟 Added
            accessToken: access,
            refreshToken: refresh,
          };
        } catch (err: any) {
          console.error("Credentials login failed", err);
          if (axios.isAxiosError(err) && err.response?.data) {
            const djangoErrorData = err.response.data as any;
            if (djangoErrorData.data?.is_active === false) {
              throw new DjangoAuthError("ACCOUNT_NOT_ACTIVATED");
            }
            const exactMessage =
              djangoErrorData.data?.message ||
              djangoErrorData.message ||
              djangoErrorData.detail ||
              "Invalid email or password";
            throw new DjangoAuthError(exactMessage);
          }
          throw new DjangoAuthError("Something went wrong. Please try again.");
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    // 🌟 INTERCEPT GOOGLE SIGN IN AND FORWARD TO DJANGO
    async signIn({ account, profile, user: nextAuthUser }) {
      if (account?.provider === "google") {
        try {
          const response = await axios.post<DjangoLoginResponse>(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/google-login/`,
            {
              email: profile?.email,
              picture: profile?.picture,      
              given_name: profile?.given_name, 
              family_name: profile?.family_name, 
            },
            { headers: { "Content-Type": "application/json" } }
          );

          if (response.data.success) {
            const { access, refresh, user: djangoUser } = response.data.data;
            
            // 🌟 Mutate the local `nextAuthUser` reference instead of the read-only `account`
            nextAuthUser.id = String(djangoUser.id);
            nextAuthUser.email = djangoUser.email;
            nextAuthUser.username = djangoUser.username;
            nextAuthUser.picture = djangoUser.profile_picture;
            nextAuthUser.accessToken = access;
            nextAuthUser.refreshToken = refresh;

            return true; 
          }
          return false;
        } catch (error) {
          console.error("Failed to sync Google user with Django backend", error);
          return false;
        }
      }
      return true;
    },

    // 🌟 UPDATED TO HANDLE INJECTED GOOGLE TOKENS
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id!;
        token.email = user.email!;
        token.username = user.username || user.email?.split("@")[0] || "";
        token.picture = user.picture || "";
        
        token.accessToken = user.accessToken || "";
        token.refreshToken = user.refreshToken || "";
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken || "";
      session.refreshToken = token.refreshToken || "";
      session.user = {
        ...session.user,
        id: token.id || "",
        email: token.email || "",
        username: token.username || "",
        image: token.picture || "", // This maps out natively to NextAuth image property
      };
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
  
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};

const { handlers } = NextAuth(authOptions);
export const { GET, POST } = handlers;