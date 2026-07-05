import axios from "axios";
import NextAuth, { type NextAuthConfig, type DefaultSession } from "next-auth";
import { type JWT } from "next-auth/jwt"; // 👈 ADD THIS LINE
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { CredentialsSignin } from "next-auth";

class DjangoAuthError extends CredentialsSignin {
  constructor(message: string) {
    super(message);
    this.code = message; // Force override the message string
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
    };
  };
}

/* =======================
   Module Augmentation (v5 Consolidated Style)
======================= */

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken: string;
    refreshToken: string;
    email: string;
    username: string;
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
  }
}

/* =======================
   Auth Options
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
          );

          // If Django returns 200 OK but your custom success flag is false
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
            accessToken: access,
            refreshToken: refresh,
          };
        } catch (err: any) {
          console.error("Credentials login failed", err);

          if (axios.isAxiosError(err) && err.response?.data) {
            const djangoErrorData = err.response.data as any;

            // 💡 Check the nested flag your Django backend provides
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
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.email = user.email!;
        token.username = user.username || "";
        token.accessToken = user.accessToken || "";
        token.refreshToken = user.refreshToken || "";
      }
      return token;
    },

    async session({ session, token }) {
      // ✅ Because JWT is fixed above, token properties are no longer 'unknown'
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user = {
        ...session.user,
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

// Correct v5 configuration and export
const { handlers } = NextAuth(authOptions);
export const { GET, POST } = handlers;
