import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import AuthGuard from "@/components/AuthGuard";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "B&K Bygg Dashboard",
  description: "Prosjektstyring og sjekklister for B&K Bygg",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0", // Prevent zoom issues on mobile
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body className={inter.className}>
        <AuthProvider>
          <AuthGuard>
            <AuthenticatedLayout>
              {children}
            </AuthenticatedLayout>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
