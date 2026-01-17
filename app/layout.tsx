import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

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
        <div className="desktop-sidebar">
          <Sidebar />
        </div>

        <div className="main-content" style={{ width: "100%", minHeight: "100vh" }}>
          {children}
        </div>

        <MobileNav />
      </body>
    </html>
  );
}
