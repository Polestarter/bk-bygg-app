"use client";

import { useState } from "react";
import { Customer, Project, PricingType } from "@/lib/types";
import { addProject } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProjectForm({ customers }: { customers: Customer[] }) {
    const router = useRouter();
    const [pricingType, setPricingType] = useState("Fastpris");
    const [budget, setBudget] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const newProject: Project = {
            id: Math.random().toString(36).substring(2, 9),
            name: formData.get("name") as string,
            customerId: formData.get("customerId") as string,
            address: formData.get("address") as string,
            pricingType: formData.get("pricingType") as PricingType,
            status: "Planlagt",
            budgetExVAT: Number(formData.get("budget")) || 0,
            spentExVAT: 0,
            startDate: formData.get("startDate") as string || new Date().toISOString().split("T")[0],
            endDate: undefined,
            files: [],
            expenses: [],
            extras: [],
            timeEntries: []
        };

        if (!newProject.name || !newProject.customerId) return;

        await addProject(newProject);
        router.push("/projects");
        router.refresh();
    };

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem", maxWidth: "800px" }}>
            <Link href="/projects" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                <ArrowLeft size={16} /> Tilbake
            </Link>

            <div className="flex-between" style={{ marginBottom: "2rem" }}>
                <h1>Nytt Prosjekt</h1>
            </div>

            <form onSubmit={handleSubmit} className="card" style={{ display: "grid", gap: "1.5rem" }}>
                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Kunde</label>
                    <select
                        name="customerId"
                        required
                        className="input"
                        defaultValue=""
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--input)", color: "var(--foreground)" }}
                    >
                        <option value="" disabled>Velg kunde...</option>
                        {customers.map(customer => (
                            <option key={customer.id} value={customer.id}>{customer.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Prosjektnavn</label>
                    <input
                        name="name"
                        type="text"
                        required
                        className="input"
                        placeholder="Eks. Oppussing Storgata 1"
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--input)", color: "var(--foreground)" }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Adresse</label>
                    <input
                        name="address"
                        type="text"
                        required
                        placeholder="Gateadresse 1, 0000 Sted"
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--input)", color: "var(--foreground)" }}
                    />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Prismodell</label>
                        <select
                            name="pricingType"
                            value={pricingType}
                            onChange={(e) => setPricingType(e.target.value)}
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--input)", color: "var(--foreground)" }}
                        >
                            <option value="Fastpris">Fastpris</option>
                            <option value="Timespris">Timespris</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Budsjett (eks. mva)</label>
                        <input
                            name="budget"
                            type="number"
                            required
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            placeholder="500000"
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--input)", color: "var(--foreground)" }}
                        />
                        {budget && (
                            <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                                inkl. mva: {(parseInt(budget) * 1.25).toLocaleString()} kr
                            </p>
                        )}
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Startdato</label>
                        <input
                            name="startDate"
                            type="date"
                            required
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--input)", color: "var(--foreground)" }}
                        />
                    </div>
                </div>

                <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
                    <button type="submit" className="btn btn-primary" style={{ gap: "0.5rem" }}>
                        <Save size={18} /> Lagre Prosjekt
                    </button>
                </div>
            </form>
        </main>
    );
}
