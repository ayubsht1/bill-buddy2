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
      profile_picture?: string;
      has_password: boolean;
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
    picture?: string;
    has_password?: boolean;
    error?: string; // 🌟 Tracks token verification / refresh failures
  }
}

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    error?: string; // 🌟 Passed to client if session fails
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

/* =======================
   Token Validation & Refresh Helpers
======================= */

// 1. Check if Django access token is still active/valid
// ⚡ In-Memory Approach
function isTokenValid(accessToken: string): boolean {
  if (!accessToken) return false;
  try {
    // 1. Extract and decode the middle part (payload) of the JWT string
    const payloadBase64 = accessToken.split(".")[1];
    const decodedJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
    const { exp } = JSON.parse(decodedJson);

    // 2. Compare token expiration timestamp with current time
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    return exp > currentTimeInSeconds + 10; // 10-second buffer
  } catch (error) {
    return false;
  }
}

// 2. Exchange refresh token for a fresh access token
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/token/refresh/`,
      { refresh: token.refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );

    const refreshedData = response.data;

    if (!refreshedData.success) {
      throw new Error("Refresh failed on backend");
    }

    return {
      ...token,
      accessToken: refreshedData.data.access,
      // If backend rotates refresh tokens, save new one; else keep old one
      refreshToken: refreshedData.data.refresh ?? token.refreshToken,
      error: undefined, // Clear any errors
    };
  } catch (error) {
    console.error("Failed to refresh Django access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError", // Signal client to log out
    };
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
            { headers: { "Content-Type": "application/json" } },
          );

          if (!res.data.success) {
            throw new DjangoAuthError(
              res.data.data?.message || "Invalid credentials",
            );
          }

          const { user, access, refresh } = res.data.data;

          return {
            id: String(user.id),
            email: user.email,
            username: user.username,
            name: `${user.first_name} ${user.last_name}`,
            picture: user.profile_picture,
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
      clientSecret:
        process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
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
            { headers: { "Content-Type": "application/json" } },
          );

          if (response.data.success) {
            const { access, refresh, user: djangoUser } = response.data.data;

            nextAuthUser.id = String(djangoUser.id);
            nextAuthUser.email = djangoUser.email;
            nextAuthUser.username = djangoUser.username;
            nextAuthUser.picture = djangoUser.profile_picture;
            nextAuthUser.accessToken = access;
            nextAuthUser.refreshToken = refresh;

            return true;
          }
          // 🌟 Redirect back to sign-in page with custom error param
          return "/auth/login?error=GoogleBackendSyncFailed";
        } catch (error) {
          console.error(
            "Failed to sync Google user with Django backend",
            error,
          );
          return "/auth/login?error=GoogleBackendSyncFailed";
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      // 1. Initial Login: set user data and tokens in JWT
      if (user) {
        token.id = user.id!;
        token.email = user.email!;
        token.username = user.username || user.email?.split("@")[0] || "";
        token.picture = user.picture || "";
        token.accessToken = user.accessToken || "";
        token.refreshToken = user.refreshToken || "";
        return token;
      }

      // 2. Subsequent session checks: Verify access token with Django
      const valid = await isTokenValid(token.accessToken);
      if (valid) {
        return token; // Access token is fine! Return as-is
      }

      // 3. Access token is expired/invalid -> Refresh it seamlessly
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken || "";
      session.refreshToken = token.refreshToken || "";
      session.error = token.error; // Expose refresh failure error if any
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

  pages: {
    signIn: "/auth/login",
  },

  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};

const { handlers } = NextAuth(authOptions);
export const { GET, POST } = handlers;
