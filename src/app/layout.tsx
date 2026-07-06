import type { Metadata } from "next";
// Import directly from the local npm package instead of next/font/google
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Providers from "./auth/provider/provider";

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
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}