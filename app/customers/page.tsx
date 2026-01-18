"use client";

import { getCustomers, getProjects } from "@/lib/db";
import { Customer, Project } from "@/lib/types";
import Link from "next/link";
import { Users, Building2, Phone, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getCustomers(),
            getProjects()
        ]).then(([custs, projs]) => {
            setCustomers(custs);
            setAllProjects(projs);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <main className="container" style={{ paddingTop: "2rem" }}>
                <p>Laster kunder...</p>
            </main>
        );
    }

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
            <div className="flex-between" style={{ marginBottom: "2rem" }}>
                <div>
                    <h1>Kunder</h1>
                    <p style={{ color: "var(--muted-foreground)" }}>Oversikt over alle kunder</p>
                </div>
                <Link href="/customers/new" className="btn btn-primary" style={{ gap: "0.5rem" }}>
                    <Plus size={18} /> Ny Kunde
                </Link>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
                {customers.map(customer => {
                    const projects = allProjects.filter(p => p.customerId === customer.id);
                    return (
                        <Link key={customer.id} href={`/customers/details?id=${customer.id}`} style={{ textDecoration: "none" }}>
                            <div className="card flex-between" style={{ transition: "border-color 0.2s" }}>
                                <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                                    <div style={{
                                        width: "56px", height: "56px",
                                        borderRadius: "var(--radius)",
                                        backgroundColor: "var(--background)",
                                        border: "1px solid var(--border)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: "var(--primary)"
                                    }}>
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: "1.25rem" }}>{customer.name}</h3>
                                        <div style={{ display: "flex", gap: "1rem", color: "var(--muted-foreground)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                                <Building2 size={14} /> {projects.length} prosjekter
                                            </span>
                                            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                                <Phone size={14} /> {customer.phone}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </main>
    );
}
