import type { Metadata } from "next";
// Import directly from the local npm package instead of next/font/google
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Providers from "./auth/provider/provider";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "BILL BUDDY",
  description: "Simplify your bills with us.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 🌟 Added suppressHydrationWarning here to tell React to ignore the theme attribute shift on load
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        {/* 🌟 Configured ThemeProvider attributes to match your global.css setup */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}