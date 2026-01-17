"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, ClipboardList, Wallet, Settings, Users, FileText } from "lucide-react";

const navItems = [
    { name: "Oversikt", href: "/", icon: LayoutDashboard },
    { name: "Prosjekter", href: "/projects", icon: Building2 },
    { name: "Tilbud", href: "/offers", icon: FileText },
    { name: "Sjekk", href: "/checklists", icon: ClipboardList },
    { name: "Økonomi", href: "/finance", icon: Wallet },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="mobile-nav" style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            backgroundColor: "var(--card)",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            padding: "0.5rem 0 1.5rem 0", // Extra padding for iPhone Home Indicator
            zIndex: 50
        }}>
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "0.25rem",
                            textDecoration: "none",
                            color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                            transition: "color 0.2s",
                            width: "100%",
                            padding: "0.5rem"
                        }}
                    >
                        <item.icon size={24} />
                        <span style={{ fontSize: "0.75rem", fontWeight: isActive ? 600 : 400 }}>{item.name}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
