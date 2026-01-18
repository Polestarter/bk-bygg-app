"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    if (isLoginPage) {
        return <div style={{ minHeight: "100vh", backgroundColor: "var(--background)" }}>{children}</div>;
    }

    return (
        <>
            <div className="desktop-sidebar">
                <Sidebar />
            </div>

            <div className="main-content" style={{ width: "100%", minHeight: "100vh" }}>
                {children}
            </div>

            <MobileNav />
        </>
    );
}
