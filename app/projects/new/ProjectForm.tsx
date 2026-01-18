"use client";

import { useState } from "react";
import { Customer, Project, PricingType } from "@/lib/types";
import { addProject, updateProject } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProjectFormProps {
    customers: Customer[];
    initialData?: Project;
}

export default function ProjectForm({ customers, initialData }: ProjectFormProps) {
    const router = useRouter();
    const isEditing = !!initialData;
    const [pricingType, setPricingType] = useState(initialData?.pricingType || "Fastpris");
    const [budget, setBudget] = useState(initialData?.budgetExVAT?.toString() || "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        const projectData: Project = {
            id: initialData?.id || Math.random().toString(36).substring(2, 9),
            name: formData.get("name") as string,
            customerId: formData.get("customerId") as string,
            address: formData.get("address") as string,
            pricingType: pricingType as PricingType,
            status: initialData?.status || "Planlagt",
            budgetExVAT: Number(budget) || 0,
            spentExVAT: initialData?.spentExVAT || 0,
            startDate: formData.get("startDate") as string || new Date().toISOString().split("T")[0],
            endDate: initialData?.endDate,
            files: initialData?.files || [],
            expenses: initialData?.expenses || [],
            extras: initialData?.extras || [],
            timeEntries: initialData?.timeEntries || []
        };

        if (!projectData.name || !projectData.customerId) {
            setLoading(false);
            return;
        }

        try {
            if (isEditing) {
                await updateProject(projectData);
            } else {
                await addProject(projectData);
            }
            router.push("/projects");
            router.refresh();
        } catch (error) {
            console.error("Failed to save project", error);
            alert("Kunne ikke lagre prosjekt.");
            setLoading(false);
        }
    };

    return (
        <main className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem", maxWidth: "800px" }}>
            <Link href="/projects" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted-foreground)", marginBottom: "1rem" }}>
                <ArrowLeft size={16} /> Tilbake
            </Link>

            <div className="flex-between" style={{ marginBottom: "2rem" }}>
                <h1>{isEditing ? "Rediger Prosjekt" : "Nytt Prosjekt"}</h1>
            </div>

            <form onSubmit={handleSubmit} className="card" style={{ display: "grid", gap: "1.5rem" }}>
                <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Kunde</label>
                    <select
                        name="customerId"
                        required
                        className="input"
                        defaultValue={initialData?.customerId || ""}
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
                        defaultValue={initialData?.name}
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
                        defaultValue={initialData?.address}
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
                            onChange={(e) => setPricingType(e.target.value as PricingType)}
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
                            defaultValue={initialData?.startDate}
                            type="date"
                            required
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--input)", color: "var(--foreground)" }}
                        />
                    </div>
                </div>

                <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ gap: "0.5rem" }}>
                        <Save size={18} /> {loading ? "Lagrer..." : (isEditing ? "Oppdater Prosjekt" : "Lagre Prosjekt")}
                    </button>
                </div>
            </form>
        </main>
    );
}
