"use client";

import { getCustomer, getCustomerProjects, Project, Customer } from "@/lib/data";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MapPin, Building2, Banknote } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function CustomerDetailsContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [customer, setCustomer] = useState<Customer | undefined>(undefined);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            Promise.all([
                getCustomer(id),
                getCustomerProjects(id)
            ]).then(([cust, projs]) => {
                setCustomer(cust);
                setProjects(projs);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [id]);

    if (loading) {
        return (
            <main className="container" style={{ paddingTop: "2rem" }}>
                <p>Laster kundedata...</p>
            </main>
        );
    }

    if (!customer) {
        return (
            <main className="container" style={{ paddingTop: "2rem" }}>
                <h1>Kunde ikke funnet</h1>
                <Link href="/customers" className="btn btn-primary" style={{ marginTop: "1rem" }}>Tilbake til oversikt</Link>
            </main>
        );
    }

    const totalBudgetExVAT = projects.reduce((acc, p) => acc + p.budgetExVAT, 0);
    const totalSpentExVAT = projects.reduce((acc, p) => acc + p.spentExVAT, 0);
    const totalMargin = totalBudgetExVAT - totalSpentExVAT;
    const marginPercentage = totalBudgetExVAT > 0 ? (totalMargin / totalBudgetExVAT) * 100 : 0;

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
            <Link href="/customers" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                <ArrowLeft size={16} /> Tilbake
            </Link>

            <div className="flex-between" style={{ marginBottom: "2rem", alignItems: "flex-start" }}>
                <div>
                    <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{customer.name}</h1>
                    <div style={{ display: "flex", gap: "1.5rem", color: "var(--muted-foreground)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Mail size={16} /> {customer.email}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Phone size={16} /> {customer.phone}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <MapPin size={16} /> {customer.address}
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
                <div className="card">
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.5rem", color: "var(--muted-foreground)" }}>
                        <Building2 size={20} />
                        <span style={{ fontWeight: "500" }}>Prosjekter</span>
                    </div>
                    <p style={{ fontSize: "1.5rem", fontWeight: "600" }}>{projects.length}</p>
                </div>

                <div className="card">
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.5rem", color: "var(--muted-foreground)" }}>
                        <Banknote size={20} />
                        <span style={{ fontWeight: "500" }}>Total Omsetning</span>
                    </div>
                    <p style={{ fontSize: "1.5rem", fontWeight: "600" }}>{(totalBudgetExVAT / 1000).toLocaleString()}k</p>
                </div>

                <div className="card" style={{ borderColor: marginPercentage < 0 ? "var(--destructive)" : "var(--border)" }}>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.5rem", color: "var(--muted-foreground)" }}>
                        <span style={{ fontWeight: "500" }}>Margin</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <p style={{ fontSize: "1.5rem", fontWeight: "600", color: marginPercentage >= 0 ? "#10b981" : "var(--destructive)" }}>
                            {(totalMargin / 1000).toLocaleString()}k
                        </p>
                        <span style={{
                            padding: "0.125rem 0.5rem",
                            borderRadius: "var(--radius)",
                            backgroundColor: marginPercentage >= 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                            color: marginPercentage >= 0 ? "#10b981" : "var(--destructive)",
                            fontSize: "0.75rem", fontWeight: "600"
                        }}>
                            {marginPercentage.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>

            <h2>Prosjekter for {customer.name}</h2>
            <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
                {projects.map(project => (
                    <Link key={project.id} href={`/projects/details?id=${project.id}`} style={{ textDecoration: "none" }}>
                        <div className="card flex-between" style={{ transition: "border-color 0.2s" }}>
                            <div>
                                <h3 style={{ fontSize: "1.1rem" }}>{project.name}</h3>
                                <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>{project.status}</p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <p style={{ fontWeight: "bold" }}>{(project.spentExVAT / 1000).toLocaleString()}k / {(project.budgetExVAT / 1000).toLocaleString()}k</p>
                                <span style={{
                                    fontSize: "0.75rem",
                                    color: project.spentExVAT > project.budgetExVAT ? "var(--destructive)" : "var(--muted-foreground)"
                                }}>
                                    {project.spentExVAT > project.budgetExVAT ? "Over budsjett" : "Innenfor budsjett"}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
                {projects.length === 0 && (
                    <p style={{ color: "var(--muted-foreground)", fontStyle: "italic" }}>Ingen prosjekter registrert på denne kunden.</p>
                )}
            </div>
        </main>
    );
}

export default function CustomerDetailsPage() {
    return (
        <Suspense fallback={<div className="container" style={{ paddingTop: "2rem" }}>Laster...</div>}>
            <CustomerDetailsContent />
        </Suspense>
    );
}
