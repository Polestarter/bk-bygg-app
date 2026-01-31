"use client";

import { useState, useEffect } from "react";
import { Customer, Project, PricingType, User } from "@/lib/types";
import { addProject, updateProject, getCustomers, getUsers } from "@/lib/data";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

interface ProjectFormProps {
    initialData?: Project;
}

export default function ProjectForm({ initialData }: ProjectFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preSelectedCustomerId = searchParams.get("customerId");

    const isEditing = !!initialData;
    const [pricingType, setPricingType] = useState(initialData?.pricingType || "Fastpris");
    const [budget, setBudget] = useState(initialData?.budgetExVAT?.toString() || "");
    const [loading, setLoading] = useState(false);

    // Data lists
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        Promise.all([
            getCustomers(),
            getUsers()
        ]).then(([c, u]) => {
            setCustomers(c);
            setUsers(u);
            // Mock Auth: Select the first admin as current user
            const admin = u.find(user => user.role === "admin");
            if (admin) setCurrentUser(admin);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        // Fallback for user ID if no admin found (should prefer valid UUID for DB constraint)
        const userId = currentUser?.id || users[0]?.id;

        if (!userId) {
            alert("Ingen brukere funnet i database. Kan ikke lagre endringer (krever bruker-ID for audit).");
            setLoading(false);
            return;
        }

        const projectData: Project = {
            id: initialData?.id || Math.random().toString(36).substring(2, 9),
            companyId: initialData?.companyId || users[0]?.companyId, // Assign company from user
            name: formData.get("name") as string,
            customerId: formData.get("customerId") as string,
            address: formData.get("address") as string,
            pricingType: pricingType as PricingType,
            status: (formData.get("status") as any) || initialData?.status || "Planlagt",

            // New Fields
            projectType: formData.get("projectType") as any,
            contractType: formData.get("contractType") as any,
            startDate: formData.get("startDate") as string || new Date().toISOString().split("T")[0],
            endDateEstimated: formData.get("endDateEstimated") as string,
            projectLeaderId: formData.get("projectLeaderId") as string,

            budgetExVAT: Number(budget) || 0,
            spentExVAT: initialData?.spentExVAT || 0,
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
                await updateProject(projectData, userId);
            } else {
                await addProject(projectData, userId);
            }
            router.push("/projects");
            router.refresh();
        } catch (error) {
            console.error("Failed to save project", error);
            alert("Kunne ikke lagre prosjekt. Sjekk konsoll for detaljer.");
            setLoading(false);
        }
    };

    const projectLeaders = users.filter(u => u.role === "project_leader" || u.role === "admin");

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
                        defaultValue={initialData?.customerId || preSelectedCustomerId || ""}
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
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Prosjektleder</label>
                        <select
                            name="projectLeaderId"
                            className="input"
                            defaultValue={initialData?.projectLeaderId || ""}
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--input)", color: "var(--foreground)" }}
                        >
                            <option value="">Ingen valgt</option>
                            {projectLeaders.map(u => (
                                <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Status</label>
                        <select
                            name="status"
                            className="input"
                            defaultValue={initialData?.status || "Planlagt"}
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--input)", color: "var(--foreground)" }}
                        >
                            <option value="Planlagt">Planlagt</option>
                            <option value="Aktiv">Aktiv</option>
                            <option value="Fullført">Fullført</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Prosjekttype</label>
                        <select
                            name="projectType"
                            className="input"
                            defaultValue={initialData?.projectType || "rehab"}
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--input)", color: "var(--foreground)" }}
                        >
                            <option value="rehab">Rehab</option>
                            <option value="nybygg">Nybygg</option>
                            <option value="service">Service</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Kontraktstype</label>
                        <select
                            name="contractType"
                            className="input"
                            defaultValue={initialData?.contractType || "fastpris"}
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "var(--radius)", border: "1px solid var(--border)", backgroundColor: "var(--input)", color: "var(--foreground)" }}
                        >
                            <option value="fastpris">Fastpris</option>
                            <option value="regning">Regning</option>
                            <option value="delt">Delt</option>
                        </select>
                    </div>
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
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
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
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Estimert sluttdato</label>
                        <input
                            name="endDateEstimated"
                            defaultValue={initialData?.endDateEstimated}
                            type="date"
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
