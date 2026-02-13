import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import AuthGuard from "@/components/AuthGuard";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "B&K Bygg Dashboard",
  description: "Prosjektstyring og sjekklister for B&K Bygg",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
