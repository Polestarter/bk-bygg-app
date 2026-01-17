"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, Wallet, Settings, Building2, Users, FileText } from "lucide-react";

const navItems = [
    { name: "Oversikt", href: "/", icon: LayoutDashboard },
    { name: "Prosjekter", href: "/projects", icon: Building2 }, // Swapped to Building2 as Briefcase was removed/missing
    { name: "Tilbud", href: "/offers", icon: FileText },
    { name: "Kunder", href: "/customers", icon: Users },
    { name: "Sjekk", href: "/checklists", icon: ClipboardList },
    { name: "Økonomi", href: "/finance", icon: Wallet },
    { name: "Innstillinger", href: "/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside style={{
            width: "250px",
            borderRight: "1px solid var(--border)",
            height: "100vh",
            backgroundColor: "var(--card)",
            flexDirection: "column",
            padding: "1rem"
        }} className="desktop-sidebar">
            <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ position: "relative", width: "100%", height: "60px" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="B&K Bygg Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
            </div>

            <nav style={{ display: "grid", gap: "0.5rem" }}>
                <Link href="/projects" className={`nav-item ${pathname.includes("/projects") ? "active" : ""}`}>
                    <LayoutDashboard size={20} />
                    Prosjekter
                </Link>
                <Link href="/offers" className={`nav-item ${pathname.includes("/offers") ? "active" : ""}`}>
                    <FileText size={20} />
                    Tilbud
                </Link>
                <Link href="/customers" className={`nav-item ${pathname.includes("/customers") ? "active" : ""}`}>
                    <Users size={20} />
                    Kunder
                </Link>
                <Link href="/checklists" className={`nav-item ${pathname.includes("/checklists") ? "active" : ""}`}>
                    <ClipboardList size={20} />
                    Sjekklister
                </Link>
                <Link href="/finance" className={`nav-item ${pathname.includes("/finance") ? "active" : ""}`}>
                    <Wallet size={20} />
                    Økonomi
                </Link>
                <Link href="/settings" className={`nav-item ${pathname.includes("/settings") ? "active" : ""}`}>
                    <Settings size={20} />
                    Innstillinger
                </Link>
            </nav>

            <div style={{ marginTop: "auto", padding: "1rem", borderTop: "1px solid var(--border)" }}>
                <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Logget inn som<br /><span style={{ color: "var(--foreground)" }}>Jolly</span></p>
            </div>
        </aside>
    );
}
