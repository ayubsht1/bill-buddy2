import axios from "axios";
import NextAuth, { type DefaultSession, type NextAuthConfig } from "next-auth";
import { CredentialsSignin } from "next-auth";
import { type JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

class DjangoAuthError extends CredentialsSignin {
  constructor(message: string) {
    super(message);
    this.code = message;
  }
}

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
      profile_picture?: string;
      has_password: boolean;
    };
  };
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken: string;
    refreshToken: string;
    email: string;
    username: string;
    picture?: string;
    has_password?: boolean;
    error?: string;
  }
}

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    error?: string;
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
    picture?: string;
    hasPassword?: boolean;
  }
}

function isTokenValid(accessToken: string): boolean {
  if (!accessToken) return false;

  try {
    const payloadBase64 = accessToken.split(".")[1];
    const decodedJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
    const { exp } = JSON.parse(decodedJson);
    return exp > Math.floor(Date.now() / 1000) + 10;
  } catch {
    return false;
  }
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/token/refresh/`,
      { refresh: token.refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );
    const refreshedData = response.data;

    if (!refreshedData.success) throw new Error("Refresh failed on backend");

    return {
      ...token,
      accessToken: refreshedData.data.access,
      refreshToken: refreshedData.data.refresh ?? token.refreshToken,
      error: undefined,
    };
  } catch (error) {
    console.error("Failed to refresh Django access token", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthConfig = {
  session: { strategy: "jwt" },
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
          const response = await axios.post<DjangoLoginResponse>(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login/`,
            { email: credentials.email, password: credentials.password },
            { headers: { "Content-Type": "application/json" } },
          );

          if (!response.data.success) {
            throw new DjangoAuthError(
              response.data.data?.message || "Invalid credentials",
            );
          }

          const { user, access, refresh } = response.data.data;
          return {
            id: String(user.id),
            email: user.email,
            username: user.username,
            name: `${user.first_name} ${user.last_name}`,
            picture: user.profile_picture,
            accessToken: access,
            refreshToken: refresh,
          };
        } catch (error: unknown) {
          console.error("Credentials login failed", error);
          if (axios.isAxiosError(error) && error.response?.data) {
            const data = error.response.data as {
              data?: { is_active?: boolean; message?: string };
              message?: string;
              detail?: string;
            };
            if (data.data?.is_active === false) {
              throw new DjangoAuthError("ACCOUNT_NOT_ACTIVATED");
            }
            throw new DjangoAuthError(
              data.data?.message || data.message || data.detail || "Invalid email or password",
            );
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
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google") return true;

      try {
        const response = await axios.post<DjangoLoginResponse>(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/google-login/`,
          {
            email: profile?.email,
            picture: profile?.picture,
            given_name: profile?.given_name,
            family_name: profile?.family_name,
          },
          { headers: { "Content-Type": "application/json" } },
        );

        if (!response.data.success) return "/auth/login?error=GoogleBackendSyncFailed";

        const { access, refresh, user: djangoUser } = response.data.data;
        user.id = String(djangoUser.id);
        user.email = djangoUser.email;
        user.username = djangoUser.username;
        user.picture = djangoUser.profile_picture;
        user.accessToken = access;
        user.refreshToken = refresh;
        return true;
      } catch (error) {
        console.error("Failed to sync Google user with Django backend", error);
        return "/auth/login?error=GoogleBackendSyncFailed";
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email || "";
        token.username = user.username || user.email?.split("@")[0] || "";
        token.picture = user.picture || "";
        token.accessToken = user.accessToken || "";
        token.refreshToken = user.refreshToken || "";
        return token;
      }

      return isTokenValid(token.accessToken)
        ? token
        : refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken || "";
      session.refreshToken = token.refreshToken || "";
      session.error = token.error;
      session.user = {
        ...session.user,
        id: token.id || "",
        email: token.email || "",
        username: token.username || "",
        image: token.picture || "",
      };
      return session;
    },
  },
  pages: { signIn: "/auth/login" },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};

export const { handlers } = NextAuth(authOptions);
